// F05 — Resultado del Módulo (GUIA_DE_CODIGO.md, Parte 1 endpoint 11,
// Parte 3 F05; propuesta visual, Pantalla 4).
//
// Tres tonos (Parte 3, F05 — Riesgos):
// - Primera vez completado → celebración completa: chanchito feliz y
//   lluvia de monedas (reemplaza al confeti genérico).
// - Repetición (isFirstCompletion: false) → celebración atenuada, sin monedas.
// - failed / abandoned → sin celebración, invitación a reintentar.
// Las monedas son pointer-events-none y duran ~1,4 s: no tapan ni bloquean
// los botones ("La celebración no puede tapar la información").
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Heart, Map as MapIcon, RotateCcw, Target, TrendingUp, Trophy, Zap } from 'lucide-react';
import AnimatedNumber from '../components/common/AnimatedNumber.jsx';
import BadgeMedal from '../components/common/BadgeMedal.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Coin from '../components/common/Coin.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Mascot from '../components/common/Mascot.jsx';
import ModuleIcon from '../components/common/ModuleIcon.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { startAttempt } from '../api/lessonApi.js';
import { fetchResult, getErrorMessage } from '../api/resultApi.js';
import { getModuleTheme } from '../theme/moduleTheme.js';

// Monedas precalculadas a nivel de módulo (determinísticas): nada de
// Math.random() durante el render — React Compiler purity rules.
const COIN_RAIN = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const distance = i % 2 === 0 ? 150 : 100;
  return {
    id: i,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance * 0.7 - 30,
    rotate: (i % 3) * 140 - 120,
    size: i % 3 === 0 ? 'h-7 w-7' : 'h-5 w-5',
    delay: (i % 5) * 0.05,
  };
});

