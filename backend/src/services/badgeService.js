// GUIA_DE_CODIGO.md §0.8 (Evaluación de insignias) + Parte 2, F07
// (catálogo de badges con sus criteriaType exactos). Se invoca al cerrar
// un intento como completed o failed — NO para abandoned: "un intento
// abandonado no otorga XP ni insignias" (Parte 1, F04, endpoint 10).
import { Badge, UserBadge, Progress, Module, User } from '../models/index.js';

const checkModuleCompleted = async (userId, criteriaValue) => {
  const targetModule = await Module.findOne({ order: criteriaValue });
  if (!targetModule) return false;
  const progress = await Progress.findOne({ userId, moduleId: targetModule._id });
  return progress?.status === 'completed';
};

const checkAllModulesCompleted = async (userId) => {
  const totalModules = await Module.countDocuments();
  if (totalModules === 0) return false;
  const completedCount = await Progress.countDocuments({ userId, status: 'completed' });
  return completedCount >= totalModules;
};

const checkPerfectModule = (attempt, moduleDoc) =>
  attempt.status === 'completed' && attempt.correctCount === moduleDoc.questionCount;

const checkStreakDays = (user, criteriaValue) => user.currentStreak >= criteriaValue;

// "Tras acreditar XP, el alumno queda en posición ≤ 3 del ranking semanal
// de su clase" (§0.8) — se mide contando compañeros de la misma classCode
// con weeklyXp estrictamente mayor.
const checkTopThreeWeekly = async (user) => {
  const higherRanked = await User.countDocuments({
    classCode: user.classCode,
    role: 'student',
    weeklyXp: { $gt: user.weeklyXp },
  });
  return higherRanked < 3;
};

const checkSpeedRun = (attempt, criteriaValue) =>
  attempt.status === 'completed' && attempt.durationSeconds !== null && attempt.durationSeconds < criteriaValue;

const CHECKERS = {
  MODULE_COMPLETED: (ctx) => checkModuleCompleted(ctx.userId, ctx.badge.criteriaValue),
  ALL_MODULES_COMPLETED: (ctx) => checkAllModulesCompleted(ctx.userId),
  PERFECT_MODULE: (ctx) => checkPerfectModule(ctx.attempt, ctx.moduleDoc),
  STREAK_DAYS: (ctx) => checkStreakDays(ctx.user, ctx.badge.criteriaValue),
  TOP_THREE_WEEKLY: (ctx) => checkTopThreeWeekly(ctx.user),
  SPEED_RUN: (ctx) => checkSpeedRun(ctx.attempt, ctx.badge.criteriaValue),
};

export const evaluateBadges = async ({ userId, attempt, moduleDoc, user }) => {
  const badges = await Badge.find();
  if (badges.length === 0) return []; // catálogo de F07 (Cesar) todavía no sembrado — no rompe, no otorga nada

  const unlocked = [];

  for (const badge of badges) {
    const checker = CHECKERS[badge.criteriaType];
    if (!checker) continue;

    const qualifies = await checker({ userId, badge, attempt, moduleDoc, user });
    if (!qualifies) continue;

    try {
      await UserBadge.create({ userId, badgeCode: badge.code, sourceAttemptId: attempt._id });
      unlocked.push(badge.code);
    } catch (err) {
      // 11000 = ya la tenía. La idempotencia la garantiza el índice único
      // (userId + badgeCode), no una lectura previa — así lo pide Parte 2, F07.
      if (err.code !== 11000) throw err;
    }
  }

  return unlocked;
};
