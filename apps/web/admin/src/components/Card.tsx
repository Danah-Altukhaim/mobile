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
  const base = `cck-card relative overflow-hidden p-5 ${alignment} ${className}`;
  const body = (
    <>
      <p className="cck-eyebrow truncate">{title}</p>
      <p className="text-3xl font-bold text-ink mt-2 tabular-nums truncate">{value}</p>
      {subtitle && <p className="text-sm text-muted mt-1.5">{subtitle}</p>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`${base} w-full cursor-pointer text-start transition-colors hover:bg-canvas ${
          active ? 'border-pair-600 ring-1 ring-pair-600' : 'hover:border-line-strong'
        }`}
      >
        {active && <span aria-hidden className="absolute inset-y-0 start-0 w-0.5 bg-pair-600" />}
        {body}
      </button>
    );
  }

  return <div className={base}>{body}</div>;
}
