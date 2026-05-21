/* Inline SVG icons. 20×20 viewBox unless noted. */

type IconProps = { className?: string };

const base = 'http://www.w3.org/2000/svg';
const stroke = {
  width: 20,
  height: 20,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const ChartIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M3 17V9" /><path d="M7 17V5" /><path d="M11 17V10" /><path d="M15 17V3" />
  </svg>
);

export const HomeIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M3 9l7-6 7 6" /><path d="M5 9v8h10V9" />
  </svg>
);

export const InboxIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M3 12V5a2 2 0 012-2h10a2 2 0 012 2v7" />
    <path d="M3 12h4l1 2h4l1-2h4" />
    <path d="M3 12v3a2 2 0 002 2h10a2 2 0 002-2v-3" />
  </svg>
);

export const GraduationIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M2 7l8-4 8 4-8 4-8-4z" />
    <path d="M5 9v4c0 1.5 2.5 3 5 3s5-1.5 5-3V9" />
  </svg>
);

export const HandHeartIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M10 17l-5-5a3 3 0 014.5-4 3 3 0 014.5 4l-4 4z" />
  </svg>
);

export const GavelIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M3 17h10" /><path d="M11 5l4 4-7 7-4-4 7-7z" /><path d="M13 3l4 4" />
  </svg>
);

export const AlertIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M10 2L1 17h18L10 2z" /><path d="M10 8v4" /><circle cx="10" cy="15" r="0.5" />
  </svg>
);

export const FlagIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M4 17V3" /><path d="M4 4h11l-2 4 2 4H4" />
  </svg>
);

export const ChatIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H8l-4 3v-3H5a2 2 0 01-2-2V5z" />
  </svg>
);

export const TrophyIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M5 3h10v4a5 5 0 01-10 0V3z" />
    <path d="M5 5H3v2a3 3 0 003 3" />
    <path d="M15 5h2v2a3 3 0 01-3 3" />
    <path d="M8 13v3M12 13v3M7 17h6" />
  </svg>
);

export const PhoneIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M4 3h3l1 4-2 1a8 8 0 005 5l1-2 4 1v3a1 1 0 01-1 1A13 13 0 013 4a1 1 0 011-1z" />
  </svg>
);

export const ShieldIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M10 2L3 5.5V10c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V5.5L10 2z" />
  </svg>
);

export const CreditCardIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <rect x="2" y="4" width="16" height="12" rx="2" /><path d="M2 8h16" />
  </svg>
);

export const WalletIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M3 6a2 2 0 012-2h9a2 2 0 012 2v1" />
    <path d="M3 6v9a2 2 0 002 2h11a1 1 0 001-1v-3" />
    <path d="M17 8h-3a2 2 0 000 4h3a1 1 0 001-1V9a1 1 0 00-1-1z" />
  </svg>
);

export const BrainIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M10 2C7.5 2 5 4 5 7c0 1.5.5 3 2 4v5h6v-5c1.5-1 2-2.5 2-4 0-3-2.5-5-5-5z" />
    <path d="M8 18h4" /><path d="M7 11h6" />
  </svg>
);

export const MegaphoneIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M16 3L6 7H3v4h3l10 4V3z" /><path d="M6 11v3.5a1.5 1.5 0 003 0V13" />
  </svg>
);

export const UsersIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <circle cx="7" cy="7" r="3" /><path d="M2 17c0-3 2.5-5 5-5s5 2 5 5" />
    <circle cx="14" cy="6" r="2" /><path d="M14 11c2.5 0 4 1.5 4 4" />
  </svg>
);

export const GearIcon = (p: IconProps) => (
  <svg xmlns={base} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={p.className} aria-hidden>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const ClipboardIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <rect x="4" y="3" width="12" height="15" rx="1.5" />
    <path d="M7 1h6v3a1 1 0 01-1 1H8a1 1 0 01-1-1V1z" />
    <path d="M7 9h6" /><path d="M7 12h4" />
  </svg>
);

export const CalendarIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <rect x="3" y="4" width="14" height="13" rx="2" />
    <path d="M3 8h14" /><path d="M7 2v4" /><path d="M13 2v4" />
  </svg>
);

export const WrenchIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M13.5 3a4 4 0 00-4.6 5.2l-5.5 5.5a1.5 1.5 0 002.1 2.1l5.5-5.5A4 4 0 0017 6l-2.4 2.4-2-2L15 4a4 4 0 00-1.5-1z" />
  </svg>
);

export const BookIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M4 3h8a2 2 0 012 2v12H6a2 2 0 00-2 2V3z" />
    <path d="M4 17a2 2 0 012-2h8" />
  </svg>
);

export const SparklesIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M10 3l1.6 3.4L15 8l-3.4 1.6L10 13 8.4 9.6 5 8l3.4-1.6L10 3z" />
    <path d="M15 13l.8 1.7L17.5 15.5l-1.7.8L15 18l-.8-1.7L12.5 15.5l1.7-.8L15 13z" />
  </svg>
);

export const LogoutIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3" /><path d="M13 14l4-4-4-4" /><path d="M17 10H7" />
  </svg>
);

export const LanguageIcon = (p: IconProps) => (
  <svg xmlns={base} {...stroke} className={p.className} aria-hidden>
    <circle cx="10" cy="10" r="8" /><path d="M2 10h16" />
    <path d="M10 2a12 12 0 014 8 12 12 0 01-4 8 12 12 0 01-4-8 12 12 0 014-8z" />
  </svg>
);

export const MenuIcon = (p: IconProps) => (
  <svg xmlns={base} viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={p.className} aria-hidden>
    <path d="M3 6h14M3 10h14M3 14h14" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg xmlns={base} viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={p.className} aria-hidden>
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg xmlns={base} viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={p.className} aria-hidden>
    <circle cx="9" cy="9" r="6" /><path d="M14 14l3 3" />
  </svg>
);

export const CollapseChevron = ({ collapsed, isRTL, className }: { collapsed: boolean; isRTL: boolean; className?: string }) => {
  const showExpand = collapsed !== isRTL;
  return (
    <svg xmlns={base} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {showExpand ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
    </svg>
  );
};
