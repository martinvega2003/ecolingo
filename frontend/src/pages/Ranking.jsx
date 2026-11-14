import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Medal, Zap } from 'lucide-react';
import Avatar from '../components/common/Avatar.jsx';
import Card from '../components/common/Card.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { fetchRanking, getErrorMessage } from '../api/rankingApi.js';
import { useAuth } from '../hooks/useAuth.js';

// F06 — Ranking de la clase (Endpoint 15; propuesta visual, Pantalla 5).
// Parte 3, F06: "El top 3 lleva medallas de oro, plata y bronce". Solo se
// otorgan con XP > 0 — un 3.º puesto con 0 XP no "ganó" nada. Por eso el
// podio se muestra únicamente cuando los tres primeros tienen XP; si no,
// todos van en la lista y la medalla la lleva solo quien sumó XP.
const PLACES = {
  1: { text: 'text-gold', ring: 'ring-gold', step: 'h-24 border-gold bg-gold/15', label: 'Oro' },
  2: { text: 'text-muted', ring: 'ring-muted', step: 'h-16 border-muted bg-muted/15', label: 'Plata' },
  3: { text: 'text-bronze', ring: 'ring-bronze', step: 'h-12 border-bronze bg-bronze/15', label: 'Bronce' },
};
const PODIUM_ORDER = [2, 1, 3]; // plata a la izquierda, oro al centro, bronce a la derecha

const SCOPES = [
  { value: 'weekly', label: 'Esta semana' },
  { value: 'alltime', label: 'General' },
];

// Día en que se reinicia el ranking semanal: el siguiente a weekEndsAt
// (campo del Endpoint 15), en la zona horaria del piloto.
const resetDayLabel = (weekEndsAt) => {
  if (!weekEndsAt) return null;
  const nextWeek = new Date(new Date(weekEndsAt).getTime() + 1000);
  return nextWeek.toLocaleDateString('es-PY', { weekday: 'long', timeZone: 'America/Asuncion' });
};

