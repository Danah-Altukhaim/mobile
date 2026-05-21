'use client';

import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';

interface LogEntry {
  id: string;
  timestamp: string;
  admin_name: string;
  action: string;
  resource: string;
  ip: string;
}

type SortKey = 'timestamp' | 'admin_name' | 'action' | 'resource';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

export default function AuditLogPage() {
  const { t, isRTL } = useI18n();
  const { data: logs = [], isError, isLoading, refetch } = useQuery<LogEntry[]>({
    queryKey: ['audit-log'],
    queryFn: () => api.getAuditLog() as Promise<LogEntry[]>,
  });
  const [filter, setFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' \u2191' : ' \u2193';
  };

  const filtered = useMemo(() => {
    let result = logs;

    if (filter) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter(
        (l) =>
          l.admin_name.toLowerCase().includes(lowerFilter) ||
          l.resource.toLowerCase().includes(lowerFilter)
      );
    }

    if (dateFrom) {
      result = result.filter((l) => l.timestamp >= dateFrom);
    }

    if (dateTo) {
      result = result.filter((l) => l.timestamp <= dateTo + 'T23:59:59Z');
    }

    result = [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [logs, filter, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filter, dateFrom, dateTo]);

  const clearFilters = () => {
    setFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasActiveFilters = filter || dateFrom || dateTo;

  if (isError) return (
    <ErrorState
      title={t('common.error')}
      description={t('common.errorDescription')}
      onRetry={() => refetch()}
      retryLabel={t('common.retry')}
    />
  );
  if (isLoading) return <SkeletonTable rows={8} cols={5} />;

  const columns: { key: SortKey; label: string }[] = [
    { key: 'timestamp', label: t('audit.timestamp') },
    { key: 'admin_name', label: t('audit.admin') },
    { key: 'action', label: t('audit.action') },
    { key: 'resource', label: t('audit.resource') },
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('audit.title')}</h1>
        <input
          type="text"
          placeholder={t('audit.filterPlaceholder')}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72"
        />
      </div>

      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">{t('audit.dateFrom')}</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">{t('audit.dateTo')}</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-danger-600 hover:text-danger-700 underline"
          >
            {t('audit.clearFilters')}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-6 py-3 cursor-pointer select-none hover:text-gray-700"
                >
                  {col.label}{sortIndicator(col.key)}
                </th>
              ))}
              <th className="px-6 py-3 text-gray-500">{t('audit.ip')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((log) => (
              <tr key={log.id} className="border-b border-gray-50 last:border-0">
                <td className="px-6 py-4 text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-medium">{log.admin_name}</td>
                <td className="px-6 py-4 text-gray-600">{log.action}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                    {log.resource}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-400 font-mono">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <EmptyState title={t('audit.noMatching')} />
        )}
      </div>

      {filtered.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
