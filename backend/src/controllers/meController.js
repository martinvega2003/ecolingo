import { User } from '../models/index.js';
import { getOrCreateProgressForUser } from '../services/progressService.js';

/**
 * F03 — Endpoint 12: GET /me/progress
 * GUIA_DE_CODIGO.md, Parte 1. Resumen general del alumno.
 */
export async function getProgress(req, res, next) {
  try {
    const { modules, progressByModuleId } = await getOrCreateProgressForUser(req.user.id);

    const values = [...progressByModuleId.values()];
    const completedModules = values.filter((p) => p.status === 'completed').length;
    const totalXp = values.reduce((sum, p) => sum + p.xpEarned, 0);
    const totalAttempts = values.reduce((sum, p) => sum + p.attemptCount, 0);
    const perfectModules = values.filter((p) => p.isPerfect).length;

    const user = await User.findById(req.user.id)
      .select('weeklyXp currentStreak longestStreak lastActivityDate')
      .lean();

    res.json({
      totalXp,
      weeklyXp: user?.weeklyXp ?? 0,
      currentStreak: user?.currentStreak ?? 0,
      longestStreak: user?.longestStreak ?? 0,
      lastActivityDate: user?.lastActivityDate ?? null,
      completedModules,
      totalModules: modules.length,
      completionPercentage: modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0,
      totalAttempts,
      perfectModules,
    });
  } catch (err) {
    next(err);
  }
}
