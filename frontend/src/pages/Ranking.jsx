import { useEffect, useState, useCallback } from 'react';
import Card from '../components/common/Card.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { fetchRanking, getErrorMessage } from '../api/rankingApi.js';

const SCOPES = [
  { value: 'weekly', label: 'Esta semana' },
  { value: 'alltime', label: 'General' },
];

export default function Ranking() {
  const [scope, setScope] = useState('weekly');
  const [state, setState] = useState('loading');
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback((currentScope) => {
    setState('loading');
    fetchRanking(currentScope)
      .then((res) => {
        setData(res);
        setState('ready');
      })
      .catch((err) => {
        setErrorMessage(getErrorMessage(err));
        setState('error');
      });
  }, []);

  useEffect(() => {
    load(scope);
  }, [scope, load]);

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

      {state === 'error' && <ErrorState description={errorMessage} onRetry={() => load(scope)} />}

      {state === 'ready' && data.entries.length === 0 && (
        <EmptyState
          title="Todavía no hay nadie en el ranking"
          description="En cuanto algún compañero de tu clase gane XP, va a aparecer acá."
        />
      )}

      {state === 'ready' && data.entries.length > 0 && (
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
          <span className="w-6 text-center text-sm font-medium text-muted">{entry.position}</span>
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
