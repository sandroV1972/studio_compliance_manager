export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield background - rappresenta protezione e compliance */}
      <path
        d="M50 5 L85 20 L85 45 C85 65 70 85 50 95 C30 85 15 65 15 45 L15 20 Z"
        fill="white"
        stroke="white"
        strokeWidth="2"
      />

      {/* Checkmark - rappresenta adempimento completato */}
      <path
        d="M35 50 L45 60 L65 35"
        stroke="#7C3AED"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Clock segments - rappresenta scadenze e tempo */}
      <circle
        cx="50"
        cy="50"
        r="20"
        stroke="#7C3AED"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      <path
        d="M50 35 L50 50 L60 55"
        stroke="#7C3AED"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
