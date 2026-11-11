import { Sprout } from 'lucide-react';

const SIZE_CLASSES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-10 w-10 border-2',
  lg: 'h-14 w-14 border-[3px]',
};

const ICON_CLASSES = { sm: 'hidden', md: 'h-4 w-4', lg: 'h-6 w-6' };

// El anillo gira alrededor de un brote (la marca): mismo componente y props
// de siempre (size, label), pero con identidad en vez de un círculo genérico.
const Spinner = ({ size = 'md', label = 'Cargando…' }) => (
  <div role="status" className="flex flex-col items-center gap-3 text-muted">
    <div className="relative flex items-center justify-center">
      <div className={`animate-spin rounded-full border-surface border-t-accent ${SIZE_CLASSES[size]}`} />
      <Sprout aria-hidden="true" className={`absolute animate-pulse text-accent ${ICON_CLASSES[size]}`} />
    </div>
    {label && <span className="text-xs">{label}</span>}
  </div>
);

export default Spinner;
