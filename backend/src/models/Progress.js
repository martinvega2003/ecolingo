import mongoose from 'mongoose';
const { Schema } = mongoose;

// GUIA_DE_CODIGO.md, Parte 2 — F03. Código fuente literal del documento.
const progressSchema = new Schema({
  userId:              { type: Schema.Types.ObjectId, ref: 'User', required: true },
  moduleId:            { type: Schema.Types.ObjectId, ref: 'Module', required: true },
  status: {
    type: String, required: true,
    enum: ['locked', 'available', 'completed'],
    default: 'locked',
  },
  bestCorrectAnswers:  { type: Number, default: 0, min: 0 },
  xpEarned:            { type: Number, default: 0, min: 0 },
  attemptCount:        { type: Number, default: 0, min: 0 },
  isPerfect:           { type: Boolean, default: false },
  bestDurationSeconds: { type: Number, default: null, min: 0 },
  firstCompletedAt:    { type: Date, default: null },
  lastAttemptAt:       { type: Date, default: null },
}, { timestamps: true });

progressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });
progressSchema.index({ userId: 1, status: 1 });

// Sobre xpEarned (D-08, regla anti-farming): el servicio de XP de F04
// verifica progress.xpEarned === 0 antes de acreditar puntos. Si ya es
// mayor a cero, un reintento actualiza estadísticas pero no vuelve a sumar.
//
// Sin seed: estos documentos se crean de forma perezosa en el primer
// acceso al mapa (ver progressService.js — getOrCreateProgressForUser).
export default mongoose.model('Progress', progressSchema);
