// GUIA_DE_CODIGO.md — Parte 1, F06 (endpoint 15: GET /ranking).
// Colección: users (L) — F06 no agrega colecciones nuevas (Parte 2).
import { User, Progress } from '../models/index.js';
import { getWeekStart } from '../utils/date.js';

const SCOPE_FIELD = { weekly: 'weeklyXp', alltime: 'totalXp' };

const resetStaleWeeklyXp = async (classCode, weekStart) => {
  await User.updateMany(
    { classCode, role: 'student', weeklyXpResetAt: { $lt: weekStart } },
    { $set: { weeklyXp: 0, weeklyXpResetAt: weekStart } }
  );
};

const getCompletedModulesByUserId = async (userIds) => {
  const rows = await Progress.aggregate([
    { $match: { userId: { $in: userIds }, status: 'completed' } },
    { $group: { _id: '$userId', count: { $sum: 1 } } },
  ]);
  const map = new Map(rows.map((row) => [String(row._id), row.count]));
  return map;
};

export const getClassRanking = async ({ requesterId, classCode, scope, limit }) => {
  const weekStart = getWeekStart();
  const weekEndsAt = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

  if (scope === 'weekly') {
    await resetStaleWeeklyXp(classCode, weekStart);
  }

  const xpField = SCOPE_FIELD[scope];

  const students = await User.find({ classCode, role: 'student', isActive: true })
    .select(`fullName ${xpField} updatedAt`)
    .sort({ [xpField]: -1, updatedAt: 1 })
    .lean();

  const completedByUserId = await getCompletedModulesByUserId(students.map((s) => s._id));

  const allEntries = students.map((student, index) => ({
    position: index + 1,
    userId: String(student._id),
    fullName: student.fullName,
    xp: student[xpField],
    completedModules: completedByUserId.get(String(student._id)) ?? 0,
    isCurrentUser: String(student._id) === String(requesterId),
  }));

  const requesterEntry = allEntries.find((entry) => entry.isCurrentUser);

  return {
    scope,
    classCode,
    weekStartsAt: weekStart.toISOString(),
    weekEndsAt: weekEndsAt.toISOString(),
    entries: allEntries.slice(0, limit),
    currentUser: requesterEntry
      ? { position: requesterEntry.position, xp: requesterEntry.xp, totalStudents: allEntries.length }
      : null,
  };
};
