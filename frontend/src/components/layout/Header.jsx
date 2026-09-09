import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

// Cabecera de F02 — nombre, XP y racha reales para el alumno (criterio de
// aceptación de F02: "la cabecera muestra nombre, XP y racha reales"),
// enlaces a Perfil/Buscar (guard student|teacher en §0.12 — ambos roles
// entran) y logout. El docente no tiene totalXp/currentStreak en el
// modelo User (Parte 2): no se muestran para ese rol.
const Header = () => {
  const { user, logout } = useAuth();
  const isStudent = user?.role === 'student';

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hair border-surface bg-bg px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-text">Ecolingo</span>
        <span className="text-sm text-muted">{user?.fullName}</span>
      </div>

      {isStudent && (
        <div className="flex items-center gap-4 text-sm text-text">
          <span title="XP total">⚡ {user.totalXp}</span>
          <span title="Racha actual">🔥 {user.currentStreak}</span>
        </div>
      )}

      <nav className="flex items-center gap-3 text-sm">
        <NavLink
          to="/buscar"
          className={({ isActive }) => (isActive ? 'font-medium text-text' : 'text-muted hover:text-text')}
        >
          Buscar
        </NavLink>
        <NavLink
          to="/perfil"
          className={({ isActive }) => (isActive ? 'font-medium text-text' : 'text-muted hover:text-text')}
        >
          Perfil
        </NavLink>
        <button
          type="button"
          onClick={logout}
          className="rounded-md border border-hair border-muted px-3 py-1.5 text-muted transition-colors hover:border-danger hover:text-danger"
        >
          Cerrar sesión
        </button>
      </nav>
    </header>
  );
};

export default Header;
