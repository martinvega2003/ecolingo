import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ExternalLink, Lock, PartyPopper, Play, Zap } from 'lucide-react';
import client, { getErrorMessage } from '../api/client';
import { useAuth } from '../hooks/useAuth.js';
import ErrorState from '../components/common/ErrorState.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import AnimatedNumber from '../components/common/AnimatedNumber.jsx';

/**
 * F03 — Mapa de Módulos (Diseño p. 5, GUIA_DE_CODIGO.md Parte 3).
 * Consume el Endpoint 5 (GET /modules) tal cual — el estado de cada módulo
 * (completed/available/locked) lo calcula el servidor; este componente
 * nunca decide desbloqueos por su cuenta (riesgo explícito del contrato).
 *
 * Visual: cada módulo es un "nodo" de un camino (círculo con check / número /
 * candado) unido por una línea vertical; entran en cascada. Los estados de
 * carga y error usan los componentes compartidos de F02 (Skeleton, ErrorState).
 */
// Encuesta de satisfacción del piloto (Google Forms). Es un enlace externo
// fijo: no pasa por la API ni toca ningún endpoint ni esquema.
const SATISFACTION_SURVEY_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfCUm-YlPFvmqRQnBYfTsYdUVE4LAVbqBUG0py5EbkEz672Sg/viewform';

const firstName = (fullName) => (fullName ? fullName.trim().split(/\s+/)[0] : '');

export default function Mapa() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      <div className="p-4" role="status" aria-label="Cargando módulos">
        <Skeleton className="mb-2 h-6 w-40" />
        <Skeleton className="mb-6 h-3 w-full" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted">Preparando tu camino financiero...</p>
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

  const { modules, summary } = data;
  const name = firstName(user?.fullName);

  return (
    <div className="p-4">
      <header className="mb-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted">{name ? `¡Hola, ${name}!` : 'Tu progreso'}</p>
            <p className="text-lg font-bold text-text">
              {summary.completedModules}/{summary.totalModules} módulos
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-hair border-primary bg-surface px-3 py-1.5">
            <Zap aria-hidden="true" className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-semibold text-accent">
              <AnimatedNumber value={summary.totalXp} /> XP
            </span>
          </div>
        </div>
        <ProgressBar value={summary.completedModules} max={summary.totalModules} />
      </header>

      <div className="relative">
        {/* Línea del camino: pasa por el centro de los nodos y queda tapada por las tarjetas */}
        <div aria-hidden="true" className="absolute bottom-10 left-[37px] top-10 w-0.5 bg-surface" />
        <div className="relative flex flex-col gap-3">
          {modules.map((mod, i) => (
            <ModuleRow key={mod.id} mod={mod} index={i} onClick={() => handleModuleClick(mod)} />
          ))}
        </div>
      </div>

      {/* Solo cuando el alumno completó los módulos: el servidor ya cuenta
          completedModules/totalModules en summary (Endpoint 5). */}
      {summary.totalModules > 0 && summary.completedModules === summary.totalModules && <SatisfactionCard />}
    </div>
  );
}

function SatisfactionCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-6 flex gap-3 rounded-xl border-hair border-accent bg-surface p-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
        <PartyPopper aria-hidden="true" className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-text">¡Completaste todos los módulos! ¿Qué te pareció Ecolingo?</p>
        <p className="mt-1 text-xs text-muted">
          Tu opinión nos ayuda a mejorar la app. Contanos en una encuesta corta cómo fue tu experiencia.
        </p>
        <a
          href={SATISFACTION_SURVEY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border-hair border-accent px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/10"
        >
          Dejar mi opinión
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.div>
  );
}

function ModuleNode({ mod }) {
  if (mod.status === 'completed') {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-bg">
        <Check aria-hidden="true" className="h-5 w-5" strokeWidth={3} />
      </div>
    );
  }
  if (mod.status === 'locked') {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg text-muted">
        <Lock aria-hidden="true" className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-info bg-bg text-base font-bold text-info">
      {mod.order}
    </div>
  );
}

function ModuleRow({ mod, index, onClick }) {
  const isLocked = mod.status === 'locked';
  const isCompleted = mod.status === 'completed';

  const borderClass = isCompleted
    ? 'border-accent'
    : mod.status === 'available'
    ? 'border-info'
    : 'border-muted';

  const handleKeyDown = (event) => {
    if (isLocked) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={isLocked ? undefined : { y: -2 }}
      whileTap={isLocked ? undefined : { scale: 0.985 }}
      role="button"
      tabIndex={isLocked ? -1 : 0}
      aria-disabled={isLocked}
      onClick={isLocked ? undefined : onClick}
      onKeyDown={handleKeyDown}
      className={`flex items-center gap-4 rounded-xl border-hair ${borderClass} bg-surface p-4 ${
        isLocked ? 'opacity-70' : 'cursor-pointer'
      }`}
    >
      <ModuleNode mod={mod} />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text">
          {mod.order}. {mod.title}
        </p>
        {isLocked ? (
          <p className="mt-1 text-xs text-muted">{mod.unlockRequirement}</p>
        ) : (
          <p className="mt-1 text-xs text-muted">{mod.description}</p>
        )}
        {isCompleted && (
          <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-accent">
            <Zap aria-hidden="true" className="h-3 w-3 fill-accent" />+{mod.xpEarned} XP
          </p>
        )}
      </div>

      {!isLocked && (
        <span className="flex shrink-0 items-center gap-1.5 rounded-lg border-hair border-info px-3 py-1.5 text-xs font-semibold text-info">
          {mod.activeAttemptId ? (
            <>
              Continuar <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              <Play aria-hidden="true" className="h-3.5 w-3.5 fill-info" /> Jugar
            </>
          )}
        </span>
      )}
    </motion.div>
  );
}
