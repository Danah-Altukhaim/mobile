'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { EquivalencyEntry, PaaetEquivalencyEntry } from '@masari/shared';
import { useI18n } from '@/lib/i18n';
import {
  validateTransferAttempt,
  validateCreditEquivalence,
  lowestGradeOf,
  type TransferValidationIssue,
} from '@/lib/cckPolicies';
import {
  upsertEquivalencyRequest,
  saveEquivalencySnapshot,
  loadEquivalencySnapshot,
  loadEquivalencyRequests,
  makeRequestId,
  type EquivalencyOutcome,
} from './requestsStore';
import {
  CheckIcon, CloseIcon, ClockIcon, ChevronIcon,
  PaperclipIcon, PhoneIcon, DocumentIcon,
} from '@/components/icons';

// ---------------------------------------------------------------------------
// Equivalency request workflow (Equivalency Screen Update doc).
//
// Models the full PAAET → CCK transfer-equivalency flow as staged hand-offs
// between roles:
//   1. Admission staff upload the official transcript + final certificate.
//   2. Registration equivalency - registration staff fill the "Registration
//      department" columns of the Transfer Credits Equivalency Form (prior
//      course, credits, grade, semester) for every prior course.
//   3. Academic equivalency - academic staff fill the "Academic Department"
//      columns (CCK course + comments), may add unlisted courses, and may
//      combine two PAAET courses into one CCK course.
//   4. VP for Academic Affairs reviews and approves the equivalency.
//   5. Request returns to admission to discuss the VP-approved equivalency
//      with the student; student acceptance completes the request.
// ---------------------------------------------------------------------------

type Stage = 'documents' | 'registration' | 'academic' | 'student' | 'vp' | 'done';
const STAGE_ORDER: Stage[] = ['documents', 'registration', 'academic', 'vp', 'student'];

// Per-outcome display for the completed (done) request: icon, i18n keys, and the
// badge tone matching the dashboard's last progress bar (green / red / neutral).
const OUTCOME_META: Record<
  EquivalencyOutcome,
  { Icon: typeof CheckIcon; title: string; desc: string; badge: string }
> = {
  accepted: { Icon: CheckIcon, title: 'eqwf.doneTitle', desc: 'eqwf.doneDesc', badge: 'cck-chip-positive' },
  declined: { Icon: CloseIcon, title: 'eqwf.doneDeclined', desc: 'eqwf.doneDeclinedDesc', badge: 'cck-chip-negative' },
  pending: { Icon: ClockIcon, title: 'eqwf.donePending', desc: 'eqwf.donePendingDesc', badge: 'cck-chip-neutral' },
};

interface CckOption {
  id: string;
  name: string;
  code: string;
  credit: number;
  major: string;
  /** Added by academic staff for a course not in the catalog. */
  unlisted?: boolean;
}

interface PaaetOption {
  id: string;
  name: string;
  code: string;
  credit: number;
  program: string;
}

interface SelectedCourse extends PaaetOption {
  grade: string;
  /** Credit hours entered by admission staff (prefilled from the catalog). */
  creditHours: string;
  /** Semester the course was completed (Registration column). */
  semester: string;
  /** CckOption.id chosen by academic staff. */
  cckId: string | null;
  /** Free-text Academic Department comment (e.g. the CCK category). */
  comments: string;
  /** Group id when this PAAET course is combined with others into one CCK
   *  course. All rows that share a group map to the same CCK course. */
  combineGroup: string | null;
}

// Default prior institution shown on the form (PAAET, the common source).
const DEFAULT_PRIOR_COLLEGE = 'The Public Authority for Applied Education & Training';

// The full serializable workflow state persisted per request, so a tracked
// request can be reopened straight into its current stage with its real data.
// Uploaded Files are not serializable and are intentionally excluded.
interface WorkflowSnapshot {
  stage: Stage;
  outcome: EquivalencyOutcome | null;
  studentName: string;
  phone: string;
  priorCollege: string;
  civilId: string;
  commencement: string;
  requestedMajor: string;
  docTranscript: boolean;
  docCertificate: boolean;
  source: 'paaet' | 'public' | 'private';
  sourceInstitution: string;
  sourceGpa: string;
  majorIds: string[];
  oldCourses: boolean;
  vpaException: boolean;
  afterCensus: boolean;
  selectedByMajor: Record<string, SelectedCourse[]>;
  extraCck: CckOption[];
  activeMajorTab: string;
  sentBack: { target: 'admission' | 'academic'; reason: string; from: 'vp' | 'academic' } | null;
}

const stageIndex = (s: Stage) => STAGE_ORDER.indexOf(s);

/** Code-first label for a CCK course, e.g. "ACC2385 - Accounting Software". */
const cckLabel = (c: CckOption) =>
  c.code && c.code !== '-' ? `${c.code} - ${c.name}` : c.name;

/**
 * Searchable CCK-course picker. Replaces the native <select> so academic staff
 * can type a course code or name instead of scrolling the full catalog.
 */
function CckCombobox({
  courses,
  value,
  onChange,
  placeholder,
  disabled,
  unlistedTag,
  className,
}: {
  courses: CckOption[];
  value: string | null;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
  unlistedTag?: string;
  className?: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rect, setRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const place = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setRect({ left: r.left, top: r.bottom, width: r.width });
  };

  const openMenu = () => {
    place();
    setOpen(true);
    setQuery('');
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    // The trigger lives inside a scrollable table; close as the viewport shifts
    // so the portalled panel stays anchored. Ignore scrolls that originate
    // inside the panel itself, otherwise scrolling the list closes the menu.
    const onScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  const selected = value ? courses.find((c) => c.id === value) ?? null : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    );
  }, [courses, query]);

  return (
    <div className={className}>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="w-full px-2 py-1.5 rounded-sm border border-line-strong text-sm bg-white text-start disabled:opacity-50 truncate"
      >
        {selected ? (
          <>
            {cckLabel(selected)}
            {selected.unlisted && unlistedTag ? ` · ${unlistedTag}` : ''}
          </>
        ) : (
          <span className="text-muted">{placeholder}</span>
        )}
      </button>
      {open && !disabled && rect &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: 'fixed', left: rect.left, top: rect.top + 4, width: rect.width, zIndex: 50 }}
            className="max-h-72 overflow-auto rounded-sm border border-line bg-white shadow-lg"
          >
            <div className="sticky top-0 bg-white p-2 border-b border-line">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('eqwf.searchCck')}
                className="cck-input py-1.5"
              />
            </div>
            <ul className="py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-xs text-muted">{t('eqwf.noResults')}</li>
              ) : (
                filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(c.id);
                        setOpen(false);
                        setQuery('');
                      }}
                      className={`w-full text-start px-3 py-1.5 text-sm hover:bg-canvas ${
                        c.id === value ? 'bg-pair-50 text-pair-700' : ''
                      }`}
                    >
                      {c.code && c.code !== '-' && (
                        <span dir="ltr" className="font-medium">{c.code}</span>
                      )}
                      {c.code && c.code !== '-' ? ' - ' : ''}
                      {c.name}
                      {c.unlisted && unlistedTag ? ` · ${unlistedTag}` : ''}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}

// CCK majors offered for transfer equivalency, sourced from the Major Sheets
// (the docs source of truth). Each major carries its school so the credit-cap
// policy can still resolve a school from a chosen major.
type ProgramSchool = 'business' | 'advanced_tech';
interface CckMajor {
  value: string;
  en: string;
  ar: string;
  school: ProgramSchool;
}
const CCK_MAJORS: CckMajor[] = [
  { value: 'diploma_management', en: 'Business Management and Entrepreneurship', ar: 'إدارة الأعمال وريادة الأعمال', school: 'business' },
  { value: 'diploma_accounting', en: 'Business - Accounting', ar: 'إدارة الأعمال - المحاسبة', school: 'business' },
  { value: 'diploma_marketing', en: 'Business - Marketing', ar: 'إدارة الأعمال - التسويق', school: 'business' },
  { value: 'diploma_cp', en: 'Computer Programming', ar: 'برمجة الحاسوب', school: 'advanced_tech' },
  { value: 'diploma_iawd', en: 'Internet Applications and Web Development', ar: 'تطبيقات الإنترنت وتطوير الويب', school: 'advanced_tech' },
  { value: 'diploma_imd', en: 'Interactive Media Design', ar: 'تصميم الوسائط التفاعلية', school: 'advanced_tech' },
];

// Stable reference for a major with no courses yet, so the per-major memos that
// depend on `selected` don't recompute on every render.
const EMPTY_SELECTED: SelectedCourse[] = [];

