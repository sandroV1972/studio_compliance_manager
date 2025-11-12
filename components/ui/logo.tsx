export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradiente radiale per effetto 3D più realistico */}
        <radialGradient id="shieldGradient" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="1" />
          <stop offset="50%" stopColor="#8B5CF6" stopOpacity="1" />
          <stop offset="100%" stopColor="#6D28D9" stopOpacity="1" />
        </radialGradient>
        {/* Gradiente per il checkmark */}
        <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="100%" stopColor="#F3F4F6" stopOpacity="1" />
        </linearGradient>
        {/* Ombra più marcata per profondità */}
        <filter id="shadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="4" dy="4" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Inner glow per effetto 3D */}
        <filter id="innerGlow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feOffset in="blur" dx="0" dy="2" result="offsetBlur" />
          <feFlood floodColor="#FFFFFF" floodOpacity="0.3" result="color" />
          <feComposite
            in="color"
            in2="offsetBlur"
            operator="in"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="glow" />
          </feMerge>
        </filter>
      </defs>

      {/* Shield - rappresenta protezione e compliance */}
      <path
        d="M50 5 L90 20 L90 50 C90 70 75 88 50 95 C25 88 10 70 10 50 L10 20 Z"
        fill="url(#shieldGradient)"
        stroke="white"
        strokeWidth="4"
        filter="url(#shadow)"
      />

      {/* Checkmark sullo scudo - rappresenta adempimento completato */}
      <path
        d="M28 50 L44 66 L72 34"
        stroke="url(#checkGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter="url(#innerGlow)"
      />
    </svg>
  );
}
