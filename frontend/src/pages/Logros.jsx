import { useEffect, useState, useCallback } from 'react';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Card from '../components/common/Card.jsx';
import { fetchMyBadges, getErrorMessage } from '../api/badgesApi.js';

export default function Logros() {
  const [state, setState] = useState('loading');
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(() => {
    setState('loading');
    fetchMyBadges()
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
    load();
  }, [load]);

  if (state === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Cargando tus logros…" />
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

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-medium text-text">Logros e Insignias</h1>
        <span className="text-sm text-muted">
          {data.unlockedCount}/{data.totalCount}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.badges.map((badge) => (
          <BadgeTile key={badge.code} badge={badge} />
        ))}
      </div>
    </div>
  );
}

function BadgeTile({ badge }) {
  return (
    <Card
      className={`flex flex-col items-center gap-1 text-center ${
        badge.isUnlocked ? 'border-accent' : 'opacity-50 grayscale'
      }`}
    >
      <span className="text-3xl">{badge.emoji}</span>
      <p className="text-sm font-medium text-text">{badge.name}</p>
      <p className="text-xs text-muted">{badge.description}</p>
      {badge.isUnlocked && badge.unlockedAt && (
        <p className="text-xs text-accent">{new Date(badge.unlockedAt).toLocaleDateString('es-PY')}</p>
      )}
    </Card>
  );
}
