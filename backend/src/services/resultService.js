// F05 — Resultado del Módulo (GUIA_DE_CODIGO.md corregida, Parte 1,
// endpoint 11). Sin colecciones nuevas: lee moduleAttempts, progress
// (indirectamente vía módulo), userBadges y users, todos ya definidos.
import mongoose from 'mongoose';
import { ModuleAttempt, Module, Badge, User } from '../models/index.js';
import { badRequest, notFound, forbidden } from '../utils/apiError.js';
import { getWeekStart } from '../utils/date.js';
import { getOrCreateProgress } from './progressService.js';
import { resetStaleWeeklyXp } from './rankingService.js';

export const getModuleResult = async (authUser, attemptId) => {
  // Mismo criterio que F04 (lessonService.js) — §0.1: MALFORMED_ID. Sin
  // esto, un id inválido explotaba en un CastError → 500.
  if (!mongoose.Types.ObjectId.isValid(attemptId)) {
    throw badRequest('MALFORMED_ID', 'attemptId no es un ObjectId válido.');
  }

  const attempt = await ModuleAttempt.findById(attemptId);
  if (!attempt) {
    throw notFound('ATTEMPT_NOT_FOUND', 'El intento referenciado no existe.');
  }
  if (String(attempt.userId) !== String(authUser.id)) {
    throw forbidden('NOT_RESOURCE_OWNER', 'El intento pertenece a otro alumno.');
  }

  const moduleDoc = await Module.findById(attempt.moduleId);
  const requester = await User.findById(authUser.id).select('classCode');

  // D-09 (reinicio semanal perezoso) aplicado a TODA la clase, igual que
  // GET /ranking (F06). Antes se reseteaba solo al solicitante: el resto
  // de la clase se comparaba con su weeklyXp de la semana anterior y la
  // posición mostrada acá no coincidía con la de /ranking.
  await resetStaleWeeklyXp(requester.classCode, getWeekStart());
  const user = await User.findById(authUser.id);

  const totalQuestions = moduleDoc.questionCount;
  const accuracyPercentage = Math.round((attempt.correctCount / totalQuestions) * 100);
  const isPerfect = attempt.correctCount === totalQuestions;
  // attempt.xpEarned es un acumulado PROVISORIO (lessonService.js): también
  // sube en intentos que terminan failed/abandoned, pero esos no acreditan
  // XP (§0.8). Lo que se informa como ganado es solo lo acreditado.
  const isCompleted = attempt.status === 'completed';
  const xpCredited = isCompleted ? attempt.xpEarned : 0;
  const isFirstCompletion = isCompleted && attempt.xpEarned > 0;

  const badgesUnlocked = await Badge.find({ code: { $in: attempt.badgesUnlocked ?? [] } }).select(
    'code name emoji description'
  );

  const classmates = await User.find({
    classCode: user.classCode,
    role: 'student',
    isActive: true,
  }).select('_id weeklyXp updatedAt');

  const rankWithXp = (hypotheticalXp) => {
    const sorted = classmates
      .map((c) =>
        String(c._id) === String(user._id)
          ? { _id: c._id, weeklyXp: hypotheticalXp, updatedAt: c.updatedAt }
          : { _id: c._id, weeklyXp: c.weeklyXp, updatedAt: c.updatedAt }
      )
      .sort((a, b) => b.weeklyXp - a.weeklyXp || a.updatedAt - b.updatedAt);
    return sorted.findIndex((c) => String(c._id) === String(user._id)) + 1;
  };

  const positionCurrent = rankWithXp(user.weeklyXp);
  // Si el intento es de una semana anterior, su XP ya no está en el
  // weeklyXp actual — no se resta (evita un XP hipotético negativo).
  const xpEarnedThisWeek = attempt.finishedAt && attempt.finishedAt >= getWeekStart() ? xpCredited : 0;
  const positionPrevious = rankWithXp(Math.max(0, user.weeklyXp - xpEarnedThisWeek));

  const nextModuleDoc = await Module.findOne({ order: moduleDoc.order + 1 });
  // isUnlocked real, no fijo en true: en un intento failed el siguiente
  // módulo puede seguir bloqueado. getOrCreateProgress (CONTRATOS_INTERNOS.md,
  // API por módulo) re-evalúa 'locked' en cada acceso — no se duplica la regla.
  const nextProgress = nextModuleDoc ? await getOrCreateProgress(user._id, nextModuleDoc) : null;

  return {
    attempt: {
      id: attempt.id,
      status: attempt.status,
      correctCount: attempt.correctCount,
      totalQuestions,
      accuracyPercentage,
      isPerfect,
      livesRemaining: attempt.livesRemaining,
      durationSeconds: attempt.durationSeconds,
      startedAt: attempt.startedAt,
      finishedAt: attempt.finishedAt,
    },
    module: {
      id: moduleDoc.id,
      order: moduleDoc.order,
      title: moduleDoc.title,
      xpReward: moduleDoc.xpReward,
    },
    rewards: {
      xpEarned: xpCredited,
      isFirstCompletion,
      totalXpAfter: user.totalXp,
      badgesUnlocked: badgesUnlocked.map((b) => ({
        code: b.code,
        name: b.name,
        emoji: b.emoji,
        description: b.description,
      })),
    },
    ranking: {
      position: positionCurrent,
      totalStudents: classmates.length,
      positionsGained: positionPrevious - positionCurrent,
    },
    nextModule: nextModuleDoc
      ? {
          id: nextModuleDoc.id,
          order: nextModuleDoc.order,
          title: nextModuleDoc.title,
          isUnlocked: nextProgress.status !== 'locked',
        }
      : null,
  };
};
