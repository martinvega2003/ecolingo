import mongoose from 'mongoose';
const { Schema } = mongoose;

// GUIA_DE_CODIGO.md, Parte 2 — F07. Confirmado por Martín (Persona B) el
// día que se destrabó la conexión a Mongo — antes de esto, F03 devolvía
// solo badgeCode como referencia simple para no inventar el schema.
export const CRITERIA_TYPES = [
  'MODULE_COMPLETED', 'ALL_MODULES_COMPLETED', 'PERFECT_MODULE',
  'STREAK_DAYS', 'TOP_THREE_WEEKLY', 'SPEED_RUN',
];

const badgeSchema = new Schema({
  code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
  name:          { type: String, required: true, trim: true, maxlength: 60 },
  description:   { type: String, required: true, trim: true, maxlength: 160 },
  emoji:         { type: String, required: true },
  criteriaType:  { type: String, required: true, enum: CRITERIA_TYPES },
  criteriaValue: { type: Schema.Types.Mixed, default: null },
  displayOrder:  { type: Number, required: true, min: 1 },
}, { timestamps: true });

badgeSchema.index({ displayOrder: 1 });

export default mongoose.model('Badge', badgeSchema);
