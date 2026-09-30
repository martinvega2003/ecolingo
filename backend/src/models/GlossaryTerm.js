// GUIA_DE_CODIGO.md — Parte 2, F10 (colección `glossaryTerms`).
//
// Único índice de texto de toda la base (§0.10) — no agregar otro en
// ninguna otra colección sin revisar esa nota primero.
import mongoose from 'mongoose';

const { Schema } = mongoose;

const glossaryTermSchema = new Schema(
  {
    term: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    definition: { type: String, required: true, trim: true, maxlength: 400 },
    keywords: { type: [String], default: [] },
    moduleOrder: { type: Number, default: null, min: 1, max: 5 },
    displayOrder: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

// (slug ya tiene unique: true en el campo — no se repite acá como
// glossaryTermSchema.index({ slug: 1 }, { unique: true }): esa línea del
// snippet original de la guía duplica el mismo índice y Mongoose lo marca
// como warning al arrancar. Cero cambio de comportamiento, un índice único
// en cualquiera de las dos formas.)

// Stemming en español y pesos por campo — término > palabras clave > definición.
glossaryTermSchema.index(
  { term: 'text', definition: 'text', keywords: 'text' },
  {
    default_language: 'spanish',
    weights: { term: 10, keywords: 5, definition: 1 },
    name: 'glossary_text_search',
  }
);

export default mongoose.model('GlossaryTerm', glossaryTermSchema);