export default function Ranking() {
  const { user } = useAuth();
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

  const entries = state === 'ready' ? data.entries : [];
  const topThree = entries.filter((e) => e.position <= 3 && e.xp > 0);
  const showPodium = state === 'ready' && !nobodyElseHasXp && topThree.length === 3;
  const rest = showPodium ? entries.filter((e) => e.position > 3) : entries;
  const ownEntry = entries.find((e) => e.isCurrentUser);
  const resetDay = scope === 'weekly' ? resetDayLabel(data?.weekEndsAt) : null;

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-extrabold text-text">Ranking de la clase</h1>

      <div className="flex gap-1 self-start rounded-full bg-surface p-1">
        {SCOPES.map((s) => (
          <button
            key={s.value}
            onClick={() => setScope(s.value)}
            aria-pressed={scope === s.value}
            className={`relative rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              scope === s.value ? 'text-text' : 'text-muted hover:text-text'
            }`}
          >
            {scope === s.value && (
              <motion.span
                layoutId="ranking-scope-pill"
                className="absolute inset-0 rounded-full bg-primary"
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
        <div className="mx-auto w-full max-w-3xl">
          <EmptyState
            title={ownXp > 0 ? 'Por ahora sos la única persona con XP' : 'El podio está libre'}
            description={
              ownXp > 0
                ? 'En cuanto algún compañero de tu clase gane XP, va a aparecer acá para competir con vos.'
                : 'Nadie sumó XP todavía. Completá un módulo y estrená el ranking de tu clase.'
            }
          />
          {data.currentUser && (
            <OwnPositionCard
              fullName={ownEntry?.fullName ?? user?.fullName}
              currentUser={data.currentUser}
              completedModules={ownEntry?.completedModules}
            />
          )}
        </div>
      )}

      {state === 'ready' && !nobodyElseHasXp && (
        <div className={`grid gap-4 ${showPodium ? 'lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start' : 'mx-auto w-full max-w-3xl'}`}>
          {showPodium && (
            <div className="flex flex-col gap-3">
              <Podium entries={topThree} />
              {resetDay && <ResetNote day={resetDay} />}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {data.currentUser && (
              <section className="flex flex-col gap-2">
                <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-muted">Tu posición</h2>
                <OwnPositionCard
                  fullName={ownEntry?.fullName ?? user?.fullName}
                  currentUser={data.currentUser}
                  completedModules={ownEntry?.completedModules}
                />
              </section>
            )}

            {rest.length > 0 && (
              <section className="flex flex-col gap-2">
                <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
                  {showPodium ? 'Resto de la clase' : 'Toda la clase'}
                </h2>
                {rest.map((entry, i) => (
                  <RankingRow key={entry.userId} entry={entry} index={i} />
                ))}
              </section>
            )}

            {!showPodium && resetDay && <ResetNote day={resetDay} />}
          </div>
        </div>
      )}
    </div>
  );
}

function ResetNote({ day }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted">
      <Clock aria-hidden="true" className="h-3.5 w-3.5" />
      La semana se reinicia el {day}
    </p>
  );
}

function Podium({ entries }) {
  const byPosition = new Map(entries.map((e) => [e.position, e]));

  return (
    <Card className="flex items-end justify-center gap-3 px-3 pb-0 pt-6">
      {PODIUM_ORDER.map((position, i) => {
        const entry = byPosition.get(position);
        const place = PLACES[position];
        return (
          <motion.div
            key={position}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.1 }}
            className="flex w-24 flex-col items-center text-center"
          >
            <Avatar
              fullName={entry.fullName}
              size="md"
              className={`ring-4 ${entry.isCurrentUser ? '' : place.ring}`}
              highlight={entry.isCurrentUser}
            />
            {/* En el podio hay poco ancho: la fila propia dice "Vos" en vez del nombre */}
            <p className={`mt-2 w-full truncate text-xs font-extrabold ${entry.isCurrentUser ? 'text-accent' : 'text-text'}`}>
              {entry.isCurrentUser ? 'Vos' : entry.fullName}
            </p>
            <p className="text-xs font-extrabold text-accent">{entry.xp} XP</p>
            <div
              aria-label={`Puesto ${position}: ${place.label}`}
              className={`mt-2 flex w-full items-start justify-center rounded-t-xl border-x-2 border-t-2 pt-2 text-2xl font-extrabold ${place.step} ${place.text}`}
            >
              {position}
            </div>
          </motion.div>
        );
      })}
    </Card>
  );
}

function OwnPositionCard({ fullName, currentUser, completedModules }) {
  return (
    <Card className="flex items-center gap-3 border-accent/60 bg-primary/20">
      <span className="w-7 shrink-0 text-center text-sm font-extrabold text-text">{currentUser.position}</span>
      <Avatar fullName={fullName} highlight />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-text">
          {fullName} <span className="text-xs font-bold text-accent">(vos)</span>
        </p>
        <p className="text-xs text-muted">
          {completedModules != null
            ? `${completedModules} ${completedModules === 1 ? 'módulo completado' : 'módulos completados'}`
            : `Puesto ${currentUser.position} de ${currentUser.totalStudents}`}
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-sm font-extrabold text-accent">
        <Zap aria-hidden="true" className="h-3.5 w-3.5 fill-accent" />
        {currentUser.xp} XP
      </span>
    </Card>
  );
}

function RankingRow({ entry, index }) {
  const place = entry.xp > 0 ? PLACES[entry.position] : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 10) * 0.04 }}
    >
      <Card className={`flex items-center gap-3 py-3 ${entry.isCurrentUser ? 'border-accent/60 bg-primary/20' : ''}`}>
        <span className="flex w-7 shrink-0 justify-center text-sm font-extrabold text-muted">
          {place ? (
            <Medal aria-label={`Puesto ${entry.position}: ${place.label}`} className={`h-6 w-6 ${place.text}`} />
          ) : (
            entry.position
          )}
        </span>
        <Avatar fullName={entry.fullName} highlight={entry.isCurrentUser} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text">
            {entry.fullName} {entry.isCurrentUser && <span className="text-xs font-bold text-accent">(vos)</span>}
          </p>
          <p className="text-xs text-muted">
            {entry.completedModules} {entry.completedModules === 1 ? 'módulo completado' : 'módulos completados'}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-sm font-extrabold text-accent">
          <Zap aria-hidden="true" className="h-3.5 w-3.5 fill-accent" />
          {entry.xp} XP
        </span>
      </Card>
    </motion.div>
  );
}
