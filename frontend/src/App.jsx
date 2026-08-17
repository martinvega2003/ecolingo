import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import client from './api/client';

const Placeholder = ({ name }) => (
  <div className="min-h-screen flex items-center justify-center">
    <p className="text-muted">Pantalla pendiente: {name}</p>
  </div>
);

function HealthCheck() {
  const [state, setState] = useState({ status: 'cargando' });

  useEffect(() => {
    client.get('/health')
      .then((r) => setState(r.data))
      .catch((e) => setState({ status: 'error', message: e.message }));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <pre className="bg-surface border-hair border-primary rounded-lg p-6 text-accent text-sm">
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<HealthCheck />} />
        <Route path="/login"     element={<Placeholder name="Login" />} />
        <Route path="/mapa"      element={<Placeholder name="Mapa de Módulos" />} />
        <Route path="*"          element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
