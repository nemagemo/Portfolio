import React from 'react';

export const NUKL_DELogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 512 512" {...props}>
    <defs>
      <linearGradient id="nuke_grad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="50%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#fbbf24" />
      </linearGradient>
    </defs>
    <g fill="url(#nuke_grad)">
      {/* Base Cloud / Ring */}
      <path d="M256 352c-60 0-110 20-110 50s50 50 110 50 110-20 110-50-50-50-110-50z" opacity="0.8"/>
      <path d="M106 412c-20 10-30 30-10 50 15 15 40 10 60 0 15-10 15-30 0-45-10-8-30-15-50-5z" opacity="0.6"/>
      <path d="M406 412c20 10 30 30 10 50-15 15-40 10-60 0-15-10-15-30 0-45 10-8 30-15 50-5z" opacity="0.6"/>
      
      {/* Stem */}
      <path d="M216 380c0-40 10-100 20-140h40c10 40 20 100 20 140 0 20-20 30-40 30s-40-10-40-30z" />
      
      {/* Mushroom Cap */}
      <path d="M256 64c-80 0-140 40-160 100-10 30 10 60 40 70 20 6 40 0 50-10 10 20 40 30 70 30s60-10 70-30c10 10 30 16 50 10 30-10 50-40 40-70-20-60-80-100-160-100z" />
      
      {/* Highlights */}
      <circle cx="200" cy="140" r="15" fill="#fff" opacity="0.3" />
      <circle cx="300" cy="120" r="10" fill="#fff" opacity="0.2" />
    </g>
  </svg>
);
