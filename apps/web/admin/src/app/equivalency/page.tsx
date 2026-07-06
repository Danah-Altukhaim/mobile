'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { EquivalencyEntry, PaaetEquivalencyEntry } from '@masari/shared';
import { useI18n } from '@/lib/i18n';
import { SkeletonPage } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import PageHeader from '@/components/PageHeader';
import Tabs from '@/components/Tabs';
import { SearchIcon } from '@/components/icons';
import EquivalencyWorkflow from './EquivalencyWorkflow';
import RequestsDashboard from './RequestsDashboard';

type EquivalencyData = {
  entries: EquivalencyEntry[];
  paaet_entries: PaaetEquivalencyEntry[];
  rules: string[];
};

type College = 'CCK' | 'PAAET';

// One course from either college, flattened into a single searchable row.
interface CourseRow {
  id: string;
  college: College;
  name: string;
  code: string;
  credit: string;
  cckMajor: string;
  paaetProgram: string;
  remarks: string | null;
  haystack: string;
}

export default function EquivalencyPage() {
  const { t, dir } = useI18n();
  const { data, isError, isLoading, refetch } = useQuery<EquivalencyData>({
    queryKey: ['equivalency'],
    queryFn: () => api.getEquivalency() as Promise<EquivalencyData>,
  });
  const [search, setSearch] = useState('');
  // A `?req=` hint (from the dashboard) reopens that request in the workflow tab.
  // Survives a refresh / deep-link via the query string; in-app it's driven by
  // `openRequest` below (the dashboard is a tab of this same page, so a router
  // push wouldn't remount and re-read the URL).
  const [openRequestId, setOpenRequestId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('req') ?? '';
  });
  // Honour a `?tab=` hint so links back from a request edit page (which point at
  // `/equivalency?tab=tracker`) reopen the tracker rather than the default tab.
  // A `?req=` hint always wins and opens the workflow tab.
  const [tab, setTab] = useState<'request' | 'tracker' | 'courses'>(() => {
    if (typeof window === 'undefined') return 'request';
    const params = new URLSearchParams(window.location.search);
    if (params.get('req')) return 'request';
    const param = params.get('tab');
    return param === 'tracker' || param === 'courses' ? param : 'request';
  });

  // Open a tracked request in the workflow tab, restored to its current stage.
  // Reflect it in the URL (without a navigation, so the workflow remounts off
  // the state change) so a refresh reopens the same request.
  const openRequest = (id: string) => {
    setOpenRequestId(id);
    setTab('request');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/equivalency?tab=request&req=${id}`);
    }
  };

  // Flatten both sheets into one list. Every course keeps the pathway it
  // belongs to (PAAET diploma -> CCK major), which is the direct transfer
  // information the source data actually contains.
  const rows = useMemo<CourseRow[]>(() => {
    if (!data) return [];
    const cck: CourseRow[] = data.entries.map((e, i) => {
      const name = e.cck_course_name || e.cck_code_raw || e.cck_code || '';
      const code = e.cck_code_raw ?? e.cck_code ?? '';
      return {
        id: `cck:${i}`,
        college: 'CCK',
        name,
        code,
        credit: e.cck_credit != null ? String(e.cck_credit) : '',
        cckMajor: e.cck_major,
        paaetProgram: e.paaet_program,
        remarks: e.remarks,
        haystack: `${name} ${code} ${e.cck_major} ${e.paaet_program}`.toLowerCase(),
      };
    });
    const paaet: CourseRow[] = data.paaet_entries.map((e, i) => {
      const name = e.paaet_course_name || e.paaet_code || '';
      return {
        id: `paaet:${i}`,
        college: 'PAAET',
        name,
        code: e.paaet_code,
        credit: e.credit || '',
        cckMajor: e.cck_major,
        paaetProgram: e.paaet_program,
        remarks: e.remarks,
        haystack: `${name} ${e.paaet_code} ${e.cck_major} ${e.paaet_program}`.toLowerCase(),
      };
    });
    return [...cck, ...paaet].sort(
      (a, b) =>
        a.cckMajor.localeCompare(b.cckMajor) ||
        a.college.localeCompare(b.college) ||
        a.name.localeCompare(b.name),
    );
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.haystack.includes(q));
  }, [rows, search]);

  if (isError)
    return (
      <ErrorState
        title={t('common.error')}
        description={t('common.errorDescription')}
        onRetry={() => refetch()}
        retryLabel={t('common.retry')}
      />
    );
  if (isLoading || !data) return <SkeletonPage />;

  return (
    <div dir={dir}>
      <PageHeader title={t('equivalency.title')} subtitle={t('equivalency.subtitle')} />

      {/* Tabs: the staged equivalency request (Equivalency Screen Update doc) and
          the read-only list of all CCK/PAAET courses. */}
      <Tabs
        className="mb-5"
        active={tab}
        onChange={setTab}
        tabs={[
          { key: 'request', label: t('equivalency.tabRequest') },
          { key: 'tracker', label: t('equivalency.tabTracker') },
          { key: 'courses', label: t('equivalency.tabCourses') },
        ]}
      />

      {tab === 'request' ? (
        <EquivalencyWorkflow entries={data.entries} paaetEntries={data.paaet_entries} openRequestId={openRequestId} />
      ) : tab === 'tracker' ? (
        <RequestsDashboard onOpen={openRequest} />
      ) : (
        <CourseList
          search={search}
          setSearch={setSearch}
          filtered={filtered}
          t={t}
        />
      )}
    </div>
  );
}

// Fields a staff member can edit on a course row.
interface CourseDraft {
  name: string;
  code: string;
  credit: string;
  paaetProgram: string;
  cckMajor: string;
  remarks: string;
}

const inputCls = 'cck-input py-1 text-sm';

function CourseList({
  search,
  setSearch,
  filtered,
  t,
}: {
  search: string;
  setSearch: (v: string) => void;
  filtered: CourseRow[];
  t: (key: string) => string;
}) {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CourseDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const startEdit = (r: CourseRow) => {
    setEditingId(r.id);
    setDraft({
      name: r.name,
      code: r.code,
      credit: r.credit,
      paaetProgram: r.paaetProgram,
      cckMajor: r.cckMajor,
      remarks: r.remarks ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const setField = (key: keyof CourseDraft, value: string) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const save = async (r: CourseRow) => {
    if (!draft) return;
    const index = Number(r.id.split(':')[1]);
    setSaving(true);
    try {
      const res = await api.updateEquivalencyEntry(r.college, index, draft);
      qc.setQueryData<EquivalencyData>(['equivalency'], (prev) => {
        if (!prev) return prev;
        if (res.college === 'CCK') {
          const entries = prev.entries.slice();
          entries[index] = res.entry as EquivalencyEntry;
          return { ...prev, entries };
        }
        const paaet_entries = prev.paaet_entries.slice();
        paaet_entries[index] = res.entry as PaaetEquivalencyEntry;
        return { ...prev, paaet_entries };
      });
      showToast(t('equivalency.saved'), true);
      cancelEdit();
    } catch {
      showToast(t('equivalency.saveFailed'), false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Single search across both colleges: course name, code, major, or diploma */}
      <div className="cck-card p-3 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <span className="absolute inset-y-0 start-0 grid place-items-center ps-3 text-muted pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('equivalency.searchAll')}
            className="cck-input ps-9"
          />
        </div>
        <span className="cck-badge cck-chip-neutral">
          {filtered.length} {t('equivalency.coursesCount')}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="cck-card"><EmptyState title={t('equivalency.noResults')} /></div>
      ) : (
        <div className="cck-card overflow-hidden">
          <table className="cck-table">
            <thead>
              <tr>
                <th>{t('equivalency.course')}</th>
                <th>{t('equivalency.college')}</th>
                <th>{t('equivalency.credit')}</th>
                <th>{t('equivalency.pathway')}</th>
                <th>{t('equivalency.remarks')}</th>
                <th className="text-end">{t('equivalency.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const editing = editingId === r.id && draft;
                return (
                  <tr key={r.id} className="align-top">
                    <td>
                      {editing ? (
                        <div className="flex flex-col gap-1.5">
                          <input
                            className={inputCls}
                            value={draft.name}
                            placeholder={t('equivalency.namePlaceholder')}
                            onChange={(e) => setField('name', e.target.value)}
                          />
                          <input
                            className={inputCls}
                            dir="ltr"
                            value={draft.code}
                            placeholder={t('equivalency.codePlaceholder')}
                            onChange={(e) => setField('code', e.target.value)}
                          />
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold text-ink">{r.name || '-'}</p>
                          {r.code && (
                            <p className="text-xs text-muted font-mono mt-0.5" dir="ltr">{r.code}</p>
                          )}
                        </>
                      )}
                    </td>
                    <td>
                      <span
                        className={`cck-badge ${
                          r.college === 'CCK'
                            ? 'cck-chip-positive'
                            : 'cck-chip-neutral'
                        }`}
                      >
                        {r.college}
                      </span>
                    </td>
                    <td className="text-muted" dir="ltr">
                      {editing ? (
                        <input
                          className={`${inputCls} w-16`}
                          dir="ltr"
                          value={draft.credit}
                          onChange={(e) => setField('credit', e.target.value)}
                        />
                      ) : (
                        r.credit || '-'
                      )}
                    </td>
                    <td className="text-muted">
                      {editing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            className={inputCls}
                            value={draft.paaetProgram}
                            onChange={(e) => setField('paaetProgram', e.target.value)}
                          />
                          <span aria-hidden>→</span>
                          <input
                            className={inputCls}
                            value={draft.cckMajor}
                            onChange={(e) => setField('cckMajor', e.target.value)}
                          />
                        </div>
                      ) : (
                        `${r.paaetProgram} → ${r.cckMajor}`
                      )}
                    </td>
                    <td className="text-xs">
                      {editing ? (
                        <input
                          className={inputCls}
                          value={draft.remarks}
                          placeholder={t('equivalency.remarksPlaceholder')}
                          onChange={(e) => setField('remarks', e.target.value)}
                        />
                      ) : r.remarks ? (
                        <span className="cck-badge cck-chip-neutral">
                          {r.remarks}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="text-end whitespace-nowrap">
                      {editing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => save(r)}
                            className="btn btn-primary btn-sm text-xs"
                          >
                            {t('equivalency.save')}
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={cancelEdit}
                            className="btn btn-outline btn-sm text-xs"
                          >
                            {t('equivalency.cancel')}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={editingId !== null}
                          onClick={() => startEdit(r)}
                          className="btn btn-ghost btn-sm text-xs text-pair-700 disabled:opacity-40"
                        >
                          {t('equivalency.edit')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 inset-x-0 mx-auto w-fit px-4 py-2 rounded-sm text-sm font-semibold shadow-lg ${
            toast.ok ? 'bg-pair-700 text-white' : 'bg-danger-600 text-white'
          }`}
          role="status"
        >
          {toast.msg}
        </div>
      )}
    </>
  );
}
