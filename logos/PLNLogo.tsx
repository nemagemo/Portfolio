
import React from 'react';

export const PLNLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" {...props}>
    <defs>
      <linearGradient id="pln_gold_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fcd34d" />
        <stop offset="50%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <filter id="pln_inner_shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2"/>
      </filter>
    </defs>

    {/* Coin Outer Ring */}
    <circle cx="100" cy="100" r="96" fill="url(#pln_gold_gradient)" stroke="#92400e" strokeWidth="2" />
    
    {/* Inner Polish Flag Circle */}
    <mask id="flag_mask">
       <circle cx="100" cy="100" r="76" fill="white" />
    </mask>
    
    <g mask="url(#flag_mask)">
        {/* Top White */}
        <rect x="0" y="0" width="200" height="100" fill="#ffffff" />
        {/* Bottom Red */}
        <rect x="0" y="100" width="200" height="100" fill="#dc2626" />
    </g>
    
    {/* Inner Ring Border to separate Gold from Flag */}
    <circle cx="100" cy="100" r="76" fill="none" stroke="#b45309" strokeWidth="4" opacity="0.8" />
  </svg>
);
