// allowedRoles es opcional: sin especificar, solo exige sesión válida;
// con ['student'] o ['teacher'], aplica el guard por rol de la tabla de rutas
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/UseAuth.js';
import { homeRouteForRole } from '../../utils/routes.js';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-muted">
        Cargando sesión…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Rol equivocado (p. ej. docente entrando a /mapa): lo manda a SU home,
  // no a /login — ya tiene sesión válida, solo no le corresponde esta ruta.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homeRouteForRole(user.role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;