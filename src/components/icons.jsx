// Ícones compartilhados (stroke estilo Lucide), 1 único ponto de manutenção.
const I = ({ size = 15, d }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {d}
  </svg>
);

export const Download = ({ size }) => (
  <I
    size={size}
    d={
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </>
    }
  />
);
export const Refresh = ({ size }) => (
  <I
    size={size}
    d={
      <>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </>
    }
  />
);
export const Plus = ({ size = 15 }) => (
  <I
    size={size}
    d={
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    }
  />
);
export const ChevronLeft = ({ size = 16 }) => (
  <I size={size} d={<polyline points="15 18 9 12 15 6" />} />
);
export const ChevronRight = ({ size = 16 }) => (
  <I size={size} d={<polyline points="9 18 15 12 9 6" />} />
);
export const Inbox = ({ size = 30 }) => (
  <I
    size={size}
    d={
      <>
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
      </>
    }
  />
);
export const X = ({ size = 15 }) => (
  <I
    size={size}
    d={
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    }
  />
);
