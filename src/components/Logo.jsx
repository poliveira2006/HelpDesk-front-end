// Marca SPREV (São Paulo Previdência): logo oficial servido pelo favicon do projeto.
export default function Logo({ size = 30, className = '' }) {
  return (
    <img
      src="/favicon.png"
      alt="São Paulo Previdência"
      className={className ? `logo ${className}` : 'logo'}
      style={{ '--logo-size': `${size}px` }}
      draggable="false"
    />
  );
}
