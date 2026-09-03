// GUIA_DE_CODIGO.md §0.8 — Cálculo de racha y escritura de XP.
// "La racha se calcula sobre actividad real (finalizar un intento), no
// sobre el mero login." Por eso esto solo se invoca al cerrar un intento
// (completed, failed o abandoned — cualquier actividad real), nunca en
// un simple GET.
import { User } from '../models/index.js';
import { toLocalDateString } from '../utils/date.js';

const computeStreak = (user, now = new Date()) => {
  const today = toLocalDateString(now);
  const last = user.lastActivityDate;

  if (last === today) {
    // Ya contó hoy — sin cambios.
    return { currentStreak: user.currentStreak, longestStreak: user.longestStreak, lastActivityDate: today };
  }

  const yesterday = toLocalDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const currentStreak = last === yesterday ? user.currentStreak + 1 : 1;
  const longestStreak = Math.max(user.longestStreak, currentStreak);

  return { currentStreak, longestStreak, lastActivityDate: today };
};

// Se invoca UNA vez al cerrar cualquier intento (completed/failed/
// abandoned — todas cuentan como "actividad real"), acredite o no XP.
// xpAmount es 0 para intentos failed/abandoned o repeticiones (§0.8:
// "otorgan 0 XP") — igual se registra la racha, solo que sin sumar XP.
export const registerActivity = async ({ userId, xpAmount = 0 }) => {
  const user = await User.findById(userId);
  const { currentStreak, longestStreak, lastActivityDate } = computeStreak(user);

  await User.updateOne(
    { _id: userId },
    {
      $inc: { totalXp: xpAmount, weeklyXp: xpAmount },
      $set: { currentStreak, longestStreak, lastActivityDate },
    }
  );

  return { currentStreak, longestStreak, lastActivityDate };
};
