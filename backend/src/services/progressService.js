import { Module, Progress } from '../models/index.js';

/**
 * F03 — Mapa de Módulos (GUIA_DE_CODIGO.md, Parte 3, riesgo "Creación perezosa
 * de progress"). No hay seed de `progress`: los documentos se crean recién en
 * el primer GET /modules del alumno, uno por cada módulo publicado.
 *
 * La regla de desbloqueo (Parte 1, Endpoint 5) es estrictamente lineal:
 * el módulo de order N está "available" si y solo si el N-1 está "completed".
 * El módulo 1 siempre está "available". Esto se calcula en el servidor,
 * nunca en el cliente (riesgo explícito del documento).
 */

/**
 * Devuelve, para un userId dado, un array de progress (uno por módulo
 * publicado), creando los que falten con status calculado según el estado
 * actual — nunca todos en "locked" a ciegas.
 */
export async function getOrCreateProgressForUser(userId) {
  const modules = await Module.find({ isPublished: true }).sort({ order: 1 }).lean();
  const existing = await Progress.find({ userId }).lean();
  const byModuleId = new Map(existing.map((p) => [String(p.moduleId), p]));

  const missing = [];
  let previousCompleted = true; // el módulo 1 siempre disponible

  const progressByModuleId = new Map();

  for (const mod of modules) {
    const found = byModuleId.get(String(mod._id));

    if (found) {
      progressByModuleId.set(String(mod._id), found);
      previousCompleted = found.status === 'completed';
      continue;
    }

    // No existe todavía: se crea con el status que corresponde según
    // el módulo anterior, no siempre "locked".
    const status = previousCompleted ? 'available' : 'locked';
    missing.push({ userId, moduleId: mod._id, status });
    previousCompleted = false; // uno recién creado nunca está completed
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
      // Se ignora acá y se relee abajo para tener el estado real.
      if (err.code !== 11000) throw err;
      const reread = await Progress.find({ userId }).lean();
      for (const p of reread) progressByModuleId.set(String(p.moduleId), p);
    }
  }

  return { modules, progressByModuleId };
}

/**
 * Re-evalúa y persiste el desbloqueo lineal completo del alumno.
 * Se llama después de que F04 marca un módulo como "completed", para que
 * el siguiente pase a "available" sin que el alumno tenga que recargar
 * manualmente (criterio de aceptación de F03).
 */
export async function recalculateUnlocks(userId) {
  const { modules, progressByModuleId } = await getOrCreateProgressForUser(userId);

  let previousCompleted = true;
  for (const mod of modules) {
    const progress = progressByModuleId.get(String(mod._id));
    if (progress.status === 'completed') {
      previousCompleted = true;
      continue;
    }
    const shouldBeAvailable = previousCompleted;
    const nextStatus = shouldBeAvailable ? 'available' : 'locked';
    if (progress.status !== nextStatus) {
      await Progress.updateOne({ _id: progress._id }, { status: nextStatus });
      progress.status = nextStatus;
    }
    previousCompleted = false;
  }
}
