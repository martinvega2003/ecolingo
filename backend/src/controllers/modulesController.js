import mongoose from 'mongoose';
import { Module, User, Badge, UserBadge } from '../models/index.js'; // agregar los 4 al barrel — ver nota al final
import { badRequest, notFound } from '../utils/apiError.js';
import { getOrCreateProgressForUser } from '../services/progressService.js';

/**
 * F03 — Endpoint 5: GET /modules
 * GUIA_DE_CODIGO.md, Parte 1. El userId sale siempre de req.user.id
 * (requireAuth), nunca de un parámetro — D-11.
 */
export async function getModules(req, res, next) {
  try {
    const { modules, progressByModuleId } = await getOrCreateProgressForUser(req.user.id);

    const modulesResponse = modules.map((mod, index) => {
      const progress = progressByModuleId.get(String(mod._id));
      const previous = index > 0 ? modules[index - 1] : null;

      const base = {
        id: String(mod._id),
        order: mod.order,
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        keyConcepts: mod.keyConcepts,
        questionCount: mod.questionCount,
        xpReward: mod.xpReward,
        status: progress.status,
        xpEarned: progress.xpEarned,
        bestCorrectAnswers: progress.bestCorrectAnswers,
        isPerfect: progress.isPerfect,
        attemptCount: progress.attemptCount,
        firstCompletedAt: progress.firstCompletedAt,
      };

      if (progress.status === 'locked' && previous) {
        base.unlockRequirement = `Completá el módulo ${previous.order}`;
      }

      return base;
    });

    const completedModules = modulesResponse.filter((m) => m.status === 'completed').length;
    const totalXp = modulesResponse.reduce((sum, m) => sum + m.xpEarned, 0);
    const nextModule = modulesResponse.find((m) => m.status === 'available');

    // weeklyXp y currentStreak viven en el documento User (Parte 2, F01),
    // no en progress. requireAuth solo adjunta { id, role, fullName,
    // classCode } a req.user (ver middlewares/requireAuth.js) — no el
    // documento completo — así que se busca acá.
    const user = await User.findById(req.user.id).select('weeklyXp currentStreak').lean();

    res.json({
      modules: modulesResponse,
      summary: {
        totalModules: modules.length,
        completedModules,
        totalXp,
        weeklyXp: user?.weeklyXp ?? 0,
        currentStreak: user?.currentStreak ?? 0,
        nextModuleOrder: nextModule?.order ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * F03 — Endpoint 6: GET /modules/:moduleId
 * Detalle de un módulo, sin preguntas. Pantalla de confirmación previa al intento.
 *
 * badge resuelto contra Badge/UserBadge (Parte 2, F07 — schema confirmado
 * por Martín). Shape exacto: { code, name, emoji, isUnlocked }.
 */
export async function getModuleDetail(req, res, next) {
  try {
    const { moduleId } = req.params;

    if (!mongoose.isValidObjectId(moduleId)) {
      return next(badRequest('MALFORMED_ID', 'El id del módulo no es válido.'));
    }

    const mod = await Module.findOne({ _id: moduleId, isPublished: true }).lean();
    if (!mod) {
      return next(notFound('MODULE_NOT_FOUND', 'El módulo no existe.'));
    }

    const { progressByModuleId } = await getOrCreateProgressForUser(req.user.id);
    const progress = progressByModuleId.get(String(mod._id));

    const badgeDoc = await Badge.findOne({ code: mod.badgeCode }).lean();
    const unlocked = badgeDoc
      ? await UserBadge.exists({ userId: req.user.id, badgeCode: mod.badgeCode })
      : false;

    res.json({
      id: String(mod._id),
      order: mod.order,
      slug: mod.slug,
      title: mod.title,
      description: mod.description,
      keyConcepts: mod.keyConcepts,
      questionCount: mod.questionCount,
      xpReward: mod.xpReward,
      xpPerCorrectAnswer: mod.xpPerCorrectAnswer,
      status: progress.status,
      badge: badgeDoc
        ? { code: badgeDoc.code, name: badgeDoc.name, emoji: badgeDoc.emoji, isUnlocked: Boolean(unlocked) }
        : null,
    });
  } catch (err) {
    next(err);
  }
}
