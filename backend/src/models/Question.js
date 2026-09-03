// GUIA_DE_CODIGO.md — Parte 2, F04 (colección `questions`). Dueño: Persona B.
import mongoose from 'mongoose';

const { Schema } = mongoose;

const optionSchema = new Schema(
  {
    key: { type: String, required: true, enum: ['A', 'B', 'C'] },
    text: { type: String, required: true, trim: true, maxlength: 200 },
  },
  { _id: false }
);

const questionSchema = new Schema(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    order: { type: Number, required: true, min: 1 },
    statement: { type: String, required: true, trim: true, maxlength: 500 },
    options: {
      type: [optionSchema],
      required: true,
      validate: {
        validator: (v) => v.length === 3 && ['A', 'B', 'C'].every((k) => v.some((o) => o.key === k)),
        message: 'Cada pregunta requiere exactamente 3 opciones con claves A, B y C.',
      },
    },
    correctOptionKey: { type: String, required: true, enum: ['A', 'B', 'C'] },
    explanation: { type: String, required: true, trim: true, maxlength: 400 },
    conceptTag: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

questionSchema.index({ moduleId: 1, order: 1 }, { unique: true });

// Proyección obligatoria para servir una pregunta al cliente.
// D-07 del Contrato Técnico: correctOptionKey y explanation NUNCA llegan
// al navegador antes de que el alumno responda.
questionSchema.statics.publicProjection = function () {
  return '-correctOptionKey -explanation -conceptTag -createdAt -updatedAt';
};

export default mongoose.model('Question', questionSchema);
