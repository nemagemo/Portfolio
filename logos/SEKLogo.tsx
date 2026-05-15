import React from 'react';

export const SEKLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="100" height="32" rx="4" fill="#E2E8F0" />
    <text 
      x="50%" 
      y="21" 
      textAnchor="middle" 
      fill="#475569" 
      fontSize="16" 
      fontWeight="bold" 
      fontFamily="sans-serif"
    >
      SEK
    </text>
  </svg>
);
