import { getModuleTheme } from '../../theme/moduleTheme.js';

// Icono de un módulo dentro de un recuadro con su color (Mapa, Lección,
// Resultado, Buscar, Glosario). `order` nulo → tema general (gris).
// - tone "soft": fondo tenue y icono a color. "solid": fondo a color.
// - locked: atenuado, para módulos bloqueados.
const SIZES = {
  sm: { box: 'h-9 w-9 rounded-lg', icon: 'h-4 w-4' },
  md: { box: 'h-12 w-12 rounded-xl', icon: 'h-6 w-6' },
};

const ModuleIcon = ({ order, icon, size = 'md', tone = 'soft', locked = false, className = '' }) => {
  const theme = getModuleTheme(order);
  const Icon = icon ?? theme.icon;
  const toneClass = locked
    ? 'bg-surface-2 text-muted'
    : tone === 'solid'
      ? `${theme.bg} text-bg`
      : `${theme.soft} ${theme.text}`;

  return (
    <span className={`flex shrink-0 items-center justify-center ${SIZES[size].box} ${toneClass} ${className}`}>
      <Icon aria-hidden="true" className={SIZES[size].icon} />
    </span>
  );
};

export default ModuleIcon;
