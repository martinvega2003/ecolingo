// F05 — Resultado del Módulo (GUIA_DE_CODIGO.md corregida, Parte 1
// endpoint 11, Parte 3 F05). "No hay mockup del diseño" para el caso
// fallido — se resuelve con el mismo sistema visual (Card, tokens),
// sin confeti, con tono sobrio e invitación a reintentar.
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { fetchResult, getErrorMessage } from '../api/resultApi.js';

export default function Resultado() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [state, setState] = useState('loading'); // loading | ready | error
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(() => {
    setState('loading');
    fetchResult(attemptId)
      .then(async (res) => {
        setData(res);
        setState('ready');
        await refreshUser();
      })
      .catch((err) => {
        setErrorMessage(getErrorMessage(err));
        setState('error');
      });
  }, [attemptId, refreshUser]);

  useEffect(() => {
    load();
  }, [load]);

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
        <ErrorState description={errorMessage} onRetry={load} />
      </div>
    );
  }

  const { attempt, module: moduleInfo, rewards, ranking, nextModule } = data;
  const isFailed = attempt.status === 'failed';
  const celebrate = !isFailed && rewards.isFirstCompletion;

  const goToMap = () => navigate('/mapa');

  return (
    <div className="flex flex-col gap-4 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <Card className={isFailed ? 'border-danger' : attempt.isPerfect ? 'border-accent' : 'border-primary'}>
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <span className="text-3xl">{isFailed ? '💪' : attempt.isPerfect ? '🌟' : '✅'}</span>
            <h1 className="text-lg font-medium text-text">
              {isFailed ? 'No llegaste esta vez' : moduleInfo.title}
            </h1>
            {isFailed && (
              <p className="text-sm text-muted">Te quedaste sin vidas. Tu progreso no se perdió, podés reintentar.</p>
            )}
            {!isFailed && attempt.isPerfect && (
              <p className="text-sm text-accent">¡Módulo perfecto! Respondiste todo bien.</p>
            )}
          </div>
        </Card>
      </motion.div>

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
          <p className="text-lg font-medium text-accent">+{rewards.xpEarned} XP</p>
          {!rewards.isFirstCompletion && !isFailed && (
            <p className="text-xs text-muted">Ya habías completado este módulo antes.</p>
          )}
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

      {nextModule && !isFailed && (
        <Card>
          <p className="text-xs text-muted">Siguiente módulo desbloqueado</p>
          <p className="text-sm text-text">{nextModule.title}</p>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={goToMap}>{isFailed ? 'Reintentar' : 'Volver al mapa'}</Button>
        {!isFailed && (
          <Button variant="secondary" onClick={goToMap}>
            Ver mi progreso
          </Button>
        )}
      </div>
    </div>
  );
}
