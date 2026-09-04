import { Module } from '../models/index.js';

// GUIA_DE_CODIGO.md, Parte 2 — F03. Código fuente literal del documento.
// 5 módulos, 17 subtemas, 34 preguntas, 1.700 XP totales — estructura
// aprobada por el tutor el 27/8 (Ecolingo_Modulos_Subtemas_y_Escala-1.pdf, v2).
// keyConcepts lista los subtemas de cada módulo.
export const MODULES = [
  {
    order: 1, slug: 'ahorro-e-interes', title: 'Ahorro e Interés',
    description: 'Fondo de emergencia, ahorro automático, metas de ahorro y capitalización',
    keyConcepts: ['Fondo de emergencia', 'Ahorro automático', 'Metas de ahorro', 'Capitalización'],
    questionCount: 8, xpPerCorrectAnswer: 50, xpReward: 400, badgeCode: 'PRIMER_AHORRO',
  },
  {
    order: 2, slug: 'presupuesto', title: 'Presupuesto',
    description: 'Regla 50/30/20, gastos fijos y variables, balance ingreso-gasto',
    keyConcepts: ['Regla 50/30/20', 'Gastos fijos vs. variables', 'Balance ingreso-gasto'],
    questionCount: 6, xpPerCorrectAnswer: 50, xpReward: 300, badgeCode: 'PRESUPUESTADOR',
  },
  {
    order: 3, slug: 'credito', title: 'Crédito y deuda',
    description: 'Tasa de interés, método avalancha e historial crediticio',
    keyConcepts: ['Tasa de interés', 'Método avalancha', 'Historial crediticio'],
    questionCount: 6, xpPerCorrectAnswer: 50, xpReward: 300, badgeCode: 'SIN_DEUDAS',
  },
  {
    order: 4, slug: 'inversion', title: 'Inversión básica',
    description: 'Riesgo, diversificación, plazo fijo vs. acciones y estafas de inversión',
    keyConcepts: ['Riesgo', 'Diversificación', 'Plazo fijo vs. acciones', 'Estafas de inversión'],
    questionCount: 8, xpPerCorrectAnswer: 50, xpReward: 400, badgeCode: 'INVERSIONES',
  },
  {
    order: 5, slug: 'planificacion', title: 'Planificación financiera',
    description: 'Corto vs. largo plazo, metas SMART y revisión del plan',
    keyConcepts: ['Corto vs. largo plazo', 'Metas SMART', 'Revisión del plan'],
    questionCount: 6, xpPerCorrectAnswer: 50, xpReward: 300, badgeCode: 'PLANIFICADOR',
  },
];

// upsert por `order`: correr esto de nuevo no duplica nada — corrige el
// módulo 1 (hoy tiene el slug/título viejo "ahorro") y agrega los 3 que
// faltan (order 3, 4, 5).
export const seedModules = async () => {
  for (const mod of MODULES) {
    await Module.updateOne({ order: mod.order }, { $set: mod }, { upsert: true, runValidators: true });
  }
  console.log(`✅ ${MODULES.length} módulos cargados`);
};
