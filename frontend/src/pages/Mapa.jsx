import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ExternalLink, Flame, Lightbulb, Lock, PartyPopper, Play, RotateCcw, Trophy, Zap } from 'lucide-react';
import client, { getErrorMessage } from '../api/client';
import { fetchMyProgress } from '../api/progressApi.js';
import { fetchRanking } from '../api/rankingApi.js';
import { useAuth } from '../hooks/useAuth.js';
import { getModuleTheme } from '../theme/moduleTheme.js';
import { factForDay } from '../content/dailyFacts.js';
import { buildWeekStreak } from '../utils/streak.js';
import { now } from '../utils/time.js';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Coin from '../components/common/Coin.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Mascot from '../components/common/Mascot.jsx';
import ModuleIcon from '../components/common/ModuleIcon.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import ProgressRing from '../components/common/ProgressRing.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import AnimatedNumber from '../components/common/AnimatedNumber.jsx';

/**
 * F03 — Mapa de Módulos (GUIA_DE_CODIGO.md Parte 3; propuesta visual, Pantalla 2).
 * Consume el Endpoint 5 (GET /modules) tal cual — el estado de cada módulo
 * (completed/available/locked) lo calcula el servidor; este componente
 * nunca decide desbloqueos por su cuenta (riesgo explícito del contrato).
 *
 * Visual: saludo con el chanchito y botón para seguir donde quedó; cada
 * módulo con su icono y su color; en PC, columna lateral con anillo de
 * progreso, racha semanal (Endpoint 12) y dato del día.
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
  // Datos de la columna lateral. Son secundarios: si alguna de estas dos
  // llamadas falla, la tarjeta correspondiente no se muestra y el mapa sigue.
  const [week, setWeek] = useState(null); // racha semanal (Endpoint 12)
  const [position, setPosition] = useState(null); // puesto en la clase (Endpoint 15)
  const [fact] = useState(() => factForDay(now()));

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

  useEffect(() => {
    let ignore = false;
    fetchMyProgress()
      .then((progress) => {
        if (!ignore) setWeek(buildWeekStreak(progress, now()));
      })
      .catch(() => {});
    fetchRanking('alltime')
      .then((ranking) => {
        if (!ignore) setPosition(ranking.currentUser);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

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
        <Skeleton className="mb-5 h-36" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <p className="mt-6 text-center text-xs font-semibold text-muted">Llenando la alcancía…</p>
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
  // "Seguir donde quedó": el primer módulo disponible sin completar, según
  // el estado que manda el servidor.
  const nextUp = modules.find((m) => m.status === 'available');
  const remaining = summary.totalModules - summary.completedModules;
  const allDone = summary.totalModules > 0 && remaining === 0;

  return (
    <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0">
        <Greeting name={name} nextUp={nextUp} remaining={remaining} allDone={allDone} onContinue={handleModuleClick} />

        <div className="mb-3 mt-6 flex items-baseline justify-between">
          <h2 className="text-base font-extrabold text-text">Tu camino</h2>
          <span className="text-xs font-semibold text-muted">
            {summary.completedModules} de {summary.totalModules} completados
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {modules.map((mod, i) => (
            <ModuleRow key={mod.id} mod={mod} index={i} onClick={() => handleModuleClick(mod)} />
          ))}
        </div>

        {/* Solo cuando el alumno completó los módulos: el servidor ya cuenta
            completedModules/totalModules en summary (Endpoint 5). */}
        {allDone && <SatisfactionCard />}
      </div>

      <aside className="flex flex-col gap-3">
        <Card className="flex items-center gap-4">
          <ProgressRing value={summary.completedModules} max={summary.totalModules}>
            <span className="text-xl font-extrabold text-text">
              {summary.completedModules}/{summary.totalModules}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">módulos</span>
          </ProgressRing>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted">XP total</p>
            <p className="flex items-center gap-1 text-2xl font-extrabold text-accent">
              <Zap aria-hidden="true" className="h-5 w-5 fill-accent" />
              <AnimatedNumber value={summary.totalXp} />
            </p>
            {position && (
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted">
                <Trophy aria-hidden="true" className="h-3.5 w-3.5 text-gold" />
                Puesto #{position.position} de {position.totalStudents}
              </p>
            )}
          </div>
        </Card>

        {week && <StreakCard week={week} />}

        <Card className="flex gap-3 border-gold/40">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
            <Lightbulb aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-gold">Dato del día</p>
            <p className="mt-1 text-sm text-text">{fact}</p>
          </div>
        </Card>
      </aside>
    </div>
  );
}

