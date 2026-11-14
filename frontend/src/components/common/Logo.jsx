import Mascot from './Mascot.jsx';

// Marca de Ecolingo: el chanchito alcancía con la moneda ₲ sobre el verde
// primario (variante A de la propuesta visual). Misma API de siempre
// (`size`), así que la cabecera y el login no cambian su forma de usarlo.
const SIZES = {
  sm: { box: 'h-9 w-9 rounded-xl', icon: 'h-7 w-7' },
  lg: { box: 'h-16 w-16 rounded-2xl', icon: 'h-12 w-12' },
};

const Logo = ({ size = 'sm' }) => (
  <span className={`inline-flex shrink-0 items-center justify-center bg-primary ${SIZES[size].box}`}>
    <Mascot className={SIZES[size].icon} />
  </span>
);

// Nombre con "lingo" en el verde de acento (igual que el XP).
export const Wordmark = ({ className = '' }) => (
  <span className={`font-extrabold text-text ${className}`}>
    Eco<span className="text-accent">lingo</span>
  </span>
);

export default Logo;
