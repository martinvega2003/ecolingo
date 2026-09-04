import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import client, { getErrorMessage } from '../api/client';

/**
 * F03 — Mapa de Módulos (Diseño p. 5, GUIA_DE_CODIGO.md Parte 3).
 * Consume el Endpoint 5 (GET /modules) tal cual — el estado de cada módulo
 * (completed/available/locked) lo calcula el servidor; este componente
 * nunca decide desbloqueos por su cuenta (riesgo explícito del contrato).
 *
 * ⚠️ Estados de carga/error siguen el patrón mínimo de la guía. Si F02 ya
 * define un componente compartido de loading/error (spinner, layout de
 * página), reemplazar los bloques de abajo por ese componente en vez de
 * duplicar el patrón.
 */
export default function Mapa() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(() => {
    setState('loading');
    client
      .get('/modules')
      .then((res) => {
        setData(res.data);
        setState('ready');
      })
      .catch((err) => {
        setErrorMessage(getErrorMessage(err));
        setState('error');
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleModuleClick = async (mod) => {
    if (mod.status === 'locked') return; // no clickeable — criterio de aceptación

    if (mod.activeAttemptId) {
      navigate(`/leccion/${mod.activeAttemptId}`);
      return;
    }

    try {
      const res = await client.post(`/modules/${mod.id}/attempts`);
      navigate(`/leccion/${res.data.attempt.id}`);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setState('error');
    }
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-muted text-sm">Cargando tu mapa...</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg p-6">
        <p className="text-danger text-sm text-center">{errorMessage}</p>
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg bg-primary text-text text-sm border-hair border-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { modules, summary } = data;

  return (
    <div className="min-h-screen bg-bg p-4">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted text-xs">Tu progreso</p>
          <p className="text-text text-lg font-medium">
            {summary.completedModules}/{summary.totalModules} módulos
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface border-hair border-primary rounded-lg px-3 py-1.5">
          <span className="text-accent text-sm font-medium">{summary.totalXp} XP</span>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        {modules.map((mod) => (
          <ModuleRow key={mod.id} mod={mod} onClick={() => handleModuleClick(mod)} />
        ))}
      </div>
    </div>
  );
}

function ModuleRow({ mod, onClick }) {
  const isLocked = mod.status === 'locked';
  const isCompleted = mod.status === 'completed';

  const borderClass = isCompleted
    ? 'border-accent'
    : mod.status === 'available'
    ? 'border-info'
    : 'border-muted';

  return (
    <div
      onClick={isLocked ? undefined : onClick}
      className={`rounded-xl border-hair ${borderClass} bg-surface p-4 flex items-center justify-between ${
        isLocked ? 'opacity-60' : 'cursor-pointer'
      }`}
    >
      <div>
        <p className="text-text text-sm font-medium">
          {mod.order}. {mod.title}
        </p>
        {isLocked ? (
          <p className="text-muted text-xs mt-1">{mod.unlockRequirement}</p>
        ) : (
          <p className="text-muted text-xs mt-1">{mod.description}</p>
        )}
        {isCompleted && <p className="text-accent text-xs mt-1">+{mod.xpEarned} XP</p>}
      </div>

      {!isLocked && (
        <button className="text-xs font-medium text-info px-3 py-1.5 rounded-lg border-hair border-info">
          {mod.activeAttemptId ? 'Continuar' : 'Jugar'}
        </button>
      )}
    </div>
  );
}
