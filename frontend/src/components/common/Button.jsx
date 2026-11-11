// Componentes comunes de F02 (dueño: Pareja, §0.13). Definir bien las
// props acá evita que cada feature arme su propio botón (riesgo señalado
// en Parte 3, F02: "zona compartida, todo lo de esta feature lo van a
// tocar los dos después").
//
// Props retrocompatibles: variant, type, disabled, onClick, className y
// cualquier otra prop nativa siguen igual. Se agregó (opcional):
// - icon: componente de lucide-react que se dibuja a la izquierda del texto.
const VARIANT_CLASSES = {
  primary: 'bg-primary text-text hover:bg-primary/85',
  secondary: 'border border-hair border-muted text-text hover:border-info hover:bg-info/10',
  danger: 'bg-danger text-text hover:bg-danger/85',
  ghost: 'text-muted hover:bg-surface hover:text-text',
};

const Button = ({
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  icon: Icon,
  children,
  className = '',
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${VARIANT_CLASSES[variant]} ${className}`}
    {...rest}
  >
    {Icon && <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />}
    {children}
  </button>
);

export default Button;
