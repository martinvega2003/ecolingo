// GUIA_DE_CODIGO.md — Parte 2, F01 (colección `users`).
// Shape y modelo Mongoose copiados literal del documento.
import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
      enum: { values: ['student', 'teacher'], message: 'Rol inválido: {VALUE}' },
      index: true,
    },
    fullName: { type: String, required: true, trim: true, minlength: 3, maxlength: 80 },

    // --- Solo docentes ---
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido.'],
    },
    passwordHash: { type: String, default: null, select: false },

    // --- Solo alumnos ---
    username: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_]{3,20}$/, 'El usuario debe tener 3-20 caracteres: minúsculas, números o guion bajo.'],
    },
    classCode: { type: String, default: null, uppercase: true, trim: true, index: true },
    pinHash: { type: String, default: null, select: false }, // bcrypt del PIN de 4 dígitos — ver §0.2.1

    // --- Gamificación ---
    totalXp: { type: Number, default: 0, min: 0 },
    weeklyXp: { type: Number, default: 0, min: 0 },
    weeklyXpResetAt: { type: Date, default: Date.now },
    currentStreak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    lastActivityDate: { type: String, default: null }, // 'YYYY-MM-DD' en UTC-3

    // --- Métricas del piloto ---
    totalTimeSpentSeconds: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Validación condicional por rol: reemplaza el CHECK de PostgreSQL.
userSchema.pre('validate', function (next) {
  if (this.role === 'teacher') {
    if (!this.email) return next(new Error('Un docente requiere email.'));
    if (!this.passwordHash) return next(new Error('Un docente requiere contraseña.'));
    // Un índice sparse excluye campos AUSENTES, no en `null` — sin esto,
    // un segundo docente chocaría contra { classCode, username } igual
    // que pasó acá con email.
    this.username = undefined;
    this.classCode = undefined;
    this.pinHash = undefined;
  }
  if (this.role === 'student') {
    if (!this.username) return next(new Error('Un alumno requiere username.'));
    if (!this.classCode) return next(new Error('Un alumno requiere classCode.'));
    if (!this.pinHash) return next(new Error('Un alumno requiere PIN.'));
    this.email = undefined;
    this.passwordHash = undefined;
  }
  next();
});

// Índices — Parte 2, §0.10 de la guía.
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ classCode: 1, username: 1 }, { unique: true, sparse: true });
userSchema.index({ classCode: 1, weeklyXp: -1 }); // ranking semanal
userSchema.index({ classCode: 1, totalXp: -1 }); // panel del docente

export default mongoose.model('User', userSchema);
