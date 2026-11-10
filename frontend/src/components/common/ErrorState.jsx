import { motion } from 'framer-motion';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import Button from './Button.jsx';

const ErrorState = ({ title = 'Algo salió mal', description, onRetry }) => (
  <motion.div
    role="alert"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center gap-3 py-12 text-center"
  >
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
      <TriangleAlert aria-hidden="true" className="h-7 w-7" />
    </div>
    <h3 className="text-base font-semibold text-danger">{title}</h3>
    {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
    {onRetry && (
      <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>
        Reintentar
      </Button>
    )}
  </motion.div>
);

export default ErrorState;
