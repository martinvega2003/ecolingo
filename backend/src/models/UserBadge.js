import mongoose from 'mongoose';
const { Schema } = mongoose;

// GUIA_DE_CODIGO.md, Parte 2 — F07. Confirmado por Martín (Persona B).
const userBadgeSchema = new Schema({
  userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  badgeCode:       { type: String, required: true, uppercase: true },
  unlockedAt:      { type: Date, default: Date.now },
  sourceAttemptId: { type: Schema.Types.ObjectId, ref: 'ModuleAttempt', default: null },
}, { timestamps: true });

userBadgeSchema.index({ userId: 1, badgeCode: 1 }, { unique: true });

export default mongoose.model('UserBadge', userBadgeSchema);
