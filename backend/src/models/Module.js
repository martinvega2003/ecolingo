// GUIA_DE_CODIGO.md v2.2 — Parte 2, F03 (colección `modules`).

// Actualizado a v2.2 (D-16 revisada, 5 módulos, F11 descartada): sin
// theoryContent/estimatedReadingMinutes, max de order bajó de 6 a 5.
import mongoose from 'mongoose';

const { Schema } = mongoose;

const moduleSchema = new Schema(
  {
    order: { type: Number, required: true, unique: true, min: 1, max: 5 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 200 },
    keyConcepts: { type: [String], required: true, default: [] },
    questionCount: { type: Number, required: true, min: 1 },
    xpPerCorrectAnswer: { type: Number, required: true, default: 50, min: 1 },
    xpReward: { type: Number, required: true, min: 1 },
    badgeCode: { type: String, required: true, uppercase: true },
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
