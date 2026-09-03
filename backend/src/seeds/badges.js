// GUIA_DE_CODIGO.md — Parte 2, F07. Copiado literal — el catálogo de las
// 11 insignias viene completo en el documento, sin partes omitidas.
import { Badge } from '../models/index.js';

export const BADGES = [
  { code: 'PRIMER_AHORRO', name: 'Primer ahorro', emoji: '🐷 ', description: 'Completá el módulo 1 (Ahorro)', criteriaType: 'MODULE_COMPLETED', criteriaValue: 1, displayOrder: 1 },
  { code: 'PRESUPUESTADOR', name: 'Presupuestador', emoji: '📊 ', description: 'Completá el módulo 2 (Presupuesto)', criteriaType: 'MODULE_COMPLETED', criteriaValue: 2, displayOrder: 2 },
  { code: 'SIN_DEUDAS', name: 'Sin deudas', emoji: '💳 ', description: 'Completá el módulo 3 (Crédito y deuda)', criteriaType: 'MODULE_COMPLETED', criteriaValue: 3, displayOrder: 3 },
  { code: 'INVERSOR_NOVATO', name: 'Inversor novato', emoji: '📈 ', description: 'Completá el módulo 4 (Interés compuesto)', criteriaType: 'MODULE_COMPLETED', criteriaValue: 4, displayOrder: 4 },
  { code: 'INVERSIONES', name: 'Inversiones', emoji: '💰 ', description: 'Completá el módulo 5 (Inversión básica)', criteriaType: 'MODULE_COMPLETED', criteriaValue: 5, displayOrder: 5 },
  { code: 'PLANIFICADOR', name: 'Planificador', emoji: '🎯 ', description: 'Completá el módulo 6 (Planificación)', criteriaType: 'MODULE_COMPLETED', criteriaValue: 6, displayOrder: 6 },
  { code: 'MODULOS_COMPLETOS', name: 'Módulos completos', emoji: '🏆 ', description: 'Completá los 6 módulos', criteriaType: 'ALL_MODULES_COMPLETED', criteriaValue: null, displayOrder: 7 },
  { code: 'RACHA_7_DIAS', name: 'Racha de 7 días', emoji: '🔥 ', description: 'Usá la plataforma 7 días seguidos', criteriaType: 'STREAK_DAYS', criteriaValue: 7, displayOrder: 8 },
  { code: 'RESPUESTA_PERFECTA', name: 'Respuesta perfecta', emoji: '⭐ ', description: 'Obtené el 100 % en cualquier módulo', criteriaType: 'PERFECT_MODULE', criteriaValue: null, displayOrder: 9 },
  { code: 'TOP_3_PODIO', name: 'Top 3 del podio', emoji: '🥇 ', description: 'Quedá entre los 3 primeros del ranking semanal', criteriaType: 'TOP_THREE_WEEKLY', criteriaValue: null, displayOrder: 10 },
  { code: 'VELOCISTA', name: 'Velocista', emoji: '⚡', description: 'Completá un módulo en menos de 3 minutos', criteriaType: 'SPEED_RUN', criteriaValue: 180, displayOrder: 11 },
];

export const seedBadges = async () => {
  for (const badge of BADGES) {
    await Badge.updateOne({ code: badge.code }, { $set: badge }, { upsert: true });
  }
  console.log(`✅ ${BADGES.length} insignias cargadas`);
};
