import { motion } from 'framer-motion';

// Anillo de progreso (Mapa, Logros). value/max como ProgressBar; el contenido
// del centro se pasa como children. El color del trazo es `currentColor`:
// se elige con una clase de texto (por defecto, accent).
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ProgressRing = ({ value, max, className = 'h-24 w-24', colorClassName = 'text-accent', children }) => {
  const safeMax = max > 0 ? max : 1;
  const ratio = Math.min(1, Math.max(0, value / safeMax));

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`relative shrink-0 ${className}`}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="10" className="stroke-surface-2" />
        <motion.circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke="currentColor"
          className={colorClassName}
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - ratio) }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
};

export default ProgressRing;
