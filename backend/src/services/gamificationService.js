// GUIA_DE_CODIGO.md §0.8 — Cálculo de racha y escritura de XP.
// "La racha se calcula sobre actividad real (finalizar un intento), no
// sobre el mero login." Por eso esto solo se invoca al cerrar un intento
// (completed, failed o abandoned — cualquier actividad real), nunca en
// un simple GET.
import { User } from '../models/index.js';
import { toLocalDateString, getWeekStart } from '../utils/date.js';

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
//
// 🐛 BUG encontrado y corregido acá: totalTimeSpentSeconds (User.js) nunca
// se incrementaba en ningún servicio — quedaba en 0 para todos los
// alumnos pase lo que pase, lo que rompía silenciosamente la columna del
// mismo nombre en la exportación CSV de F08 (encontrado al revisar el CSV
// exportado con datos reales). registerActivity ya es el único punto por
// el que pasan los tres cierres de intento (completed/failed en
// answerQuestion, abandoned en abandonAttempt) — es el lugar correcto
// para sumarlo una sola vez, sin duplicar la regla en cada llamador.
export const registerActivity = async ({ userId, xpAmount = 0, durationSeconds = 0 }) => {
  const user = await User.findById(userId);
  const { currentStreak, longestStreak, lastActivityDate } = computeStreak(user);
  const timeSpent = Math.max(0, durationSeconds ?? 0);

  // 🐛 D-09 — "en cada lectura o escritura de XP, si weeklyXpResetAt es
  // anterior al lunes de la semana en curso, weeklyXp se pone en 0". Acá
  // faltaba en la ESCRITURA: el $inc sumaba sobre el weeklyXp viejo y el
  // siguiente reinicio perezoso (al leer /ranking o /resultado) borraba
  // también el XP recién ganado esta semana.
  const weekStart = getWeekStart();
  const isWeekStale = !user.weeklyXpResetAt || user.weeklyXpResetAt < weekStart;

  const update = isWeekStale
    ? {
        $inc: { totalXp: xpAmount, totalTimeSpentSeconds: timeSpent },
        $set: { currentStreak, longestStreak, lastActivityDate, weeklyXp: xpAmount, weeklyXpResetAt: weekStart },
      }
    : {
        $inc: { totalXp: xpAmount, weeklyXp: xpAmount, totalTimeSpentSeconds: timeSpent },
        $set: { currentStreak, longestStreak, lastActivityDate },
      };

  await User.updateOne({ _id: userId }, update);

  return { currentStreak, longestStreak, lastActivityDate };
};
