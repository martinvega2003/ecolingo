import { useEffect, useState } from 'react';
import Card from '../components/common/Card.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { fetchRanking, getErrorMessage } from '../api/rankingApi.js';

// Parte 3, F06: "El top 3 lleva medallas de oro, plata y bronce". Solo se
// otorgan con XP > 0 — un 3.º puesto con 0 XP no "ganó" nada.
const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

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
      <h1 className="text-lg font-medium text-text">Ranking de Clase</h1>

      <div className="flex gap-2">
        {SCOPES.map((s) => (
          <button
            key={s.value}
            onClick={() => setScope(s.value)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              scope === s.value ? 'bg-primary text-text' : 'border border-hair border-muted text-muted'
            }`}
          >
            {s.label}
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
            {data.entries.map((entry) => (
              <RankingRow key={entry.userId} entry={entry} />
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

function RankingRow({ entry }) {
  return (
    <Card className={entry.isCurrentUser ? 'border-primary bg-primary/10' : ''}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-6 text-center text-sm font-medium text-muted">
            {entry.xp > 0 && MEDALS[entry.position] ? (
              <span className="text-lg" aria-label={`Puesto ${entry.position}`}>
                {MEDALS[entry.position]}
              </span>
            ) : (
              entry.position
            )}
          </span>
          <div>
            <p className="text-sm text-text">
              {entry.fullName} {entry.isCurrentUser && <span className="text-xs text-primary">(vos)</span>}
            </p>
            <p className="text-xs text-muted">{entry.completedModules} módulos completados</p>
          </div>
        </div>
        <span className="text-sm font-medium text-accent">{entry.xp} XP</span>
      </div>
    </Card>
  );
}
