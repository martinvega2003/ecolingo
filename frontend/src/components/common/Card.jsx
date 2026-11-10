// `className` y el resto de props (onClick, ref, etc.) se siguen pasando tal
// cual. La transición de color hace que los hover de borde de cada pantalla
// (p. ej. hover:border-info en Buscar) se sientan suaves.
const Card = ({ children, className = '', ...rest }) => (
  <div
    className={`rounded-xl border border-hair border-surface bg-surface p-4 transition-colors duration-200 ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
