// F08 — Parte 3. Pantalla de entrada del panel del docente (endpoint 16).
// Si el docente tiene una sola clase, entra directo al detalle — con
// varias, elige desde acá. Ninguna de las dos rutas de §0.12 deja de
// existir: esto solo decide a cuál saltar primero.
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { fetchTeacherClasses, getErrorMessage } from '../api/teacherApi.js';

export default function TeacherClasses() {
  const navigate = useNavigate();
  const [state, setState] = useState('loading'); // loading | ready | error
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(() => {
    setState('loading');
    fetchTeacherClasses()
      .then((res) => {
        if (res.classes.length === 1) {
          navigate(`/docente/clase/${res.classes[0].code}`, { replace: true });
          return;
        }
        setData(res);
        setState('ready');
      })
      .catch((err) => {
        setErrorMessage(getErrorMessage(err));
        setState('error');
      });
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  if (state === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Cargando tus clases…" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="p-6">
        <ErrorState description={errorMessage} onRetry={load} />
      </div>
    );
  }

  if (data.classes.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="Todavía no tenés clases"
          description="Pedile a coordinación que te asigne una clase piloto."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-lg font-medium text-text">Tus clases</h1>
      {data.classes.map((c) => (
        <Card
          key={c.code}
          onClick={() => navigate(`/docente/clase/${c.code}`)}
          className="cursor-pointer hover:border-info"
        >
          <p className="text-sm font-medium text-text">{c.name}</p>
          <p className="text-xs text-muted">
            {c.code} · {c.studentCount} alumnos {!c.isActive && '· inactiva'}
          </p>
        </Card>
      ))}
    </div>
  );
}
