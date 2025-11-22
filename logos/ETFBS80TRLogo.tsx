import React from 'react';

export const ETFBS80TRLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" {...props}>
    <defs>
      <linearGradient id="beta_ring_grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#d946ef" /> {/* Fuchsia/Purple */}
        <stop offset="50%" stopColor="#3b82f6" /> {/* Blue */}
        <stop offset="100%" stopColor="#0ea5e9" /> {/* Sky Blue */}
      </linearGradient>
    </defs>

    {/* Center Icon Group */}
    <g transform="translate(50, 50)">
        {/* Full Gradient Ring surrounding the bars */}
        <circle 
            cx="0" 
            cy="0" 
            r="40" 
            fill="none" 
            stroke="url(#beta_ring_grad)" 
            strokeWidth="6" 
        />
        
        {/* Bars inside - aligned to a baseline */}
        {/* Left Bar (Small) */}
        <rect x="-22" y="5" width="12" height="20" fill="#0f172a" rx="1" />
        {/* Middle Bar (Medium) */}
        <rect x="-6" y="-10" width="12" height="35" fill="#0f172a" rx="1" />
        {/* Right Bar (Tall) */}
        <rect x="10" y="-25" width="12" height="50" fill="#0f172a" rx="1" />
    </g>
  </svg>
);