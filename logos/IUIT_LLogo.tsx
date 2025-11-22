import React from 'react';

export const IUIT_LLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" {...props}>
    <defs>
      <linearGradient id="tech_grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9" /> {/* Sky Blue */}
        <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
      </linearGradient>
    </defs>
    
    {/* Pins / Traces Background */}
    <g stroke="#94a3b8" strokeWidth="8" strokeLinecap="round">
      {/* Top Pins */}
      <path d="M60 20 V40" />
      <path d="M100 20 V40" />
      <path d="M140 20 V40" />
      
      {/* Bottom Pins */}
      <path d="M60 160 V180" />
      <path d="M100 160 V180" />
      <path d="M140 160 V180" />
      
      {/* Left Pins */}
      <path d="M20 60 H40" />
      <path d="M20 100 H40" />
      <path d="M20 140 H40" />
      
      {/* Right Pins */}
      <path d="M160 60 H180" />
      <path d="M160 100 H180" />
      <path d="M160 140 H180" />
    </g>

    {/* Chip Body */}
    <rect x="40" y="40" width="120" height="120" rx="15" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
    
    {/* Inner Core */}
    <rect x="70" y="70" width="60" height="60" rx="8" fill="url(#tech_grad)" />
    
    {/* Circuit Lines on Core */}
    <path d="M70 100 H130 M100 70 V130" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
    <circle cx="100" cy="100" r="10" fill="white" fillOpacity="0.8" />
  </svg>
);
