import Button from './Button.jsx';

const ErrorState = ({ title = 'Algo salió mal', description, onRetry }) => (
  <div className="flex flex-col items-center gap-3 py-12 text-center">
    <h3 className="text-base font-medium text-danger">{title}</h3>
    {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
    {onRetry && (
      <Button variant="secondary" onClick={onRetry}>
        Reintentar
      </Button>
    )}
  </div>
);

export default ErrorState;
