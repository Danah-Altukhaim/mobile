export default function Card({
  title,
  value,
  subtitle,
  className = '',
  align = 'start',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  align?: 'start' | 'center';
}) {
  const alignment = align === 'center' ? 'text-center' : 'text-start';
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 ${alignment} ${className}`}>
      <p className="text-xs text-gray-500 truncate">{title}</p>
      <p className="text-2xl font-bold mt-1 truncate">{value}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
