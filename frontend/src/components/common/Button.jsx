// Componentes comunes de F02 (dueño: Pareja, §0.13). Definir bien las
// props acá evita que cada feature arme su propio botón (riesgo señalado
// en Parte 3, F02: "zona compartida, todo lo de esta feature lo van a
// tocar los dos después").
const VARIANT_CLASSES = {
  primary: 'bg-primary text-text hover:opacity-90',
  secondary: 'border border-hair border-muted text-text hover:border-info',
  danger: 'bg-danger text-text hover:opacity-90',
  ghost: 'text-muted hover:text-text',
};

const Button = ({ variant = 'primary', type = 'button', disabled = false, onClick, children, className = '', ...rest }) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default Button;
