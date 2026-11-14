import { motion } from 'framer-motion';
import Coin from './Coin.jsx';
import Mascot from './Mascot.jsx';

// Carga con la mascota: una moneda cae en la alcancía en bucle. Mismas props
// de siempre (size, label). El tamaño 'sm' sigue siendo un anillo simple,
// para usar dentro de botones o líneas de texto.
const MASCOT_SIZES = {
  md: { box: 'h-24 w-24', mascot: 'h-20 w-24', coin: 'h-6 w-6' },
  lg: { box: 'h-32 w-32', mascot: 'h-28 w-32', coin: 'h-8 w-8' },
};

const Spinner = ({ size = 'md', label = 'Llenando la alcancía…' }) => {
  if (size === 'sm') {
    return (
      <div role="status" className="flex items-center gap-2 text-muted">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-surface-2 border-t-accent" />
        {label && <span className="text-xs">{label}</span>}
      </div>
    );
  }

  const s = MASCOT_SIZES[size];

  return (
    <div role="status" className="flex flex-col items-center gap-2 text-muted">
      <div className={`relative flex items-end justify-center ${s.box}`}>
        <motion.span
          className="absolute left-1/2 top-0 -ml-3"
          animate={{ y: [-6, 22], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeIn', times: [0, 0.2, 0.8, 1] }}
        >
          <Coin className={s.coin} />
        </motion.span>
        <Mascot coin={false} className={s.mascot} />
      </div>
      {label && <span className="text-xs font-semibold">{label}</span>}
    </div>
  );
};

export default Spinner;
