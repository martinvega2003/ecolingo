// GUIA_DE_CODIGO.md — Parte 2, F07 (colección `badges`).
//
// ⚠️ NOTA PARA CESAR: es tu colección por §0.13 (F07 — Logros e
// Insignias). La copié verbatim, junto con UserBadge.js y el seed de las
// 11 insignias, porque F04 tiene "Evaluación de insignias" en su propio
// Incluye (Parte 3) y necesita el catálogo real para evaluar los
// criterios al cerrar un intento. No toqué los endpoints 13/14 ni la
// pantalla /logros — eso sigue siendo tuyo.
import mongoose from 'mongoose';

const { Schema } = mongoose;

export const CRITERIA_TYPES = [
  'MODULE_COMPLETED',
  'ALL_MODULES_COMPLETED',
  'PERFECT_MODULE',
  'STREAK_DAYS',
  'TOP_THREE_WEEKLY',
  'SPEED_RUN',
];

const badgeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, required: true, trim: true, maxlength: 160 },
    emoji: { type: String, required: true },
    criteriaType: { type: String, required: true, enum: CRITERIA_TYPES },
    criteriaValue: { type: Schema.Types.Mixed, default: null },
    displayOrder: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

badgeSchema.index({ displayOrder: 1 });

export default mongoose.model('Badge', badgeSchema);
