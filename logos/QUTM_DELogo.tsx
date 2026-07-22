import React from 'react';

export const QUTM_DELogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" {...props}>
    <defs>
      {/* Background Gradient */}
      <radialGradient id="qutm_bg_glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>

      {/* Core Quantum Glow */}
      <radialGradient id="qutm_core_glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
        <stop offset="60%" stopColor="#818cf8" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
      </radialGradient>

      {/* Quantum Ring Gradient */}
      <linearGradient id="qutm_ring_grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
    </defs>

    {/* Dark Badge Outer Ring */}
    <circle cx="100" cy="100" r="95" fill="url(#qutm_bg_glow)" stroke="url(#qutm_ring_grad)" strokeWidth="4" />

    {/* Quantum Processing Lattice / Chip Background Grid */}
    <path
      d="M100 30 V170 M30 100 H170 M50 50 L150 150 M150 50 L50 150"
      stroke="#475569"
      strokeWidth="1.5"
      strokeDasharray="4 4"
      opacity="0.35"
    />

    {/* Bloch Sphere / Quantum Superposition Orbit Rings */}
    <g stroke="url(#qutm_ring_grad)" strokeWidth="3" fill="none" opacity="0.85">
      {/* Outer Bloch Equator */}
      <ellipse cx="100" cy="100" rx="72" ry="26" transform="rotate(-30 100 100)" />
      <ellipse cx="100" cy="100" rx="72" ry="26" transform="rotate(30 100 100)" />
      <ellipse cx="100" cy="100" rx="72" ry="26" transform="rotate(90 100 100)" />
    </g>

    {/* Quantum Central Core Glow */}
    <circle cx="100" cy="100" r="42" fill="url(#qutm_core_glow)" />

    {/* Quantum Processor Core Chip (Square with rounded corners & diagonal cuts) */}
    <rect
      x="75"
      y="75"
      width="50"
      height="50"
      rx="10"
      fill="#0f172a"
      stroke="url(#qutm_ring_grad)"
      strokeWidth="3"
    />

    {/* Stylized Quantum 'Q' & State Vector Vector */}
    <g transform="translate(100, 100)">
      {/* Q Ring */}
      <circle r="18" fill="none" stroke="#38bdf8" strokeWidth="4.5" />
      {/* Q Tail / Quantum Vector Arrow */}
      <path d="M10 10 L22 22" stroke="#c084fc" strokeWidth="4.5" strokeLinecap="round" />
      {/* Superposition State Point |Ψ> */}
      <circle cx="0" cy="0" r="5" fill="#f43f5e" />
    </g>

    {/* Entangled Qubit Nodes (Glowing Qubits in superposition state) */}
    <circle cx="150" cy="71" r="6" fill="#38bdf8" />
    <circle cx="50" cy="129" r="6" fill="#c084fc" />
    <circle cx="129" cy="150" r="6" fill="#818cf8" />
    <circle cx="71" cy="50" r="6" fill="#f43f5e" />

    {/* Quantum Entanglement Links */}
    <path d="M150 71 L100 100 M50 129 L100 100 M129 150 L100 100 M71 50 L100 100" stroke="#a5b4fc" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
  </svg>
);
