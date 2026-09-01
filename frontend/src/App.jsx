import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.jsx';
import { useAuth } from './hooks/useAuth.js';
import { homeRouteForRole } from './utils/routes.js';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import PublicOnlyRoute from './components/common/PublicOnlyRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import FeaturePlaceholder from './components/common/FeaturePlaceholder.jsx';
import NotFoundPage from './components/common/NotFoundPage.jsx';
import Login from './pages/Login.jsx';

// "/" — entrada al sitio. Honra literal el texto de §0.12 para el
// wildcard ("Redirección a /mapa o /login según sesión"): acá sí es un
// redirect silencioso, sin pantalla. Cualquier OTRA ruta desconocida cae
// en NotFoundPage (ver la nota de la contradicción ahí).
const RootRedirect = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return null;
  return <Navigate to={isAuthenticated ? homeRouteForRole(user.role) : '/login'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Público — §0.12 */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Alumno — guard: student, con tabs Módulos/Ranking/Logros */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<AppLayout showTabs />}>
              <Route
                path="/mapa"
                element={<FeaturePlaceholder title="Mapa de Módulos" feature="F03" owner="Persona A" />}
              />
              <Route
                path="/leccion/:moduleId/teoria"
                element={<FeaturePlaceholder title="Contenido teórico" feature="F11" owner="Persona B" />}
              />
              <Route
                path="/leccion/:attemptId"
                element={<FeaturePlaceholder title="Lección" feature="F04" owner="Persona B" />}
              />
              <Route
                path="/resultado/:attemptId"
                element={<FeaturePlaceholder title="Resultado del módulo" feature="F05" owner="Ambos" />}
              />
              <Route
                path="/ranking"
                element={<FeaturePlaceholder title="Ranking de Clase" feature="F06" owner="Persona A" />}
              />
              <Route
                path="/logros"
                element={<FeaturePlaceholder title="Logros e Insignias" feature="F07" owner="Persona A" />}
              />
            </Route>
          </Route>

          {/* Docente — guard: teacher, sin tabs */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route element={<AppLayout />}>
              <Route
                path="/docente"
                element={<FeaturePlaceholder title="Panel del Docente" feature="F08" owner="Persona B" />}
              />
              <Route
                path="/docente/clase/:classCode"
                element={<FeaturePlaceholder title="Detalle de clase" feature="F08" owner="Persona B" />}
              />
            </Route>
          </Route>

          {/* Ambos roles — guard: cualquier sesión válida (student|teacher en §0.12), sin tabs */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route
                path="/perfil"
                element={<FeaturePlaceholder title="Perfil de usuario" feature="F09" owner="Persona A" />}
              />
              <Route
                path="/buscar"
                element={<FeaturePlaceholder title="Buscador de contenido" feature="F10" owner="Persona B" />}
              />
              <Route
                path="/glosario"
                element={<FeaturePlaceholder title="Glosario completo" feature="F10" owner="Persona B" />}
              />
            </Route>
          </Route>

          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;