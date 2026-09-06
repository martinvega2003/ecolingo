// GUIA_DE_CODIGO.md — Parte 2, F03 (colección `progress`).
//
// ⚠️ NOTA PARA CESAR: mismo caso que Module.js — es tu colección por
// §0.13, copiada verbatim porque F04 la actualiza al cerrar cada intento
// (regla anti-farming D-08 incluida). El documento dice explícitamente
// "sin seed: los documentos se crean de forma perezosa en el primer
// acceso al mapa" — como el mapa todavía no existe, F04 hace esa
// creación perezosa desde services/progressService.js en vez de asumir
// que ya existe. Cuando construyas F03, probablemente quieras que el
// mapa use ese mismo servicio en vez de duplicar la lógica de desbloqueo.
import mongoose from 'mongoose';

const { Schema } = mongoose;

const progressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    status: {
      type: String,
      required: true,
      enum: ['locked', 'available', 'completed'],
      default: 'locked',
    },
    bestCorrectAnswers: { type: Number, default: 0, min: 0 },
    xpEarned: { type: Number, default: 0, min: 0 },
    attemptCount: { type: Number, default: 0, min: 0 },
    isPerfect: { type: Boolean, default: false },
    bestDurationSeconds: { type: Number, default: null, min: 0 },
    firstCompletedAt: { type: Date, default: null },
    lastAttemptAt: { type: Date, default: null },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });
progressSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Progress', progressSchema);
