interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorState({ title, description, onRetry, retryLabel = 'Retry' }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-danger-400" aria-hidden fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p className="text-gray-700 font-medium">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1 text-center max-w-sm">{description}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm bg-pair-600 text-white rounded-lg hover:bg-pair-700"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
