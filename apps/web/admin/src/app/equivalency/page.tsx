'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { EquivalencyEntry, PaaetEquivalencyEntry } from '@masari/shared';
import { useI18n } from '@/lib/i18n';
import { SkeletonPage } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

type EquivalencyData = {
  entries: EquivalencyEntry[];
  paaet_entries: PaaetEquivalencyEntry[];
  rules: string[];
};

type Direction = 'cck' | 'paaet';

export default function EquivalencyPage() {
  const { t, dir } = useI18n();
  const { data, isError, isLoading, refetch } = useQuery<EquivalencyData>({
    queryKey: ['equivalency'],
    queryFn: () => api.getEquivalency() as Promise<EquivalencyData>,
  });
  const [direction, setDirection] = useState<Direction>('cck');
  const [program, setProgram] = useState<string>('all');
  const [search, setSearch] = useState('');

  const programs = useMemo(() => {
    if (!data) return [];
    const src = direction === 'cck' ? data.entries : data.paaet_entries;
    return Array.from(new Set(src.map((e) => e.paaet_program))).sort();
  }, [data, direction]);

  const cckGrouped = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    const filtered = data.entries.filter((e) => {
      if (program !== 'all' && e.paaet_program !== program) return false;
      if (!q) return true;
      return (
        e.cck_course_name.toLowerCase().includes(q) ||
        (e.cck_code ?? '').toLowerCase().includes(q) ||
        e.cck_major.toLowerCase().includes(q)
      );
    });
    const byProgram = new Map<string, EquivalencyEntry[]>();
    for (const e of filtered) {
      const list = byProgram.get(e.paaet_program) ?? [];
      list.push(e);
      byProgram.set(e.paaet_program, list);
    }
    return Array.from(byProgram.entries());
  }, [data, program, search]);

  const paaetGrouped = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    const filtered = data.paaet_entries.filter((e) => {
      if (program !== 'all' && e.paaet_program !== program) return false;
      if (!q) return true;
      return (
        e.paaet_course_name.toLowerCase().includes(q) ||
        e.paaet_code.toLowerCase().includes(q) ||
        e.cck_major.toLowerCase().includes(q)
      );
    });
    const byProgram = new Map<string, PaaetEquivalencyEntry[]>();
    for (const e of filtered) {
      const list = byProgram.get(e.paaet_program) ?? [];
      list.push(e);
      byProgram.set(e.paaet_program, list);
    }
    return Array.from(byProgram.entries());
  }, [data, program, search]);

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

  const switchDirection = (d: Direction) => {
    setDirection(d);
    setProgram('all');
  };

  const count = direction === 'cck'
    ? cckGrouped.reduce((n, [, list]) => n + list.length, 0)
    : paaetGrouped.reduce((n, [, list]) => n + list.length, 0);

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('equivalency.title')}</h1>
      <p className="text-sm text-[#737477] mb-4">{t('equivalency.subtitle')}</p>

      {/* Direction toggle */}
      <div className="flex gap-2 border-b border-gray-200 mb-4">
        <button
          onClick={() => switchDirection('cck')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            direction === 'cck' ? 'text-pair-600 border-pair-600' : 'text-[#737477] border-transparent'
          }`}
        >
          {t('equivalency.dirCck')}
        </button>
        <button
          onClick={() => switchDirection('paaet')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            direction === 'paaet' ? 'text-pair-600 border-pair-600' : 'text-[#737477] border-transparent'
          }`}
        >
          {t('equivalency.dirPaaet')}
        </button>
      </div>

      {/* Transferable-credit rules */}
      {data.rules.length > 0 && (
        <div className="mb-4 bg-pair-50 border border-pair-200 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-pair-700 mb-1.5">{t('equivalency.rulesTitle')}</p>
          <ul className="text-xs text-pair-700 space-y-0.5 list-disc list-inside">
            {data.rules.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4 flex flex-wrap items-center gap-3">
        <select
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          className="px-3 py-1.5 rounded border border-gray-300 text-sm bg-white"
        >
          <option value="all">{t('equivalency.allPrograms')}</option>
          {programs.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('equivalency.searchPlaceholder')}
          className="px-3 py-1.5 rounded border border-gray-300 text-sm flex-1 min-w-[200px]"
        />
        <span className="text-xs text-[#737477] ms-auto">
          {count} {t('equivalency.coursesCount')}
        </span>
      </div>

      {/* CCK → PAAET direction */}
      {direction === 'cck' && (
        cckGrouped.length === 0 ? (
          <EmptyState title={t('common.noData')} />
        ) : (
          <div className="space-y-6">
            {cckGrouped.map(([paaetProgram, entries]) => (
              <section key={paaetProgram} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <header className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-semibold">{paaetProgram}</h2>
                  <p className="text-xs text-[#737477] mt-1">
                    {entries.length} {t('equivalency.equivalentCourses')}
                  </p>
                </header>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#737477] border-b">
                      <th className="px-4 py-3 text-start font-medium">{t('equivalency.cckCourse')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('equivalency.cckCode')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('equivalency.credit')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('equivalency.cckMajor')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('equivalency.remarks')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e, i) => (
                      <tr key={`${e.cck_code}-${i}`} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-3 font-medium">{e.cck_course_name}</td>
                        <td className="px-4 py-3 text-[#737477]" dir="ltr">{e.cck_code_raw ?? e.cck_code ?? '—'}</td>
                        <td className="px-4 py-3 text-[#737477]">{e.cck_credit ?? '—'}</td>
                        <td className="px-4 py-3 text-[#737477]">{e.cck_major}</td>
                        <td className="px-4 py-3 text-xs text-[#737477]">{e.remarks ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))}
          </div>
        )
      )}

      {/* PAAET → CCK direction (per-course, with bridge-course flags) */}
      {direction === 'paaet' && (
        paaetGrouped.length === 0 ? (
          <EmptyState title={t('common.noData')} />
        ) : (
          <div className="space-y-6">
            {paaetGrouped.map(([paaetProgram, entries]) => (
              <section key={paaetProgram} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <header className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-semibold">{paaetProgram}</h2>
                  <p className="text-xs text-[#737477] mt-1">
                    {entries.length} {t('equivalency.paaetCourses')}
                  </p>
                </header>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#737477] border-b">
                      <th className="px-4 py-3 text-start font-medium">{t('equivalency.paaetCourse')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('equivalency.paaetCode')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('equivalency.credit')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('equivalency.cckMajor')}</th>
                      <th className="px-4 py-3 text-start font-medium">{t('equivalency.remarks')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e, i) => (
                      <tr key={`${e.paaet_code}-${i}`} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-3 font-medium">{e.paaet_course_name || '—'}</td>
                        <td className="px-4 py-3 text-[#737477]" dir="ltr">{e.paaet_code || '—'}</td>
                        <td className="px-4 py-3 text-[#737477]" dir="ltr">{e.credit || '—'}</td>
                        <td className="px-4 py-3 text-[#737477]">{e.cck_major}</td>
                        <td className="px-4 py-3 text-xs">
                          {e.remarks
                            ? <span className={`px-1.5 py-0.5 rounded font-medium ${
                                /bridge/i.test(e.remarks) ? 'bg-gold-50 text-gold-700' : 'bg-gray-100 text-[#222]'
                              }`}>{e.remarks}</span>
                            : <span className="text-[#737477]">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))}
          </div>
        )
      )}
    </div>
  );
}
