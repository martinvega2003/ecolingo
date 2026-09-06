// GUIA_DE_CODIGO.md v2.2 — Parte 2, F07. Copiado literal — 10 insignias
// (antes 11: INVERSOR_NOVATO se elimina porque el módulo 4 viejo,
// interés compuesto, se fusionó con Ahorro y ya no existe como módulo
// separado).
import { Badge } from '../models/index.js';

export const BADGES = [
  { code: 'PRIMER_AHORRO', name: 'Primer ahorro', emoji: '🐷 ', description: 'Completá el módulo 1 (Ahorro e Interés)', criteriaType: 'MODULE_COMPLETED', criteriaValue: 1, displayOrder: 1 },
  { code: 'PRESUPUESTADOR', name: 'Presupuestador', emoji: '📊 ', description: 'Completá el módulo 2 (Presupuesto)', criteriaType: 'MODULE_COMPLETED', criteriaValue: 2, displayOrder: 2 },
  { code: 'SIN_DEUDAS', name: 'Sin deudas', emoji: '💳 ', description: 'Completá el módulo 3 (Crédito y deuda)', criteriaType: 'MODULE_COMPLETED', criteriaValue: 3, displayOrder: 3 },
  { code: 'INVERSIONES', name: 'Inversiones', emoji: '💰 ', description: 'Completá el módulo 4 (Inversión básica)', criteriaType: 'MODULE_COMPLETED', criteriaValue: 4, displayOrder: 4 },
  { code: 'PLANIFICADOR', name: 'Planificador', emoji: '🎯 ', description: 'Completá el módulo 5 (Planificación financiera)', criteriaType: 'MODULE_COMPLETED', criteriaValue: 5, displayOrder: 5 },
  { code: 'MODULOS_COMPLETOS', name: 'Módulos completos', emoji: '🏆 ', description: 'Completá los 5 módulos', criteriaType: 'ALL_MODULES_COMPLETED', criteriaValue: null, displayOrder: 6 },
  { code: 'RACHA_7_DIAS', name: 'Racha de 7 días', emoji: '🔥 ', description: 'Usá la plataforma 7 días seguidos', criteriaType: 'STREAK_DAYS', criteriaValue: 7, displayOrder: 7 },
  { code: 'RESPUESTA_PERFECTA', name: 'Respuesta perfecta', emoji: '⭐ ', description: 'Obtené el 100 % en cualquier módulo', criteriaType: 'PERFECT_MODULE', criteriaValue: null, displayOrder: 8 },
  { code: 'TOP_3_PODIO', name: 'Top 3 del podio', emoji: '🥇 ', description: 'Quedá entre los 3 primeros del ranking semanal', criteriaType: 'TOP_THREE_WEEKLY', criteriaValue: null, displayOrder: 9 },
  { code: 'VELOCISTA', name: 'Velocista', emoji: '⚡', description: 'Completá un módulo en menos de 3 minutos', criteriaType: 'SPEED_RUN', criteriaValue: 180, displayOrder: 10 },
];

export const seedBadges = async () => {
  for (const badge of BADGES) {
    await Badge.updateOne({ code: badge.code }, { $set: badge }, { upsert: true });
  }
  console.log(`✅ ${BADGES.length} insignias cargadas`);
};
