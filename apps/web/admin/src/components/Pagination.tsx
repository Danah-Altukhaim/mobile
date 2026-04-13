'use client';

import { useI18n } from '@/lib/i18n';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  const { t } = useI18n();
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 px-2">
      <p className="text-sm text-gray-500">
        {t('common.showing')} {from} {t('common.to')} {to} {t('common.of')} {totalItems} {t('common.results')}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-white"
        >
          {t('common.previous')}
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (page <= 3) {
            pageNum = i + 1;
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = page - 2 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 text-sm rounded-lg ${
                pageNum === page
                  ? 'bg-pair-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 disabled:hover:bg-white"
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  );
}
