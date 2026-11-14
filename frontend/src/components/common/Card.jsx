// `className` y el resto de props (onClick, ref, etc.) se siguen pasando tal
// cual. La transición de color hace que los hover de borde de cada pantalla
// se sientan suaves. Borde `surface-2` (apenas más claro que la tarjeta) para
// que la tarjeta se despegue del fondo sin usar sombras.
const Card = ({ children, className = '', ...rest }) => (
  <div
    className={`rounded-2xl border border-surface-2 bg-surface p-4 transition-colors duration-200 ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
