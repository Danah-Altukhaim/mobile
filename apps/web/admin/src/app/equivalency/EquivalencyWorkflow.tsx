'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { EquivalencyEntry, PaaetEquivalencyEntry } from '@masari/shared';
import { useI18n } from '@/lib/i18n';
import {
  validateTransferAttempt,
  lowestGradeOf,
  type TransferValidationIssue,
} from '@/lib/cckPolicies';

// ---------------------------------------------------------------------------
// Equivalency request workflow (Equivalency Screen Update doc).
//
// Models the full PAAET → CCK transfer-equivalency flow as staged hand-offs
// between roles:
//   1. Admission staff upload the official transcript + final certificate.
//   2. The Transfer Credits Equivalency Form — a single page laid out exactly
//      like the official paper form. Admission fills the "Registration
//      department" columns (PAAET course, credits, grade, semester) and academic
//      staff fill the "Academic Department" columns (CCK course + comments),
//      may add unlisted courses, and may combine two PAAET courses into one CCK
//      course.
//   3. VP for Academic Affairs reviews and approves the equivalency.
//   4. Request returns to admission to discuss the VP-approved equivalency
//      with the student; student acceptance completes the request.
// ---------------------------------------------------------------------------

type Stage = 'documents' | 'form' | 'student' | 'vp' | 'done';
const STAGE_ORDER: Stage[] = ['documents', 'form', 'vp', 'student'];

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
}

const stageIndex = (s: Stage) => STAGE_ORDER.indexOf(s);

/** Code-first label for a CCK course, e.g. "ACC2385 — Accounting Software". */
const cckLabel = (c: CckOption) =>
  c.code && c.code !== '-' ? `${c.code} — ${c.name}` : c.name;

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
        className="w-full px-2 py-1.5 rounded border border-gray-300 text-sm bg-white text-start disabled:opacity-50 truncate"
      >
        {selected ? (
          <>
            {cckLabel(selected)}
            {selected.unlisted && unlistedTag ? ` · ${unlistedTag}` : ''}
          </>
        ) : (
          <span className="text-[#737477]">{placeholder}</span>
        )}
      </button>
      {open && !disabled && rect &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: 'fixed', left: rect.left, top: rect.top + 4, width: rect.width, zIndex: 50 }}
            className="max-h-72 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('eqwf.searchCck')}
                className="w-full px-2 py-1.5 rounded border border-gray-300 text-sm"
              />
            </div>
            <ul className="py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-xs text-[#737477]">{t('eqwf.noResults')}</li>
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
                      className={`w-full text-start px-3 py-1.5 text-sm hover:bg-gray-50 ${
                        c.id === value ? 'bg-pair-50 text-pair-700' : ''
                      }`}
                    >
                      {c.code && c.code !== '-' && (
                        <span dir="ltr" className="font-medium">{c.code}</span>
                      )}
                      {c.code && c.code !== '-' ? ' — ' : ''}
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
  { value: 'dip_bme', en: 'Diploma of Business - Management & Entrepreneurship', ar: 'دبلوم إدارة الأعمال - الإدارة وريادة الأعمال', school: 'business' },
  { value: 'dip_marketing', en: 'Diploma of Business - Marketing', ar: 'دبلوم إدارة الأعمال - التسويق', school: 'business' },
  { value: 'dip_accounting', en: 'Diploma of Business - Accounting', ar: 'دبلوم إدارة الأعمال - المحاسبة', school: 'business' },
  { value: 'bba_bme', en: 'BBA - Management & Entrepreneurship', ar: 'بكالوريوس إدارة الأعمال - الإدارة وريادة الأعمال', school: 'business' },
  { value: 'bba_accounting', en: 'BBA - Accounting', ar: 'بكالوريوس إدارة الأعمال - المحاسبة', school: 'business' },
  { value: 'bba_marketing', en: 'BBA - Management & Entrepreneurship (Marketing)', ar: 'بكالوريوس إدارة الأعمال - الإدارة وريادة الأعمال (التسويق)', school: 'business' },
  { value: 'dip_cp', en: 'Diploma of Computer Programming', ar: 'دبلوم برمجة الحاسوب', school: 'advanced_tech' },
  { value: 'dip_iawd', en: 'Diploma of Internet Application & Web Development', ar: 'دبلوم تطبيقات الإنترنت وتطوير المواقع', school: 'advanced_tech' },
];

