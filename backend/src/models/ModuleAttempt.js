// GUIA_DE_CODIGO.md — Parte 2, F04 (colección `moduleAttempts`). Dueño:
// Persona B. El modelo más complejo del sistema — sesión de juego y
// registro de análisis para el Capítulo 5.
import mongoose from 'mongoose';

const { Schema } = mongoose;

const answerSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    questionOrder: { type: Number, required: true, min: 1 },
    selectedOptionKey: { type: String, required: true, enum: ['A', 'B', 'C'] },
    isCorrect: { type: Boolean, required: true },
    answeredAt: { type: Date, default: Date.now },
    timeToAnswerSeconds: { type: Number, required: true, min: 0, max: 600 },
  },
  { _id: false }
);

const moduleAttemptSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    status: {
      type: String,
      required: true,
      enum: ['in_progress', 'completed', 'failed', 'abandoned'],
      default: 'in_progress',
    },
    livesRemaining: { type: Number, default: 3, min: 0, max: 3 },
    currentQuestionOrder: { type: Number, default: 1, min: 1 },
    answers: { type: [answerSchema], default: [] },
    correctCount: { type: Number, default: 0, min: 0 },
    xpEarned: { type: Number, default: 0, min: 0 },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: null, min: 0 },
    badgesUnlocked: { type: [String], default: [] },
  },
  { timestamps: true }
);

moduleAttemptSchema.index({ userId: 1, moduleId: 1, status: 1 });
moduleAttemptSchema.index({ userId: 1, status: 1 });

// Índice único parcial: como máximo un intento activo por (alumno, módulo).
// Equivalente al CREATE UNIQUE INDEX ... WHERE de PostgreSQL — la
// invariante la garantiza el motor, no la lógica del controlador.
moduleAttemptSchema.index(
  { userId: 1, moduleId: 1 },
  { unique: true, partialFilterExpression: { status: 'in_progress' } }
);

// Calcula la duración automáticamente al cerrar el intento.
moduleAttemptSchema.pre('save', function (next) {
  if (this.finishedAt && this.durationSeconds === null) {
    this.durationSeconds = Math.round((this.finishedAt - this.startedAt) / 1000);
  }
  next();
});

export default mongoose.model('ModuleAttempt', moduleAttemptSchema);
