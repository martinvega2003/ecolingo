import { motion } from 'framer-motion';

// value/max en vez de un porcentaje ya calculado — así F03 (módulos
// completados) y F05 (XP del intento) pasan sus propios números sin tener
// que hacer la cuenta antes de llamarlo.
// La barra crece animada desde 0 al montar y entre valores.
const ProgressBar = ({ value, max, label }) => {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div>
      {label && <p className="mb-1.5 text-xs text-muted">{label}</p>}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-2.5 w-full overflow-hidden rounded-full bg-surface"
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
