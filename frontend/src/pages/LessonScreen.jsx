import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAttempt, submitAnswer, abandonAttempt } from '../api/lessonApi.js';
import { now } from '../utils/time.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';

const LessonScreen = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0); // cambiar este valor dispara una recarga
  const questionStartedAt = useRef(null); // sin Date.now() acá — se evaluaría durante el render

  useEffect(() => {
    let ignore = false;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAttempt(attemptId);
        if (ignore) return;

        if (!data.question) {
          // status !== in_progress → el contrato pide redirigir a resultado
          // (F05, Cesar — todavía no construida, pero el destino es correcto).
          navigate(`/resultado/${attemptId}`, { replace: true });
          return;
        }

        setAttempt(data.attempt);
        setQuestion(data.question);
        setFeedback(null);
        questionStartedAt.current = now();
      } catch (err) {
        if (ignore) return;
        const code = err.response?.data?.error?.code;
        setError(
          code === 'NOT_RESOURCE_OWNER'
            ? 'Este intento no te pertenece.'
            : code === 'ATTEMPT_NOT_FOUND'
              ? 'No encontramos esta lección.'
              : 'No pudimos cargar la lección.'
        );
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [attemptId, reloadToken, navigate]);

  const reload = () => setReloadToken((token) => token + 1);

  const handleSelect = async (optionKey) => {
    if (isSubmitting || feedback) return; // protección de doble clic (riesgo señalado en Parte 3, F04)
    setIsSubmitting(true);
    try {
      const timeToAnswerSeconds = Math.round((now() - questionStartedAt.current) / 1000);
      const data = await submitAnswer(attemptId, {
        questionId: question.id,
        selectedOptionKey: optionKey,
        timeToAnswerSeconds,
      });
      setFeedback(data.feedback);
      setAttempt(data.attempt);
      setQuestion(data.isFinished ? null : data.nextQuestion);
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 'ATTEMPT_ALREADY_FINISHED' || code === 'QUESTION_ALREADY_ANSWERED') {
        // Estado del cliente desincronizado (doble pestaña, reconexión) —
        // se recupera pidiendo el estado real en vez de mostrar un error.
        reload();
      } else {
        setError('No pudimos enviar tu respuesta. Probá de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (attempt.status !== 'in_progress') {
      navigate(`/resultado/${attemptId}`, { replace: true });
      return;
    }
    setFeedback(null);
    questionStartedAt.current = now();
  };

  const handleAbandon = async () => {
    try {
      await abandonAttempt(attemptId);
    } catch {
      // Si ya estaba cerrado por otro motivo, igual volvemos al mapa.
    }
    navigate('/mapa', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Cargando lección…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState title="No pudimos cargar la lección" description={error} onRetry={reload} />
      </div>
    );
  }

  if (!attempt) return null;

  const hearts = Array.from({ length: attempt.totalLives }, (_, i) => i < attempt.livesRemaining);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handleAbandon}
          className="text-xl text-muted transition-colors hover:text-danger"
          aria-label="Cerrar lección"
        >
          ✕
        </button>
        <div className="flex gap-1 text-lg" aria-label={`${attempt.livesRemaining} de ${attempt.totalLives} vidas`}>
          {hearts.map((alive, i) => (
            <span key={i}>{alive ? '❤️' : '🤍'}</span>
          ))}
        </div>
      </div>

      <ProgressBar
        value={attempt.currentQuestionOrder}
        max={attempt.totalQuestions}
        label={`Pregunta ${attempt.currentQuestionOrder} de ${attempt.totalQuestions}`}
      />

      {question && (
        <Card className="my-6">
          <p className="text-base text-text">{question.statement}</p>
        </Card>
      )}

      {!feedback && question && (
        <div className="flex flex-col gap-3">
          {question.options.map((option) => (
            <Button
              key={option.key}
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => handleSelect(option.key)}
              className="text-left"
            >
              <span className="mr-2 font-semibold">{option.key}.</span>
              {option.text}
            </Button>
          ))}
        </div>
      )}

      {feedback && (
        <Card className="my-6">
          <p className={`mb-2 font-semibold ${feedback.isCorrect ? 'text-accent' : 'text-danger'}`}>
            {feedback.isCorrect ? '¡Correcto!' : 'Incorrecto'}
            {feedback.xpAwarded > 0 && ` · +${feedback.xpAwarded} XP`}
          </p>
          <p className="text-sm text-muted">{feedback.explanation}</p>
          <Button className="mt-4" onClick={handleNext}>
            {attempt.status === 'in_progress' ? 'Siguiente' : 'Ver resultado'}
          </Button>
        </Card>
      )}
    </div>
  );
};

export default LessonScreen;