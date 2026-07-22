import React from 'react';

export const QRSLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" {...props}>
    <defs>
      <linearGradient id="qrs_grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <rect width="200" height="200" rx="40" fill="url(#qrs_grad)" />
    <text
      x="100"
      y="118"
      fill="#ffffff"
      fontSize="52"
      fontWeight="bold"
      fontFamily="sans-serif"
      textAnchor="middle"
      letterSpacing="2"
    >
      QRS
    </text>
  </svg>
);
