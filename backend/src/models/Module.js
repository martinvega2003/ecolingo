// GUIA_DE_CODIGO.md — Parte 2, F03 (colección `modules`).
//
// ⚠️ NOTA PARA CESAR: este archivo es tuyo por §0.13 (F03 — Mapa de
// Módulos). Lo copié verbatim del documento porque F04 no puede funcionar
// sin él (endpoint 7 necesita min/order/questionCount/xpReward/
// livesPerAttempt de un módulo para poder iniciar un intento, y el chequeo
// de MODULE_LOCKED exige leer el módulo anterior). No toqué los
// endpoints 5/6/12 ni la pantalla del mapa — eso sigue totalmente en tu
// cancha. Revisalo antes de construir F03 encima.
import mongoose from 'mongoose';

const { Schema } = mongoose;

const moduleSchema = new Schema(
  {
    order: { type: Number, required: true, unique: true, min: 1, max: 6 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 200 },
    keyConcepts: { type: [String], required: true, default: [] },
    questionCount: { type: Number, required: true, min: 1 },
    xpPerCorrectAnswer: { type: Number, required: true, default: 50, min: 1 },
    xpReward: { type: Number, required: true, min: 1 },
    badgeCode: { type: String, required: true, uppercase: true },
    // --- F11 / D-16 — contenido teórico, previo a las preguntas ---
    theoryContent: { type: String, required: true, trim: true, maxlength: 4000 },
    estimatedReadingMinutes: { type: Number, required: true, min: 1, default: 3 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Invariante D-06: xpReward = questionCount × xpPerCorrectAnswer
moduleSchema.pre('validate', function (next) {
  const esperado = this.questionCount * this.xpPerCorrectAnswer;
  if (this.xpReward !== esperado) {
    return next(
      new Error(
        `Inconsistencia de XP en el módulo ${this.order}: ` +
          `xpReward=${this.xpReward} pero questionCount×xpPerCorrectAnswer=${esperado}.`
      )
    );
  }
  next();
});

export default mongoose.model('Module', moduleSchema);
