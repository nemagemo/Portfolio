import React from 'react';

export const NUKL_DELogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" {...props}>
    <defs>
      <radialGradient id="core_glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#fef08a" /> {/* Yellow-200 */}
        <stop offset="100%" stopColor="#eab308" /> {/* Yellow-500 */}
      </radialGradient>
    </defs>
    
    {/* Background */}
    <circle cx="100" cy="100" r="95" fill="#111827" stroke="#eab308" strokeWidth="4" />

    {/* Electron Orbits */}
    <g stroke="#06b6d4" strokeWidth="4" fill="none" opacity="0.8">
      <ellipse cx="100" cy="100" rx="85" ry="28" transform="rotate(0 100 100)" />
      <ellipse cx="100" cy="100" rx="85" ry="28" transform="rotate(60 100 100)" />
      <ellipse cx="100" cy="100" rx="85" ry="28" transform="rotate(120 100 100)" />
    </g>

    {/* Nucleus (Radiation Warning Shape simplified) */}
    <g transform="translate(100, 100)" fill="url(#core_glow)">
       <circle r="18" />
       <circle r="30" fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
    </g>
    
    {/* Electrons */}
    <circle cx="185" cy="100" r="6" fill="#fff" transform="rotate(0 100 100)" />
    <circle cx="185" cy="100" r="6" fill="#fff" transform="rotate(60 100 100)" />
    <circle cx="185" cy="100" r="6" fill="#fff" transform="rotate(120 100 100)" />
  </svg>
);