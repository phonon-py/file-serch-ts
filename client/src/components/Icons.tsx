// client/src/components/Icons.tsx
// Crisp monochrome line icons for the GLACIAL INDEX system.
// currentColor everywhere — colour is decided by CSS, never here.
import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

/** The glob asterisk — the cold sun the index orbits. */
export const GlobMark: React.FC<IconProps> = ({ size = 22, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <line x1="12" y1="4.5" x2="12" y2="19.5" />
      <line x1="5.5" y1="8.25" x2="18.5" y2="15.75" />
      <line x1="5.5" y1="15.75" x2="18.5" y2="8.25" />
    </g>
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <line x1="15.5" y1="15.5" x2="21" y2="21" />
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
    fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
    <rect x="8" y="8" width="12" height="13" rx="1.5" />
    <path d="M16 5.5V4.5A1.5 1.5 0 0 0 14.5 3H5.5A1.5 1.5 0 0 0 4 4.5v12A1.5 1.5 0 0 0 5.5 18h1" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12.5L9.5 18L20 6.5" />
  </svg>
);
