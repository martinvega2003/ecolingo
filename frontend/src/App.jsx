import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const Placeholder = ({ name }) => (
  <div className="min-h-screen flex items-center justify-center">
    <p className="text-muted">Pantalla pendiente: {name}</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"     element={<Placeholder name="Login" />} />
        <Route path="/mapa"      element={<Placeholder name="Mapa de Módulos" />} />
        <Route path="*"          element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