export default function EquivalencyWorkflow({
  entries,
  paaetEntries,
  openRequestId = '',
}: {
  entries: EquivalencyEntry[];
  paaetEntries: PaaetEquivalencyEntry[];
  /** When set (from the dashboard), reopen this request restored to its stage. */
  openRequestId?: string;
}) {
  const { t, locale, dir } = useI18n();

  // Seed all request state from the saved snapshot for `openRequestId`, falling
  // back to its dashboard summary for legacy requests with no snapshot, then to
  // empty defaults for a brand-new request. Computed once on mount.
  const [seed] = useState<WorkflowSnapshot>(() => {
    const base: WorkflowSnapshot = {
      stage: 'documents',
      outcome: null,
      studentName: '',
      phone: '',
      priorCollege: DEFAULT_PRIOR_COLLEGE,
      civilId: '',
      commencement: '',
      requestedMajor: '',
      docTranscript: false,
      docCertificate: false,
      source: 'paaet',
      sourceInstitution: '',
      sourceGpa: '',
      majorIds: [],
      oldCourses: false,
      vpaException: false,
      afterCensus: false,
      selectedByMajor: {},
      extraCck: [],
      activeMajorTab: '',
      sentBack: null,
    };
    if (!openRequestId) return base;
    const snap = loadEquivalencySnapshot(openRequestId) as WorkflowSnapshot | null;
    let result: WorkflowSnapshot = base;
    if (snap) {
      result = { ...base, ...snap };
    } else {
      const summary = loadEquivalencyRequests().find((r) => r.id === openRequestId);
      if (summary) {
        result = {
          ...base,
          stage: summary.stage,
          outcome: summary.outcome ?? null,
          studentName: summary.applicant,
          phone: summary.phone ?? '',
          civilId: summary.civilId,
          source: summary.source,
          sourceInstitution: summary.sourceInstitution,
        };
      }
    }
    // Legacy requests saved on the old combined "form" stage reopen on the new
    // registration stage so they re-walk the split registration → academic flow.
    if ((result.stage as string) === 'form') {
      result = { ...result, stage: 'registration' };
    }
    // A request parked on "Pending student decision" reopens on the student
    // decision stage so staff can record the final outcome, instead of the
    // read-only done summary.
    if (result.stage === 'done' && result.outcome === 'pending') {
      result = { ...result, stage: 'student' };
    }
    return result;
  });

  // Catalog of CCK courses academic staff can map to, plus any unlisted
  // courses they add during this request.
  const [extraCck, setExtraCck] = useState<CckOption[]>(seed.extraCck);
  const cckCourses = useMemo<CckOption[]>(() => {
    const map = new Map<string, CckOption>();
    for (const e of entries) {
      const code = e.cck_code_raw ?? e.cck_code ?? '';
      const id = `${code}|${e.cck_course_name}`;
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: e.cck_course_name,
          code: code || '-',
          credit: e.cck_credit ?? 0,
          major: e.cck_major,
        });
      }
    }
    return [...extraCck, ...Array.from(map.values())].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [entries, extraCck]);

  const paaetCourses = useMemo<PaaetOption[]>(() => {
    return paaetEntries
      .map((e, i) => ({
        id: `${e.paaet_code}|${i}`,
        name: e.paaet_course_name,
        code: e.paaet_code,
        credit: Number(e.credit) || 0,
        program: e.paaet_program,
      }))
      .filter((p) => p.name.trim().length > 0);
  }, [paaetEntries]);

  const programs = useMemo(
    () => Array.from(new Set(paaetCourses.map((p) => p.program))).sort(),
    [paaetCourses],
  );

  // Request state ───────────────────────────────────────────────────────────
  const [stage, setStage] = useState<Stage>(seed.stage);
  // The student's final decision, recorded when admission staff finish the
  // "Discuss with student" stage. Drives the done-screen banner and the colour
  // of the last progress bar on the dashboard.
  const [outcome, setOutcome] = useState<EquivalencyOutcome | null>(seed.outcome);
  // Move the request to its final stage with the chosen outcome.
  const finishWithOutcome = (decision: EquivalencyOutcome) => {
    setOutcome(decision);
    setStage('done');
  };
  // Stable id for the request being worked on, so it can be tracked on the
  // submitted-requests dashboard as it moves through the stages. Generated
  // client-side (a fresh one is minted for every new request).
  const [requestId, setRequestId] = useState(openRequestId);
  useEffect(() => {
    if (!requestId) setRequestId(makeRequestId());
  }, [requestId]);
  const [studentName, setStudentName] = useState(seed.studentName);
  const [phone, setPhone] = useState(seed.phone);
  // Applicant header fields, mirroring the paper Transfer Credits Equivalency Form.
  const [priorCollege, setPriorCollege] = useState(seed.priorCollege);
  const [civilId, setCivilId] = useState(seed.civilId);
  const [commencement, setCommencement] = useState(seed.commencement);
  const [requestedMajor, setRequestedMajor] = useState(seed.requestedMajor);
  const [docTranscript, setDocTranscript] = useState(seed.docTranscript);
  const [docCertificate, setDocCertificate] = useState(seed.docCertificate);
  // The actual uploaded files, so reviewers can open them from later stages.
  const [docFiles, setDocFiles] = useState<{ transcript: File | null; certificate: File | null }>({
    transcript: null,
    certificate: null,
  });
  // True while the uploaded documents are being read by the AI extractor.
  const [extracting, setExtracting] = useState(false);
  // Eligibility inputs for the Credit Transfer Policy v2.0 compliance check.
  const [source, setSource] = useState<'paaet' | 'public' | 'private'>(seed.source);
  // Name of the private university/institution (shown only when source=private).
  const [sourceInstitution, setSourceInstitution] = useState(seed.sourceInstitution);
  const [sourceGpa, setSourceGpa] = useState(seed.sourceGpa);
  // Target CCK majors to evaluate, in selection order. The first is the
  // "primary"; any number can be added and each keeps its own course mapping.
  const [majorIds, setMajorIds] = useState<string[]>(seed.majorIds);
  const [majorDropdownOpen, setMajorDropdownOpen] = useState(false);
  const [oldCourses, setOldCourses] = useState(seed.oldCourses);
  const [vpaException, setVpaException] = useState(seed.vpaException);
  const [afterCensus, setAfterCensus] = useState(seed.afterCensus);
  // Each evaluated major keeps its own course mapping, keyed by major id, since
  // the CCK equivalents differ per major.
  const [selectedByMajor, setSelectedByMajor] = useState<Record<string, SelectedCourse[]>>(seed.selectedByMajor);
  // The tab the reviewer is currently editing. Falls back to the first selected
  // major so it stays valid as majors are added or removed.
  const [activeMajorTab, setActiveMajorTab] = useState(seed.activeMajorTab);
  const activeMajorId = majorIds.includes(activeMajorTab) ? activeMajorTab : (majorIds[0] ?? '');
  const selected = selectedByMajor[activeMajorId] ?? EMPTY_SELECTED;
  const setSelected = (
    updater: SelectedCourse[] | ((prev: SelectedCourse[]) => SelectedCourse[]),
  ) => {
    if (!activeMajorId) return;
    setSelectedByMajor((prev) => {
      const cur = prev[activeMajorId] ?? [];
      const next = typeof updater === 'function' ? updater(cur) : updater;
      return { ...prev, [activeMajorId]: next };
    });
  };
  // Add or remove a target major from the evaluated set.
  const toggleMajor = (value: string) => {
    setMajorIds((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };
  // The credit-cap policy works at the school level, so resolve the active
  // major's school (defaulting to business until a major is picked).
  const programSchool: ProgramSchool = CCK_MAJORS.find((m) => m.value === activeMajorId)?.school ?? 'business';
  const majorName = (id: string) => {
    const m = CCK_MAJORS.find((x) => x.value === id);
    return m ? (locale === 'ar' ? m.ar : m.en) : '';
  };
  const [search, setSearch] = useState('');
  const [program, setProgram] = useState('all');
  // Whether the prior-course results popover (in the registration table toolbar)
  // is open. Opens on focus/typing in the search box, closes on click-away.
  const [pickerOpen, setPickerOpen] = useState(false);
  const [combinePicks, setCombinePicks] = useState<Set<string>>(new Set());
  const [showUnlisted, setShowUnlisted] = useState(false);
  const [unlisted, setUnlisted] = useState({ name: '', code: '', credit: '' });
  const [toast, setToast] = useState<string | null>(null);
  // VP "send back" - when the VP returns the request to admission or academic
  // staff for re-evaluation, the note + attachments are surfaced on their stage.
  const [sendBackOpen, setSendBackOpen] = useState(false);
  // Academic staff "send back" - returns the request to the registration
  // department with a note explaining why the CCK mapping can't proceed.
  const [acadSendBackOpen, setAcadSendBackOpen] = useState(false);
  const [sentBack, setSentBack] = useState<{
    target: 'admission' | 'academic';
    reason: string;
    files: File[];
    from: 'vp' | 'academic';
  } | null>(seed.sentBack ? { ...seed.sentBack, files: [] } : null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Once both documents are uploaded, read them with the AI extractor and
  // prefill the identity + eligibility fields. Best-effort: on any failure the
  // reviewer just fills the form by hand.
  const runExtraction = async (transcript: File, certificate: File) => {
    setExtracting(true);
    try {
      const body = new FormData();
      body.append('transcript', transcript);
      body.append('certificate', certificate);
      const res = await fetch('/api/equivalency/extract', { method: 'POST', body });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        showToast(t('eqwf.extractFailed'));
        return;
      }
      const f = data.fields ?? {};
      if (f.studentName) setStudentName(f.studentName);
      if (f.civilId) setCivilId(f.civilId);
      if (f.source) setSource(f.source);
      if (f.sourceInstitution) setSourceInstitution(f.sourceInstitution);
      if (f.sourceGpa) setSourceGpa(f.sourceGpa);
      if (f.targetMajorId && CCK_MAJORS.some((m) => m.value === f.targetMajorId)) {
        setMajorIds((prev) => (prev.includes(f.targetMajorId) ? prev : [...prev, f.targetMajorId]));
      }
      showToast(t('eqwf.extractDone'));
    } catch {
      showToast(t('eqwf.extractFailed'));
    } finally {
      setExtracting(false);
    }
  };

  const reset = () => {
    setStage('documents');
    setOutcome(null);
    setRequestId(makeRequestId());
    setStudentName('');
    setPriorCollege(DEFAULT_PRIOR_COLLEGE);
    setPhone('');
    setCivilId('');
    setCommencement('');
    setRequestedMajor('');
    setDocTranscript(false);
    setDocCertificate(false);
    setDocFiles({ transcript: null, certificate: null });
    setSource('paaet');
    setSourceInstitution('');
    setSourceGpa('');
    setMajorIds([]);
    setMajorDropdownOpen(false);
    setOldCourses(false);
    setVpaException(false);
    setAfterCensus(false);
    setSelectedByMajor({});
    setActiveMajorTab('');
    setSearch('');
    setProgram('all');
    setCombinePicks(new Set());
    setShowUnlisted(false);
    setUnlisted({ name: '', code: '', credit: '' });
    setPickerOpen(false);
    setExtraCck([]);
    setSendBackOpen(false);
    setSentBack(null);
  };

  // Form stage - PAAET course picker (Registration columns) ───────────────────
  const filteredPaaet = useMemo(() => {
    const q = search.trim().toLowerCase();
    return paaetCourses.filter((p) => {
      if (program !== 'all' && p.program !== program) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      );
    });
  }, [paaetCourses, program, search]);

  const addCourse = (p: PaaetOption) => {
    if (selected.some((s) => s.id === p.id)) return;
    setSelected((prev) => [
      ...prev,
      {
        ...p,
        grade: '',
        creditHours: p.credit ? String(p.credit) : '',
        semester: '',
        cckId: null,
        comments: '',
        combineGroup: null,
      },
    ]);
  };
  const removeCourse = (id: string) => {
    setSelected((prev) => {
      const removed = prev.find((s) => s.id === id);
      let next = prev.filter((s) => s.id !== id);
      // Dissolve a combine group that drops below two members.
      const group = removed?.combineGroup;
      if (group && next.filter((s) => s.combineGroup === group).length < 2) {
        next = next.map((s) => (s.combineGroup === group ? { ...s, combineGroup: null } : s));
      }
      return next;
    });
    setCombinePicks((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };
  const setGrade = (id: string, grade: string) =>
    setSelected((prev) => prev.map((s) => (s.id === id ? { ...s, grade } : s)));
  const setCreditHours = (id: string, creditHours: string) =>
    setSelected((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, creditHours: creditHours.replace(/[^\d.]/g, '') } : s,
      ),
    );
  const setSemester = (id: string, semester: string) =>
    setSelected((prev) => prev.map((s) => (s.id === id ? { ...s, semester } : s)));
  const setComments = (id: string, comments: string) =>
    setSelected((prev) => prev.map((s) => (s.id === id ? { ...s, comments } : s)));

  // Academic staff maps CCK equivalents. Prefill the comment with the CCK
  // course's category (matching the paper form, e.g. "GED", "ENL") when blank.
  // When the row belongs to a combine group, the chosen CCK course is applied to
  // every course in that group so they share a single CCK equivalent.
  const setCck = (id: string, cckId: string) => {
    const cck = cckCourses.find((c) => c.id === cckId);
    const row = selected.find((s) => s.id === id);
    const applyTo = row?.combineGroup
      ? new Set(selected.filter((s) => s.combineGroup === row.combineGroup).map((s) => s.id))
      : new Set([id]);
    setSelected((prev) =>
      prev.map((s) =>
        applyTo.has(s.id)
          ? {
              ...s,
              cckId: cckId || null,
              comments: s.comments || (cck && cck.major !== '-' ? cck.major : ''),
            }
          : s,
      ),
    );
  };

  const toggleCombinePick = (id: string) =>
    setCombinePicks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Combine the currently ticked PAAET courses (2+) into one group. They then
  // share a single CCK equivalent and their credits are summed for the credit
  // floor and total. Triggered by the combine box at the bottom of the list.
  const combineCounter = useRef(0);
  const combineSelected = () => {
    if (combinePicks.size < 2) return;
    const group = `grp-${++combineCounter.current}`;
    setSelected((prev) => {
      // If any course being combined already has a CCK course mapped, the rest
      // of the group inherits it so they autofill instead of starting blank.
      const anchor = prev.find((s) => combinePicks.has(s.id) && s.cckId);
      return prev.map((s) =>
        combinePicks.has(s.id)
          ? {
              ...s,
              combineGroup: group,
              cckId: anchor ? anchor.cckId : s.cckId,
              comments: s.comments || anchor?.comments || '',
            }
          : s,
      );
    });
    setCombinePicks(new Set());
    showToast(t('eqwf.combinedToast'));
  };

  const uncombine = (group: string) => {
    setSelected((prev) =>
      prev.map((s) => (s.combineGroup === group ? { ...s, combineGroup: null } : s)),
    );
  };

  // Display order: pull every member of a combine group together so the rows
  // sit next to each other (the whole group lands at the position of its first
  // member). The academic-side cells then get rowSpan'd into one shared cell.
  const orderedRows = useMemo(() => {
    const result: SelectedCourse[] = [];
    const placed = new Set<string>();
    for (const s of selected) {
      if (placed.has(s.id)) continue;
      if (s.combineGroup) {
        const group = selected.filter((x) => x.combineGroup === s.combineGroup);
        group.forEach((x) => placed.add(x.id));
        result.push(...group);
      } else {
        placed.add(s.id);
        result.push(s);
      }
    }
    return result;
  }, [selected]);

  const addUnlistedCourse = () => {
    const name = unlisted.name.trim();
    if (!name) return;
    const opt: CckOption = {
      id: `unlisted|${name}|${unlisted.code}`,
      name,
      code: unlisted.code.trim() || '-',
      credit: Number(unlisted.credit) || 0,
      major: '-',
      unlisted: true,
    };
    setExtraCck((prev) => [opt, ...prev]);
    setUnlisted({ name: '', code: '', credit: '' });
    setShowUnlisted(false);
    showToast(t('eqwf.unlistedAddedToast'));
  };

  const allMapped = selected.length > 0 && selected.every((s) => s.cckId);

  // Registration hand-off is ready once every prior course has its credit hours
  // and grade filled in (the columns registration staff own).
  const registrationComplete =
    selected.length > 0 &&
    selected.every((s) => s.grade.trim() && s.creditHours.trim());

  // The form is ready for VP review when every row also has a mapped CCK course
  // (the column academic staff own), on top of the registration fields.
  const formComplete =
    selected.length > 0 &&
    selected.every((s) => s.grade.trim() && s.creditHours.trim() && s.cckId);

  // Distinct CCK credits (a combined 2→1 mapping counts the CCK course once).
  const totalCredits = useMemo(() => {
    const seen = new Set<string>();
    let total = 0;
    for (const s of selected) {
      if (!s.cckId || seen.has(s.cckId)) continue;
      seen.add(s.cckId);
      total += cckCourses.find((c) => c.id === s.cckId)?.credit ?? 0;
    }
    return total;
  }, [selected, cckCourses]);

  // Credit-equivalence floor (Equivalency Screen Feedback): the prior credit per
  // mapped CCK course (summed across a combine group) must be ≥ the CCK credit,
  // with an allowance for being exactly one hour less.
  const creditMappings = useMemo(() => {
    const byCck = new Map<string, { cck: CckOption; prior: number }>();
    for (const s of selected) {
      if (!s.cckId) continue;
      const cck = cckCourses.find((c) => c.id === s.cckId);
      if (!cck) continue;
      const prior = Number(s.creditHours) || 0;
      const acc = byCck.get(s.cckId);
      if (acc) acc.prior += prior;
      else byCck.set(s.cckId, { cck, prior });
    }
    return [...byCck.values()].map(({ cck, prior }) => ({
      cckCode: cck.code,
      cckTitle: cck.name,
      cckCredit: cck.credit,
      priorCredit: prior,
    }));
  }, [selected, cckCourses]);

  // Credit Transfer Policy v2.0 compliance - re-evaluated live as the reviewer
  // maps courses and fills the eligibility inputs.
  const validation = useMemo<TransferValidationIssue[]>(
    () => [
      ...validateTransferAttempt({
        source,
        sourceGpa: sourceGpa.trim() ? Number(sourceGpa) : undefined,
        transferCredits: totalCredits,
        programCredits: 0,
        programSchool,
        lowestGrade: lowestGradeOf(selected.map((s) => s.grade)),
        hasCoursesOverSevenYears: oldCourses,
        vpaTimeException: vpaException,
        afterCensusDate: afterCensus,
      }),
      ...validateCreditEquivalence(creditMappings),
    ],
    [source, sourceGpa, totalCredits, programSchool, selected, oldCourses, vpaException, afterCensus, creditMappings],
  );
  const blockingIssues = useMemo(() => validation.filter((i) => i.severity === 'block'), [validation]);

  const cckById = (id: string | null) =>
    id ? cckCourses.find((c) => c.id === id) ?? null : null;

  // Distinct CCK credits for an arbitrary mapping list (combine groups share a
  // CCK course, so each CCK course is counted once).
  const creditsOf = (list: SelectedCourse[]) => {
    const seen = new Set<string>();
    let total = 0;
    for (const s of list) {
      if (!s.cckId || seen.has(s.cckId)) continue;
      seen.add(s.cckId);
      total += cckCourses.find((c) => c.id === s.cckId)?.credit ?? 0;
    }
    return total;
  };

  // Track the request on the submitted-requests dashboard. A request starts
  // being tracked once it leaves the documents stage, and its stored stage +
  // summary update live as it advances. Mirrors the in-memory workflow state
  // into localStorage so the dashboard tab can list every request.
  useEffect(() => {
    if (!requestId || stage === 'documents') return;
    const courseCount = majorIds.reduce((n, id) => n + (selectedByMajor[id]?.length ?? 0), 0);
    const totalCredits = majorIds.reduce((n, id) => n + creditsOf(selectedByMajor[id] ?? []), 0);
    upsertEquivalencyRequest({
      id: requestId,
      stage,
      applicant: studentName.trim(),
      phone: phone.trim(),
      civilId: civilId.trim(),
      major: majorName(majorIds[0] ?? ''),
      // Any majors beyond the first are listed together in the second slot.
      secondMajor: majorIds.slice(1).map(majorName).filter(Boolean).join(', '),
      source,
      sourceInstitution: source === 'private' ? sourceInstitution.trim() : '',
      courseCount,
      totalCredits,
      blocked: blockingIssues.length > 0,
      // Only carry the outcome once the request is finalised.
      outcome: stage === 'done' ? outcome ?? undefined : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    requestId, stage, outcome, studentName, phone, civilId, majorIds,
    source, sourceInstitution, selectedByMajor, blockingIssues.length,
  ]);

  // Persist the full workflow state alongside the summary, so opening this
  // request from the dashboard restores its real course mappings, not just the
  // summary row. Files are dropped (not serializable); the View links no-op on
  // a restored request. Like the summary, only tracked once it leaves documents.
  useEffect(() => {
    if (!requestId || stage === 'documents') return;
    saveEquivalencySnapshot(requestId, {
      stage,
      outcome,
      studentName,
      phone,
      priorCollege,
      civilId,
      commencement,
      requestedMajor,
      docTranscript,
      docCertificate,
      source,
      sourceInstitution,
      sourceGpa,
      majorIds,
      oldCourses,
      vpaException,
      afterCensus,
      selectedByMajor,
      extraCck,
      activeMajorTab,
      sentBack: sentBack ? { target: sentBack.target, reason: sentBack.reason, from: sentBack.from } : null,
    } satisfies WorkflowSnapshot);
  }, [
    requestId, stage, outcome, studentName, phone, priorCollege, civilId, commencement,
    requestedMajor, docTranscript, docCertificate, source, sourceInstitution,
    sourceGpa, majorIds, oldCourses, vpaException, afterCensus, selectedByMajor,
    extraCck, activeMajorTab, sentBack,
  ]);

  const roleTag = (role: 'admission' | 'academic' | 'vp') => (
    <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-pair-50 text-pair-700">
      {t(`eqwf.role.${role}`)}
    </span>
  );

  // Open an uploaded document in a new tab (or note that none is attached).
  const viewDoc = (file: File | null) => {
    if (file) window.open(URL.createObjectURL(file), '_blank', 'noopener');
    else showToast(t('eqwf.noDocFile'));
  };

  // VP returns the request to the chosen team for re-evaluation. Admission staff
  // own the documents + registration stages; academic staff own the CCK mapping.
  const handleSendBack = (
    target: 'admission' | 'academic',
    reason: string,
    files: File[],
    from: 'vp' | 'academic' = 'vp',
  ) => {
    setSentBack({ target, reason, files, from });
    setSendBackOpen(false);
    setAcadSendBackOpen(false);
    setStage(target === 'admission' ? 'registration' : 'academic');
    showToast(t('eqwf.sentBackToast', { role: t(`eqwf.role.${target}`) }));
  };

  // Banner shown on the admission/academic stage after the VP sends a request
  // back, carrying the VP's reason and any attached photos or documents. Only
  // renders on the stage that owns the targeted team.
  const sentBackBanner = (owner: 'admission' | 'academic') =>
    sentBack && sentBack.target === owner ? (
      <div className="rounded-sm border border-line-strong bg-canvas p-4 mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink inline-flex items-center gap-1.5"><ChevronIcon dir="start" className="w-3.5 h-3.5 shrink-0" />{t(sentBack.from === 'academic' ? 'eqwf.sentBackBannerAcademic' : 'eqwf.sentBackBanner')}</p>
            <p className="mt-1 text-sm text-body whitespace-pre-wrap break-words">{sentBack.reason}</p>
          </div>
          <button
            type="button"
            onClick={() => setSentBack(null)}
            aria-label={t('eqwf.sentBackDismiss')}
            className="shrink-0 text-muted hover:text-ink"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
        {sentBack.files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sentBack.files.map((f, i) => (
              <button
                key={i}
                type="button"
                onClick={() => viewDoc(f)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-line-strong bg-white text-xs font-medium text-body hover:bg-canvas"
              >
                <PaperclipIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[160px]">{f.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    ) : null;

  // Student-info header reused on the form, VP, and student stages so reviewers
  // can see who the request is for and open the uploaded documents.
  const studentBanner = (
    <div className="rounded-sm border border-pair-200 bg-pair-50/40 p-4 mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pair-600 text-white text-sm font-semibold">
            {(studentName.trim()[0] || '?').toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">
              {studentName.trim() || t('eqwf.unnamedApplicant')}
            </p>
            <p className="text-xs text-muted truncate">
              {civilId.trim() ? <span dir="ltr">{civilId}</span> : t('eqwf.noCivilId')}
              {requestedMajor.trim() ? ` · ${requestedMajor}` : ''}
              {source === 'private' && sourceInstitution.trim()
                ? ` · ${sourceInstitution.trim()}`
                : priorCollege.trim()
                  ? ` · ${priorCollege}`
                  : ''}
            </p>
            <p className="text-xs truncate">
              {phone.trim() ? (
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  dir="ltr"
                  className="inline-flex items-center gap-1 font-medium text-pair-700 hover:underline"
                >
                  <PhoneIcon className="w-3.5 h-3.5 shrink-0" />
                  {phone}
                </a>
              ) : (
                <span className="text-muted">{t('eqwf.noPhone')}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {([
            { key: 'transcript', on: docTranscript, file: docFiles.transcript, label: t('eqwf.docTranscript') },
            { key: 'certificate', on: docCertificate, file: docFiles.certificate, label: t('eqwf.docCertificate') },
          ] as const).map((d) =>
            d.on ? (
              <button
                key={d.key}
                type="button"
                onClick={() => viewDoc(d.file)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-pair-200 bg-white text-xs font-medium text-pair-700 hover:bg-pair-50"
              >
                <DocumentIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[160px]">{d.file?.name || d.label}</span>
                <span className="text-muted">· {t('eqwf.viewDoc')}</span>
              </button>
            ) : (
              <span
                key={d.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs text-muted"
              >
                <DocumentIcon className="w-3.5 h-3.5 shrink-0" />
                {d.label} · {t('eqwf.notUploaded')}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );

  // One tab per evaluated major - shown on every stage that mirrors a single
  // major's mapping (the reviewer switches majors here; each keeps its own rows).
  const majorTabs = majorIds.length > 1 ? (
    <div className="flex flex-wrap gap-0 border-b border-line-strong mb-4">
      {majorIds.map((id, i) => {
        const active = activeMajorId === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setActiveMajorTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              active
                ? 'border-pair-600 text-pair-700'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {majorName(id) || `${t('eqwf.majorTab1')} ${i + 1}`}
          </button>
        );
      })}
    </div>
  ) : null;

  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div dir={dir}>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 bg-pair-50 border border-pair-200 rounded-sm px-4 py-2 text-sm text-pair-700"
        >
          {toast}
        </div>
      )}

      {/* Stepper */}
      <ol className="flex flex-wrap items-center gap-y-2 mb-6">
        {STAGE_ORDER.map((s, i) => {
          const current = stage === s;
          const done = stage === 'done' || stageIndex(stage) > i;
          return (
            <li key={s} className="flex items-center">
              <span
                className={`flex items-center gap-2 ps-1.5 pe-3 py-1.5 rounded-sm text-xs font-semibold transition-colors ${
                  current
                    ? 'bg-pair-600 text-white'
                    : done
                      ? 'bg-pair-50 text-pair-700 ring-1 ring-inset ring-pair-200'
                      : 'bg-panel text-muted ring-1 ring-inset ring-line'
                }`}
              >
                <span
                  className={`grid place-items-center h-5 w-5 rounded-sm text-[11px] font-bold tabular-nums ${
                    current
                      ? 'bg-white/20 text-white'
                      : done
                        ? 'bg-pair-600 text-white'
                        : 'bg-canvas text-muted'
                  }`}
                  dir="ltr"
                >
                  {done && !current ? <CheckIcon className="w-3 h-3" /> : i + 1}
                </span>
                {t(`eqwf.step.${s}`)}
              </span>
              {i < STAGE_ORDER.length - 1 && (
                <span aria-hidden className={`mx-1.5 h-px w-5 ${done ? 'bg-pair-300' : 'bg-line-strong'}`} />
              )}
            </li>
          );
        })}
      </ol>

      {/* Stage 1 - Documents ─────────────────────────────────────────────── */}
      {stage === 'documents' && (
        <section className="cck-card p-5">
          <header className="flex items-center justify-between gap-2 mb-1">
            <h2 className="font-semibold text-sm">{t('eqwf.docsTitle')}</h2>
            {roleTag('admission')}
          </header>
          <p className="text-xs text-muted mb-4">{t('eqwf.docsDesc')}</p>

          {sentBackBanner('admission')}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 max-w-2xl">
            <label className="block">
              <span className="cck-label">{t('eqwf.studentLabel')}</span>
              <input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder={t('eqwf.studentPlaceholder')}
                className="cck-input"
              />
            </label>
            <label className="block">
              <span className="cck-label">{t('eqwf.phone')}</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('eqwf.phonePlaceholder')}
                inputMode="tel"
                dir="ltr"
                className="cck-input"
              />
            </label>
            <label className="block">
              <span className="cck-label">{t('eqwf.civilId')}</span>
              <input
                value={civilId}
                onChange={(e) => setCivilId(e.target.value)}
                inputMode="numeric"
                dir="ltr"
                className="cck-input"
              />
            </label>
          </div>

          <div className="space-y-2.5 mb-5">
            {([
              { key: 'transcript', on: docTranscript, set: setDocTranscript, file: docFiles.transcript, label: t('eqwf.docTranscript') },
              { key: 'certificate', on: docCertificate, set: setDocCertificate, file: docFiles.certificate, label: t('eqwf.docCertificate') },
            ] as const).map((d) => (
              <div
                key={d.key}
                className={`flex items-center justify-between gap-3 rounded-sm border px-4 py-3 transition-colors ${
                  d.on ? 'border-pair-300 bg-pair-50/40' : 'border-line bg-canvas/50'
                }`}
              >
                <span className="text-sm text-ink font-medium flex items-center gap-2.5 min-w-0">
                  <span className={`grid place-items-center h-8 w-8 rounded-sm shrink-0 ${d.on ? 'bg-pair-100 text-pair-700' : 'bg-panel text-muted ring-1 ring-inset ring-line'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <span className="truncate">{d.on && d.file ? d.file.name : d.label}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {d.on && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-pair-700">
                      <CheckIcon className="w-3.5 h-3.5 shrink-0" />{t('eqwf.uploaded')}
                    </span>
                  )}
                  <label className="btn btn-outline btn-sm cursor-pointer">
                    {d.on ? t('eqwf.replace') : t('eqwf.upload')}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        d.set(!!file);
                        const next = { ...docFiles, [d.key]: file };
                        setDocFiles(next);
                        // Auto-extract once both documents are in place.
                        if (next.transcript && next.certificate) {
                          void runExtraction(next.transcript, next.certificate);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          {extracting && (
            <p className="-mt-3 mb-5 flex items-center gap-2 text-xs text-pair-700">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-pair-300 border-t-pair-600" />
              {t('eqwf.extracting')}
            </p>
          )}

          {/* Eligibility inputs - drive the Credit Transfer Policy check */}
          <div className="rounded-sm border border-line p-4 mb-5">
            <p className="text-xs font-semibold text-ink mb-3">{t('eqwf.eligibilityTitle')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-muted">{t('eqwf.sourceLabel')}</span>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as 'paaet' | 'public' | 'private')}
                  className="mt-1 w-full px-3 py-2 rounded-sm border border-line-strong text-sm bg-white"
                >
                  <option value="paaet">{t('eqwf.sourcePaaet')}</option>
                  <option value="public">{t('eqwf.sourcePublic')}</option>
                  <option value="private">{t('eqwf.sourcePrivate')}</option>
                </select>
              </label>
              {source === 'private' && (
                <label className="block">
                  <span className="text-xs font-medium text-muted">{t('eqwf.sourceInstitution')}</span>
                  <input
                    value={sourceInstitution}
                    onChange={(e) => setSourceInstitution(e.target.value)}
                    placeholder={t('eqwf.sourceInstitutionPlaceholder')}
                    className="mt-1 w-full px-3 py-2 rounded-sm border border-line-strong text-sm"
                  />
                </label>
              )}
              <label className="block">
                <span className="text-xs font-medium text-muted">{t('eqwf.sourceGpaLabel')}</span>
                <input
                  value={sourceGpa}
                  onChange={(e) => setSourceGpa(e.target.value)}
                  placeholder="2.67"
                  inputMode="decimal"
                  dir="ltr"
                  className="mt-1 w-full px-3 py-2 rounded-sm border border-line-strong text-sm"
                />
              </label>
              <div className="block relative">
                <span className="text-xs font-medium text-muted">{t('eqwf.majorLabel')}</span>
                <button
                  type="button"
                  onClick={() => setMajorDropdownOpen((o) => !o)}
                  className="mt-1 w-full px-3 py-2 rounded-sm border border-line-strong text-sm bg-white flex items-center justify-between gap-2 text-start"
                >
                  <span className={majorIds.length ? 'text-ink' : 'text-muted'}>
                    {majorIds.length
                      ? t('eqwf.majorsSelected').replace('{n}', String(majorIds.length))
                      : t('eqwf.majorPlaceholder')}
                  </span>
                  <span className="text-muted">▾</span>
                </button>
                {majorDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMajorDropdownOpen(false)} />
                    <div className="absolute z-20 mt-1 w-full max-h-72 overflow-auto rounded-sm border border-line-strong bg-white shadow-lg py-1">
                      {([
                        { school: 'business' as const, label: t('eqwf.schoolBusiness') },
                        { school: 'advanced_tech' as const, label: t('eqwf.schoolAdvancedTech') },
                      ])
                        .filter((grp) => CCK_MAJORS.some((m) => m.school === grp.school))
                        .map((grp) => (
                        <div key={grp.school}>
                          <div className="px-3 py-1 text-[11px] font-semibold text-[#9a9a9a]">{grp.label}</div>
                          {CCK_MAJORS.filter((m) => m.school === grp.school).map((m) => (
                            <label
                              key={m.value}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-canvas cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={majorIds.includes(m.value)}
                                onChange={() => toggleMajor(m.value)}
                                className="accent-pair-600"
                              />
                              <span>{locale === 'ar' ? m.ar : m.en}</span>
                            </label>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {majorIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {majorIds.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-pair-50 text-pair-700 text-xs"
                      >
                        {majorName(id)}
                        <button
                          type="button"
                          onClick={() => toggleMajor(id)}
                          aria-label={t('eqwf.removeMajor')}
                          className="text-pair-700 hover:text-pair-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={oldCourses} onChange={(e) => setOldCourses(e.target.checked)} className="accent-pair-600" />
                {t('eqwf.oldCourses')}
              </label>
              {oldCourses && (
                <label className="flex items-center gap-2 text-sm ms-6">
                  <input type="checkbox" checked={vpaException} onChange={(e) => setVpaException(e.target.checked)} className="accent-pair-600" />
                  {t('eqwf.vpaException')}
                </label>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={afterCensus} onChange={(e) => setAfterCensus(e.target.checked)} className="accent-pair-600" />
                {t('eqwf.afterCensus')}
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStage('registration')}
              disabled={!docTranscript || !docCertificate}
              className="btn btn-primary"
            >
              {t('eqwf.continue')}
            </button>
            <button
              type="button"
              onClick={() => {
                setDocTranscript(true);
                setDocCertificate(true);
                setStage('registration');
              }}
              className="px-4 py-2 rounded-sm text-sm font-medium border border-dashed border-line-strong text-muted hover:bg-canvas"
            >
              {t('eqwf.bypassDemo')}
            </button>
          </div>
        </section>
      )}

      {/* Stage 2 - Registration equivalency (registration staff fill the
          prior-course columns of the Transfer Credits Equivalency Form). */}
      {stage === 'registration' && (
        <section className="cck-card p-5">
          <header className="flex items-center justify-between gap-2 mb-1">
            <h2 className="font-semibold text-sm">{t('eqwf.regTitle')}</h2>
            {roleTag('admission')}
          </header>
          <p className="text-xs text-muted mb-4">{t('eqwf.regDesc')}</p>

          {studentBanner}
          {sentBackBanner('admission')}

          {/* Applicant header - mirrors the top of the paper form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-sm border border-line-strong p-4 mb-5">
            <label className="block">
              <span className="text-xs font-medium text-muted">{t('eqwf.applicantName')}</span>
              <input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder={t('eqwf.studentPlaceholder')}
                className="mt-1 w-full px-3 py-2 rounded-sm border border-line-strong text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted">{t('eqwf.civilId')}</span>
              <input
                value={civilId}
                onChange={(e) => setCivilId(e.target.value)}
                dir="ltr"
                className="mt-1 w-full px-3 py-2 rounded-sm border border-line-strong text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted">{t('eqwf.phone')}</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                inputMode="tel"
                placeholder={t('eqwf.phonePlaceholder')}
                className="mt-1 w-full px-3 py-2 rounded-sm border border-line-strong text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted">{t('eqwf.priorCollege')}</span>
              <input
                value={priorCollege}
                onChange={(e) => setPriorCollege(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-sm border border-line-strong text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted">{t('eqwf.commencement')}</span>
              <input
                value={commencement}
                onChange={(e) => setCommencement(e.target.value)}
                placeholder={t('eqwf.commencementPlaceholder')}
                className="mt-1 w-full px-3 py-2 rounded-sm border border-line-strong text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-muted">{t('eqwf.requestedMajor')}</span>
              <input
                value={requestedMajor}
                onChange={(e) => setRequestedMajor(e.target.value)}
                placeholder={t('eqwf.requestedMajorPlaceholder')}
                className="mt-1 w-full px-3 py-2 rounded-sm border border-line-strong text-sm"
              />
            </label>
          </div>

          {/* One mapping per evaluated major - registration records prior courses
              separately for each, since the CCK equivalents differ. */}
          {majorTabs}

          {/* Add prior courses + the registration table, unified into one card.
              The picker is a combobox toolbar: typing opens a results popover and
              each pick drops a row straight into the table below. */}
          <div className="rounded-sm border border-line-strong mb-4">
            <div className="bg-pair-50 text-pair-700 px-3 py-2 text-center cck-section-label text-muted border-b border-line-strong">
              {t('eqwf.groupRegistration')}
            </div>

            {/* Add-prior-courses toolbar */}
            <div className="p-3 border-b border-line-strong">
              <p className="text-xs font-medium text-ink mb-2">{t('eqwf.addPaaetTitle')}</p>
              {!activeMajorId && (
                <p className="text-xs text-pair-700 bg-pair-50 border border-pair-200 rounded-sm px-2.5 py-1.5 mb-2">
                  {t('eqwf.addNeedsMajor')}
                </p>
              )}
              <div className="relative">
                <div className="flex flex-wrap gap-2">
                  <select
                    value={program}
                    onChange={(e) => { setProgram(e.target.value); setPickerOpen(true); }}
                    onFocus={() => setPickerOpen(true)}
                    disabled={!activeMajorId}
                    className="px-3 py-1.5 rounded-sm border border-line-strong text-sm bg-white disabled:opacity-50"
                  >
                    <option value="all">{t('eqwf.programAll')}</option>
                    {programs.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPickerOpen(true); }}
                    onFocus={() => setPickerOpen(true)}
                    placeholder={t('eqwf.searchPaaet')}
                    disabled={!activeMajorId}
                    className="px-3 py-1.5 rounded-sm border border-line-strong text-sm flex-1 min-w-[200px] disabled:opacity-50"
                  />
                </div>
                {pickerOpen && activeMajorId && (
                  <>
                    {/* click-away backdrop */}
                    <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
                    <div className="absolute z-20 mt-1 w-full max-h-72 overflow-auto rounded-sm border border-line-strong bg-white shadow-lg">
                      {filteredPaaet.length === 0 ? (
                        <p className="px-3 py-6 text-center text-xs text-muted">{t('eqwf.noResults')}</p>
                      ) : (
                        <table className="w-full text-sm">
                          <tbody>
                            {filteredPaaet.slice(0, 200).map((p) => {
                              const added = selected.some((s) => s.id === p.id);
                              return (
                                <tr key={p.id} className="border-b border-line last:border-0">
                                  <td className="px-3 py-2">
                                    <p className="font-medium">{p.name}</p>
                                    <p className="text-xs text-muted">
                                      <span dir="ltr">{p.code}</span> · {p.program}
                                      {p.credit ? ` · ${p.credit} cr` : ''}
                                    </p>
                                  </td>
                                  <td className="px-3 py-2 text-end w-20">
                                    <button
                                      type="button"
                                      onClick={() => addCourse(p)}
                                      disabled={added}
                                      className="px-2.5 py-1 rounded-sm text-xs font-medium border border-line-strong hover:bg-canvas disabled:opacity-40"
                                    >
                                      {added ? t('eqwf.added') : t('eqwf.add')}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Registration-department columns - the prior-course details the
                picker above fills in. Academic staff map the CCK equivalents next. */}
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm border-collapse">
                <colgroup>
                  <col className="w-[16%]" />
                  <col className="w-[34%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[26%]" />
                </colgroup>
                <thead>
                  <tr className="text-muted bg-canvas/60">
                    <th className="border border-line-strong px-2 py-2 text-start font-medium">{t('eqwf.colCourseCode')}</th>
                    <th className="border border-line-strong px-2 py-2 text-start font-medium">{t('eqwf.colPriorTitle')}</th>
                    <th className="border border-line-strong px-2 py-2 text-start font-medium">{t('eqwf.colCredits')}</th>
                    <th className="border border-line-strong px-2 py-2 text-start font-medium">{t('eqwf.colGrade')}</th>
                    <th className="border border-line-strong px-2 py-2 text-start font-medium">{t('eqwf.colSemester')}</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="border border-line-strong px-3 py-8 text-center text-xs text-muted">
                      {t('eqwf.noneSelected')}
                    </td>
                  </tr>
                ) : (
                  selected.map((s) => (
                    <tr key={s.id} className="align-top">
                      <td className="border border-line-strong px-2 py-2 break-words" dir="ltr">{s.code}</td>
                      <td className="border border-line-strong px-2 py-2 break-words">{s.name}</td>
                      <td className="border border-line-strong px-2 py-2">
                        <input
                          value={s.creditHours}
                          onChange={(e) => setCreditHours(s.id, e.target.value)}
                          inputMode="decimal"
                          aria-label={t('eqwf.creditLabel')}
                          dir="ltr"
                          className="cck-input py-1 text-xs"
                        />
                      </td>
                      <td className="border border-line-strong px-2 py-2">
                        <input
                          value={s.grade}
                          onChange={(e) => setGrade(s.id, e.target.value)}
                          placeholder={t('eqwf.gradePlaceholder')}
                          aria-label={t('eqwf.gradeLabel')}
                          dir="ltr"
                          className="cck-input py-1 text-xs"
                        />
                      </td>
                      <td className="border border-line-strong px-2 py-2">
                        <div className="flex items-center gap-2">
                          <input
                            value={s.semester}
                            onChange={(e) => setSemester(s.id, e.target.value)}
                            placeholder={t('eqwf.semesterPlaceholder')}
                            aria-label={t('eqwf.colSemester')}
                            className="cck-input py-1 text-xs flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeCourse(s.id)}
                            aria-label={t('eqwf.remove')}
                            className="shrink-0 text-danger-600 hover:text-danger-700"
                          >
                            <CloseIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5">
            <button
              type="button"
              onClick={() => setStage('documents')}
              className="px-3 py-2 rounded-sm text-sm font-medium border border-line-strong hover:bg-canvas"
            >
              {t('eqwf.back')}
            </button>
            <button
              type="button"
              onClick={() => setStage('academic')}
              disabled={!registrationComplete}
              title={!registrationComplete ? t('eqwf.completeRegFirst') : undefined}
              className="btn btn-primary"
            >
              {t('eqwf.toAcademic')}
            </button>
          </div>
        </section>
      )}

      {/* Stage 3 - Academic equivalency (academic staff map the CCK equivalents
          for the prior courses registration recorded). */}
      {stage === 'academic' && (
        <section className="cck-card p-5">
          <header className="flex items-center justify-between gap-2 mb-1">
            <h2 className="font-semibold text-sm">{t('eqwf.acadTitle')}</h2>
            {roleTag('academic')}
          </header>
          <p className="text-xs text-muted mb-4">{t('eqwf.acadDesc')}</p>

          {studentBanner}
          {sentBackBanner('academic')}

          {majorTabs}

          {/* The form table - laid out exactly like the paper equivalency form.
              The "Registration department" columns are read-only here (filled in
              the previous step); academic staff fill the "Academic Department"
              columns and may combine prior courses into one CCK course. */}
          <div className="overflow-x-auto rounded-sm border border-line-strong mb-4">
            <table className="w-full table-fixed text-sm border-collapse">
              <colgroup>
                <col className="w-[13%]" />
                <col className="w-[16%]" />
                <col className="w-[6%]" />
                <col className="w-[6%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
                <col className="w-[18%]" />
                <col className="w-[6%]" />
                <col className="w-[10%]" />
                <col className="w-[7%]" />
              </colgroup>
              <thead>
                <tr>
                  <th
                    colSpan={5}
                    className="border border-line-strong bg-pair-50 text-pair-700 px-3 py-2 text-center cck-section-label text-muted"
                  >
                    {t('eqwf.groupRegistration')}
                  </th>
                  <th
                    colSpan={5}
                    className="border border-line-strong bg-canvas text-body px-3 py-2 text-center cck-section-label text-muted"
                  >
                    {t('eqwf.groupAcademic')}
                  </th>
                </tr>
                <tr className="text-muted bg-canvas/60">
                  <th className="border border-line-strong px-2 py-2 text-start font-medium">{t('eqwf.colCourseCode')}</th>
                  <th className="border border-line-strong px-2 py-2 text-start font-medium">{t('eqwf.colPriorTitle')}</th>
                  <th className="border border-line-strong px-2 py-2 text-start font-medium">{t('eqwf.colCredits')}</th>
                  <th className="border border-line-strong px-2 py-2 text-start font-medium">{t('eqwf.colGrade')}</th>
                  <th className="border border-line-strong px-2 py-2 text-start font-medium">{t('eqwf.colSemester')}</th>
                  <th className="border border-line-strong px-2 py-2 text-start font-medium">{t('eqwf.colCckCode')}</th>
                  <th className="border border-line-strong px-2 py-2 text-start font-medium">{t('eqwf.colCckTitle')}</th>
                  <th className="border border-line-strong px-2 py-2 text-start font-medium">{t('eqwf.colCredits')}</th>
                  <th className="border border-line-strong px-2 py-2 text-start font-medium">{t('eqwf.colComments')}</th>
                  <th className="border border-line-strong" aria-hidden="true" />
                </tr>
              </thead>
              <tbody>
                {selected.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="border border-line-strong px-3 py-8 text-center text-xs text-muted">
                      {t('eqwf.noneSelected')}
                    </td>
                  </tr>
                ) : (
                  orderedRows.map((s) => {
                    const cck = cckById(s.cckId);
                    const combined = !!s.combineGroup;
                    // Group members are adjacent in orderedRows, so the academic
                    // columns render once (on the first member) and span the group.
                    const groupRows = combined
                      ? orderedRows.filter((x) => x.combineGroup === s.combineGroup)
                      : [s];
                    const isFirstInGroup = groupRows[0].id === s.id;
                    const groupSpan = groupRows.length;
                    return (
                      <tr key={s.id} className="align-top">
                        {/* Registration department columns - read-only here */}
                        <td className="border border-line-strong px-2 py-2 break-words" dir="ltr">{s.code}</td>
                        <td className="border border-line-strong px-2 py-2 break-words">
                          {s.name}
                          {/* Academic staff combine prior courses into one CCK
                              course. Rows already combined show a badge + undo. */}
                          {combined ? (
                            <span className="mt-1.5 inline-flex items-center gap-1.5 text-[11px]">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-medium cck-chip-neutral">
                                {t('eqwf.combinedBadge')}
                              </span>
                              <button
                                type="button"
                                onClick={() => uncombine(s.combineGroup!)}
                                className="text-pair-600 hover:text-pair-700"
                              >
                                {t('eqwf.uncombine')}
                              </button>
                            </span>
                          ) : (
                            <label className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted">
                              <input
                                type="checkbox"
                                checked={combinePicks.has(s.id)}
                                onChange={() => toggleCombinePick(s.id)}
                                className="accent-pair-600"
                              />
                              {t('eqwf.combineSelect')}
                            </label>
                          )}
                        </td>
                        <td className="border border-line-strong px-2 py-2 text-ink" dir="ltr">
                          {s.creditHours || <span className="text-muted">-</span>}
                        </td>
                        <td className="border border-line-strong px-2 py-2 text-ink" dir="ltr">
                          {s.grade || <span className="text-muted">-</span>}
                        </td>
                        <td className="border border-line-strong px-2 py-2 text-ink">
                          {s.semester || <span className="text-muted">-</span>}
                        </td>
                        {/* Academic department columns - one CCK course is shared
                            across a combine group, so these cells render once on
                            the group's first row and span the rest. */}
                        {isFirstInGroup && (
                          <>
                            <td rowSpan={groupSpan} className="border border-line-strong px-2 py-2 break-words align-top" dir="ltr">
                              {cck && cck.code !== '-' ? cck.code : <span className="text-muted">-</span>}
                            </td>
                            <td rowSpan={groupSpan} className="border border-line-strong px-2 py-2 align-top">
                              <CckCombobox
                                courses={cckCourses}
                                value={s.cckId}
                                onChange={(id) => setCck(s.id, id)}
                                placeholder={t('eqwf.choose')}
                                unlistedTag={t('eqwf.unlistedTag')}
                              />
                              {combined && (
                                <p className="mt-1.5 text-[11px] text-muted">{t('eqwf.combinedHint')}</p>
                              )}
                            </td>
                            <td rowSpan={groupSpan} className="border border-line-strong px-2 py-2 text-muted align-top" dir="ltr">{cck?.credit || '-'}</td>
                            <td rowSpan={groupSpan} className="border border-line-strong px-2 py-2 align-top">
                              <input
                                value={s.comments}
                                onChange={(e) => setComments(s.id, e.target.value)}
                                placeholder={t('eqwf.commentsPlaceholder')}
                                aria-label={t('eqwf.colComments')}
                                className="cck-input py-1 text-xs"
                              />
                            </td>
                          </>
                        )}
                        <td className="border border-line-strong px-1 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeCourse(s.id)}
                            aria-label={t('eqwf.remove')}
                            className="text-danger-600 hover:text-danger-700 inline-flex"
                          >
                            <CloseIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Combine box - tick two or more prior courses above, then combine
              them into one CCK course. */}
          <div className="rounded-sm border border-line p-3 mb-5">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={false}
                disabled={combinePicks.size < 2}
                onChange={(e) => { if (e.target.checked) combineSelected(); }}
                className="accent-pair-600 disabled:opacity-50"
              />
              <span className={combinePicks.size < 2 ? 'text-muted' : 'text-ink'}>
                {t('eqwf.combineBox')}
              </span>
              {combinePicks.size >= 2 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[11px] font-medium bg-pair-50 text-pair-700">
                  {combinePicks.size}
                </span>
              )}
            </label>
            <p className="mt-1 text-[11px] text-muted">{t('eqwf.combineBoxHint')}</p>
          </div>

          {/* Add-unlisted control (Academic Department) */}
          <div className="flex flex-wrap items-start gap-3 mb-5">
            <div className="rounded-sm border border-line p-3 flex-1 min-w-[260px]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-ink">{t('eqwf.addUnlisted')}</p>
                <button
                  type="button"
                  onClick={() => setShowUnlisted((v) => !v)}
                  className="text-xs text-pair-600 hover:text-pair-700"
                >
                  {showUnlisted ? t('eqwf.back') : '+'}
                </button>
              </div>
              <p className="text-[11px] text-muted mb-2">{t('eqwf.addUnlistedHint')}</p>
              {showUnlisted && (
                <div className="space-y-2">
                  <input
                    value={unlisted.name}
                    onChange={(e) => setUnlisted((u) => ({ ...u, name: e.target.value }))}
                    placeholder={t('eqwf.unlistedName')}
                    className="cck-input py-1.5"
                  />
                  <div className="flex gap-2">
                    <input
                      value={unlisted.code}
                      onChange={(e) => setUnlisted((u) => ({ ...u, code: e.target.value }))}
                      placeholder={t('eqwf.unlistedCode')}
                      dir="ltr"
                      className="flex-1 px-2 py-1.5 rounded-sm border border-line-strong text-sm"
                    />
                    <input
                      value={unlisted.credit}
                      onChange={(e) => setUnlisted((u) => ({ ...u, credit: e.target.value }))}
                      placeholder={t('eqwf.unlistedCredit')}
                      dir="ltr"
                      inputMode="numeric"
                      className="w-20 px-2 py-1.5 rounded-sm border border-line-strong text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addUnlistedCourse}
                    disabled={!unlisted.name.trim()}
                    className="px-3 py-1.5 bg-pair-600 text-white rounded-sm text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
                  >
                    {t('eqwf.addCourse')}
                  </button>
                </div>
              )}
            </div>
          </div>

          <CompliancePanel issues={validation} />

          <div className="flex items-center gap-2 mt-5">
            <button
              type="button"
              onClick={() => setStage('registration')}
              className="px-3 py-2 rounded-sm text-sm font-medium border border-line-strong hover:bg-canvas"
            >
              {t('eqwf.back')}
            </button>
            <button
              type="button"
              onClick={() => setStage('vp')}
              disabled={!formComplete}
              title={!formComplete ? t('eqwf.completeFormFirst') : undefined}
              className="btn btn-primary"
            >
              {t('eqwf.submitForm')}
            </button>
            <button
              type="button"
              onClick={() => setAcadSendBackOpen(true)}
              className="px-4 py-2 rounded-sm text-sm font-medium border border-line-strong text-ink hover:bg-canvas"
            >
              {t('eqwf.sendBackToReg')}
            </button>
          </div>
        </section>
      )}

      <SendBackDialog
        open={acadSendBackOpen}
        fixedTarget="admission"
        onCancel={() => setAcadSendBackOpen(false)}
        onConfirm={(target, reason, files) => handleSendBack(target, reason, files, 'academic')}
      />

      {/* Stage 5 - Discuss with student (final acceptance) ───────────────── */}
      {stage === 'student' && (
        <section className="cck-card p-5">
          <header className="flex items-center justify-between gap-2 mb-1">
            <h2 className="font-semibold text-sm">{t('eqwf.studentTitle')}</h2>
            {roleTag('admission')}
          </header>
          <p className="text-xs text-muted mb-4">{t('eqwf.studentDesc')}</p>
          {studentBanner}
          {majorTabs}
          <EquivalencySummaryTable selected={selected} cckById={cckById} totalCredits={totalCredits} />
          <CompliancePanel issues={validation} />
          <div className="flex items-center gap-2 mt-5">
            <button
              type="button"
              onClick={() => setStage('vp')}
              className="px-3 py-2 rounded-sm text-sm font-medium border border-line-strong hover:bg-canvas"
            >
              {t('eqwf.back')}
            </button>
            <button
              type="button"
              onClick={() => finishWithOutcome('declined')}
              className="px-3 py-2 rounded-sm text-sm font-medium border border-danger-300 text-danger-700 hover:bg-danger-50"
            >
              {t('eqwf.studentReject')}
            </button>
            <button
              type="button"
              onClick={() => finishWithOutcome('pending')}
              className="px-4 py-2 rounded-sm text-sm font-medium border border-line-strong text-ink hover:bg-canvas"
            >
              {t('eqwf.studentPending')}
            </button>
            <button
              type="button"
              onClick={() => finishWithOutcome('accepted')}
              className="px-4 py-2 bg-pair-600 text-white rounded-sm text-sm font-medium hover:bg-pair-700"
            >
              {t('eqwf.studentAccept')}
            </button>
          </div>
        </section>
      )}

      {/* Stage 4 - VP approval ───────────────────────────────────────────── */}
      {stage === 'vp' && (
        <section className="cck-card p-5">
          <header className="flex items-center justify-between gap-2 mb-1">
            <h2 className="font-semibold text-sm">{t('eqwf.vpTitle')}</h2>
            {roleTag('vp')}
          </header>
          <p className="text-xs text-muted mb-4">{t('eqwf.vpDesc')}</p>
          {studentBanner}
          {majorTabs}
          <EquivalencySummaryTable selected={selected} cckById={cckById} totalCredits={totalCredits} />
          <CompliancePanel issues={validation} />
          <div className="flex items-center gap-2 mt-5">
            <button
              type="button"
              onClick={() => setStage('academic')}
              className="px-3 py-2 rounded-sm text-sm font-medium border border-line-strong hover:bg-canvas"
            >
              {t('eqwf.back')}
            </button>
            <button
              type="button"
              onClick={() => setStage('student')}
              disabled={blockingIssues.length > 0}
              title={blockingIssues.length > 0 ? t('eqwf.blockedByPolicy') : undefined}
              className="btn btn-primary"
            >
              {t('eqwf.vpApprove')}
            </button>
            <button
              type="button"
              onClick={() => setSendBackOpen(true)}
              className="px-4 py-2 rounded-sm text-sm font-medium border border-line-strong text-ink hover:bg-canvas"
            >
              {t('eqwf.sendBack')}
            </button>
          </div>
        </section>
      )}

      <SendBackDialog
        open={sendBackOpen}
        onCancel={() => setSendBackOpen(false)}
        onConfirm={handleSendBack}
      />

      {/* Done ────────────────────────────────────────────────────────────── */}
      {stage === 'done' && (() => {
        const meta = OUTCOME_META[outcome ?? 'accepted'];
        return (
        <section className="cck-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium ${meta.badge}`}>
              <meta.Icon className="w-3.5 h-3.5 shrink-0" />{t(meta.title)}
            </span>
            {studentName.trim() && (
              <span className="text-sm font-medium">{studentName}</span>
            )}
          </div>
          <p className="text-xs text-muted mb-4">{t(meta.desc)}</p>
          {majorTabs}
          <EquivalencySummaryTable selected={selected} cckById={cckById} totalCredits={totalCredits} />
          <CompliancePanel issues={validation} />
          <button
            type="button"
            onClick={reset}
            className="mt-5 px-4 py-2 border border-line-strong rounded-sm text-sm font-medium hover:bg-canvas"
          >
            {t('eqwf.newRequest')}
          </button>
        </section>
        );
      })()}
    </div>
  );
}

function CompliancePanel({ issues }: { issues: TransferValidationIssue[] }) {
  const { t, locale } = useI18n();
  const blocks = issues.filter((i) => i.severity === 'block');
  const infos = issues.filter((i) => i.severity === 'info');

  if (issues.length === 0) {
    return (
      <div className="mt-4 rounded-sm border border-pair-200 bg-pair-50 px-4 py-3">
        <p className="text-sm font-medium text-pair-700 flex items-center gap-1.5"><CheckIcon className="w-3.5 h-3.5 shrink-0" />{t('eqwf.policyOk')}</p>
        <p className="text-xs text-pair-700/80 mt-0.5">{t('eqwf.policyOkDesc')}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {blocks.length > 0 && (
        <div className="rounded-sm border border-danger-200 bg-danger-50 px-4 py-3">
          <p className="text-sm font-semibold text-danger-700 mb-2">{t('eqwf.policyBlocked')}</p>
          <ul className="space-y-1.5">
            {blocks.map((i, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-danger-700">
                <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-danger-500 shrink-0" />
                <span>{locale === 'ar' ? i.message_ar : i.message_en}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {infos.length > 0 && (
        <div className="rounded-sm border border-line bg-canvas px-4 py-3">
          <p className="text-sm font-semibold text-ink mb-2">{t('eqwf.policyNotes')}</p>
          <ul className="space-y-1.5">
            {infos.map((i, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-body">
                <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-line-strong shrink-0" />
                <span>{locale === 'ar' ? i.message_ar : i.message_en}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EquivalencySummaryTable({
  selected,
  cckById,
  totalCredits,
}: {
  selected: SelectedCourse[];
  cckById: (id: string | null) => CckOption | null;
  totalCredits: number;
}) {
  const { t } = useI18n();
  return (
    <div className="overflow-x-auto rounded-sm border border-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted border-b">
            <th className="px-3 py-2 text-start font-medium">{t('eqwf.summaryPaaet')}</th>
            <th className="px-3 py-2 text-start font-medium">{t('eqwf.summaryGrade')}</th>
            <th className="px-3 py-2 text-start font-medium">{t('eqwf.summaryCck')}</th>
            <th className="px-3 py-2 text-start font-medium">{t('eqwf.summaryCredit')}</th>
          </tr>
        </thead>
        <tbody>
          {selected.map((s) => {
            const cck = cckById(s.cckId);
            return (
              <tr key={s.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted" dir="ltr">{s.code}</p>
                </td>
                <td className="px-3 py-2 font-medium" dir="ltr">
                  {s.grade || '-'}
                  {s.creditHours ? (
                    <span className="text-xs font-normal text-muted"> · {s.creditHours} {t('eqwf.creditUnit')}</span>
                  ) : null}
                </td>
                <td className="px-3 py-2">
                  {cck ? (
                    <>
                      <p className="font-medium">{cck.name}</p>
                      <p className="text-xs text-muted" dir="ltr">{cck.code}</p>
                    </>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-muted" dir="ltr">{cck?.credit || '-'}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-line">
            <td className="px-3 py-2 font-semibold" colSpan={3}>{t('eqwf.totalCredits')}</td>
            <td className="px-3 py-2 font-semibold" dir="ltr">{totalCredits}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// VP "send back" dialog - the VP picks which team re-evaluates the request,
// explains why, and may attach photos or documents to clarify the changes.
function SendBackDialog({
  open,
  onCancel,
  onConfirm,
  fixedTarget,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: (target: 'admission' | 'academic', reason: string, files: File[]) => void;
  // When set, the team picker is hidden and the request always goes back to
  // this team (e.g. academic staff returning the request to registration).
  fixedTarget?: 'admission' | 'academic';
}) {
  const { t, dir } = useI18n();
  const titleId = useId();
  const descId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [target, setTarget] = useState<'admission' | 'academic'>(fixedTarget ?? 'admission');
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    setTarget(fixedTarget ?? 'admission');
    setReason('');
    setFiles([]);
    const tm = setTimeout(() => textareaRef.current?.focus(), 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(tm);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;

  const trimmed = reason.trim();
  const disabled = trimmed.length === 0;

  const targets: { value: 'admission' | 'academic' }[] = [
    { value: 'admission' },
    { value: 'academic' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir={dir}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden />
      <div className="relative bg-white rounded-sm shadow-xl border border-line p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 id={titleId} className="text-lg font-semibold mb-1">
          {t('eqwf.sendBackTitle')}
        </h3>
        <p id={descId} className="text-sm text-muted mb-4">
          {t('eqwf.sendBackHint')}
        </p>

        <fieldset className={`mb-4 ${fixedTarget ? 'hidden' : ''}`}>
          <legend className="block text-xs font-medium text-muted mb-2">
            {t('eqwf.sendBackTo')}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {targets.map((opt) => {
              const active = target === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTarget(opt.value)}
                  aria-pressed={active}
                  className={`px-3 py-2 rounded-sm text-sm font-medium border text-start ${
                    active
                      ? 'border-pair-600 bg-pair-50 text-pair-700'
                      : 'border-line-strong text-ink hover:bg-canvas'
                  }`}
                >
                  {t(`eqwf.role.${opt.value}`)}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label htmlFor={`${titleId}-reason`} className="block text-xs font-medium text-muted mb-1">
          {t('eqwf.sendBackReason')}
        </label>
        <textarea
          id={`${titleId}-reason`}
          ref={textareaRef}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder={t('eqwf.sendBackReasonPlaceholder')}
          className="w-full border border-line-strong rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-200"
        />
        {trimmed.length === 0 && (
          <p className="mt-1 text-xs text-danger-600">{t('eqwf.sendBackReasonRequired')}</p>
        )}

        <div className="mt-4">
          <p className="block text-xs font-medium text-muted mb-1">{t('eqwf.sendBackAttach')}</p>
          <p className="text-[11px] text-muted mb-2">{t('eqwf.sendBackAttachHint')}</p>
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-medium border border-line-strong hover:bg-canvas cursor-pointer">
            <PaperclipIcon className="w-3.5 h-3.5 shrink-0" />
            {t('eqwf.sendBackAddFiles')}
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                if (picked.length) setFiles((prev) => [...prev, ...picked]);
                e.target.value = '';
              }}
            />
          </label>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {files.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 rounded-sm border border-line px-3 py-1.5 text-sm"
                >
                  <span className="truncate flex items-center gap-1.5 min-w-0">
                    <PaperclipIcon className="w-3.5 h-3.5 shrink-0 text-muted" />
                    <span className="truncate">{f.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    aria-label={t('eqwf.remove')}
                    className="shrink-0 text-danger-600 hover:text-danger-700"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-line-strong rounded-sm text-sm hover:bg-canvas"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(target, trimmed, files)}
            disabled={disabled}
            className="px-4 py-2 bg-ink text-white rounded-sm text-sm font-medium hover:bg-ink/85 disabled:opacity-50"
          >
            {t('eqwf.sendBackConfirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
