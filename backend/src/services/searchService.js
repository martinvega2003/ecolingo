// GUIA_DE_CODIGO.md — Parte 1, F10 (endpoint 25) + resolución de contrato
// acordada con Martín el 2026-09-11/12, pendiente de que Cesar la vea:
//
// 1. Búsqueda en `modules`: no hay (ni puede haber, según §0.10 — un solo
//    índice de texto en toda la base) un índice de texto en `modules`.
//    Como son 5 documentos fijos y sembrados, se filtran en memoria con
//    comparación normalizada (sin tildes, insensible a mayúsculas) en vez
//    de $text. Esto además evita el problema de stemming en español que
//    la propia guía señala como debilidad (pág. 81, Riesgos F10).
//
// 2. Orden dentro del grupo `modules` (no hay score de texto para
//    ordenar ahí): título > keyConcepts > description; empate por
//    `order` ascendente (Módulo 1 primero). Decisión de Martín.
//
// 3. `isAccessible`: se reutiliza `getOrCreateProgressForUser` de
//    progressService.js (ya usada por F03) en vez de reimplementar la
//    regla de desbloqueo — evita repetir el bug de 'locked' no reevaluado
//    (ver /learnings.md del proyecto). Requiere una fila nueva en
//    CONTRATOS_INTERNOS.md — ver nota en services/progressService.js.
import { GlossaryTerm, Module } from '../models/index.js';
import { getOrCreateProgressForUser } from './progressService.js';

const SNIPPET_MAX_LENGTH = 160;

// Insensibilidad a mayúsculas y tildes (Reglas de búsqueda, pág. 44):
// "buscar interes encuentra interés".
const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const truncateSnippet = (text, maxLength = SNIPPET_MAX_LENGTH) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
};

// ────────────────────────────────────────────────────────────────
// Glosario — $text sobre glossaryTerms (único índice de texto de la base)
// ────────────────────────────────────────────────────────────────

async function searchGlossary(q, limit) {
  if (limit <= 0) return [];

  const docs = await GlossaryTerm.find(
    { $text: { $search: q } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean();

  return docs.map((doc) => ({
    type: 'glossary',
    id: String(doc._id),
    title: doc.term,
    snippet: truncateSnippet(doc.definition),
    moduleOrder: doc.moduleOrder,
    isAccessible: true,
    route: `/glosario/${doc.slug}`,
  }));
}

// ────────────────────────────────────────────────────────────────
// Módulos — filtro en memoria, D-14: questions nunca se indexa/consulta acá
// ────────────────────────────────────────────────────────────────

// Devuelve 1 (title), 2 (keyConcepts) o 3 (description) según dónde matcheó
// primero — o null si no matchea en ningún campo. Coincide con el orden de
// prioridad acordado.
function matchRank(mod, normalizedQuery) {
  if (normalize(mod.title).includes(normalizedQuery)) return 1;
  if (mod.keyConcepts.some((concept) => normalize(concept).includes(normalizedQuery))) return 2;
  if (normalize(mod.description).includes(normalizedQuery)) return 3;
  return null;
}

async function searchModules({ q, limit, userId, role }) {
  if (limit <= 0) return [];

  const normalizedQuery = normalize(q);
  let modules;
  let isAccessibleByModuleId;

  if (role === 'student') {
    // Misma función que consume F03 (modulesController.js) — ya filtra
    // isPublished: true, ya ordena por `order` ascendente, y ya reevalúa
    // 'locked' en cada llamada (no hace falta un recalculateUnlocks aparte
    // para lectura).
    const { modules: mods, progressByModuleId } = await getOrCreateProgressForUser(userId);
    modules = mods;
    isAccessibleByModuleId = new Map(
      mods.map((mod) => [String(mod._id), progressByModuleId.get(String(mod._id))?.status !== 'locked'])
    );
  } else {
    // Docente: "para docentes siempre es true" (pág. 43) — no hay progress
    // de docente, no tiene sentido llamar a getOrCreateProgressForUser acá.
    modules = await Module.find({ isPublished: true }).sort({ order: 1 }).lean();
    isAccessibleByModuleId = new Map(modules.map((mod) => [String(mod._id), true]));
  }

  const matches = modules
    .map((mod) => ({ mod, rank: matchRank(mod, normalizedQuery) }))
    .filter(({ rank }) => rank !== null)
    .sort((a, b) => a.rank - b.rank || a.mod.order - b.mod.order);

  return matches.slice(0, limit).map(({ mod }) => ({
    type: 'module',
    id: String(mod._id),
    title: mod.title,
    snippet: truncateSnippet(mod.description),
    moduleOrder: mod.order,
    isAccessible: isAccessibleByModuleId.get(String(mod._id)) ?? false,
    route: '/mapa',
  }));
}

// ────────────────────────────────────────────────────────────────
// Endpoint 25 — GET /search
// ────────────────────────────────────────────────────────────────

// Orden entre grupos (pág. 44): glossaryTerms primero, luego modules.
// `limit` es el total combinado — no por-fuente — así que el segundo
// grupo solo llena lo que el primero dejó libre.
export async function search({ q, type, limit, userId, role }) {
  let results = [];

  if (type === 'all' || type === 'glossary') {
    results = results.concat(await searchGlossary(q, limit - results.length));
  }

  if (type === 'all' || type === 'module') {
    results = results.concat(await searchModules({ q, limit: limit - results.length, userId, role }));
  }

  return { query: q, results, total: results.length };
}

// ────────────────────────────────────────────────────────────────
// Endpoint 27 — GET /glossary (nuevo, propuesto — ver nota de cabecera)
// ────────────────────────────────────────────────────────────────

// Vista de glosario completo, sin pasar por $text — "se puede recorrer sin
// buscar" (criterio de aceptación, pág. 81). Orden: por módulo (1→5), los
// términos transversales (moduleOrder: null) al final; dentro de cada
// grupo, por displayOrder. No está en la guía tal cual (no había un campo
// para ordenar transversales); es una decisión de implementación, a
// confirmar con Cesar.
export async function listGlossaryTerms() {
  const [docs, modules] = await Promise.all([
    GlossaryTerm.find().lean(),
    Module.find({ isPublished: true }).select('order title').lean(),
  ]);

  const titleByOrder = new Map(modules.map((mod) => [mod.order, mod.title]));

  docs.sort((a, b) => {
    const orderA = a.moduleOrder ?? Number.POSITIVE_INFINITY;
    const orderB = b.moduleOrder ?? Number.POSITIVE_INFINITY;
    return orderA - orderB || a.displayOrder - b.displayOrder;
  });

  return {
    terms: docs.map((doc) => ({
      id: String(doc._id),
      term: doc.term,
      slug: doc.slug,
      definition: doc.definition,
      keywords: doc.keywords,
      moduleOrder: doc.moduleOrder,
      moduleTitle: doc.moduleOrder ? titleByOrder.get(doc.moduleOrder) ?? null : null,
      displayOrder: doc.displayOrder,
    })),
    total: docs.length,
  };
}
