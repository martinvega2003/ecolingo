import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

// `icon` es opcional (componente de lucide-react); sin él se usa Inbox.
const EmptyState = ({ title, description, action, icon: Icon = Inbox }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center gap-3 py-12 text-center"
  >
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted">
      <Icon aria-hidden="true" className="h-7 w-7" />
    </div>
    <h3 className="text-base font-semibold text-text">{title}</h3>
    {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
    {action}
  </motion.div>
);

export default EmptyState;
