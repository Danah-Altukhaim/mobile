interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorState({ title, description, onRetry, retryLabel = 'Retry' }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-12 h-12 bg-danger-50 rounded-sm flex items-center justify-center mb-4 ring-1 ring-inset ring-danger-100">
        <svg className="w-6 h-6 text-danger-500" aria-hidden fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p className="text-ink font-semibold">{title}</p>
      {description && <p className="text-sm text-muted mt-1.5 text-center max-w-sm">{description}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary mt-4">
          {retryLabel}
        </button>
      )}
    </div>
  );
}
