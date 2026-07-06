import Anthropic from '@anthropic-ai/sdk';

// Document extraction runs server-side (needs the Node runtime for the SDK and
// the secret API key) and can take a few seconds for vision.
export const runtime = 'nodejs';
export const maxDuration = 60;

// The CCK target majors a prior PAAET major can map onto (must match CCK_MAJORS
// values in EquivalencyWorkflow.tsx).
const TARGET_MAJORS = ['diploma_management', 'diploma_accounting', 'diploma_marketing'] as const;

const SYSTEM =
  "You extract structured data from a prospective transfer student's official documents " +
  'for a Kuwaiti college (CCK). The documents are issued by PAAET (The Public Authority for ' +
  'Applied Education & Training) and are usually in Arabic. Read them carefully and return ' +
  'only what is clearly legible. Leave a field blank ("") rather than guessing - never invent ' +
  'a civil ID or a GPA.';

const TOOL: Anthropic.Tool = {
  name: 'extract_fields',
  description:
    'Return the fields extracted from the uploaded graduation certificate and transcript.',
  input_schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      studentName: {
        type: 'string',
        description: 'Full student name exactly as printed (keep the Arabic script if Arabic).',
      },
      civilId: {
        type: 'string',
        description: 'Kuwaiti civil ID (الرقم المدني), digits only. Blank if not shown.',
      },
      sourceGpa: {
        type: 'string',
        description: 'Cumulative GPA (المعدل العام) on a 4.0 scale, e.g. "2.73". Blank if not shown.',
      },
      source: {
        type: 'string',
        enum: ['paaet', 'public', 'private'],
        description: 'Prior institution type. PAAET documents are always "paaet".',
      },
      sourceInstitution: {
        type: 'string',
        description: 'Private university name; blank unless source is "private".',
      },
      targetMajorId: {
        type: 'string',
        enum: ['', ...TARGET_MAJORS],
        description:
          "Best-matching CCK target major id from the student's prior major: " +
          'Management/Administration (الإدارة) -> diploma_management, Accounting (المحاسبة) -> diploma_accounting, ' +
          'Marketing (التسويق) -> diploma_marketing. Blank if unclear.',
      },
    },
    required: [
      'studentName',
      'civilId',
      'sourceGpa',
      'source',
      'sourceInstitution',
      'targetMajorId',
    ],
  },
};

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type ImageType = (typeof IMAGE_TYPES)[number];

async function toBase64(file: File): Promise<string> {
  return Buffer.from(await file.arrayBuffer()).toString('base64');
}

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // No key configured - the UI falls back to manual entry.
    return Response.json({ ok: false, reason: 'no_api_key' }, { status: 503 });
  }

  try {
    const form = await req.formData();
    const transcript = form.get('transcript');
    const certificate = form.get('certificate');
    if (!(transcript instanceof File) || !(certificate instanceof File)) {
      return Response.json({ ok: false, reason: 'missing_files' }, { status: 400 });
    }

    const certB64 = await toBase64(certificate);
    const transB64 = await toBase64(transcript);
    const transType: ImageType = IMAGE_TYPES.includes(transcript.type as ImageType)
      ? (transcript.type as ImageType)
      : 'image/jpeg';

    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      system: SYSTEM,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'extract_fields' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Graduation certificate (PDF):' },
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: certB64 },
            },
            { type: 'text', text: 'Official transcript (image):' },
            {
              type: 'image',
              source: { type: 'base64', media_type: transType, data: transB64 },
            },
            { type: 'text', text: 'Extract the fields by calling extract_fields.' },
          ],
        },
      ],
    });

    const block = msg.content.find((b) => b.type === 'tool_use');
    if (!block || block.type !== 'tool_use') {
      return Response.json({ ok: false, reason: 'no_extraction' }, { status: 502 });
    }
    return Response.json({ ok: true, fields: block.input });
  } catch (err) {
    console.error('[equivalency extract]', err);
    return Response.json({ ok: false, reason: 'error' }, { status: 500 });
  }
}
