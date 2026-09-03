// GUIA_DE_CODIGO.md — Parte 2, F03. La metadata de cada módulo (title,
// description, keyConcepts, questionCount, xpReward, badgeCode) es
// literal del documento. theoryContent NO estaba dado ahí — es contenido
// pedagógico real que le toca escribir a quien sea dueño de cada módulo
// (Cesar: 1-4, Martín: 5-6, por el reparto de preguntas de Parte 2, F04).
// Match temporalmente con un placeholder CLARAMENTE marcado, solo para
// que el seed no falle (el schema lo exige) y F04 sea testeable.
//
// Solo se cargan los módulos 1 y 2 — los mínimos para probar el
// desbloqueo secuencial (MODULE_LOCKED). Los módulos 3-6 quedan para
// cuando Cesar (3, 4) y vos (5, 6) tengan contenido real: se agregan a
// este mismo array, no se reemplaza.
import { Module } from '../models/index.js';

const THEORY_PLACEHOLDER = (title) =>
  `[PLACEHOLDER — reemplazar con contenido teórico real de "${title}" antes del piloto. ` +
  `Este texto es solo para que el seed no falle mientras se prueba F04 localmente.]`;

export const MODULES = [
  {
    order: 1,
    slug: 'ahorro',
    title: 'Ahorro',
    description: 'Fondo de emergencia, ahorro automático y metas',
    keyConcepts: ['Fondo de emergencia', 'Ahorro automático', 'Metas'],
    questionCount: 2,
    xpPerCorrectAnswer: 50,
    xpReward: 100,
    badgeCode: 'PRIMER_AHORRO',
    theoryContent: THEORY_PLACEHOLDER('Ahorro'),
    estimatedReadingMinutes: 3,
  },
  {
    order: 2,
    slug: 'presupuesto',
    title: 'Presupuesto',
    description: 'Regla 50/30/20, gastos fijos y variables',
    keyConcepts: ['Regla 50/30/20', 'Gastos fijos', 'Gastos variables'],
    questionCount: 3,
    xpPerCorrectAnswer: 50,
    xpReward: 150,
    badgeCode: 'PRESUPUESTADOR',
    theoryContent: THEORY_PLACEHOLDER('Presupuesto'),
    estimatedReadingMinutes: 3,
  },
];

export const seedModules = async () => {
  for (const mod of MODULES) {
    await Module.updateOne({ order: mod.order }, { $set: mod }, { upsert: true, runValidators: true });
  }
  console.log(`✅ ${MODULES.length} módulos cargados (1-2 de 6 — el resto queda para cuando haya contenido real)`);
};
