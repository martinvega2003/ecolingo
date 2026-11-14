import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CircleCheck, CircleX, Heart, Trophy, X, Zap } from 'lucide-react';
import client from '../api/client.js';
import { fetchAttempt, submitAnswer, abandonAttempt } from '../api/lessonApi.js';
import { getModuleTheme } from '../theme/moduleTheme.js';
import { now } from '../utils/time.js';
import Button from '../components/common/Button.jsx';
import ModuleIcon from '../components/common/ModuleIcon.jsx';
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
  // Orden del módulo (1-5), solo para elegir su color e icono. El Endpoint 8
  // devuelve moduleId y moduleTitle pero no el orden, así que se busca en
  // GET /modules (Endpoint 5). Si esa llamada falla, la lección sigue igual
  // con el color general.
  const [moduleOrder, setModuleOrder] = useState(null);
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

  const moduleId = attempt?.moduleId;
  useEffect(() => {
    if (!moduleId) return undefined;
    let ignore = false;
    client
      .get('/modules')
      .then((res) => {
        const found = res.data.modules.find((m) => m.id === moduleId);
        if (!ignore && found) setModuleOrder(found.order);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [moduleId]);

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
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Spinner label="Cargando lección…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-bg p-6">
        <ErrorState title="No pudimos cargar la lección" description={error} onRetry={reload} />
        <Button variant="ghost" onClick={() => navigate('/mapa', { replace: true })}>
          Volver al mapa
        </Button>
      </div>
    );
  }

  if (!attempt) return null;

  const theme = getModuleTheme(moduleOrder);
  const hearts = Array.from({ length: attempt.totalLives }, (_, i) => i < attempt.livesRemaining);
  const questionNumber = question?.order ?? attempt.currentQuestionOrder;
  // La barra avanza al responder: cuenta las preguntas ya contestadas.
  const answeredCount = feedback ? questionNumber : questionNumber - 1;

  return (
    // Modo concentrado: sin cabecera ni tabs (ver App.jsx). Solo la X para
    // salir, el progreso y las vidas.
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 pt-4">
        <button
          type="button"
          onClick={handleAbandon}
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface hover:text-danger"
          aria-label="Cerrar lección"
        >
          <X aria-hidden="true" className="h-6 w-6" />
        </button>
        <div className="flex-1">
          <ProgressBar value={answeredCount} max={attempt.totalQuestions} size="lg" barClassName={theme.bg} />
        </div>
        <div className="flex gap-1" aria-label={`${attempt.livesRemaining} de ${attempt.totalLives} vidas`}>
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
                className={`h-6 w-6 transition-colors ${alive ? 'fill-danger text-danger' : 'text-surface-2'}`}
              />
            </motion.span>
          ))}
        </div>
      </header>

      {/* pb-56: deja lugar para la franja de feedback fija, así no tapa las opciones */}
      <main className={`mx-auto w-full max-w-3xl flex-1 px-4 pt-6 ${feedback ? 'pb-56' : 'pb-8'}`}>
        <div className="mb-4 flex items-center gap-2">
          <ModuleIcon order={moduleOrder} size="sm" />
          <p className={`text-xs font-extrabold uppercase tracking-wider ${theme.text}`}>
            {attempt.moduleTitle} · Pregunta {questionNumber} de {attempt.totalQuestions}
          </p>
        </div>

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
              <h1 className="mb-6 text-lg font-bold leading-relaxed text-text sm:text-xl">{question.statement}</h1>

              {/* Tres opciones (A, B, C — contrato del Endpoint 9). Se quedan
                  visibles tras responder: la correcta en verde y, si falló, la
                  elegida en rojo. Quedan deshabilitadas: no se responde dos veces. */}
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
      </main>

      {/* Franja de feedback fija abajo: verde o roja, con la explicación y "Siguiente" */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            key="feedback"
            role="status"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className={`fixed inset-x-0 bottom-0 z-30 max-h-[60vh] overflow-y-auto border-t-4 bg-surface ${
              feedback.isCorrect ? 'border-accent' : 'border-danger'
            }`}
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex min-w-0 flex-1 gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    feedback.isCorrect ? 'bg-accent/15 text-accent' : 'bg-danger/15 text-danger'
                  }`}
                >
                  {feedback.isCorrect ? (
                    <CircleCheck aria-hidden="true" className="h-6 w-6" />
                  ) : (
                    <CircleX aria-hidden="true" className="h-6 w-6" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className={`flex flex-wrap items-center gap-2 text-base font-extrabold ${feedback.isCorrect ? 'text-accent' : 'text-danger'}`}>
                    {feedback.isCorrect ? '¡Correcto!' : 'Incorrecto'}
                    {feedback.xpAwarded > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.15 }}
                        className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-sm text-accent"
                      >
                        <Zap aria-hidden="true" className="h-3.5 w-3.5 fill-accent" />+{feedback.xpAwarded} XP
                      </motion.span>
                    )}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-text/90">{feedback.explanation}</p>
                </div>
              </div>
              <Button
                className="w-full shrink-0 py-3 sm:w-auto sm:px-8"
                variant={feedback.isCorrect ? 'primary' : 'danger'}
                icon={attempt.status === 'in_progress' ? ArrowRight : Trophy}
                onClick={handleNext}
                autoFocus
              >
                {attempt.status === 'in_progress' ? 'Siguiente' : 'Ver resultado'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Opción de respuesta: botón grande con la letra y borde inferior "3D".
function OptionButton({ option, index, feedback, disabled, onSelect }) {
  const answered = Boolean(feedback);
  const isCorrectOption = answered && option.key === feedback.correctOptionKey;
  const isWrongPick = answered && option.key === feedback.selectedOptionKey && !feedback.isCorrect;

  let stateClass = 'border-surface-2 bg-surface hover:border-info hover:bg-info/10';
  let badgeClass = 'bg-surface-2 text-text';
  if (isCorrectOption) {
    stateClass = 'border-accent bg-accent/10';
    badgeClass = 'bg-accent text-bg';
  } else if (isWrongPick) {
    stateClass = 'border-danger bg-danger/10';
    badgeClass = 'bg-danger text-text';
  } else if (answered) {
    stateClass = 'border-surface-2 bg-surface opacity-50';
  }

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 + index * 0.06 }}
      whileTap={disabled ? undefined : { y: 2 }}
      className={`flex items-center gap-3 rounded-2xl border-2 border-b-4 px-4 py-3.5 text-left text-sm font-semibold text-text transition-colors disabled:cursor-default sm:text-base ${stateClass}`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${badgeClass}`}>
        {isCorrectOption ? (
          <CircleCheck aria-hidden="true" className="h-5 w-5" />
        ) : isWrongPick ? (
          <CircleX aria-hidden="true" className="h-5 w-5" />
        ) : (
          option.key
        )}
      </span>
      <span className="flex-1">{option.text}</span>
    </motion.button>
  );
}

export default LessonScreen;
