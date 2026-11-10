import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CircleCheck, CircleX, Heart, Trophy, X, Zap } from 'lucide-react';
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
  // La respuesta del servidor ya trae la siguiente pregunta, pero no se
  // muestra hasta que el alumno toca "Siguiente": mientras tanto `question`
  // sigue siendo la que acaba de responder, junto con su feedback.
  const [nextQuestion, setNextQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0); // cambiar este valor dispara una recarga
  const feedbackRef = useRef(null); // para llevar el feedback a la vista en pantallas chicas
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
        setNextQuestion(null);
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

  // En 375 px el feedback (y el botón "Siguiente") queda debajo de las opciones,
  // tapado por la barra de tabs: al responder se lo lleva suavemente a la vista.
  useEffect(() => {
    if (feedback) feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [feedback]);

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
      setNextQuestion(data.isFinished ? null : data.nextQuestion);
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
    if (!nextQuestion) {
      // No debería pasar con el intento en curso; si pasa, se pide el estado real.
      reload();
      return;
    }
    setQuestion(nextQuestion);
    setNextQuestion(null);
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
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface hover:text-danger"
          aria-label="Cerrar lección"
        >
          <X aria-hidden="true" className="h-6 w-6" />
        </button>
        <div className="flex gap-1.5" aria-label={`${attempt.livesRemaining} de ${attempt.totalLives} vidas`}>
          {hearts.map((alive, i) => (
            // initial={false}: no anima al montar; al perder una vida (alive pasa a false)
            // el corazón "late" una vez.
            <motion.span
              key={i}
              initial={false}
              animate={{ scale: alive ? 1 : [1, 1.45, 1] }}
              transition={{ duration: 0.4 }}
            >
              <Heart
                aria-hidden="true"
                className={`h-6 w-6 transition-colors ${alive ? 'fill-danger text-danger' : 'text-muted'}`}
              />
            </motion.span>
          ))}
        </div>
      </div>

      <ProgressBar
        value={question?.order ?? attempt.currentQuestionOrder}
        max={attempt.totalQuestions}
        label={`Pregunta ${question?.order ?? attempt.currentQuestionOrder} de ${attempt.totalQuestions}`}
      />

      {question && (
        // La pregunta se cruza con un fundido al pasar a la siguiente (key = id).
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="my-6">
              <p className="text-base font-medium leading-relaxed text-text">{question.statement}</p>
            </Card>

            {/* Las opciones se quedan visibles tras responder: la correcta en verde y,
                si falló, la elegida en rojo (feedback.correctOptionKey / selectedOptionKey,
                Endpoint 9). Quedan deshabilitadas: no se puede responder dos veces. */}
            <div className="flex flex-col gap-3">
              {question.options.map((option, i) => (
                <OptionButton
                  key={option.key}
                  option={option}
                  index={i}
                  feedback={feedback}
                  disabled={isSubmitting || Boolean(feedback)}
                  onSelect={() => handleSelect(option.key)}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {feedback && (
          <motion.div
            key="feedback"
            ref={feedbackRef}
            className="scroll-mb-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, x: feedback.isCorrect ? 0 : [0, -8, 8, -6, 6, 0] }}
            transition={{ duration: 0.35 }}
          >
            <Card className={`my-6 ${feedback.isCorrect ? 'border-accent bg-accent/5' : 'border-danger bg-danger/5'}`}>
              <div className={`mb-2 flex items-center gap-2 font-bold ${feedback.isCorrect ? 'text-accent' : 'text-danger'}`}>
                {feedback.isCorrect ? (
                  <CircleCheck aria-hidden="true" className="h-5 w-5" />
                ) : (
                  <CircleX aria-hidden="true" className="h-5 w-5" />
                )}
                <span>{feedback.isCorrect ? '¡Correcto!' : 'Incorrecto'}</span>
                {feedback.xpAwarded > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.15 }}
                    className="ml-auto inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-sm text-accent"
                  >
                    <Zap aria-hidden="true" className="h-3.5 w-3.5 fill-accent" />+{feedback.xpAwarded} XP
                  </motion.span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted">{feedback.explanation}</p>
              <Button
                className="mt-4 w-full sm:w-auto"
                icon={attempt.status === 'in_progress' ? ArrowRight : Trophy}
                onClick={handleNext}
              >
                {attempt.status === 'in_progress' ? 'Siguiente' : 'Ver resultado'}
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function OptionButton({ option, index, feedback, disabled, onSelect }) {
  const answered = Boolean(feedback);
  const isCorrectOption = answered && option.key === feedback.correctOptionKey;
  const isWrongPick = answered && option.key === feedback.selectedOptionKey && !feedback.isCorrect;

  let stateClass = 'border-muted hover:border-info hover:bg-info/10';
  let badgeClass = 'bg-bg text-muted';
  if (isCorrectOption) {
    stateClass = 'border-accent bg-accent/10';
    badgeClass = 'bg-accent text-bg';
  } else if (isWrongPick) {
    stateClass = 'border-danger bg-danger/10';
    badgeClass = 'bg-danger text-text';
  } else if (answered) {
    stateClass = 'border-surface opacity-50';
  }

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 + index * 0.06 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`flex items-center gap-3 rounded-xl border border-hair bg-surface px-4 py-3 text-left text-sm text-text transition-colors disabled:cursor-default ${stateClass}`}
    >
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${badgeClass}`}>
        {isCorrectOption ? (
          <CircleCheck aria-hidden="true" className="h-4 w-4" />
        ) : isWrongPick ? (
          <CircleX aria-hidden="true" className="h-4 w-4" />
        ) : (
          option.key
        )}
      </span>
      <span className="flex-1">{option.text}</span>
    </motion.button>
  );
}

export default LessonScreen;