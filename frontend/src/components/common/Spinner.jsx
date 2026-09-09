const SIZE_CLASSES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

const Spinner = ({ size = 'md', label = 'Cargando…' }) => (
  <div role="status" className="flex flex-col items-center gap-2 text-muted">
    <div className={`animate-spin rounded-full border-muted border-t-primary ${SIZE_CLASSES[size]}`} />
    {label && <span className="text-xs">{label}</span>}
  </div>
);

export default Spinner;
