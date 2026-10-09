// F05 — Resultado del Módulo (GUIA_DE_CODIGO.md corregida, Parte 1
// endpoint 11, Parte 3 F05). "No hay mockup del diseño" para el caso
// fallido — se resuelve con el mismo sistema visual (Card, tokens),
// sin confeti, con tono sobrio e invitación a reintentar.
//
// Tres tonos (Parte 3, F05 — Riesgos):
// - Primera vez completado → celebración completa (confeti breve + pop).
// - Repetición (isFirstCompletion: false) → celebración atenuada, sin confeti.
// - failed / abandoned → sin celebración, invitación a reintentar.
// El confeti es pointer-events-none y dura ~1,2 s: no tapa ni bloquea los
// botones ("La celebración no puede tapar la información").
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { fetchResult, getErrorMessage } from '../api/resultApi.js';

// Partículas precalculadas a nivel de módulo (determinísticas): nada de
// Math.random() durante el render — React Compiler purity rules.
const CONFETTI_COLORS = ['bg-accent', 'bg-primary', 'bg-warn', 'bg-info'];
const CONFETTI = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2;
  const distance = i % 2 === 0 ? 120 : 80;
  return {
    id: i,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance - 40,
    rotate: (i % 3) * 120,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: (i % 4) * 0.04,
  };
});

function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {CONFETTI.map((p) => (
        <motion.span
          key={p.id}
          className={`absolute h-2 w-2 rounded-sm ${p.color}`}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.6, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1, rotate: p.rotate }}
          transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

export default function Resultado() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [state, setState] = useState('loading'); // loading | ready | error
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
        const res = await fetchResult(attemptId);
        if (ignore) return;
        setData(res);
        setState('ready');
        // Refresco de la cabecera del shell (XP, racha) — Parte 3, F05.
        await refreshUser();
      } catch (err) {
        if (ignore) return;
        setErrorMessage(getErrorMessage(err));
        setState('error');
      }
    })();

    return () => {
      ignore = true;
    };
  }, [attemptId, refreshUser, reloadToken]);

  if (state === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Calculando tu resultado…" />
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

  const { attempt, module: moduleInfo, rewards, ranking, nextModule } = data;
  const isFailed = attempt.status === 'failed';
  const isAbandoned = attempt.status === 'abandoned';
  const isNotCompleted = isFailed || isAbandoned;
  const isRepeat = !isNotCompleted && !rewards.isFirstCompletion;
  const celebrate = !isNotCompleted && rewards.isFirstCompletion;
  const showConfetti = celebrate && !prefersReducedMotion;

  const goToMap = () => navigate('/mapa');

  const headerAnimation = celebrate
    ? {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { type: 'spring', stiffness: 260, damping: 14 },
      }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } };

  const headerBorder = isNotCompleted
    ? 'border-danger'
    : isRepeat
      ? 'border-muted'
      : attempt.isPerfect
        ? 'border-accent'
        : 'border-primary';

  const headerEmoji = isNotCompleted ? '💪' : isRepeat ? '🔁' : attempt.isPerfect ? '🌟' : '✅';

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="relative">
        {showConfetti && <ConfettiBurst />}
        <motion.div {...headerAnimation}>
          <Card className={headerBorder}>
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <span className="text-3xl">{headerEmoji}</span>
              <h1 className="text-lg font-medium text-text">
                {isFailed ? 'No llegaste esta vez' : isAbandoned ? 'Dejaste este intento' : moduleInfo.title}
              </h1>
              {isFailed && (
                <p className="text-sm text-muted">Te quedaste sin vidas. Tu progreso no se perdió, podés reintentar.</p>
              )}
              {isAbandoned && (
                <p className="text-sm text-muted">Este intento quedó sin terminar. Podés volver a empezarlo desde el mapa.</p>
              )}
              {isRepeat && <p className="text-sm text-muted">Repaso completado. Ya habías ganado el XP de este módulo.</p>}
              {celebrate && attempt.isPerfect && (
                <p className="text-sm text-accent">¡Módulo perfecto! Respondiste todo bien.</p>
              )}
              {isRepeat && attempt.isPerfect && <p className="text-sm text-muted">Esta vez, sin errores.</p>}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-muted">Aciertos</p>
          <p className="text-lg font-medium text-text">
            {attempt.correctCount}/{attempt.totalQuestions}{' '}
            <span className="text-sm text-muted">({attempt.accuracyPercentage}%)</span>
          </p>
        </Card>
        <Card>
          <p className="text-xs text-muted">XP ganado</p>
          <p className={`text-lg font-medium ${celebrate ? 'text-accent' : 'text-muted'}`}>+{rewards.xpEarned} XP</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Posición en el ranking</p>
          <p className="text-lg font-medium text-text">
            #{ranking.position} de {ranking.totalStudents}
          </p>
          {ranking.positionsGained > 0 && (
            <p className="text-xs text-accent">Subiste {ranking.positionsGained} posición(es)</p>
          )}
        </Card>
        <Card>
          <p className="text-xs text-muted">Vidas restantes</p>
          <p className="text-lg font-medium text-text">{attempt.livesRemaining}/3</p>
        </Card>
      </div>

      {rewards.badgesUnlocked.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: celebrate ? 0.2 : 0 }}
        >
          <Card className="border-accent">
            <p className="mb-2 text-sm font-medium text-text">Nuevas insignias</p>
            <div className="flex flex-col gap-2">
              {rewards.badgesUnlocked.map((badge) => (
                <div key={badge.code} className="flex items-center gap-3">
                  <span className="text-2xl">{badge.emoji}</span>
                  <div>
                    <p className="text-sm text-text">{badge.name}</p>
                    <p className="text-xs text-muted">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {nextModule && nextModule.isUnlocked && !isNotCompleted && (
        <Card>
          <p className="text-xs text-muted">Siguiente módulo desbloqueado</p>
          <p className="text-sm text-text">{nextModule.title}</p>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={goToMap}>{isNotCompleted ? 'Reintentar' : 'Volver al mapa'}</Button>
        {!isNotCompleted && (
          <Button variant="secondary" onClick={goToMap}>
            Ver mi progreso
          </Button>
        )}
      </div>
    </div>
  );
}
