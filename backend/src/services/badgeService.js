// GUIA_DE_CODIGO.md §0.8 (Evaluación de insignias) + Parte 2, F07
// (catálogo de badges con sus criteriaType exactos). Se invoca al cerrar
// un intento como completed o failed — NO para abandoned: "un intento
// abandonado no otorga XP ni insignias" (Parte 1, F04, endpoint 10).
import { Badge, UserBadge, Progress, Module, User } from '../models/index.js';
import { getWeekStart } from '../utils/date.js';
import { resetStaleWeeklyXp } from './rankingService.js';

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
// de su clase" (§0.8, Evaluación de insignias).
//
// 🐛 Corregido: antes se evaluaba en CUALQUIER cierre (también failed) y
// sin mirar el XP. Un alumno con 0 XP en una clase donde solo dos
// compañeros habían jugado quedaba "3.º" y se llevaba la insignia sin
// haber ganado nada. Ahora:
// - solo si este intento acreditó XP (completed con xpEarned > 0) — "tras
//   acreditar XP";
// - la posición se mide con las mismas reglas que GET /ranking (F06):
//   solo alumnos activos, reinicio semanal perezoso aplicado (D-09) y
//   desempate por updatedAt ascendente.
const checkTopThreeWeekly = async (user, attempt) => {
  if (attempt.status !== 'completed' || attempt.xpEarned <= 0) return false;
  if (!user.weeklyXp || user.weeklyXp <= 0) return false;

  await resetStaleWeeklyXp(user.classCode, getWeekStart());

  const higherRanked = await User.countDocuments({
    classCode: user.classCode,
    role: 'student',
    isActive: true,
    _id: { $ne: user._id },
    $or: [
      { weeklyXp: { $gt: user.weeklyXp } },
      { weeklyXp: user.weeklyXp, updatedAt: { $lt: user.updatedAt } },
    ],
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
  TOP_THREE_WEEKLY: (ctx) => checkTopThreeWeekly(ctx.user, ctx.attempt),
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
