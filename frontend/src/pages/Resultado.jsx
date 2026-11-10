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
import { CircleCheckBig, HeartCrack, Heart, RotateCcw, Star, Target, Trophy, TrendingUp, Zap, ArrowRight, Map as MapIcon } from 'lucide-react';
import AnimatedNumber from '../components/common/AnimatedNumber.jsx';
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

  // Iconos en lugar de emojis (fallan en Android viejos — GUIA_DEL_PROYECTO, 5.2).
  // Los emojis de las insignias (badge.emoji) vienen de la API y se mantienen.
  const HeaderIcon = isNotCompleted ? HeartCrack : isRepeat ? RotateCcw : attempt.isPerfect ? Star : CircleCheckBig;
  const headerTone = isNotCompleted
    ? 'bg-danger/10 text-danger'
    : isRepeat
      ? 'bg-muted/10 text-muted'
      : 'bg-accent/10 text-accent';

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="relative">
        {showConfetti && <ConfettiBurst />}
        <motion.div {...headerAnimation}>
          <Card className={headerBorder}>
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full ${headerTone}`}>
                <HeaderIcon aria-hidden="true" className={`h-8 w-8 ${attempt.isPerfect && !isNotCompleted ? 'fill-accent' : ''}`} />
              </div>
              <h1 className="text-xl font-bold text-text">
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
        <StatTile icon={Target} label="Aciertos" delay={0.05}>
          <p className="text-lg font-bold text-text">
            {attempt.correctCount}/{attempt.totalQuestions}{' '}
            <span className="text-sm font-medium text-muted">({attempt.accuracyPercentage}%)</span>
          </p>
        </StatTile>
        <StatTile icon={Zap} label="XP ganado" delay={0.1}>
          <p className={`text-lg font-bold ${celebrate ? 'text-accent' : 'text-muted'}`}>
            +<AnimatedNumber value={rewards.xpEarned} /> XP
          </p>
        </StatTile>
        <StatTile icon={Trophy} label="Posición en el ranking" delay={0.15}>
          <p className="text-lg font-bold text-text">
            #{ranking.position} de {ranking.totalStudents}
          </p>
          {ranking.positionsGained > 0 && (
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-accent">
              <TrendingUp aria-hidden="true" className="h-3 w-3" />
              Subiste {ranking.positionsGained} posición(es)
            </p>
          )}
        </StatTile>
        <StatTile icon={Heart} label="Vidas restantes" delay={0.2}>
          <p className="text-lg font-bold text-text">{attempt.livesRemaining}/3</p>
        </StatTile>
      </div>

      {rewards.badgesUnlocked.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: celebrate ? 0.2 : 0 }}
        >
          <Card className="border-accent">
            <p className="mb-3 text-sm font-semibold text-text">Nuevas insignias</p>
            <div className="flex flex-col gap-2">
              {rewards.badgesUnlocked.map((badge, badgeIndex) => (
                <motion.div
                  key={badge.code}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + badgeIndex * 0.15 }}
                >
                  <span className="text-2xl">{badge.emoji}</span>
                  <div>
                    <p className="text-sm text-text">{badge.name}</p>
                    <p className="text-xs text-muted">{badge.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {nextModule && nextModule.isUnlocked && !isNotCompleted && (
        <Card className="border-info">
          <p className="text-xs text-muted">Siguiente módulo desbloqueado</p>
          <p className="text-sm font-semibold text-text">{nextModule.title}</p>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Button icon={isNotCompleted ? RotateCcw : MapIcon} onClick={goToMap}>
          {isNotCompleted ? 'Reintentar' : 'Volver al mapa'}
        </Button>
        {!isNotCompleted && (
          <Button variant="secondary" icon={ArrowRight} onClick={goToMap}>
            Ver mi progreso
          </Button>
        )}
      </div>
    </div>
  );
}


// Tarjeta de estadística: icono + etiqueta arriba, valor abajo; entra en cascada.
function StatTile({ icon: Icon, label, delay = 0, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}>
      <Card className="h-full">
        <p className="mb-1 flex items-center gap-1.5 text-xs text-muted">
          <Icon aria-hidden="true" className="h-3.5 w-3.5" />
          {label}
        </p>
        {children}
      </Card>
    </motion.div>
  );
}
