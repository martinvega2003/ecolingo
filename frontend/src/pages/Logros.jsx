import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Lock } from 'lucide-react';
import ProgressBar from '../components/common/ProgressBar.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Card from '../components/common/Card.jsx';
import { fetchMyBadges, getErrorMessage } from '../api/badgesApi.js';

export default function Logros() {
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
        const res = await fetchMyBadges();
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
  }, [reloadToken]);

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
        <ErrorState description={errorMessage} onRetry={() => setReloadToken((t) => t + 1)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-baseline justify-between">
        <h1 className="flex items-center gap-2 text-lg font-bold text-text">
          <Award aria-hidden="true" className="h-5 w-5 text-accent" />
          Logros e Insignias
        </h1>
        <span className="text-sm font-semibold text-muted">
          {data.unlockedCount}/{data.totalCount}
        </span>
      </div>
      <ProgressBar value={data.unlockedCount} max={data.totalCount} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.badges.map((badge, i) => (
          <BadgeTile key={badge.code} badge={badge} index={i} />
        ))}
      </div>
    </div>
  );
}

// Parte 3, F07: "Bloqueadas: gris, con el requisito legible". Solo el emoji se
// atenúa; el nombre y el requisito quedan con contraste normal.
function BadgeTile({ badge, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay: Math.min(index, 12) * 0.04 }}
      whileHover={badge.isUnlocked ? { y: -3 } : undefined}
    >
      <Card
        className={`relative flex h-full flex-col items-center gap-1 text-center ${
          badge.isUnlocked ? 'border-accent bg-accent/5' : ''
        }`}
      >
        {!badge.isUnlocked && (
          <Lock aria-label="Bloqueada" className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted" />
        )}
        <span className={`text-4xl ${badge.isUnlocked ? '' : 'opacity-40 grayscale'}`}>{badge.emoji}</span>
        <p className="mt-1 text-sm font-semibold text-text">{badge.name}</p>
        <p className="text-xs text-muted">{badge.description}</p>
        {badge.isUnlocked && badge.unlockedAt && (
          <p className="mt-1 text-xs font-medium text-accent">
            {new Date(badge.unlockedAt).toLocaleDateString('es-PY')}
          </p>
        )}
      </Card>
    </motion.div>
  );
}