function CoinBurst() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {COIN_RAIN.map((c) => (
        <motion.span
          key={c.id}
          className="absolute"
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
          animate={{ x: c.x, y: c.y, opacity: [0, 1, 1, 0], scale: 1, rotate: c.rotate }}
          transition={{ duration: 1.4, delay: c.delay, ease: 'easeOut' }}
        >
          <Coin className={c.size} />
        </motion.span>
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
  const [isStartingNext, setIsStartingNext] = useState(false);

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
        <Spinner label="Contando tus monedas…" />
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
  const showCoins = celebrate && !prefersReducedMotion;
  const canContinue = Boolean(nextModule?.isUnlocked) && !isNotCompleted;

  const goToMap = () => navigate('/mapa');

  // "Seguir con el módulo N": abre un intento del siguiente módulo con el
  // Endpoint 7 (el mismo que usa el Mapa). Si algo falla, vuelve al mapa.
  const goToNextModule = async () => {
    setIsStartingNext(true);
    try {
      const res = await startAttempt(nextModule.id);
      navigate(`/leccion/${res.attempt.id}`);
    } catch {
      navigate('/mapa');
    }
  };

  const headerAnimation = celebrate
    ? {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { type: 'spring', stiffness: 260, damping: 14 },
      }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } };

  const mood = isFailed ? 'mareado' : isAbandoned ? 'durmiendo' : isRepeat ? 'normal' : 'feliz';
  const title = isFailed
    ? 'No llegaste esta vez'
    : isAbandoned
      ? 'Dejaste este intento'
      : isRepeat
        ? 'Repaso completado'
        : '¡Módulo completado!';

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <div className="relative">
        {showCoins && <CoinBurst />}
        <motion.div {...headerAnimation} className="flex flex-col items-center gap-1 pb-2 pt-4 text-center">
          <Mascot mood={mood} coin={false} className="h-28 w-36" />
          <h1 className="mt-2 text-2xl font-extrabold text-text">{title}</h1>
          <p className={`text-base font-bold ${getModuleTheme(moduleInfo.order).text}`}>{moduleInfo.title}</p>
          {isFailed && (
            <p className="text-sm text-muted">Te quedaste sin vidas. Tu progreso no se perdió, podés reintentar.</p>
          )}
          {isAbandoned && (
            <p className="text-sm text-muted">Este intento quedó sin terminar. Podés volver a empezarlo desde el mapa.</p>
          )}
          {isRepeat && <p className="text-sm text-muted">Ya habías ganado el XP de este módulo.</p>}
          {celebrate && attempt.isPerfect && (
            <p className="text-sm font-semibold text-accent">¡Módulo perfecto! Respondiste todo bien.</p>
          )}
          {isRepeat && attempt.isPerfect && <p className="text-sm text-muted">Esta vez, sin errores.</p>}
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon={Target} tone="bg-info/15 text-info" label="Aciertos" delay={0.05}>
          <p className="text-xl font-extrabold text-text">
            {attempt.correctCount}/{attempt.totalQuestions}{' '}
            <span className="text-sm font-semibold text-muted">· {attempt.accuracyPercentage} %</span>
          </p>
        </StatTile>
        <StatTile icon={Zap} tone="bg-accent/15 text-accent" label="XP ganado" delay={0.1}>
          <p className={`text-xl font-extrabold ${celebrate ? 'text-accent' : 'text-muted'}`}>
            +<AnimatedNumber value={rewards.xpEarned} /> XP
          </p>
        </StatTile>
        <StatTile icon={Trophy} tone="bg-gold/15 text-gold" label="Ranking" delay={0.15}>
          <p className="text-xl font-extrabold text-text">
            #{ranking.position} <span className="text-sm font-semibold text-muted">de {ranking.totalStudents}</span>
          </p>
          {ranking.positionsGained > 0 && (
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-accent">
              <TrendingUp aria-hidden="true" className="h-3 w-3" />
              Subiste {ranking.positionsGained} {ranking.positionsGained === 1 ? 'posición' : 'posiciones'}
            </p>
          )}
        </StatTile>
        <StatTile icon={Heart} tone="bg-danger/15 text-danger" label="Vidas" delay={0.2}>
          <p className="text-xl font-extrabold text-text">
            {attempt.livesRemaining} <span className="text-sm font-semibold text-muted">de 3</span>
          </p>
        </StatTile>
      </div>

      {(rewards.badgesUnlocked.length > 0 || canContinue) && (
        <div className="grid gap-3 md:grid-cols-2">
          {rewards.badgesUnlocked.map((badge, badgeIndex) => (
            <motion.div
              key={badge.code}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + badgeIndex * 0.15 }}
            >
              <Card className="flex h-full items-center gap-4 border-gold/50">
                <BadgeMedal code={badge.code} />
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-gold">Nueva insignia</p>
                  <p className="text-base font-extrabold text-text">{badge.name}</p>
                  <p className="text-xs text-muted">{badge.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}

          {canContinue && (
            <Card className={`flex h-full items-center gap-4 ${getModuleTheme(nextModule.order).softBorder}`}>
              <ModuleIcon order={nextModule.order} />
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted">Se desbloqueó</p>
                <p className="text-base font-extrabold text-text">{nextModule.title}</p>
                <p className="text-xs text-muted">Módulo {nextModule.order}</p>
              </div>
            </Card>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {canContinue ? (
          <>
            <Button variant="secondary" icon={MapIcon} onClick={goToMap} className="py-3">
              Volver al mapa
            </Button>
            <Button icon={ArrowRight} onClick={goToNextModule} disabled={isStartingNext} className="py-3">
              {isStartingNext ? 'Abriendo…' : `Seguir con el módulo ${nextModule.order}`}
            </Button>
          </>
        ) : (
          <Button icon={isNotCompleted ? RotateCcw : MapIcon} onClick={goToMap} className="py-3">
            {isNotCompleted ? 'Reintentar' : 'Volver al mapa'}
          </Button>
        )}
      </div>
    </div>
  );
}

// Dato del resultado: icono con color + etiqueta arriba, valor abajo; entra en cascada.
function StatTile({ icon: Icon, tone, label, delay = 0, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}>
      <Card className="h-full">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}>
            <Icon aria-hidden="true" className="h-4 w-4" />
          </span>
          {label}
        </p>
        {children}
      </Card>
    </motion.div>
  );
}
