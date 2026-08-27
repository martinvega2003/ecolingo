import { useAuth } from '../../hooks/useAuth.js';
const Header = () => {
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-end border-b border-hair border-surface bg-bg px-4 py-3">
      <button
        type="button"
        onClick={logout}
        className="rounded-md border border-hair border-muted px-3 py-1.5 text-sm text-muted transition-colors hover:border-danger hover:text-danger"
      >
        Cerrar sesión
      </button>
    </header>
  );
};

export default Header;
