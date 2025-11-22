import React from 'react';

export const ResztaKryptoLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" {...props}>
    <defs>
      <linearGradient id="sad_coin_grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fcd34d" /> {/* Amber 300 */}
        <stop offset="100%" stopColor="#d97706" /> {/* Amber 600 */}
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="4" stdDeviation="2" floodOpacity="0.3"/>
      </filter>
    </defs>

    {/* Coin Body */}
    <circle cx="100" cy="100" r="85" fill="url(#sad_coin_grad)" stroke="#b45309" strokeWidth="6" filter="url(#shadow)" />
    
    {/* Inner Ridge */}
    <circle cx="100" cy="100" r="70" fill="none" stroke="#b45309" strokeWidth="2" strokeDasharray="8 6" opacity="0.4" />

    {/* Face Features: Dead Eyes (X X) */}
    <g stroke="#78350f" strokeWidth="8" strokeLinecap="round">
      {/* Left Eye */}
      <path d="M55 70 L85 100" />
      <path d="M85 70 L55 100" />
      
      {/* Right Eye */}
      <path d="M115 70 L145 100" />
      <path d="M145 70 L115 100" />
    </g>

    {/* Mouth: Tongue Sticking Out (Dizzy/Dead) */}
    <path d="M80 130 Q100 120 120 130" fill="none" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
    <path d="M110 130 Q125 160 100 165 Q85 160 95 130" fill="#ef4444" stroke="#78350f" strokeWidth="3" />

    {/* Sweat Drops (Comic effect) */}
    <path d="M40 90 Q35 80 40 70 Q45 80 40 90" fill="#3b82f6" opacity="0.7" />
    <path d="M170 120 Q175 110 170 100 Q165 110 170 120" fill="#3b82f6" opacity="0.7" />

  </svg>
);