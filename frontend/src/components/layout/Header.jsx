import { Link, NavLink } from 'react-router-dom';
import { BookOpen, Flame, LayoutDashboard, LogOut, Search, UserRound, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { homeRouteForRole } from '../../utils/routes.js';
import Logo, { Wordmark } from '../common/Logo.jsx';
import AnimatedNumber from '../common/AnimatedNumber.jsx';

// Cabecera de F02 — nombre, XP y racha reales para el alumno (criterio de
// aceptación de F02: "la cabecera muestra nombre, XP y racha reales"),
// enlaces a Perfil/Buscar/Glosario (guard student|teacher en §0.12 — ambos
// roles entran a los tres) y logout. El docente no tiene totalXp/
// currentStreak en el modelo User (Parte 2): no se muestran para ese rol.
// El nombre "Ecolingo" es un enlace al inicio del rol (alumno → /mapa,
// docente → /docente) y siempre está visible; el docente, que no tiene
// tabs, además tiene el enlace "Mis clases".
//
// Visual: marca con el chanchito (Logo) y "lingo" en verde de acento;
// iconos de lucide-react en lugar de emojis (los emojis dependen de
// la fuente del sistema y fallan en Android viejos — GUIA_DEL_PROYECTO, 5.2).
// En 375 px los enlaces quedan solo con icono (con aria-label); desde sm
// se agrega el texto.
const navLinkClass = ({ isActive }) =>
  `flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
    isActive ? 'bg-surface-2 font-bold text-text' : 'text-muted hover:bg-surface hover:text-text'
  }`;

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink to={to} aria-label={label} title={label} className={navLinkClass}>
    <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
    <span className="hidden sm:inline">{label}</span>
  </NavLink>
);

const Header = () => {
  const { user, logout } = useAuth();
  const isStudent = user?.role === 'student';
  const homeRoute = homeRouteForRole(user?.role);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-surface-2 bg-bg/90 px-3 py-2.5 backdrop-blur sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link to={homeRoute} aria-label="Ir al inicio" className="group flex items-center gap-2">
          <Logo />
          <Wordmark className="hidden text-lg min-[420px]:inline" />
        </Link>
        <span className="hidden max-w-[10rem] truncate text-sm text-muted md:inline">{user?.fullName}</span>
      </div>

      {isStudent && (
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span
            title="XP total"
            className="flex items-center gap-1 rounded-full border border-surface-2 bg-surface px-3 py-1 font-extrabold text-accent"
          >
            <Zap aria-hidden="true" className="h-4 w-4 fill-accent" />
            <AnimatedNumber value={user.totalXp} />
          </span>
          <span
            title="Racha actual"
            className="flex items-center gap-1 rounded-full border border-surface-2 bg-surface px-3 py-1 font-extrabold text-warn"
          >
            <Flame aria-hidden="true" className="h-4 w-4 fill-warn" />
            {user.currentStreak}
          </span>
        </div>
      )}

      <nav className="flex items-center gap-0.5">
        {!isStudent && <NavItem to={homeRoute} icon={LayoutDashboard} label="Mis clases" />}
        <NavItem to="/buscar" icon={Search} label="Buscar" />
        <NavItem to="/glosario" icon={BookOpen} label="Glosario" />
        <NavItem to="/perfil" icon={UserRound} label="Perfil" />
        <button
          type="button"
          onClick={logout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="ml-1 flex items-center gap-1.5 rounded-lg border border-surface-2 px-2.5 py-2 text-sm text-muted transition-colors hover:border-danger hover:text-danger"
        >
          <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="hidden lg:inline">Salir</span>
        </button>
      </nav>
    </header>
  );
};

export default Header;
