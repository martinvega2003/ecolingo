// Inverso de ProtectedRoute: evita que alguien con sesión activa vea el
// login y se reautentique "por encima" de su propia sesión sin pasar por
// logout. Redirige por rol (alumno -> /mapa, docente -> /docente).
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/UseAuth.js';
import { homeRouteForRole } from '../../utils/routes.js';

const PublicOnlyRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-muted">
        Cargando sesión…
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={homeRouteForRole(user.role)} replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;