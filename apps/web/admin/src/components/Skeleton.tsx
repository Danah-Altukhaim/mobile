export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
      <div className="h-7 bg-gray-200 rounded w-16" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="border-b bg-gray-50 px-6 py-3 flex gap-8">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded w-20" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 border-b border-gray-50 flex gap-8">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-3 bg-gray-200 rounded w-20" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="flex-1 h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonPage({ stats = 3, chart = true }: { stats?: number; chart?: boolean } = {}) {
  const cols = stats >= 5 ? 'lg:grid-cols-5' : stats === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';
  return (
    <div className="animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-48 mb-6" />
      <div className={`grid grid-cols-2 ${cols} gap-4 mb-8`}>
        {Array.from({ length: stats }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {chart && <SkeletonChart />}
    </div>
  );
}
