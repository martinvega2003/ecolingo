import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.jsx';
import { useAuth } from './hooks/UseAuth.js'; 
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import PublicOnlyRoute from './components/common/PublicOnlyRoute.jsx';
import Header from './components/layout/Header.jsx';
import Login from './pages/Login.jsx';

// Placeholder TEMPORAL — se borra en cuanto exista /mapa real (F03,
// Persona A) y /docente real (F08, Persona B). Solo demuestra que la ruta
// protegida, el guard por rol, la rehidratación y el logout funcionan de
// punta a punta.
const AuthenticatedPlaceholder = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <div className="p-6">
        <p>Sesión activa — {user?.fullName}</p>
        <p className="text-sm text-muted">Rol: {user?.role}</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/mapa" element={<AuthenticatedPlaceholder />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/docente" element={<AuthenticatedPlaceholder />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;