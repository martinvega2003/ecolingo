// F05 — Resultado del Módulo (GUIA_DE_CODIGO.md corregida, Parte 1,
// endpoint 11). Sin colecciones nuevas: lee moduleAttempts, progress
// (indirectamente vía módulo), userBadges y users, todos ya definidos.
import { ModuleAttempt, Module, Badge, User } from '../models/index.js';
import { notFound, forbidden } from '../utils/apiError.js';
import { getWeekStart } from '../utils/date.js';

const resetStaleWeeklyXpIfNeeded = async (user) => {
  const weekStart = getWeekStart();
  if (!user.weeklyXpResetAt || user.weeklyXpResetAt < weekStart) {
    user.weeklyXp = 0;
    user.weeklyXpResetAt = weekStart;
    await user.save();
  }
};

export const getModuleResult = async (authUser, attemptId) => {
  const attempt = await ModuleAttempt.findById(attemptId);
  if (!attempt) {
    throw notFound('ATTEMPT_NOT_FOUND', 'El intento referenciado no existe.');
  }
  if (String(attempt.userId) !== String(authUser.id)) {
    throw forbidden('NOT_RESOURCE_OWNER', 'El intento pertenece a otro alumno.');
  }

  const moduleDoc = await Module.findById(attempt.moduleId);
  const user = await User.findById(authUser.id);
  await resetStaleWeeklyXpIfNeeded(user);

  const totalQuestions = moduleDoc.questionCount;
  const accuracyPercentage = Math.round((attempt.correctCount / totalQuestions) * 100);
  const isPerfect = attempt.correctCount === totalQuestions;
  const isFirstCompletion = attempt.xpEarned > 0;

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
  const positionPrevious = rankWithXp(user.weeklyXp - attempt.xpEarned);

  const nextModuleDoc = await Module.findOne({ order: moduleDoc.order + 1 });

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
      xpEarned: attempt.xpEarned,
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
          isUnlocked: true,
        }
      : null,
  };
};
