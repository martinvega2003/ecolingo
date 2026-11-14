import { initialsOf } from '../../utils/text.js';

// Avatar de iniciales (Ranking, Perfil, tabla del docente). No hay foto de
// perfil en el proyecto (F09 la excluye), así que se usan las dos primeras
// iniciales del nombre. El color se elige de forma estable según el nombre.
const TONES = [
  'bg-mod-presupuesto/20 text-mod-presupuesto',
  'bg-mod-credito/20 text-mod-credito',
  'bg-mod-inversion/20 text-mod-inversion',
  'bg-mod-plan/20 text-mod-plan',
  'bg-gold/20 text-gold',
  'bg-info/20 text-info',
];

const SIZES = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-20 w-20 text-2xl',
};

const toneFor = (fullName = '') => {
  let sum = 0;
  for (const ch of fullName) sum += ch.codePointAt(0);
  return TONES[sum % TONES.length];
};

// highlight: el avatar propio va en verde (accent) con anillo.
const Avatar = ({ fullName, size = 'sm', highlight = false, className = '' }) => (
  <span
    aria-hidden="true"
    className={`flex shrink-0 items-center justify-center rounded-full font-extrabold ${SIZES[size]} ${
      highlight ? 'bg-primary text-text ring-2 ring-accent' : toneFor(fullName)
    } ${className}`}
  >
    {initialsOf(fullName)}
  </span>
);

export default Avatar;
