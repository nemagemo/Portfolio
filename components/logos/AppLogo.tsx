
import React from 'react';

export const AppLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="logo_grad_main" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0ea5e9" /> {/* Sky Blue */}
        <stop offset="1" stopColor="#3b82f6" /> {/* Blue */}
      </linearGradient>
      <linearGradient id="logo_grad_accent" x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#34d399" /> {/* Emerald 400 */}
        <stop offset="1" stopColor="#059669" /> {/* Emerald 600 */}
      </linearGradient>
      <filter id="logo_shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15"/>
      </filter>
    </defs>

    {/* Background Shape (Rounded Squircle) */}
    <rect x="20" y="20" width="160" height="160" rx="40" fill="url(#logo_grad_main)" filter="url(#logo_shadow)" />
    
    {/* Inner White Border/Ring for depth */}
    <rect x="30" y="30" width="140" height="140" rx="32" stroke="white" strokeOpacity="0.2" strokeWidth="2" fill="none" />

    {/* Abstract Chart / Wallet Symbol */}
    <g transform="translate(50, 50)">
      {/* Bar 1 (Small) */}
      <rect x="0" y="60" width="20" height="40" rx="4" fill="white" fillOpacity="0.9" />
      
      {/* Bar 2 (Medium) */}
      <rect x="30" y="40" width="20" height="60" rx="4" fill="white" fillOpacity="0.9" />
      
      {/* Bar 3 (Large/Growth - Accent Color) */}
      <rect x="60" y="10" width="20" height="90" rx="4" fill="url(#logo_grad_accent)" stroke="white" strokeWidth="2" />
      
      {/* Trend Line Curve */}
      <path 
        d="M10 55 C 30 55, 40 35, 90 15" 
        stroke="white" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeDasharray="4 4"
        opacity="0.6"
      />
    </g>
  </svg>
);
