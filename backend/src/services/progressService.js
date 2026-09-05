// Regla de desbloqueo (GUIA_DE_CODIGO.md, Parte 1, F03, endpoint 5): "El
// módulo de order N está available si y solo si el módulo de order N−1
// tiene status: completed. El módulo de order 1 siempre está available."
//
// "Sin seed" (Parte 2, F03): los documentos de progress se crean de forma
// perezosa en el primer acceso. Como F03 (el mapa) todavía no existe,
// F04 hace esa creación perezosa acá mismo, para no depender de que el
// mapa la haya hecho antes. Cuando Cesar construya F03, este servicio es
// el lugar natural para que el endpoint 5 (GET /modules) reutilice la
// misma lógica en vez de duplicarla.
//
// BUG corregido: 'locked' se estaba calculando una sola vez, al crear el
// documento, y quedaba fijo para siempre — aunque después se completara
// el módulo anterior, este seguía marcado locked. 'available' y
// 'completed' son estados estables (nada los revierte), pero 'locked'
// depende de una condición externa (el progress del módulo anterior)
// que puede cambiar después de creado este documento. Por eso 'locked'
// es el único que hay que re-evaluar en cada acceso, no solo al crear.
import { Module, Progress } from '../models/index.js';
import { conflict } from '../utils/apiError.js';

// Único punto de verdad para "¿este módulo debería estar desbloqueado
// ahora mismo?" — usado tanto al crear el documento por primera vez
// como al re-evaluar uno que ya existe en 'locked'.
const isModuleUnlockable = async (userId, moduleDoc) => {
  if (moduleDoc.order === 1) return true;

  const previousModule = await Module.findOne({ order: moduleDoc.order - 1 });
  if (!previousModule) return false;

  const previousProgress = await Progress.findOne({ userId, moduleId: previousModule._id });
  return previousProgress?.status === 'completed';
};

export const getOrCreateProgress = async (userId, moduleDoc) => {
  const existing = await Progress.findOne({ userId, moduleId: moduleDoc._id });

  if (existing) {
    if (existing.status === 'locked' && (await isModuleUnlockable(userId, moduleDoc))) {
      existing.status = 'available';
      await existing.save();
    }
    return existing;
  }

  const status = (await isModuleUnlockable(userId, moduleDoc)) ? 'available' : 'locked';
  return Progress.create({ userId, moduleId: moduleDoc._id, status });
};

// Usado por el endpoint 7 (Iniciar intento). Lanza MODULE_LOCKED si el
// módulo anterior no está completado — mismo código que exige el
// contrato de F04.
export const assertModuleUnlocked = async (userId, moduleDoc) => {
  const progress = await getOrCreateProgress(userId, moduleDoc);
  if (progress.status === 'locked') {
    throw conflict('MODULE_LOCKED', 'El módulo anterior no está completado.');
  }
  return progress;
};

// Aplica el resultado de un intento CERRADO como "completed" al progress
// del módulo. Regla anti-farming (D-08): xpEarned del progress solo se
// fija la primera vez (progress.xpEarned === 0 al momento de cerrar).
// bestCorrectAnswers, isPerfect y bestDurationSeconds sí mejoran en
// repeticiones — son estadísticas, no acreditación.
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
    progress.xpEarned = attempt.xpEarned; // acumulado real de esta corrida, no siempre xpReward completo
    progress.firstCompletedAt = new Date();
  }

  await progress.save();
  return { progress, isFirstCompletion };
};

// Para intentos failed/abandoned: solo estadística, nunca XP (§0.8).
export const applyNonCompletionToProgress = async ({ userId, moduleDoc, attempt }) => {
  const progress = await getOrCreateProgress(userId, moduleDoc);
  progress.attemptCount += 1;
  progress.lastAttemptAt = new Date();
  await progress.save();
  return progress;
};
