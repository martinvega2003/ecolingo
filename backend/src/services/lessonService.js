// GUIA_DE_CODIGO.md — Parte 1, F04 (endpoints 7, 8, 9, 10) + §0.8
// (reglas de XP, vidas y racha). El servicio más complejo del proyecto —
// "el corazón de la gamificación", según el propio documento.
import mongoose from 'mongoose';
import { Module, Question, ModuleAttempt, User } from '../models/index.js';
import { badRequest, notFound, forbidden, conflict, unprocessable } from '../utils/apiError.js';
import { assertModuleUnlocked, getOrCreateProgress, applyCompletionToProgress, applyNonCompletionToProgress } from './progressService.js';
import { registerActivity } from './gamificationService.js';
import { evaluateBadges } from './badgeService.js';

const serializeAttempt = (attempt, moduleDoc) => ({
  id: attempt.id,
  moduleId: attempt.moduleId.toString(),
  moduleTitle: moduleDoc.title,
  status: attempt.status,
  livesRemaining: attempt.livesRemaining,
  totalLives: 3,
  currentQuestionOrder: attempt.currentQuestionOrder,
  totalQuestions: moduleDoc.questionCount,
  correctCount: attempt.correctCount,
  startedAt: attempt.startedAt,
});

const serializePublicQuestion = (question) => ({
  id: question.id,
  order: question.order,
  statement: question.statement,
  options: question.options.map((o) => ({ key: o.key, text: o.text })),
});

// Endpoint 7 — POST /modules/:moduleId/attempts
export const startAttempt = async ({ userId, moduleId }) => {
  if (!mongoose.Types.ObjectId.isValid(moduleId)) {
    throw badRequest('MALFORMED_ID', 'moduleId no es un ObjectId válido.');
  }

  const moduleDoc = await Module.findOne({ _id: moduleId, isPublished: true });
  if (!moduleDoc) {
    throw notFound('MODULE_NOT_FOUND', 'El módulo no existe o no está publicado.');
  }

  await assertModuleUnlocked(userId, moduleDoc); // 409 MODULE_LOCKED si corresponde

  let attempt;
  try {
    attempt = await ModuleAttempt.create({ userId, moduleId: moduleDoc._id });
  } catch (err) {
    if (err.code === 11000) {
      // Índice único parcial de ModuleAttempt.js: ya hay un in_progress.
      const active = await ModuleAttempt.findOne({ userId, moduleId: moduleDoc._id, status: 'in_progress' });
      throw conflict('ATTEMPT_ALREADY_ACTIVE', 'Ya existe un intento en curso para este módulo.', [
        { field: 'attemptId', issue: active?.id ?? '' },
      ]);
    }
    throw err;
  }

  const question = await Question.findOne({ moduleId: moduleDoc._id, order: 1 }).select(Question.publicProjection());

  return { attempt: serializeAttempt(attempt, moduleDoc), question: serializePublicQuestion(question) };
};

// Endpoint 8 — GET /attempts/:attemptId
export const getAttemptState = async ({ userId, attemptId }) => {
  if (!mongoose.Types.ObjectId.isValid(attemptId)) {
    throw badRequest('MALFORMED_ID', 'attemptId no es un ObjectId válido.');
  }

  const attempt = await ModuleAttempt.findById(attemptId);
  if (!attempt) throw notFound('ATTEMPT_NOT_FOUND', 'El intento no existe.');
  if (String(attempt.userId) !== String(userId)) {
    throw forbidden('NOT_RESOURCE_OWNER', 'Este intento pertenece a otro alumno.');
  }

  const moduleDoc = await Module.findById(attempt.moduleId);

  if (attempt.status !== 'in_progress') {
    // El frontend redirige a /resultado/:attemptId cuando question es null.
    return { attempt: serializeAttempt(attempt, moduleDoc), question: null };
  }

  const question = await Question.findOne({ moduleId: attempt.moduleId, order: attempt.currentQuestionOrder }).select(
    Question.publicProjection()
  );

  return { attempt: serializeAttempt(attempt, moduleDoc), question: serializePublicQuestion(question) };
};

