// GUIA_DE_CODIGO.md — Parte 1, F03 (endpoint 5) + Parte 3, F04.
//
// Este archivo lo escribieron dos personas en paralelo: F04 salió de dev
// antes de que F03 existiera ahí, así que Persona A no tenía estas funciones
// para reusar y escribió las suyas. Reconciliado acá, sin perder ninguna
// de las dos APIs:
// - Por módulo (usada por F04, lessonService.js): getOrCreateProgress,
//   assertModuleUnlocked, applyCompletionToProgress,
//   applyNonCompletionToProgress.
// - Por alumno (usada por F03, modulesController.js):
//   getOrCreateProgressForUser, recalculateUnlocks.
// Las dos comparten isModuleUnlockable() — una sola fuente de verdad
// para la regla de desbloqueo, en vez de que cada camino la reimplemente.
//
// Bug corregido en AMBOS caminos (no solo en el de F04, donde lo
// encontramos primero): un progress en 'locked' se recalculaba una sola
// vez, al crearse, y quedaba fijo aunque después se completara el
// módulo anterior. 'available' y 'completed' son estados estables
// (nada los revierte); 'locked' no, porque depende de una condición
// externa (el progress del módulo anterior) que puede cambiar después.
import { Module, Progress } from '../models/index.js';
import { conflict } from '../utils/apiError.js';

const isModuleUnlockable = async (userId, moduleDoc, previousModuleDoc) => {
  if (moduleDoc.order === 1) return true;
  if (!previousModuleDoc) return false;
  const previousProgress = await Progress.findOne({ userId, moduleId: previousModuleDoc._id });
  return previousProgress?.status === 'completed';
};

// ────────────────────────────────────────────────────────────────
// API por módulo — F04 (lessonService.js)
// ────────────────────────────────────────────────────────────────

export const getOrCreateProgress = async (userId, moduleDoc) => {
  const existing = await Progress.findOne({ userId, moduleId: moduleDoc._id });

  if (existing) {
    if (existing.status === 'locked') {
      const previousModule = await Module.findOne({ order: moduleDoc.order - 1 });
      if (await isModuleUnlockable(userId, moduleDoc, previousModule)) {
        existing.status = 'available';
        await existing.save();
      }
    }
    return existing;
  }

  const previousModule = await Module.findOne({ order: moduleDoc.order - 1 });
  const status = (await isModuleUnlockable(userId, moduleDoc, previousModule)) ? 'available' : 'locked';
  return Progress.create({ userId, moduleId: moduleDoc._id, status });
};

export const assertModuleUnlocked = async (userId, moduleDoc) => {
  const progress = await getOrCreateProgress(userId, moduleDoc);
  if (progress.status === 'locked') {
    throw conflict('MODULE_LOCKED', 'El módulo anterior no está completado.');
  }
  return progress;
};

export const applyCompletionToProgress = async ({ userId, moduleDoc, attempt }) => {
  const progress = await getOrCreateProgress(userId, moduleDoc);
  const isFirstCompletion = progress.xpEarned === 0;

  progress.status = 'completed';
  progress.attemptCount += 1;
  progress.lastAttemptAt = new Date();
  progress.bestCorrectAnswers = Math.max(progress.bestCorrectAnswers, attempt.correctCount);
  progress.isPerfect = progress.isPerfect || attempt.correctCount === moduleDoc.questionCount;

  if (progress.bestDurationSeconds === null || attempt.durationSeconds < progress.bestDurationSeconds) {
    progress.bestDurationSeconds = attempt.durationSeconds;
  }

  if (isFirstCompletion) {
    progress.xpEarned = attempt.xpEarned;
    progress.firstCompletedAt = new Date();
  }

  await progress.save();

  // Honra el diseño de Cesar: adelanta el desbloqueo del siguiente
  // módulo YA (no espera al próximo GET /modules), y deja el resto de
  // los progress del alumno consistentes en la base para cualquier otra
  // lectura directa (analítica, panel del docente, etc.).
  await recalculateUnlocks(userId);

  return { progress, isFirstCompletion };
};

export const applyNonCompletionToProgress = async ({ userId, moduleDoc, attempt }) => {
  const progress = await getOrCreateProgress(userId, moduleDoc);
  progress.attemptCount += 1;
  progress.lastAttemptAt = new Date();
  await progress.save();
  return progress;
};

// ────────────────────────────────────────────────────────────────
// API por alumno — F03 (modulesController.js)
// ────────────────────────────────────────────────────────────────

export async function getOrCreateProgressForUser(userId) {
  const modules = await Module.find({ isPublished: true }).sort({ order: 1 }).lean();
  const existing = await Progress.find({ userId }).lean();
  const byModuleId = new Map(existing.map((p) => [String(p.moduleId), p]));

  const missing = [];
  let previousCompleted = true;
  const progressByModuleId = new Map();

  for (const mod of modules) {
    const found = byModuleId.get(String(mod._id));

    if (found) {
      // Mismo fix que en getOrCreateProgress: no confiar en un 'locked'
      // guardado si la condición de desbloqueo ya cambió.
      if (found.status === 'locked' && previousCompleted) {
        await Progress.updateOne({ _id: found._id }, { $set: { status: 'available' } });
        found.status = 'available';
      }
      progressByModuleId.set(String(mod._id), found);
      previousCompleted = found.status === 'completed';
      continue;
    }

    const status = previousCompleted ? 'available' : 'locked';
    missing.push({ userId, moduleId: mod._id, status });
    previousCompleted = false;
  }

  if (missing.length > 0) {
    // insertMany con progressSchema.index({ userId, moduleId }, { unique })
    // protege contra duplicados si dos requests concurrentes disparan la
    // creación perezosa al mismo tiempo.
    try {
      const created = await Progress.insertMany(missing, { ordered: false });
      for (const doc of created) {
        progressByModuleId.set(String(doc.moduleId), doc.toObject());
      }
    } catch (err) {
      // E11000 = otro request ya creó el mismo documento en la carrera.
      if (err.code !== 11000) throw err;
      const reread = await Progress.find({ userId }).lean();
      for (const p of reread) progressByModuleId.set(String(p.moduleId), p);
    }
  }

  return { modules, progressByModuleId };
}

// Re-evalúa y persiste el desbloqueo lineal completo del alumno. Se
// llama después de que un intento cierra como "completed" (ver
// applyCompletionToProgress) para que el siguiente módulo quede
// "available" en la base de inmediato, no solo la próxima vez que se
// consulte.
export async function recalculateUnlocks(userId) {
  const { modules, progressByModuleId } = await getOrCreateProgressForUser(userId);

  let previousCompleted = true;
  for (const mod of modules) {
    const progress = progressByModuleId.get(String(mod._id));
    if (progress.status === 'completed') {
      previousCompleted = true;
      continue;
    }
    const nextStatus = previousCompleted ? 'available' : 'locked';
    if (progress.status !== nextStatus) {
      await Progress.updateOne({ _id: progress._id }, { status: nextStatus });
      progress.status = nextStatus;
    }
    previousCompleted = false;
  }
}
