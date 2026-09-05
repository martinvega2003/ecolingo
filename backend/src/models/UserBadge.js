// GUIA_DE_CODIGO.md — Parte 2, F07 (colección `userBadges`). Mismo caso
// que Badge.js — ver la nota para Cesar ahí.
import mongoose from 'mongoose';

const { Schema } = mongoose;

const userBadgeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    badgeCode: { type: String, required: true, uppercase: true },
    unlockedAt: { type: Date, default: Date.now },
    sourceAttemptId: { type: Schema.Types.ObjectId, ref: 'ModuleAttempt', default: null },
  },
  { timestamps: true }
);

// Este índice único es lo que hace idempotente a evaluateBadges(): el
// segundo insertOne para el mismo (userId, badgeCode) falla con 11000, y
// el servicio captura ese error e lo ignora en vez de evitarlo con una
// lectura previa (que tendría condición de carrera).
userBadgeSchema.index({ userId: 1, badgeCode: 1 }, { unique: true });

export default mongoose.model('UserBadge', userBadgeSchema);
