export default function Card({
  title,
  value,
  subtitle,
  className = '',
  align = 'start',
  onClick,
  active = false,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  align?: 'start' | 'center';
  onClick?: () => void;
  active?: boolean;
}) {
  const alignment = align === 'center' ? 'text-center' : 'text-start';
  const base = `bg-white rounded-xl border p-5 ${alignment} ${className}`;
  const body = (
    <>
      <p className="text-xs text-gray-500 truncate">{title}</p>
      <p className="text-2xl font-bold mt-1 truncate">{value}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`${base} w-full cursor-pointer transition-colors hover:bg-pair-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pair-400 ${
          active ? 'border-pair-600 ring-1 ring-pair-600' : 'border-gray-200 hover:border-pair-300'
        }`}
      >
        {body}
      </button>
    );
  }

  return <div className={`${base} border-gray-200`}>{body}</div>;
}
