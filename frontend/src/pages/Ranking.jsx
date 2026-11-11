import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Medal, Trophy, Users, Zap } from 'lucide-react';
import Card from '../components/common/Card.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { fetchRanking, getErrorMessage } from '../api/rankingApi.js';

// Parte 3, F06: "El top 3 lleva medallas de oro, plata y bronce". Solo se
// otorgan con XP > 0 — un 3.º puesto con 0 XP no "ganó" nada.
// Iconos con color de la paleta en lugar de emojis (fallan en Android viejos):
// oro = warn, plata = text, bronce = warn atenuado (no hay token de bronce).
const MEDAL_CLASSES = { 1: 'text-warn', 2: 'text-text', 3: 'text-warn/60' };

const initialsOf = (fullName = '') =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

const SCOPES = [
  { value: 'weekly', label: 'Esta semana' },
  { value: 'alltime', label: 'General' },
];

export default function Ranking() {
  const [scope, setScope] = useState('weekly');
  const [state, setState] = useState('loading');
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadToken, setReloadToken] = useState(0); // cambiar este valor dispara una recarga

  // Patrón IIFE dentro del efecto (React Compiler purity rules) — mismo
  // criterio que LessonScreen.jsx (F04) y Glosario.jsx (F10).
  useEffect(() => {
    let ignore = false;

    (async () => {
      setState('loading');
      try {
        const res = await fetchRanking(scope);
        if (ignore) return;
        setData(res);
        setState('ready');
      } catch (err) {
        if (ignore) return;
        setErrorMessage(getErrorMessage(err));
        setState('error');
      }
    })();

    return () => {
      ignore = true;
    };
  }, [scope, reloadToken]);

  // Parte 3, F06: "Estado vacío cuando es la única persona con XP". El
  // endpoint siempre devuelve a todos los alumnos activos (incluido el
  // solicitante), así que entries nunca llega vacío — el estado vacío se
  // decide por XP, no por la longitud del array.
  const nobodyElseHasXp =
    state === 'ready' && data.entries.every((e) => e.isCurrentUser || e.xp === 0);
  const ownXp = data?.currentUser?.xp ?? 0;

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="flex items-center gap-2 text-lg font-bold text-text">
        <Trophy aria-hidden="true" className="h-5 w-5 text-warn" />
        Ranking de Clase
      </h1>

      <div className="flex gap-1 self-start rounded-lg border border-hair border-muted p-1">
        {SCOPES.map((s) => (
          <button
            key={s.value}
            onClick={() => setScope(s.value)}
            className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              scope === s.value ? 'text-text' : 'text-muted hover:text-text'
            }`}
          >
            {scope === s.value && (
              <motion.span
                layoutId="ranking-scope-pill"
                className="absolute inset-0 rounded-md bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{s.label}</span>
          </button>
        ))}
      </div>

      {state === 'loading' && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner label="Cargando ranking…" />
        </div>
      )}

      {state === 'error' && <ErrorState description={errorMessage} onRetry={() => setReloadToken((t) => t + 1)} />}

      {state === 'ready' && nobodyElseHasXp && (
        <>
          <EmptyState
            icon={Users}
            title={ownXp > 0 ? 'Por ahora sos la única persona con XP' : 'Todavía nadie sumó XP'}
            description={
              ownXp > 0
                ? 'En cuanto algún compañero de tu clase gane XP, va a aparecer acá para competir con vos.'
                : 'Completá un módulo para estrenar el ranking de tu clase.'
            }
          />
          {data.currentUser && (
            <Card className="border-primary bg-primary/10">
              <p className="text-xs text-muted">Tu posición</p>
              <p className="text-sm text-text">
                #{data.currentUser.position} de {data.currentUser.totalStudents} · {data.currentUser.xp} XP
              </p>
            </Card>
          )}
        </>
      )}

      {state === 'ready' && !nobodyElseHasXp && (
        <>
          <div className="flex flex-col gap-2">
            {data.entries.map((entry, i) => (
              <RankingRow key={entry.userId} entry={entry} index={i} />
            ))}
          </div>

          {data.currentUser && !data.entries.some((e) => e.isCurrentUser) && (
            <Card className="border-info">
              <p className="text-xs text-muted">Tu posición</p>
              <p className="text-sm text-text">
                #{data.currentUser.position} de {data.currentUser.totalStudents} · {data.currentUser.xp} XP
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function RankingRow({ entry, index }) {
  const hasMedal = entry.xp > 0 && MEDAL_CLASSES[entry.position];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 10) * 0.04 }}
    >
      <Card className={entry.isCurrentUser ? 'border-primary bg-primary/10' : ''}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex w-7 shrink-0 justify-center text-sm font-bold text-muted">
              {hasMedal ? (
                <Medal
                  aria-label={`Puesto ${entry.position}`}
                  className={`h-6 w-6 ${MEDAL_CLASSES[entry.position]}`}
                />
              ) : (
                entry.position
              )}
            </span>
            <span
              aria-hidden="true"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                entry.isCurrentUser ? 'bg-primary text-text' : 'bg-bg text-muted'
              }`}
            >
              {initialsOf(entry.fullName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">
                {entry.fullName} {entry.isCurrentUser && <span className="text-xs font-medium text-accent">(vos)</span>}
              </p>
              <p className="text-xs text-muted">{entry.completedModules} módulos completados</p>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-accent">
            <Zap aria-hidden="true" className="h-3.5 w-3.5 fill-accent" />
            {entry.xp} XP
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
