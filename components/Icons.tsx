import React from 'react';

export const NoPPKIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 34 14" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="11.5" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="sans-serif" letterSpacing="1px">PPK</text>
    <line x1="2" y1="7" x2="32" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const TaxToggleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <line x1="9" y1="10" x2="15" y2="16" />
    <circle cx="10.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="13.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);