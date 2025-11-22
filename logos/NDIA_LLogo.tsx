import React from 'react';

export const NDIA_LLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" {...props}>
    <defs>
      <clipPath id="circleView">
        <circle cx="100" cy="100" r="100" />
      </clipPath>
    </defs>
    <g clipPath="url(#circleView)">
      {/* Top Band - Saffron */}
      <rect x="0" y="0" width="200" height="66.6" fill="#FF9933" />
      
      {/* Middle Band - White */}
      <rect x="0" y="66.6" width="200" height="66.6" fill="#FFFFFF" />
      
      {/* Bottom Band - Green */}
      <rect x="0" y="133.2" width="200" height="66.8" fill="#138808" />
      
      {/* Ashoka Chakra (Stylized Wheel) */}
      <g transform="translate(100, 100)">
        <circle r="30" fill="none" stroke="#000080" strokeWidth="4" />
        <circle r="5" fill="#000080" />
        {/* Spokes */}
        {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165].map((angle) => (
          <rect 
            key={angle}
            x="-1.5" 
            y="-30" 
            width="3" 
            height="60" 
            fill="#000080" 
            transform={`rotate(${angle})`} 
          />
        ))}
      </g>
    </g>
  </svg>
);
