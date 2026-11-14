import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import Button from './Button.jsx';
import Mascot from './Mascot.jsx';

// Estado de error con la mascota "mareada". Misma API (title, description,
// onRetry). La última línea aclara que el progreso no se perdió: es lo que
// más preocupa a un alumno cuando algo falla en medio del uso.
const ErrorState = ({ title = 'Algo salió mal', description, onRetry }) => (
  <motion.div
    role="alert"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center gap-3 py-10 text-center"
  >
    <Mascot mood="mareado" className="h-24 w-28" />
    <h3 className="text-base font-extrabold text-text">{title}</h3>
    {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
    <p className="max-w-sm text-xs text-muted">No te preocupes: tu progreso está guardado.</p>
    {onRetry && (
      <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>
        Reintentar
      </Button>
    )}
  </motion.div>
);

export default ErrorState;
