const Card = ({ children, className = '', ...rest }) => (
  <div className={`rounded-lg border border-hair border-surface bg-surface p-4 ${className}`} {...rest}>
    {children}
  </div>
);

export default Card;
