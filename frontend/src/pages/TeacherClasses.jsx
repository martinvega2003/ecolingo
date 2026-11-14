// F08 — Parte 3. Pantalla de entrada del panel del docente (endpoint 16).
// Si el docente tiene una sola clase, entra directo al detalle — con
// varias, elige desde acá. Ninguna de las dos rutas de §0.12 deja de
// existir: esto solo decide a cuál saltar primero.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, GraduationCap, Users } from 'lucide-react';
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

  // Carga dentro del efecto: el estado arranca en 'loading', así que no hace
  // falta un setState síncrono al montar. El reintento (handler) sí lo
  // reinicia y dispara el efecto de nuevo con reloadKey.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchTeacherClasses()
      .then((res) => {
        if (cancelled) return;
        if (res.classes.length === 1) {
          navigate(`/docente/clase/${res.classes[0].code}`, { replace: true });
          return;
        }
        setData(res);
        setState('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(getErrorMessage(err));
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [navigate, reloadKey]);

  const load = () => {
    setState('loading');
    setReloadKey((k) => k + 1);
  };

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
    <div className="mx-auto flex max-w-3xl flex-col gap-3 p-4">
      <h1 className="text-xl font-extrabold text-text">Mis clases</h1>
      {data.classes.map((c) => (
        <Card
          key={c.code}
          role="button"
          tabIndex={0}
          onClick={() => navigate(`/docente/clase/${c.code}`)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate(`/docente/clase/${c.code}`);
            }
          }}
          className="flex cursor-pointer items-center gap-3 hover:border-info"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/40 text-accent">
            <GraduationCap aria-hidden="true" className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-extrabold text-text">{c.name}</p>
            <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
              <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-bold text-text">{c.code}</span>
              <span className="flex items-center gap-1">
                <Users aria-hidden="true" className="h-3 w-3" />
                {c.studentCount} {c.studentCount === 1 ? 'alumno' : 'alumnos'}
              </span>
              {!c.isActive && <span className="font-semibold text-warn">inactiva</span>}
            </p>
          </div>
          <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-muted" />
        </Card>
      ))}
    </div>
  );
}
