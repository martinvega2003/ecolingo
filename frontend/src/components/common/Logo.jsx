import { Sprout } from 'lucide-react';

// Marca de Ecolingo: brote sobre el verde primario. Reutilizable en la
// cabecera y en el login.
const SIZES = {
  sm: { box: 'h-8 w-8 rounded-lg', icon: 'h-4 w-4' },
  lg: { box: 'h-14 w-14 rounded-2xl', icon: 'h-7 w-7' },
};

const Logo = ({ size = 'sm' }) => (
  <span className={`inline-flex shrink-0 items-center justify-center bg-primary text-accent ${SIZES[size].box}`}>
    <Sprout aria-hidden="true" className={SIZES[size].icon} />
  </span>
);

export default Logo;
