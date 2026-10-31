import React from 'react';

interface AuthIllustrationProps {
  variant?: 'login' | 'register';
}

export const AuthIllustration: React.FC<AuthIllustrationProps> = ({ variant = 'login' }) => {
  return (
    <svg
      viewBox="0 0 480 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full max-w-md mx-auto"
      aria-hidden="true"
    >
      {/* Background blobs */}
      <ellipse cx="240" cy="200" rx="200" ry="170" fill="#EEF2FF" opacity="0.5" />
      <ellipse cx="340" cy="120" rx="90" ry="80" fill="#E0E7FF" opacity="0.4" />
      <ellipse cx="100" cy="300" rx="70" ry="60" fill="#CCFBF1" opacity="0.35" />

      {/* Orbit ring */}
      <circle cx="240" cy="200" r="130" stroke="#C7D2FE" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
      <circle cx="240" cy="200" r="90" stroke="#A5F3FC" strokeWidth="1" strokeDasharray="4 5" opacity="0.4" />

      {/* Central ACTIVIA hub */}
      <circle cx="240" cy="200" r="36" fill="#4F46E5" />
      <circle cx="240" cy="200" r="30" fill="#6366F1" />
      {/* A letter */}
      <text x="240" y="207" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="system-ui">A</text>

      {/* Book — top left orbit */}
      <g transform="translate(118, 100)">
        <rect x="0" y="0" width="44" height="34" rx="4" fill="#4F46E5" />
        <rect x="4" y="3" width="36" height="28" rx="3" fill="#818CF8" />
        <rect x="8" y="9" width="24" height="2" rx="1" fill="white" opacity="0.8" />
        <rect x="8" y="14" width="18" height="2" rx="1" fill="white" opacity="0.6" />
        <rect x="8" y="19" width="20" height="2" rx="1" fill="white" opacity="0.6" />
        <line x1="22" y1="3" x2="22" y2="31" stroke="#6366F1" strokeWidth="1.5" />
      </g>

      {/* Trophy — top right orbit */}
      <g transform="translate(324, 88)">
        <rect x="14" y="34" width="16" height="6" rx="2" fill="#F59E0B" />
        <rect x="8" y="38" width="28" height="4" rx="2" fill="#FCD34D" />
        <path d="M8 4 Q8 28 22 28 Q36 28 36 4 Z" fill="#F59E0B" />
        <path d="M8 4 Q0 4 0 12 Q0 22 10 24" stroke="#FCD34D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M36 4 Q44 4 44 12 Q44 22 34 24" stroke="#FCD34D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="22" cy="16" r="5" fill="#FBBF24" opacity="0.6" />
      </g>

      {/* Science flask — bottom right */}
      <g transform="translate(330, 256)">
        <path d="M14 2 L14 18 L4 34 Q2 38 6 40 L30 40 Q34 38 32 34 L22 18 L22 2 Z" fill="#0D9488" opacity="0.9" />
        <path d="M14 20 L5 34 Q3 38 7 40 L29 40 Q33 38 31 34 L22 20 Z" fill="#14B8A6" opacity="0.7" />
        <rect x="10" y="0" width="16" height="4" rx="2" fill="#0F766E" />
        <circle cx="10" cy="30" r="3" fill="white" opacity="0.6" />
        <circle cx="18" cy="34" r="2" fill="white" opacity="0.5" />
        <circle cx="25" cy="28" r="2.5" fill="white" opacity="0.4" />
      </g>

      {/* Sport ball — bottom left */}
      <g transform="translate(100, 258)">
        <circle cx="22" cy="22" r="22" fill="#4F46E5" />
        <circle cx="22" cy="22" r="17" fill="#6366F1" />
        <path d="M22 5 Q28 14 22 22 Q16 30 22 39" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M5 22 Q14 16 22 22 Q30 28 39 22" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
      </g>

      {/* Star / Achievement — right middle */}
      <g transform="translate(368, 185)">
        <path d="M16 2 L19 11 L28 11 L21 17 L24 26 L16 20 L8 26 L11 17 L4 11 L13 11 Z" fill="#F59E0B" />
        <path d="M16 5 L18.5 12 L26 12 L20 16.5 L22.5 24 L16 19.5 L9.5 24 L12 16.5 L6 12 L13.5 12 Z" fill="#FCD34D" />
      </g>

      {/* Pencil — left middle */}
      <g transform="translate(62, 178)">
        <rect x="6" y="0" width="12" height="44" rx="2" fill="#4F46E5" transform="rotate(-20, 12, 22)" />
        <rect x="6" y="0" width="12" height="10" rx="2" fill="#FCD34D" transform="rotate(-20, 12, 22)" />
        <polygon points="6,40 18,40 12,52" fill="#F8FAFC" transform="rotate(-20, 12, 22)" />
        <polygon points="9,46 15,46 12,52" fill="#1E293B" transform="rotate(-20, 12, 22)" />
      </g>

      {/* Palette / Arts — top center */}
      <g transform="translate(206, 52)">
        <ellipse cx="20" cy="20" rx="20" ry="18" fill="#7C3AED" opacity="0.85" />
        <ellipse cx="20" cy="20" rx="15" ry="13" fill="#8B5CF6" opacity="0.7" />
        <circle cx="12" cy="14" r="3.5" fill="#EF4444" />
        <circle cx="22" cy="11" r="3.5" fill="#F59E0B" />
        <circle cx="29" cy="17" r="3.5" fill="#10B981" />
        <circle cx="27" cy="26" r="3.5" fill="#3B82F6" />
        <ellipse cx="18" cy="26" rx="5" ry="6" fill="#1E1B4B" />
      </g>

      {/* Connection lines from hub to nodes */}
      <line x1="204" y1="186" x2="162" y2="128" stroke="#A5B4FC" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <line x1="272" y1="180" x2="344" y2="118" stroke="#A5B4FC" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <line x1="268" y1="218" x2="356" y2="272" stroke="#99F6E4" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <line x1="212" y1="222" x2="144" y2="278" stroke="#A5B4FC" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <line x1="240" y1="164" x2="228" y2="86" stroke="#C4B5FD" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

      {/* Floating dots */}
      <circle cx="170" cy="60" r="4" fill="#818CF8" opacity="0.5" />
      <circle cx="290" cy="52" r="3" fill="#0D9488" opacity="0.5" />
      <circle cx="380" cy="160" r="5" fill="#F59E0B" opacity="0.4" />
      <circle cx="80" cy="150" r="4" fill="#4F46E5" opacity="0.4" />
      <circle cx="60" cy="250" r="3" fill="#0D9488" opacity="0.4" />
      <circle cx="400" cy="290" r="4" fill="#818CF8" opacity="0.4" />
      <circle cx="300" cy="360" r="3" fill="#F59E0B" opacity="0.35" />
      <circle cx="160" cy="350" r="5" fill="#4F46E5" opacity="0.3" />

      {/* Bottom tagline area — student silhouettes */}
      <g transform="translate(170, 310)" opacity="0.7">
        <circle cx="20" cy="0" r="8" fill="#4F46E5" />
        <path d="M8 18 Q20 12 32 18 L32 28 L8 28 Z" fill="#4F46E5" />
        <circle cx="50" cy="2" r="7" fill="#0D9488" />
        <path d="M38 20 Q50 14 62 20 L62 28 L38 28 Z" fill="#0D9488" />
        <circle cx="80" cy="0" r="8" fill="#7C3AED" />
        <path d="M68 18 Q80 12 92 18 L92 28 L68 28 Z" fill="#7C3AED" />
        {/* Connecting arc */}
        <path d="M20 -10 Q50 -24 80 -10" stroke="#C7D2FE" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
      </g>

      {/* Variant-specific accent for register */}
      {variant === 'register' && (
        <>
          <circle cx="200" cy="340" r="6" fill="#10B981" opacity="0.5" />
          <circle cx="280" cy="348" r="4" fill="#4F46E5" opacity="0.4" />
          <path d="M200 340 Q240 320 280 340" stroke="#A7F3D0" strokeWidth="1.5" fill="none" opacity="0.6" />
        </>
      )}
    </svg>
  );
};
