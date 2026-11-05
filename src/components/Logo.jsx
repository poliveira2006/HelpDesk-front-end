// Marca HelpDesk (a mesma do favicon): quadrado arredondado teal com o "H".
export default function Logo({ size = 30, className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <rect width="24" height="24" rx="6" fill="var(--accent)" />
      <path
        d="M8 6v12M16 6v12M8 12h8"
        stroke="#052a1f"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
