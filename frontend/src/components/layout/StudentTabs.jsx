import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Map, Trophy } from 'lucide-react';

// "Los tabs navegan... sin recargar" + "el tab activo se distingue
// visualmente" (criterios de aceptación, F02). "Móvil primero": en 375px
// queda fija abajo, cómoda con el pulgar; de md (768px) en adelante pasa
// a fila normal debajo de la cabecera, donde el pulgar deja de ser el
// problema.
// Visual: icono + etiqueta; el indicador del tab activo se desliza entre
// tabs (layoutId). Hay dos barras (móvil y desktop) con layoutId distinto
// para que no se mezclen.
const TABS = [
  { to: '/mapa', label: 'Módulos', icon: Map },
  { to: '/ranking', label: 'Ranking', icon: Trophy },
  { to: '/logros', label: 'Logros', icon: Award },
];

const TabBar = ({ idPrefix, vertical }) =>
  TABS.map(({ to, label, icon: Icon }) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm transition-colors ${
          vertical ? 'flex-col text-[11px]' : 'flex-row'
        } ${isActive ? 'font-semibold text-text' : 'text-muted hover:text-text'}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId={`${idPrefix}-tab-indicator`}
              className={`absolute inset-x-6 h-0.5 rounded-full bg-accent ${vertical ? 'top-0' : 'bottom-0'}`}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <Icon aria-hidden="true" className={`h-5 w-5 ${isActive ? 'text-accent' : ''}`} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  ));

const StudentTabs = () => (
  <>
    {/* Móvil: barra fija abajo */}
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-hair border-surface bg-bg/95 backdrop-blur md:hidden">
      <TabBar idPrefix="mobile" vertical />
    </nav>
    {/* Tablet/desktop: fila normal debajo de la cabecera */}
    <nav className="hidden border-b border-hair border-surface bg-bg md:flex">
      <TabBar idPrefix="desktop" />
    </nav>
  </>
);

export default StudentTabs;
