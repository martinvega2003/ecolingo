const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center gap-3 py-12 text-center">
    <h3 className="text-base font-medium text-text">{title}</h3>
    {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
