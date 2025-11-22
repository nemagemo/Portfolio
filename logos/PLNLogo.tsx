import React from 'react';

export const PLNLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" {...props}>
    <defs>
      <linearGradient id="gold_grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <filter id="flag_shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.3"/>
      </filter>
    </defs>
    
    {/* Main Coin */}
    <circle cx="100" cy="100" r="90" fill="url(#gold_grad)" stroke="#b45309" strokeWidth="8" />
    <circle cx="100" cy="100" r="75" fill="none" stroke="#b45309" strokeWidth="2" strokeDasharray="10 5" opacity="0.5" />
    
    {/* Polish Flag Badge */}
    <g transform="translate(130, 130)" filter="url(#flag_shadow)">
        {/* Badge Border/Bg */}
        <circle cx="25" cy="25" r="30" fill="#b45309" />
        <circle cx="25" cy="25" r="27" fill="white" />
        
        {/* Flag Content */}
        <g clipPath="url(#flag_clip)">
            <path d="M-5 25 H 55 V 55 H -5 Z" fill="#dc2626" />
        </g>
        <clipPath id="flag_clip">
            <circle cx="25" cy="25" r="27" />
        </clipPath>
    </g>
  </svg>
);