// Endpoint 9 — POST /attempts/:attemptId/answers
export const answerQuestion = async ({ userId, attemptId, questionId, selectedOptionKey, timeToAnswerSeconds }) => {
  if (!mongoose.Types.ObjectId.isValid(attemptId)) {
    throw badRequest('MALFORMED_ID', 'attemptId no es un ObjectId válido.');
  }
  if (!['A', 'B', 'C'].includes(selectedOptionKey)) {
    throw badRequest('VALIDATION_ERROR', 'Uno o más campos no son válidos.', [
      { field: 'selectedOptionKey', issue: 'Debe ser "A", "B" o "C".' },
    ]);
  }

  const attempt = await ModuleAttempt.findById(attemptId);
  if (!attempt) throw notFound('ATTEMPT_NOT_FOUND', 'El intento no existe.');
  if (String(attempt.userId) !== String(userId)) {
    throw forbidden('NOT_RESOURCE_OWNER', 'Este intento pertenece a otro alumno.');
  }
  if (attempt.status !== 'in_progress') {
    throw unprocessable('ATTEMPT_ALREADY_FINISHED', 'El intento ya está cerrado.');
  }

  // Cubre doble clic y reenvío: questionId debe corresponder EXACTAMENTE
  // a la pregunta actual del intento (riesgo señalado en Parte 3, F04).
  const question = await Question.findOne({ moduleId: attempt.moduleId, order: attempt.currentQuestionOrder });
  if (!question || String(question._id) !== String(questionId)) {
    throw unprocessable('QUESTION_ALREADY_ANSWERED', 'La pregunta no corresponde al estado actual del intento.');
  }

  const moduleDoc = await Module.findById(attempt.moduleId);
  const isCorrect = question.correctOptionKey === selectedOptionKey;
  const clampedTime = Math.min(600, Math.max(0, Math.round(timeToAnswerSeconds)));

  // Regla anti-farming (D-08): solo se acredita XP si esta corrida sigue
  // siendo la primera finalización pendiente del módulo. Se revisa en
  // cada respuesta — el índice único parcial de moduleAttempts impide
  // que exista otro intento in_progress simultáneo del mismo módulo, así
  // que no puede cambiar a mitad de este intento.
  const progressBefore = await getOrCreateProgress(userId, moduleDoc);
  const isEligibleForXp = progressBefore.xpEarned === 0;
  const xpAwarded = isCorrect && isEligibleForXp ? moduleDoc.xpPerCorrectAnswer : 0;

  attempt.answers.push({
    questionId: question._id,
    questionOrder: question.order,
    selectedOptionKey,
    isCorrect,
    timeToAnswerSeconds: clampedTime,
  });

  if (isCorrect) {
    attempt.correctCount += 1;
    // Acumulado PROVISORIO del intento. Solo se acredita de verdad a
    // users.totalXp/weeklyXp si el intento cierra como "completed" — un
    // intento failed/abandoned no otorga XP aunque haya tenido respuestas
    // correctas en el camino (Parte 1, F04, endpoint 10, y §0.8).
    attempt.xpEarned += xpAwarded;
  } else {
    attempt.livesRemaining -= 1;
  }

  const isLastQuestion = attempt.currentQuestionOrder >= moduleDoc.questionCount;
  let nextQuestion = null;
  let isFinished = false;

  if (!isCorrect && attempt.livesRemaining <= 0) {
    attempt.status = 'failed';
    attempt.finishedAt = new Date();
    isFinished = true;
  } else if (isLastQuestion) {
    attempt.status = 'completed';
    attempt.finishedAt = new Date();
    isFinished = true;
  } else {
    attempt.currentQuestionOrder += 1;
  }

  await attempt.save(); // dispara el pre-save que calcula durationSeconds

  if (isFinished) {
    // Orden fijo de escrituras al cerrar (riesgo señalado en Parte 3, F04):
    // 1) moduleAttempts (ya guardado arriba) → 2) progress → 3) users → 4) userBadges.
    if (attempt.status === 'completed') {
      await applyCompletionToProgress({ userId, moduleDoc, attempt });
    } else {
      await applyNonCompletionToProgress({ userId, moduleDoc, attempt });
    }

    const xpToCredit = attempt.status === 'completed' ? attempt.xpEarned : 0;
    await registerActivity({ userId, xpAmount: xpToCredit });

    // evaluateBadges no corre para "abandoned" — eso pasa por el
    // endpoint 10 (abandon), no por acá, así que este tramo siempre es
    // completed o failed.
    const userAfter = await User.findById(userId); // con racha/XP ya al día, para STREAK_DAYS y TOP_THREE_WEEKLY
    const badgesUnlocked = await evaluateBadges({ userId, attempt, moduleDoc, user: userAfter });

    if (badgesUnlocked.length > 0) {
      attempt.badgesUnlocked = badgesUnlocked;
      await attempt.save();
    }
  } else {
    nextQuestion = await Question.findOne({ moduleId: attempt.moduleId, order: attempt.currentQuestionOrder }).select(
      Question.publicProjection()
    );
  }

  return {
    feedback: {
      isCorrect,
      correctOptionKey: question.correctOptionKey,
      selectedOptionKey,
      explanation: question.explanation,
      xpAwarded,
    },
    attempt: serializeAttempt(attempt, moduleDoc),
    nextQuestion: nextQuestion ? serializePublicQuestion(nextQuestion) : null,
    isFinished,
    // Apunta al endpoint 11 (F05, Persona A — Cesar), literal del
    // contrato. No resuelve hasta que él lo construya; es esperable que
    // dé 404 hasta entonces.
    ...(isFinished ? { resultUrl: `/api/v1/attempts/${attempt.id}/result` } : {}),
  };
};

// Endpoint 10 — POST /attempts/:attemptId/abandon
export const abandonAttempt = async ({ userId, attemptId }) => {
  if (!mongoose.Types.ObjectId.isValid(attemptId)) {
    throw badRequest('MALFORMED_ID', 'attemptId no es un ObjectId válido.');
  }

  const attempt = await ModuleAttempt.findById(attemptId);
  if (!attempt) throw notFound('ATTEMPT_NOT_FOUND', 'El intento no existe.');
  if (String(attempt.userId) !== String(userId)) {
    throw forbidden('NOT_RESOURCE_OWNER', 'Este intento pertenece a otro alumno.');
  }
  if (attempt.status !== 'in_progress') {
    throw unprocessable('ATTEMPT_ALREADY_FINISHED', 'El intento ya está cerrado.');
  }

  attempt.status = 'abandoned';
  attempt.finishedAt = new Date();
  await attempt.save();

  const moduleDoc = await Module.findById(attempt.moduleId);
  await applyNonCompletionToProgress({ userId, moduleDoc, attempt });

  // Abandonar SÍ cuenta como actividad real para la racha (el alumno
  // entró a jugar hoy), pero NO otorga XP ni insignias — explícito en
  // Parte 1, F04, endpoint 10.
  await registerActivity({ userId, xpAmount: 0 });

  return {
    attempt: {
      id: attempt.id,
      status: attempt.status,
      correctCount: attempt.correctCount,
      totalQuestions: moduleDoc.questionCount,
      durationSeconds: attempt.durationSeconds,
      finishedAt: attempt.finishedAt,
    },
    message: 'Tu progreso quedó guardado. Podés volver a intentarlo cuando quieras.',
  };
};
