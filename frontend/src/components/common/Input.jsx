import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Campo de formulario con etiqueta, icono a la izquierda y (para PIN/contraseña)
// botón de mostrar/ocultar. Reutiliza el mismo estilo de borde fino + foco info
// de los formularios existentes. Todas las props nativas de <input> pasan tal cual.
// - label: texto de la etiqueta (obligatorio, accesibilidad).
// - icon: componente de lucide-react (opcional).
// - revealable: solo con type="password"; agrega el ojo para ver/ocultar.
// - inputClassName: clases extra para el <input> (p. ej. uppercase).
const Input = ({ label, icon: Icon, revealable = false, type = 'text', className = '', inputClassName = '', ...rest }) => {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const actualType = isPassword && revealable && revealed ? 'text' : type;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-muted">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          />
        )}
        <input
          id={id}
          type={actualType}
          className={`w-full rounded-lg border border-hair border-muted bg-surface py-2.5 text-text outline-none transition-colors placeholder:text-muted/60 focus:border-info ${
            Icon ? 'pl-10' : 'pl-3'
          } ${isPassword && revealable ? 'pr-10' : 'pr-3'} ${inputClassName}`}
          {...rest}
        />
        {isPassword && revealable && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? 'Ocultar' : 'Mostrar'}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted transition-colors hover:text-text"
          >
            {revealed ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
