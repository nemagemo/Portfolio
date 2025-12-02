
import React from 'react';

export const FooterLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 170 180" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g stroke="#C5A059" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
      {/* Top/Right Arrow */}
      <path d="M45 165 C 90 160, 120 120, 155 55" />
      <path d="M135 55 L 155 55 L 150 75" />

      {/* Middle Arrow */}
      <path d="M35 170 C 75 165, 100 130, 125 80" />
      <path d="M105 80 L 125 80 L 120 100" />

      {/* Bottom/Left Arrow */}
      <path d="M25 175 C 60 170, 80 140, 95 105" />
      <path d="M75 105 L 95 105 L 90 125" />
    </g>
  </svg>
);