function Greeting({ name, nextUp, remaining, allDone, onContinue }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-mascot-dark p-5 pr-28 sm:pr-40"
    >
      <h1 className="text-2xl font-extrabold text-text">{name ? `¡Hola, ${name}!` : '¡Hola!'}</h1>
      <p className="mt-1 text-sm text-text/90">
        {allDone ? (
          '¡Completaste todos los módulos! Podés repasar el que quieras.'
        ) : nextUp ? (
          <>
            Hoy toca <strong className="font-extrabold">{nextUp.title}</strong>.{' '}
            {remaining === 1 ? 'Te falta 1 módulo.' : `Te faltan ${remaining} módulos.`}
          </>
        ) : (
          'Elegí un módulo para empezar.'
        )}
      </p>
      {nextUp && !allDone && (
        <Button variant="light" icon={Play} className="mt-4" onClick={() => onContinue(nextUp)}>
          {nextUp.activeAttemptId ? 'Continuar' : 'Empezar'}
        </Button>
      )}

      {/* Chanchito y monedas: decoración, no tapa el texto (pr-28 / pr-40) */}
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-1 right-2 sm:right-6">
        <Mascot mood={allDone ? 'feliz' : 'normal'} coin={false} className="h-20 w-24 sm:h-28 sm:w-36" />
      </div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-16 top-3 sm:right-28"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Coin className="h-7 w-7 sm:h-9 sm:w-9" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-8 sm:right-8"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        <Coin className="h-5 w-5 sm:h-7 sm:w-7" />
      </motion.div>
    </motion.section>
  );
}

function StreakCard({ week }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-extrabold text-text">
          {week.streak > 0 ? `Racha de ${week.streak} ${week.streak === 1 ? 'día' : 'días'}` : 'Empezá tu racha hoy'}
        </p>
        <Flame aria-hidden="true" className={`h-5 w-5 ${week.streak > 0 ? 'fill-warn text-warn' : 'text-muted'}`} />
      </div>
      <div className="flex justify-between">
        {week.days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className={`text-[10px] font-bold ${day.isToday ? 'text-text' : 'text-muted'}`}>{day.label}</span>
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                day.isDone ? 'bg-warn/20 text-warn' : 'bg-surface-2 text-surface-2'
              } ${day.isToday ? 'ring-2 ring-warn/60' : ''}`}
            >
              <Flame aria-hidden="true" className={`h-3.5 w-3.5 ${day.isDone ? 'fill-warn' : ''}`} />
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SatisfactionCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-5 flex gap-3 rounded-2xl border border-accent/50 bg-surface p-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
        <PartyPopper aria-hidden="true" className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-text">¡Completaste todos los módulos! ¿Qué te pareció Ecolingo?</p>
        <p className="mt-1 text-xs text-muted">
          Tu opinión nos ayuda a mejorar la app. Contanos en una encuesta corta cómo fue tu experiencia.
        </p>
        <a
          href={SATISFACTION_SURVEY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-accent/60 px-3 py-1.5 text-xs font-bold text-accent transition-colors hover:bg-accent/10"
        >
          Dejar mi opinión
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.div>
  );
}

function ModuleRow({ mod, index, onClick }) {
  const isLocked = mod.status === 'locked';
  const isCompleted = mod.status === 'completed';
  const theme = getModuleTheme(mod.order);

  const borderClass = isLocked ? 'border-surface-2 border-dashed' : isCompleted ? 'border-surface-2' : theme.border;

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
      role="button"
      tabIndex={isLocked ? -1 : 0}
      aria-disabled={isLocked}
      onClick={isLocked ? undefined : onClick}
      onKeyDown={handleKeyDown}
      className={`flex items-center gap-3 rounded-2xl border bg-surface p-4 sm:gap-4 ${borderClass} ${
        isLocked ? 'opacity-60' : 'cursor-pointer'
      }`}
    >
      <ModuleIcon order={mod.order} icon={isLocked ? Lock : undefined} locked={isLocked} />

      <div className="min-w-0 flex-1">
        <p className={`text-[10px] font-extrabold uppercase tracking-wider ${isLocked ? 'text-muted' : theme.text}`}>
          Módulo {mod.order}
        </p>
        <p className="text-sm font-extrabold text-text sm:text-base">{mod.title}</p>
        {isLocked ? (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <Lock aria-hidden="true" className="h-3 w-3 shrink-0" />
            {mod.unlockRequirement}
          </p>
        ) : isCompleted ? (
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar value={1} max={1} size="sm" barClassName={theme.bg} />
            </div>
            <span className="flex shrink-0 items-center gap-1 text-xs font-extrabold text-accent">
              <Zap aria-hidden="true" className="h-3 w-3 fill-accent" />+{mod.xpEarned} XP
            </span>
          </div>
        ) : (
          <p className="mt-0.5 text-xs text-muted">{mod.description}</p>
        )}
      </div>

      {isCompleted && (
        <div className="flex shrink-0 flex-col items-center gap-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-bg">
            <Check aria-hidden="true" className="h-4 w-4" strokeWidth={3.5} />
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-muted">
            <RotateCcw aria-hidden="true" className="h-2.5 w-2.5" />
            Repasar
          </span>
        </div>
      )}

      {mod.status === 'available' && (
        // El clic lo maneja la tarjeta entera; el botón es su parte visible
        // (tabIndex -1 para que el teclado no pase dos veces por lo mismo).
        <Button
          tabIndex={-1}
          colorClassName={`${theme.bg} text-bg`}
          icon={mod.activeAttemptId ? ArrowRight : Play}
          className="shrink-0 px-3 sm:px-4"
        >
          {mod.activeAttemptId ? 'Continuar' : 'Jugar'}
        </Button>
      )}
    </motion.div>
  );
}