export default function EquivalencyWorkflow({
  entries,
  paaetEntries,
}: {
  entries: EquivalencyEntry[];
  paaetEntries: PaaetEquivalencyEntry[];
}) {
  const { t, locale, dir } = useI18n();

  // Catalog of CCK courses academic staff can map to, plus any unlisted
  // courses they add during this request.
  const [extraCck, setExtraCck] = useState<CckOption[]>([]);
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
  const [stage, setStage] = useState<Stage>('documents');
  const [studentName, setStudentName] = useState('');
  // Applicant header fields, mirroring the paper Transfer Credits Equivalency Form.
  const [priorCollege, setPriorCollege] = useState(
    'The Public Authority for Applied Education & Training',
  );
  const [civilId, setCivilId] = useState('');
  const [commencement, setCommencement] = useState('');
  const [requestedMajor, setRequestedMajor] = useState('');
  const [docTranscript, setDocTranscript] = useState(false);
  const [docCertificate, setDocCertificate] = useState(false);
  // The actual uploaded files, so reviewers can open them from later stages.
  const [docFiles, setDocFiles] = useState<{ transcript: File | null; certificate: File | null }>({
    transcript: null,
    certificate: null,
  });
  // Eligibility inputs for the Credit Transfer Policy v2.0 compliance check.
  const [source, setSource] = useState<'paaet' | 'public' | 'private'>('paaet');
  const [sourceGpa, setSourceGpa] = useState('');
  const [majorId, setMajorId] = useState('');
  // When set, the request is evaluated for a second major in parallel.
  const [secondMajor, setSecondMajor] = useState(false);
  const [secondMajorId, setSecondMajorId] = useState('');
  const [oldCourses, setOldCourses] = useState(false);
  const [vpaException, setVpaException] = useState(false);
  const [afterCensus, setAfterCensus] = useState(false);
  // Each evaluated major keeps its own course mapping, since the CCK equivalents
  // differ per major. When no second major is requested only the primary list
  // is ever touched, so this behaves exactly like a single selection.
  const [selectedPrimary, setSelectedPrimary] = useState<SelectedCourse[]>([]);
  const [selectedSecond, setSelectedSecond] = useState<SelectedCourse[]>([]);
  const [activeMajorTab, setActiveMajorTab] = useState<'primary' | 'second'>('primary');
  const activeMajor = secondMajor ? activeMajorTab : 'primary';
  const selected = activeMajor === 'second' ? selectedSecond : selectedPrimary;
  const setSelected = activeMajor === 'second' ? setSelectedSecond : setSelectedPrimary;
  // The credit-cap policy works at the school level, so resolve the active
  // major's school (defaulting to business until a major is picked).
  const activeMajorId = activeMajor === 'second' ? secondMajorId : majorId;
  const programSchool: ProgramSchool = CCK_MAJORS.find((m) => m.value === activeMajorId)?.school ?? 'business';
  const majorName = (id: string) => {
    const m = CCK_MAJORS.find((x) => x.value === id);
    return m ? (locale === 'ar' ? m.ar : m.en) : '';
  };
  const [search, setSearch] = useState('');
  const [program, setProgram] = useState('all');
  const [combinePicks, setCombinePicks] = useState<Set<string>>(new Set());
  const [showUnlisted, setShowUnlisted] = useState(false);
  const [unlisted, setUnlisted] = useState({ name: '', code: '', credit: '' });
  const [toast, setToast] = useState<string | null>(null);
  // VP "send back" — when the VP returns the request to admission or academic
  // staff for re-evaluation, the note + attachments are surfaced on their stage.
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [sentBack, setSentBack] = useState<{
    target: 'admission' | 'academic';
    reason: string;
    files: File[];
  } | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const reset = () => {
    setStage('documents');
    setStudentName('');
    setPriorCollege('The Public Authority for Applied Education & Training');
    setCivilId('');
    setCommencement('');
    setRequestedMajor('');
    setDocTranscript(false);
    setDocCertificate(false);
    setDocFiles({ transcript: null, certificate: null });
    setSource('paaet');
    setSourceGpa('');
    setMajorId('');
    setSecondMajor(false);
    setSecondMajorId('');
    setOldCourses(false);
    setVpaException(false);
    setAfterCensus(false);
    setSelectedPrimary([]);
    setSelectedSecond([]);
    setActiveMajorTab('primary');
    setSearch('');
    setProgram('all');
    setCombinePicks(new Set());
    setShowUnlisted(false);
    setUnlisted({ name: '', code: '', credit: '' });
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
      },
    ]);
  };
  const removeCourse = (id: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
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
  // When the row is part of a combine selection (2+ rows ticked), the chosen
  // CCK course is applied to every ticked row, then the selection is cleared.
  const setCck = (id: string, cckId: string) => {
    const cck = cckCourses.find((c) => c.id === cckId);
    const applyTo =
      combinePicks.has(id) && combinePicks.size >= 2 ? combinePicks : new Set([id]);
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
    if (applyTo.size >= 2) {
      setCombinePicks(new Set());
      showToast(t('eqwf.combinedToast'));
    }
  };

  const toggleCombinePick = (id: string) =>
    setCombinePicks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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

  // Rows that share a CCK course with another row = a combined mapping.
  const combinedCckIds = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of selected) {
      if (s.cckId) counts.set(s.cckId, (counts.get(s.cckId) ?? 0) + 1);
    }
    return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([id]) => id));
  }, [selected]);

  const allMapped = selected.length > 0 && selected.every((s) => s.cckId);

  // The combined form is ready for VP review when every row has a grade, credit
  // hours, and a mapped CCK course.
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

  // Credit Transfer Policy v2.0 compliance - re-evaluated live as the reviewer
  // maps courses and fills the eligibility inputs.
  const validation = useMemo<TransferValidationIssue[]>(
    () =>
      validateTransferAttempt({
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
    [source, sourceGpa, totalCredits, programSchool, selected, oldCourses, vpaException, afterCensus],
  );
  const blockingIssues = useMemo(() => validation.filter((i) => i.severity === 'block'), [validation]);

  const cckById = (id: string | null) =>
    id ? cckCourses.find((c) => c.id === id) ?? null : null;

  const roleTag = (role: 'admission' | 'academic' | 'vp') => (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-pair-50 text-pair-700">
      {t(`eqwf.role.${role}`)}
    </span>
  );

  // Open an uploaded document in a new tab (or note that none is attached).
  const viewDoc = (file: File | null) => {
    if (file) window.open(URL.createObjectURL(file), '_blank', 'noopener');
    else showToast(t('eqwf.noDocFile'));
  };

  // VP returns the request to the chosen team for re-evaluation. Admission staff
  // own the documents stage; academic staff own the equivalency-form mapping.
  const handleSendBack = (target: 'admission' | 'academic', reason: string, files: File[]) => {
    setSentBack({ target, reason, files });
    setSendBackOpen(false);
    setStage(target === 'admission' ? 'documents' : 'form');
    showToast(t('eqwf.sentBackToast', { role: t(`eqwf.role.${target}`) }));
  };

  // Banner shown on the admission/academic stage after the VP sends a request
  // back, carrying the VP's reason and any attached photos or documents. Only
  // renders on the stage that owns the targeted team.
  const sentBackBanner = (owner: 'admission' | 'academic') =>
    sentBack && sentBack.target === owner ? (
      <div className="rounded-lg border border-gold-200 bg-gold-50 p-4 mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gold-700">↩ {t('eqwf.sentBackBanner')}</p>
            <p className="mt-1 text-sm text-gold-700 whitespace-pre-wrap break-words">{sentBack.reason}</p>
          </div>
          <button
            type="button"
            onClick={() => setSentBack(null)}
            aria-label={t('eqwf.sentBackDismiss')}
            className="shrink-0 text-gold-700 hover:text-gold-800 text-sm"
          >
            ✕
          </button>
        </div>
        {sentBack.files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sentBack.files.map((f, i) => (
              <button
                key={i}
                type="button"
                onClick={() => viewDoc(f)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gold-200 bg-white text-xs font-medium text-gold-700 hover:bg-gold-50"
              >
                <span aria-hidden>📎</span>
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
    <div className="rounded-lg border border-pair-200 bg-pair-50/40 p-4 mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pair-600 text-white text-sm font-semibold">
            {(studentName.trim()[0] || '?').toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">
              {studentName.trim() || t('eqwf.unnamedApplicant')}
            </p>
            <p className="text-xs text-[#737477] truncate">
              {civilId.trim() ? <span dir="ltr">{civilId}</span> : t('eqwf.noCivilId')}
              {requestedMajor.trim() ? ` · ${requestedMajor}` : ''}
              {priorCollege.trim() ? ` · ${priorCollege}` : ''}
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-pair-200 bg-white text-xs font-medium text-pair-700 hover:bg-pair-50"
              >
                <span aria-hidden>📄</span>
                <span className="truncate max-w-[160px]">{d.file?.name || d.label}</span>
                <span className="text-[#737477]">· {t('eqwf.viewDoc')}</span>
              </button>
            ) : (
              <span
                key={d.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-[#737477]"
              >
                <span aria-hidden>📄</span>
                {d.label} · {t('eqwf.notUploaded')}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );

  // One tab per evaluated major — shown on every stage that mirrors a single
  // major's mapping (the reviewer switches majors here; each keeps its own rows).
  const majorTabs = secondMajor ? (
    <div className="flex gap-0 border-b border-gray-300 mb-4">
      {([
        { key: 'primary' as const, label: majorName(majorId) || t('eqwf.majorTab1') },
        { key: 'second' as const, label: majorName(secondMajorId) || t('eqwf.majorTab2') },
      ]).map((tab) => {
        const active = activeMajor === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveMajorTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              active
                ? 'border-pair-600 text-pair-700'
                : 'border-transparent text-[#737477] hover:text-[#222]'
            }`}
          >
            {tab.label}
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
          className="mb-4 bg-pair-50 border border-pair-200 rounded-lg px-4 py-2 text-sm text-pair-700"
        >
          {toast}
        </div>
      )}

      {/* Stepper */}
      <ol className="flex flex-wrap items-center gap-2 mb-5">
        {STAGE_ORDER.map((s, i) => {
          const current = stage === s;
          const done = stage === 'done' || stageIndex(stage) > i;
          return (
            <li key={s} className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${
                  current
                    ? 'bg-pair-600 text-white border-pair-600'
                    : done
                      ? 'bg-oasis-50 text-oasis-700 border-oasis-200'
                      : 'bg-white text-[#737477] border-gray-200'
                }`}
              >
                <span className="tabular-nums" dir="ltr">
                  {done && !current ? '✓' : i + 1}
                </span>
                {t(`eqwf.step.${s}`)}
              </span>
              {i < STAGE_ORDER.length - 1 && (
                <span className="text-[#c7c7c7]">›</span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Stage 1 - Documents ─────────────────────────────────────────────── */}
      {stage === 'documents' && (
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <header className="flex items-center justify-between gap-2 mb-1">
            <h2 className="font-semibold text-sm">{t('eqwf.docsTitle')}</h2>
            {roleTag('admission')}
          </header>
          <p className="text-xs text-[#737477] mb-4">{t('eqwf.docsDesc')}</p>

          {sentBackBanner('admission')}

          <label className="block mb-4">
            <span className="block text-xs font-medium text-[#737477]">{t('eqwf.studentLabel')}</span>
            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder={t('eqwf.studentPlaceholder')}
              className="mt-1 w-full max-w-sm px-3 py-2 rounded border border-gray-300 text-sm"
            />
          </label>

          <div className="space-y-2 mb-5">
            {([
              { key: 'transcript', on: docTranscript, set: setDocTranscript, file: docFiles.transcript, label: t('eqwf.docTranscript') },
              { key: 'certificate', on: docCertificate, set: setDocCertificate, file: docFiles.certificate, label: t('eqwf.docCertificate') },
            ] as const).map((d) => (
              <div
                key={d.key}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3"
              >
                <span className="text-sm text-[#222] flex items-center gap-2 min-w-0">
                  <span className="text-[#737477]">📄</span>
                  <span className="truncate">{d.on && d.file ? d.file.name : d.label}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {d.on && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-oasis-700">
                      ✓ {t('eqwf.uploaded')}
                    </span>
                  )}
                  <label className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 cursor-pointer">
                    {d.on ? t('eqwf.replace') : t('eqwf.upload')}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        d.set(!!file);
                        setDocFiles((prev) => ({ ...prev, [d.key]: file }));
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Eligibility inputs - drive the Credit Transfer Policy check */}
          <div className="rounded-lg border border-gray-200 p-4 mb-5">
            <p className="text-xs font-semibold text-[#222] mb-3">{t('eqwf.eligibilityTitle')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-[#737477]">{t('eqwf.sourceLabel')}</span>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as 'paaet' | 'public' | 'private')}
                  className="mt-1 w-full px-3 py-2 rounded border border-gray-300 text-sm bg-white"
                >
                  <option value="paaet">{t('eqwf.sourcePaaet')}</option>
                  <option value="public">{t('eqwf.sourcePublic')}</option>
                  <option value="private">{t('eqwf.sourcePrivate')}</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-[#737477]">{t('eqwf.sourceGpaLabel')}</span>
                <input
                  value={sourceGpa}
                  onChange={(e) => setSourceGpa(e.target.value)}
                  placeholder="2.67"
                  inputMode="decimal"
                  dir="ltr"
                  className="mt-1 w-full px-3 py-2 rounded border border-gray-300 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-[#737477]">{t('eqwf.majorLabel')}</span>
                <select
                  value={majorId}
                  onChange={(e) => setMajorId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded border border-gray-300 text-sm bg-white"
                >
                  <option value="">{t('eqwf.majorPlaceholder')}</option>
                  <optgroup label={t('eqwf.schoolBusiness')}>
                    {CCK_MAJORS.filter((m) => m.school === 'business').map((m) => (
                      <option key={m.value} value={m.value}>{locale === 'ar' ? m.ar : m.en}</option>
                    ))}
                  </optgroup>
                  <optgroup label={t('eqwf.schoolAdvancedTech')}>
                    {CCK_MAJORS.filter((m) => m.school === 'advanced_tech').map((m) => (
                      <option key={m.value} value={m.value}>{locale === 'ar' ? m.ar : m.en}</option>
                    ))}
                  </optgroup>
                </select>
              </label>
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
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={secondMajor} onChange={(e) => setSecondMajor(e.target.checked)} className="accent-pair-600" />
                {t('eqwf.secondMajor')}
              </label>
              {secondMajor && (
                <label className="block ms-6">
                  <span className="text-xs font-medium text-[#737477]">{t('eqwf.majorLabel2')}</span>
                  <select
                    value={secondMajorId}
                    onChange={(e) => setSecondMajorId(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded border border-gray-300 text-sm bg-white"
                  >
                    <option value="">{t('eqwf.majorPlaceholder')}</option>
                    <optgroup label={t('eqwf.schoolBusiness')}>
                      {CCK_MAJORS.filter((m) => m.school === 'business').map((m) => (
                        <option key={m.value} value={m.value}>{locale === 'ar' ? m.ar : m.en}</option>
                      ))}
                    </optgroup>
                    <optgroup label={t('eqwf.schoolAdvancedTech')}>
                      {CCK_MAJORS.filter((m) => m.school === 'advanced_tech').map((m) => (
                        <option key={m.value} value={m.value}>{locale === 'ar' ? m.ar : m.en}</option>
                      ))}
                    </optgroup>
                  </select>
                </label>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStage('form')}
              disabled={!docTranscript || !docCertificate}
              className="px-4 py-2 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
            >
              {t('eqwf.continue')}
            </button>
            <button
              type="button"
              onClick={() => {
                setDocTranscript(true);
                setDocCertificate(true);
                setStage('form');
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-dashed border-gray-300 text-[#737477] hover:bg-gray-50"
            >
              {t('eqwf.bypassDemo')}
            </button>
          </div>
        </section>
      )}

      {/* Stage 2 - Transfer Credits Equivalency Form (registration + academic) */}
      {stage === 'form' && (
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <header className="flex items-center justify-between gap-2 mb-1">
            <h2 className="font-semibold text-sm">{t('eqwf.formTitle')}</h2>
            <div className="flex items-center gap-1.5">
              {roleTag('admission')}
              {roleTag('academic')}
            </div>
          </header>
          <p className="text-xs text-[#737477] mb-4">{t('eqwf.formDesc')}</p>

          {studentBanner}
          {sentBackBanner('academic')}

          {/* Applicant header — mirrors the top of the paper form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-gray-300 p-4 mb-5">
            <label className="block">
              <span className="text-xs font-medium text-[#737477]">{t('eqwf.applicantName')}</span>
              <input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder={t('eqwf.studentPlaceholder')}
                className="mt-1 w-full px-3 py-2 rounded border border-gray-300 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#737477]">{t('eqwf.civilId')}</span>
              <input
                value={civilId}
                onChange={(e) => setCivilId(e.target.value)}
                dir="ltr"
                className="mt-1 w-full px-3 py-2 rounded border border-gray-300 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#737477]">{t('eqwf.priorCollege')}</span>
              <input
                value={priorCollege}
                onChange={(e) => setPriorCollege(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded border border-gray-300 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#737477]">{t('eqwf.commencement')}</span>
              <input
                value={commencement}
                onChange={(e) => setCommencement(e.target.value)}
                placeholder={t('eqwf.commencementPlaceholder')}
                className="mt-1 w-full px-3 py-2 rounded border border-gray-300 text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[#737477]">{t('eqwf.requestedMajor')}</span>
              <input
                value={requestedMajor}
                onChange={(e) => setRequestedMajor(e.target.value)}
                placeholder={t('eqwf.requestedMajorPlaceholder')}
                className="mt-1 w-full px-3 py-2 rounded border border-gray-300 text-sm"
              />
            </label>
          </div>

          {/* One mapping per evaluated major — the reviewer maps prior courses
              separately for each, since the CCK equivalents differ. */}
          {majorTabs}

          {/* Add PAAET courses — the rows admission fills in */}
          <div className="rounded-lg border border-gray-200 p-3 mb-5">
            <p className="text-xs font-medium text-[#222] mb-2">{t('eqwf.addPaaetTitle')}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="px-3 py-1.5 rounded border border-gray-300 text-sm bg-white"
              >
                <option value="all">{t('eqwf.programAll')}</option>
                {programs.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('eqwf.searchPaaet')}
                className="px-3 py-1.5 rounded border border-gray-300 text-sm flex-1 min-w-[200px]"
              />
            </div>
            <div className="max-h-56 overflow-auto rounded-lg border border-gray-100">
              <table className="w-full text-sm">
                <tbody>
                  {filteredPaaet.slice(0, 200).map((p) => {
                    const added = selected.some((s) => s.id === p.id);
                    return (
                      <tr key={p.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-2">
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-[#737477]">
                            <span dir="ltr">{p.code}</span> · {p.program}
                            {p.credit ? ` · ${p.credit} cr` : ''}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-end w-20">
                          <button
                            type="button"
                            onClick={() => addCourse(p)}
                            disabled={added}
                            className="px-2.5 py-1 rounded text-xs font-medium border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
                          >
                            {added ? t('eqwf.added') : t('eqwf.add')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* The form table — laid out exactly like the paper equivalency form:
              "Registration department" columns on one side, "Academic Department"
              columns on the other. */}
          <div className="overflow-x-auto rounded-lg border border-gray-300 mb-4">
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
                    className="border border-gray-300 bg-pair-50 text-pair-700 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide"
                  >
                    {t('eqwf.groupRegistration')}
                  </th>
                  <th
                    colSpan={4}
                    className="border border-gray-300 bg-gold-50 text-gold-700 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide"
                  >
                    {t('eqwf.groupAcademic')}
                  </th>
                  <th rowSpan={2} className="border border-gray-300 bg-gray-50 w-10" />
                </tr>
                <tr className="text-[#737477] bg-gray-50/60">
                  <th className="border border-gray-300 px-2 py-2 text-start font-medium">{t('eqwf.colCourseCode')}</th>
                  <th className="border border-gray-300 px-2 py-2 text-start font-medium">{t('eqwf.colPriorTitle')}</th>
                  <th className="border border-gray-300 px-2 py-2 text-start font-medium">{t('eqwf.colCredits')}</th>
                  <th className="border border-gray-300 px-2 py-2 text-start font-medium">{t('eqwf.colGrade')}</th>
                  <th className="border border-gray-300 px-2 py-2 text-start font-medium">{t('eqwf.colSemester')}</th>
                  <th className="border border-gray-300 px-2 py-2 text-start font-medium">{t('eqwf.colCckCode')}</th>
                  <th className="border border-gray-300 px-2 py-2 text-start font-medium">{t('eqwf.colCckTitle')}</th>
                  <th className="border border-gray-300 px-2 py-2 text-start font-medium">{t('eqwf.colCredits')}</th>
                  <th className="border border-gray-300 px-2 py-2 text-start font-medium">{t('eqwf.colComments')}</th>
                </tr>
              </thead>
              <tbody>
                {selected.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="border border-gray-300 px-3 py-8 text-center text-xs text-[#737477]">
                      {t('eqwf.noneSelected')}
                    </td>
                  </tr>
                ) : (
                  selected.map((s) => {
                    const cck = cckById(s.cckId);
                    const combined = s.cckId ? combinedCckIds.has(s.cckId) : false;
                    return (
                      <tr key={s.id} className="align-top">
                        {/* Registration department columns */}
                        <td className="border border-gray-300 px-2 py-2 break-words" dir="ltr">{s.code}</td>
                        <td className="border border-gray-300 px-2 py-2 break-words">
                          {s.name}
                          <label className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#737477]">
                            <input
                              type="checkbox"
                              checked={combinePicks.has(s.id)}
                              onChange={() => toggleCombinePick(s.id)}
                              className="accent-pair-600"
                            />
                            {t('eqwf.combineSelect')}
                          </label>
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            value={s.creditHours}
                            onChange={(e) => setCreditHours(s.id, e.target.value)}
                            inputMode="decimal"
                            aria-label={t('eqwf.creditLabel')}
                            dir="ltr"
                            className="w-full px-2 py-1 rounded border border-gray-300 text-xs"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            value={s.grade}
                            onChange={(e) => setGrade(s.id, e.target.value)}
                            placeholder={t('eqwf.gradePlaceholder')}
                            aria-label={t('eqwf.gradeLabel')}
                            dir="ltr"
                            className="w-full px-2 py-1 rounded border border-gray-300 text-xs"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            value={s.semester}
                            onChange={(e) => setSemester(s.id, e.target.value)}
                            placeholder={t('eqwf.semesterPlaceholder')}
                            aria-label={t('eqwf.colSemester')}
                            className="w-full px-2 py-1 rounded border border-gray-300 text-xs"
                          />
                        </td>
                        {/* Academic department columns */}
                        <td className="border border-gray-300 px-2 py-2 break-words" dir="ltr">
                          {cck && cck.code !== '-' ? cck.code : <span className="text-[#737477]">—</span>}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <CckCombobox
                            courses={cckCourses}
                            value={s.cckId}
                            onChange={(id) => setCck(s.id, id)}
                            placeholder={t('eqwf.choose')}
                            unlistedTag={t('eqwf.unlistedTag')}
                          />
                          <label className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#737477]">
                            <input
                              type="checkbox"
                              checked={combinePicks.has(s.id)}
                              onChange={() => toggleCombinePick(s.id)}
                              className="accent-pair-600"
                            />
                            {t('eqwf.combineSelect')}
                            {combined && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gold-50 text-gold-700">
                                {t('eqwf.combinedBadge')}
                              </span>
                            )}
                          </label>
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-[#737477]" dir="ltr">{cck?.credit || '—'}</td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            value={s.comments}
                            onChange={(e) => setComments(s.id, e.target.value)}
                            placeholder={t('eqwf.commentsPlaceholder')}
                            aria-label={t('eqwf.colComments')}
                            className="w-full px-2 py-1 rounded border border-gray-300 text-xs"
                          />
                        </td>
                        <td className="border border-gray-300 px-1 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeCourse(s.id)}
                            aria-label={t('eqwf.remove')}
                            className="text-danger-600 hover:text-danger-700 text-sm"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Add-unlisted control (Academic Department) */}
          <div className="flex flex-wrap items-start gap-3 mb-5">
            <div className="rounded-lg border border-gray-200 p-3 flex-1 min-w-[260px]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-[#222]">{t('eqwf.addUnlisted')}</p>
                <button
                  type="button"
                  onClick={() => setShowUnlisted((v) => !v)}
                  className="text-xs text-pair-600 hover:text-pair-700"
                >
                  {showUnlisted ? t('eqwf.back') : '+'}
                </button>
              </div>
              <p className="text-[11px] text-[#737477] mb-2">{t('eqwf.addUnlistedHint')}</p>
              {showUnlisted && (
                <div className="space-y-2">
                  <input
                    value={unlisted.name}
                    onChange={(e) => setUnlisted((u) => ({ ...u, name: e.target.value }))}
                    placeholder={t('eqwf.unlistedName')}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      value={unlisted.code}
                      onChange={(e) => setUnlisted((u) => ({ ...u, code: e.target.value }))}
                      placeholder={t('eqwf.unlistedCode')}
                      dir="ltr"
                      className="flex-1 px-2 py-1.5 rounded border border-gray-300 text-sm"
                    />
                    <input
                      value={unlisted.credit}
                      onChange={(e) => setUnlisted((u) => ({ ...u, credit: e.target.value }))}
                      placeholder={t('eqwf.unlistedCredit')}
                      dir="ltr"
                      inputMode="numeric"
                      className="w-20 px-2 py-1.5 rounded border border-gray-300 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addUnlistedCourse}
                    disabled={!unlisted.name.trim()}
                    className="px-3 py-1.5 bg-oasis-500 text-white rounded-lg text-sm font-medium hover:bg-oasis-600 disabled:opacity-50"
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
              onClick={() => setStage('documents')}
              className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
            >
              {t('eqwf.back')}
            </button>
            <button
              type="button"
              onClick={() => setStage('vp')}
              disabled={!formComplete}
              title={!formComplete ? t('eqwf.completeFormFirst') : undefined}
              className="px-4 py-2 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
            >
              {t('eqwf.submitForm')}
            </button>
          </div>
        </section>
      )}

      {/* Stage 5 - Discuss with student (final acceptance) ───────────────── */}
      {stage === 'student' && (
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <header className="flex items-center justify-between gap-2 mb-1">
            <h2 className="font-semibold text-sm">{t('eqwf.studentTitle')}</h2>
            {roleTag('admission')}
          </header>
          <p className="text-xs text-[#737477] mb-4">{t('eqwf.studentDesc')}</p>
          {studentBanner}
          {majorTabs}
          <EquivalencySummaryTable selected={selected} cckById={cckById} totalCredits={totalCredits} />
          <CompliancePanel issues={validation} />
          <div className="flex items-center gap-2 mt-5">
            <button
              type="button"
              onClick={() => setStage('vp')}
              className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
            >
              {t('eqwf.back')}
            </button>
            <button
              type="button"
              onClick={() => { showToast(t('eqwf.declinedToast')); setStage('form'); }}
              className="px-3 py-2 rounded-lg text-sm font-medium border border-danger-300 text-danger-700 hover:bg-danger-50"
            >
              {t('eqwf.studentReject')}
            </button>
            <button
              type="button"
              onClick={() => setStage('done')}
              className="px-4 py-2 bg-oasis-500 text-white rounded-lg text-sm font-medium hover:bg-oasis-600"
            >
              {t('eqwf.studentAccept')}
            </button>
          </div>
        </section>
      )}

      {/* Stage 4 - VP approval ───────────────────────────────────────────── */}
      {stage === 'vp' && (
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <header className="flex items-center justify-between gap-2 mb-1">
            <h2 className="font-semibold text-sm">{t('eqwf.vpTitle')}</h2>
            {roleTag('vp')}
          </header>
          <p className="text-xs text-[#737477] mb-4">{t('eqwf.vpDesc')}</p>
          {studentBanner}
          {majorTabs}
          <EquivalencySummaryTable selected={selected} cckById={cckById} totalCredits={totalCredits} />
          <CompliancePanel issues={validation} />
          <div className="flex items-center gap-2 mt-5">
            <button
              type="button"
              onClick={() => setStage('form')}
              className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
            >
              {t('eqwf.back')}
            </button>
            <button
              type="button"
              onClick={() => setStage('student')}
              disabled={blockingIssues.length > 0}
              title={blockingIssues.length > 0 ? t('eqwf.blockedByPolicy') : undefined}
              className="px-4 py-2 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
            >
              {t('eqwf.vpApprove')}
            </button>
            <button
              type="button"
              onClick={() => setSendBackOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gold-500 text-gold-700 hover:bg-gold-50"
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
      {stage === 'done' && (
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-oasis-50 text-oasis-700">
              ✓ {t('eqwf.doneTitle')}
            </span>
            {studentName.trim() && (
              <span className="text-sm font-medium">{studentName}</span>
            )}
          </div>
          <p className="text-xs text-[#737477] mb-4">{t('eqwf.doneDesc')}</p>
          {majorTabs}
          <EquivalencySummaryTable selected={selected} cckById={cckById} totalCredits={totalCredits} />
          <CompliancePanel issues={validation} />
          <button
            type="button"
            onClick={reset}
            className="mt-5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            {t('eqwf.newRequest')}
          </button>
        </section>
      )}
    </div>
  );
}

function CompliancePanel({ issues }: { issues: TransferValidationIssue[] }) {
  const { t, locale } = useI18n();
  const blocks = issues.filter((i) => i.severity === 'block');
  const infos = issues.filter((i) => i.severity === 'info');

  if (issues.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-oasis-200 bg-oasis-50 px-4 py-3">
        <p className="text-sm font-medium text-oasis-700">✓ {t('eqwf.policyOk')}</p>
        <p className="text-xs text-oasis-700/80 mt-0.5">{t('eqwf.policyOkDesc')}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {blocks.length > 0 && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3">
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
        <div className="rounded-lg border border-gold-200 bg-gold-50 px-4 py-3">
          <p className="text-sm font-semibold text-gold-700 mb-2">{t('eqwf.policyNotes')}</p>
          <ul className="space-y-1.5">
            {infos.map((i, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gold-700">
                <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />
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
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[#737477] border-b">
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
              <tr key={s.id} className="border-b border-gray-50 last:border-0">
                <td className="px-3 py-2">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-[#737477]" dir="ltr">{s.code}</p>
                </td>
                <td className="px-3 py-2 font-medium" dir="ltr">
                  {s.grade || '-'}
                  {s.creditHours ? (
                    <span className="text-xs font-normal text-[#737477]"> · {s.creditHours} {t('eqwf.creditUnit')}</span>
                  ) : null}
                </td>
                <td className="px-3 py-2">
                  {cck ? (
                    <>
                      <p className="font-medium">{cck.name}</p>
                      <p className="text-xs text-[#737477]" dir="ltr">{cck.code}</p>
                    </>
                  ) : (
                    <span className="text-[#737477]">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-[#737477]" dir="ltr">{cck?.credit || '-'}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200">
            <td className="px-3 py-2 font-semibold" colSpan={3}>{t('eqwf.totalCredits')}</td>
            <td className="px-3 py-2 font-semibold" dir="ltr">{totalCredits}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// VP "send back" dialog — the VP picks which team re-evaluates the request,
// explains why, and may attach photos or documents to clarify the changes.
function SendBackDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: (target: 'admission' | 'academic', reason: string, files: File[]) => void;
}) {
  const { t, dir } = useI18n();
  const titleId = useId();
  const descId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [target, setTarget] = useState<'admission' | 'academic'>('admission');
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    setTarget('admission');
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
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 id={titleId} className="text-lg font-semibold mb-1">
          {t('eqwf.sendBackTitle')}
        </h3>
        <p id={descId} className="text-sm text-[#737477] mb-4">
          {t('eqwf.sendBackHint')}
        </p>

        <fieldset className="mb-4">
          <legend className="block text-xs font-medium text-[#737477] mb-2">
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium border text-start ${
                    active
                      ? 'border-pair-600 bg-pair-50 text-pair-700'
                      : 'border-gray-300 text-[#222] hover:bg-gray-50'
                  }`}
                >
                  {t(`eqwf.role.${opt.value}`)}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label htmlFor={`${titleId}-reason`} className="block text-xs font-medium text-[#737477] mb-1">
          {t('eqwf.sendBackReason')}
        </label>
        <textarea
          id={`${titleId}-reason`}
          ref={textareaRef}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder={t('eqwf.sendBackReasonPlaceholder')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-200"
        />
        {trimmed.length === 0 && (
          <p className="mt-1 text-xs text-danger-600">{t('eqwf.sendBackReasonRequired')}</p>
        )}

        <div className="mt-4">
          <p className="block text-xs font-medium text-[#737477] mb-1">{t('eqwf.sendBackAttach')}</p>
          <p className="text-[11px] text-[#737477] mb-2">{t('eqwf.sendBackAttachHint')}</p>
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 cursor-pointer">
            <span aria-hidden>📎</span>
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
                  className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                >
                  <span className="truncate flex items-center gap-1.5 min-w-0">
                    <span aria-hidden className="text-[#737477]">📎</span>
                    <span className="truncate">{f.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    aria-label={t('eqwf.remove')}
                    className="shrink-0 text-danger-600 hover:text-danger-700"
                  >
                    ✕
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
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(target, trimmed, files)}
            disabled={disabled}
            className="px-4 py-2 bg-gold-600 text-white rounded-lg text-sm font-medium hover:bg-gold-700 disabled:opacity-50"
          >
            {t('eqwf.sendBackConfirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
