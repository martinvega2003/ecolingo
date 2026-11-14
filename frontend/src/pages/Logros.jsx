import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BadgeMedal from '../components/common/BadgeMedal.jsx';
import Card from '../components/common/Card.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import ProgressRing from '../components/common/ProgressRing.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { fetchMyBadges, getErrorMessage } from '../api/badgesApi.js';

// F07 — Logros e insignias (Endpoints 13 y 14; propuesta visual, Pantalla 6).
// Cada insignia es una medalla; el icono sale de su `code`
// (theme/badgeIcons.js) en lugar del emoji de la API. Se muestran las diez,
// en el orden que manda el servidor (displayOrder), sin filtrar ni reordenar.

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

  // "Próxima insignia": la primera bloqueada en el orden del servidor.
  const nextBadge = data.badges.find((b) => !b.isUnlocked);

  return (
    <div className="flex flex-col gap-5 p-4">
      <Card className="flex items-center gap-4">
        <ProgressRing value={data.unlockedCount} max={data.totalCount} colorClassName="text-gold" className="h-20 w-20">
          <span className="text-lg font-extrabold text-text">
            {data.unlockedCount}/{data.totalCount}
          </span>
        </ProgressRing>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-text">Logros e insignias</h1>
          <p className="mt-0.5 text-sm text-muted">
            {nextBadge ? (
              <>
                Próxima: <span className="font-bold text-text">{nextBadge.name}</span> · {nextBadge.description}
              </>
            ) : (
              '¡Conseguiste todas las insignias!'
            )}
          </p>
        </div>
      </Card>

      {/* F07: "Grid de 2 columnas en móvil, más en pantallas grandes" */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {data.badges.map((badge, i) => (
          <BadgeTile key={badge.code} badge={badge} index={i} />
        ))}
      </div>
    </div>
  );
}

// Parte 3, F07: "Bloqueadas: gris, con el requisito legible". La medalla se
// ve como silueta punteada; el nombre y el requisito quedan con contraste normal.
function BadgeTile({ badge, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay: Math.min(index, 12) * 0.04 }}
      whileHover={badge.isUnlocked ? { y: -3 } : undefined}
    >
      <Card
        className={`flex h-full flex-col items-center gap-1.5 text-center ${badge.isUnlocked ? 'border-gold/40' : 'border-dashed'}`}
      >
        <BadgeMedal code={badge.code} isUnlocked={badge.isUnlocked} />
        <p className={`mt-1 text-sm font-extrabold ${badge.isUnlocked ? 'text-text' : 'text-text/80'}`}>{badge.name}</p>
        <p className="text-xs text-muted">{badge.description}</p>
        {badge.isUnlocked && badge.unlockedAt && (
          <p className="mt-auto pt-1 text-xs font-bold text-gold">
            {new Date(badge.unlockedAt).toLocaleDateString('es-PY')}
          </p>
        )}
      </Card>
    </motion.div>
  );
}
