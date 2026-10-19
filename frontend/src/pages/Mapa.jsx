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
// Encuesta de satisfacción del piloto (Google Forms). Es un enlace externo
// fijo: no pasa por la API ni toca ningún endpoint ni esquema.
const SATISFACTION_SURVEY_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfCUm-YlPFvmqRQnBYfTsYdUVE4LAVbqBUG0py5EbkEz672Sg/viewform';

export default function Mapa() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState('');

  // El estado inicial ya es 'loading', así que la primera carga no necesita
  // setState síncrono dentro del efecto: solo se actualiza en los callbacks.
  const fetchModules = useCallback(() => {
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

  // Reintento manual (botón "Reintentar"): vuelve a 'loading' y recarga.
  const load = () => {
    setState('loading');
    fetchModules();
  };

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

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
        <p className="text-muted text-sm">Preparando tu camino financiero...</p>
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

      {/* Solo cuando el alumno completó los módulos: el servidor ya cuenta
          completedModules/totalModules en summary (Endpoint 5). */}
      {summary.totalModules > 0 && summary.completedModules === summary.totalModules && <SatisfactionCard />}
    </div>
  );
}

function SatisfactionCard() {
  return (
    <div className="mt-6 rounded-xl border-hair border-accent bg-surface p-4">
      <p className="text-text text-sm font-medium">¡Completaste todos los módulos! ¿Qué te pareció Ecolingo?</p>
      <p className="text-muted text-xs mt-1">
        Tu opinión nos ayuda a mejorar la app. Contanos en una encuesta corta cómo fue tu experiencia.
      </p>
      <a
        href={SATISFACTION_SURVEY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-3 text-xs font-medium text-accent px-3 py-1.5 rounded-lg border-hair border-accent"
      >
        Dejar mi opinión
      </a>
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
