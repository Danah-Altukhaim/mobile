export function SkeletonCard() {
  return (
    <div className="cck-card p-5 animate-pulse">
      <div className="h-3 bg-line-strong rounded-sm w-24 mb-3" />
      <div className="h-7 bg-line-strong rounded-sm w-16" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="cck-card overflow-hidden animate-pulse">
      <div className="border-b border-line-strong bg-canvas px-6 py-3 flex gap-8">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-line-strong rounded-sm w-20" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 border-b border-line flex gap-8">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-3 bg-line rounded-sm w-20" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="cck-card p-6 animate-pulse">
      <div className="h-4 bg-line-strong rounded-sm w-40 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-3 bg-line-strong rounded-sm w-24" />
            <div className="flex-1 h-4 bg-line rounded-sm" />
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
      <div className="h-7 bg-line-strong rounded-sm w-48 mb-6" />
      <div className={`grid grid-cols-2 ${cols} gap-4 mb-8`}>
        {Array.from({ length: stats }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {chart && <SkeletonChart />}
    </div>
  );
}
