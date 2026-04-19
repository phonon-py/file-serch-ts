import React from 'react';

type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const SearchIcon: React.FC<IconProps> = ({ size = 16, className, strokeWidth = 2 }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className} aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const FileIcon: React.FC<IconProps> = ({ size = 16, className, strokeWidth = 1.75 }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className} aria-hidden="true">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
);

export const FolderIcon: React.FC<IconProps> = ({ size = 16, className, strokeWidth = 1.75 }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className} aria-hidden="true">
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ size = 16, className, strokeWidth = 1.75 }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className} aria-hidden="true">
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 16, className, strokeWidth = 2 }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className} aria-hidden="true">
    <path d="m5 12 5 5 9-11" />
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ size = 16, className, strokeWidth = 1.75 }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const AlertIcon: React.FC<IconProps> = ({ size = 16, className, strokeWidth = 1.75 }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ size = 16, className, strokeWidth = 1.75 }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 16, className, strokeWidth = 1.75 }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className} aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 3v4M16 3v4" />
  </svg>
);

export const HardDriveIcon: React.FC<IconProps> = ({ size = 16, className, strokeWidth = 1.75 }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className} aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 12h18" />
    <circle cx="7" cy="16" r="0.5" fill="currentColor" />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 16, className, strokeWidth = 2 }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className} aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const SlidersIcon: React.FC<IconProps> = ({ size = 16, className, strokeWidth = 1.75 }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className} aria-hidden="true">
    <path d="M4 6h10" />
    <path d="M18 6h2" />
    <path d="M4 12h4" />
    <path d="M12 12h8" />
    <path d="M4 18h14" />
    <path d="M22 18h-2" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="20" cy="18" r="2" />
  </svg>
);

export const SparkIcon: React.FC<IconProps> = ({ size = 16, className, strokeWidth = 1.75 }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className} aria-hidden="true">
    <path d="M12 3v4" />
    <path d="M12 17v4" />
    <path d="M3 12h4" />
    <path d="M17 12h4" />
    <path d="m5.6 5.6 2.8 2.8" />
    <path d="m15.6 15.6 2.8 2.8" />
    <path d="m5.6 18.4 2.8-2.8" />
    <path d="m15.6 8.4 2.8-2.8" />
  </svg>
);
