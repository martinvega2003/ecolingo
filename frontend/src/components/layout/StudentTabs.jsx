import { NavLink } from 'react-router-dom';

// "Los tabs navegan... sin recargar" + "el tab activo se distingue
// visualmente" (criterios de aceptación, F02). "Móvil primero": en 375px
// queda fija abajo, cómoda con el pulgar; de md (768px) en adelante pasa
// a fila normal debajo de la cabecera, donde el pulgar deja de ser el
// problema.
const TABS = [
  { to: '/mapa', label: 'Módulos' },
  { to: '/ranking', label: 'Ranking' },
  { to: '/logros', label: 'Logros' },
];

const tabClassName = ({ isActive }) =>
  `flex-1 py-3 text-center text-sm transition-colors ${
    isActive ? 'border-t-2 border-primary font-medium text-text md:border-b-2 md:border-t-0' : 'text-muted'
  }`;

const StudentTabs = () => (
  <>
    {/* Móvil: barra fija abajo */}
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-hair border-surface bg-bg md:hidden">
      {TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className={tabClassName}>
          {tab.label}
        </NavLink>
      ))}
    </nav>
    {/* Tablet/desktop: fila normal debajo de la cabecera */}
    <nav className="hidden border-b border-hair border-surface bg-bg md:flex">
      {TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className={tabClassName}>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  </>
);

export default StudentTabs;
