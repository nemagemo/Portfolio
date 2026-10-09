import React from 'react';

export const NUKL_DELogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      {/* Cap core: White-hot to incandescent fireball */}
      <radialGradient id="nukl_fire_core" cx="50%" cy="42%" r="48%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="20%" stopColor="#fef08a" />
        <stop offset="45%" stopColor="#f97316" />
        <stop offset="75%" stopColor="#dc2626" />
        <stop offset="95%" stopColor="#7f1d1d" />
      </radialGradient>

      {/* Cap outer billows: Dark billowing smoke with glowing edge */}
      <radialGradient id="nukl_smoke_outer" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#fb923c" />
        <stop offset="35%" stopColor="#ea580c" />
        <stop offset="70%" stopColor="#991b1b" />
        <stop offset="92%" stopColor="#450a0a" />
        <stop offset="100%" stopColor="#1c1917" />
      </radialGradient>

      {/* Stem column gradient */}
      <linearGradient id="nukl_stem_grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="25%" stopColor="#f97316" />
        <stop offset="65%" stopColor="#dc2626" />
        <stop offset="90%" stopColor="#991b1b" />
        <stop offset="100%" stopColor="#450a0a" />
      </linearGradient>

      {/* Fire core of stem */}
      <linearGradient id="nukl_stem_core" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor="#fef08a" />
        <stop offset="80%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>

      {/* Base surge ground explosion gradient */}
      <radialGradient id="nukl_base_grad" cx="50%" cy="85%" r="55%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="25%" stopColor="#f97316" />
        <stop offset="55%" stopColor="#b91c1c" />
        <stop offset="85%" stopColor="#450a0a" />
        <stop offset="100%" stopColor="#1c1917" />
      </radialGradient>

      {/* Condensation shockwave torus ring */}
      <linearGradient id="nukl_shockwave_ring" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fed7aa" stopOpacity="0" />
        <stop offset="25%" stopColor="#fed7aa" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="75%" stopColor="#fed7aa" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#fed7aa" stopOpacity="0" />
      </linearGradient>

      {/* Glow filter */}
      <filter id="nukl_glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* 2. Base Surge (Podstawa wybuchu / Fala przyziemna) */}
    <path
      d="M 18 190 
         C 12 180 18 168 32 165 
         C 40 155 58 152 70 160 
         C 82 152 100 150 112 158 
         C 124 150 142 152 152 160 
         C 165 155 182 165 184 178 
         C 190 185 182 192 170 192 
         L 30 192 
         C 22 192 18 191 18 190 Z"
      fill="url(#nukl_base_grad)"
      stroke="#7f1d1d"
      strokeWidth="1.5"
    />

    {/* Inner base surge fiery highlights */}
    <path
      d="M 38 185 C 44 172 58 170 68 176 C 78 168 95 168 105 174 C 115 168 132 168 142 176 C 152 170 164 176 168 185 Z"
      fill="#f97316"
      opacity="0.75"
    />
    <path
      d="M 60 188 C 70 178 85 178 95 184 C 105 178 120 178 130 186 C 115 190 85 190 60 188 Z"
      fill="#fef08a"
      opacity="0.9"
    />

    {/* 3. Updraft Stem Column (Słup dymu i ognia) */}
    <path
      d="M 68 165 
         C 78 145 84 125 86 100 
         L 114 100 
         C 116 125 122 145 132 165 
         C 118 170 82 170 68 165 Z"
      fill="url(#nukl_stem_grad)"
      stroke="#450a0a"
      strokeWidth="1.5"
    />

    {/* Churning smoke side contours along stem */}
    <path d="M 72 155 C 68 148 72 140 78 138 C 75 130 80 122 86 122" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
    <path d="M 128 155 C 132 148 128 140 122 138 C 125 130 120 122 114 122" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />

    {/* Inner blazing heat column */}
    <path
      d="M 88 160 
         C 92 138 94 118 95 98 
         L 105 98 
         C 106 118 108 138 112 160 
         Z"
      fill="url(#nukl_stem_core)"
    />
    {/* White core updraft */}
    <path
      d="M 96 155 
         C 97 135 98 115 98 96 
         L 102 96 
         C 102 115 103 135 104 155 
         Z"
      fill="#ffffff"
      opacity="0.95"
    />

    {/* 4. Condensation Wilson Ring (Toroidalna fala uderzeniowa) */}
    <ellipse cx="100" cy="116" rx="66" ry="12" fill="url(#nukl_shockwave_ring)" />
    <path d="M 36 116 C 50 126 150 126 164 116" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" fill="none" />

    {/* 5. Mushroom Cap - Outer Smoke Billows (Główna czasza wybuchu) */}
    <path
      d="M 45 88 
         C 26 84 15 68 22 52 
         C 28 38 46 32 58 35 
         C 68 22 88 16 104 18 
         C 120 16 140 22 150 35 
         C 162 32 180 38 186 52 
         C 192 68 182 84 162 88 
         C 148 92 135 84 122 82 
         C 112 80 96 80 86 82 
         C 72 84 60 92 45 88 Z"
      fill="url(#nukl_smoke_outer)"
      stroke="#1c1917"
      strokeWidth="2"
      strokeLinejoin="round"
    />

    {/* Intermediate fiery billows (Płonące fałdy czaszy) */}
    <path
      d="M 52 82 
         C 36 78 28 66 34 54 
         C 40 42 54 38 64 42 
         C 74 28 90 24 102 25 
         C 114 24 130 28 140 42 
         C 150 38 164 42 170 54 
         C 176 66 168 78 152 82 
         C 138 84 128 76 118 75 
         C 108 74 96 74 86 75 
         C 76 76 66 84 52 82 Z"
      fill="url(#nukl_fire_core)"
    />

    {/* Internal cloud depth creases */}
    <path d="M 42 62 C 55 58 68 66 75 74" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
    <path d="M 164 62 C 151 58 138 66 131 74" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
    <path d="M 65 44 C 76 38 90 42 96 52" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
    <path d="M 141 44 C 130 38 116 42 110 52" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
    <path d="M 82 28 C 94 24 108 24 120 28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />

    {/* Center incandescent detonation core */}
    <ellipse cx="102" cy="56" rx="36" ry="22" fill="#ffffff" opacity="0.85" filter="url(#nukl_glow)" />
    <ellipse cx="102" cy="56" rx="22" ry="14" fill="#ffffff" />
    <ellipse cx="102" cy="56" rx="42" ry="25" fill="#fef08a" opacity="0.55" />

    {/* Bottom toroidal roll-under of the cap (Zawinięcie torusowe do wnętrza) */}
    <path
      d="M 54 84 
         C 68 78 84 86 98 84 
         C 112 86 128 78 142 84 
         C 134 94 118 94 108 92 
         C 98 94 82 94 74 92 
         C 65 94 58 90 54 84 Z"
      fill="#b91c1c"
      stroke="#7f1d1d"
      strokeWidth="1.2"
    />
    <path
      d="M 72 88 C 84 84 98 86 108 84 C 118 86 132 84 144 88"
      stroke="#f97316"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      opacity="0.9"
    />

    {/* 6. Glowing plasma embers & flying particles */}
    <circle cx="28" cy="42" r="1.5" fill="#fef08a" />
    <circle cx="18" cy="65" r="1.8" fill="#f97316" />
    <circle cx="34" cy="98" r="1.5" fill="#fdba74" />
    <circle cx="178" cy="40" r="1.6" fill="#fef08a" />
    <circle cx="186" cy="68" r="1.8" fill="#f97316" />
    <circle cx="168" cy="102" r="1.5" fill="#fdba74" />
    <circle cx="62" cy="120" r="1.6" fill="#ffffff" />
    <circle cx="142" cy="122" r="1.6" fill="#ffffff" />
    <circle cx="50" cy="145" r="1.4" fill="#f97316" />
    <circle cx="152" cy="144" r="1.4" fill="#f97316" />
    <circle cx="102" cy="14" r="2.2" fill="#ffffff" />
  </svg>
);