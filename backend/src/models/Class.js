// GUIA_DE_CODIGO.md — Parte 2, F01 (colección `classes`).
// Copiado literal del documento.
import mongoose from 'mongoose';

const { Schema } = mongoose;

const classSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 4,
      maxlength: 12,
      match: [/^[A-Z0-9]+$/, 'El código solo admite letras y números.'],
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isActive: { type: Boolean, default: true },
    isPretestEnabled: { type: Boolean, default: false },
    isPosttestEnabled: { type: Boolean, default: false },
    pretestFormUrl: { type: String, default: null },
    posttestFormUrl: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Class', classSchema);
