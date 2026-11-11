import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

// Número que "cuenta" hasta su valor cuando cambia (XP en la cabecera y en
// el resultado). No usa estado de React: el valor animado se renderiza
// directo desde un motion value. Con "reducir movimiento" salta sin animar.
const AnimatedNumber = ({ value, duration = 0.8, className = '' }) => {
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v).toLocaleString('es-PY'));

  useEffect(() => {
    if (reduce) {
      motionValue.set(value);
      return undefined;
    }
    const controls = animate(motionValue, value, { duration, ease: 'easeOut' });
    return () => controls.stop();
  }, [value, duration, reduce, motionValue]);

  return <motion.span className={className}>{rounded}</motion.span>;
};

export default AnimatedNumber;
