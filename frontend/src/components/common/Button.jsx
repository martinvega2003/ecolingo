// Componentes comunes de F02 (dueño: Pareja, §0.13). Definir bien las
// props acá evita que cada feature arme su propio botón (riesgo señalado
// en Parte 3, F02: "zona compartida, todo lo de esta feature lo van a
// tocar los dos después").
//
// Props retrocompatibles: variant, type, disabled, onClick, icon, className
// y cualquier otra prop nativa siguen igual.
//
// Botón "3D" de la propuesta visual: la profundidad sale de un borde
// inferior de 4 px (regla "sin sombras"). El borde usa el color `bg` con
// transparencia sobre el fondo del propio botón, así se oscurece sin
// necesitar un color extra por variante. Al presionar, el botón baja.
// - variant "light": botón claro para usar sobre fondos verdes (saludo del Mapa).
// - colorClassName: reemplaza el color de fondo/texto de la variante
//   (p. ej. el color de un módulo: "bg-mod-presupuesto text-text").
const BASE_3D = 'border-b-4 border-bg/40 hover:brightness-110 active:translate-y-0.5 active:brightness-95';

const VARIANT_CLASSES = {
  primary: `bg-primary text-text ${BASE_3D}`,
  secondary: `bg-surface-2 text-text ${BASE_3D}`,
  danger: `bg-danger text-text ${BASE_3D}`,
  light: `bg-text text-primary ${BASE_3D}`,
  ghost: 'text-muted hover:bg-surface-2 hover:text-text',
};

const Button = ({
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  icon: Icon,
  colorClassName,
  children,
  className = '',
  ...rest
}) => {
  const variantClasses = colorClassName ? `${colorClassName} ${BASE_3D}` : VARIANT_CLASSES[variant];

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-[filter,transform,background-color] duration-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100 disabled:active:translate-y-0 ${variantClasses} ${className}`}
      {...rest}
    >
      {Icon && <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
