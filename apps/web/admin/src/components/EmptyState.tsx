interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div role="status" className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-12 h-12 bg-canvas rounded-sm flex items-center justify-center mb-4 ring-1 ring-inset ring-line-strong">
        <svg className="w-6 h-6 text-muted" aria-hidden fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-ink font-semibold">{title}</p>
      {description && <p className="text-sm text-muted mt-1.5 text-center max-w-sm">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="btn btn-primary mt-4">
          {action.label}
        </button>
      )}
    </div>
  );
}
