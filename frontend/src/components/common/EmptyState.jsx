import { motion } from 'framer-motion';
import Mascot from './Mascot.jsx';

// Estado vacío con la mascota. Misma API (title, description, action); la
// prop `icon` de la versión anterior se sigue aceptando pero ya no se dibuja:
// el chanchito toma su lugar en todas las pantallas a la vez.
// - mood: estado de la mascota (por defecto 'durmiendo').
const EmptyState = ({ title, description, action, mood = 'durmiendo' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center gap-3 py-10 text-center"
  >
    <Mascot mood={mood} className="h-24 w-28" />
    <h3 className="text-base font-extrabold text-text">{title}</h3>
    {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
    {action}
  </motion.div>
);

export default EmptyState;
