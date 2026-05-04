export function Squiggle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 12"
      fill="none"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M2 8 Q 14 1, 28 6 T 56 6 T 84 6 T 112 6 T 140 6 T 168 6 T 198 6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
