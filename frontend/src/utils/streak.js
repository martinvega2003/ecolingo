// Racha semanal del Mapa (puntos L–D). Función pura: recibe la hora actual.
// Datos del Endpoint 12 (GET /me/progress): currentStreak y lastActivityDate
// ('YYYY-MM-DD' en UTC-3, igual que el backend).
//
// currentStreak solo se actualiza al jugar: si el alumno no juega varios
// días, el número guardado queda viejo. Por eso la racha se considera activa
// solo si la última actividad fue hoy o ayer.
const DAY_MS = 24 * 60 * 60 * 1000;
const UTC_OFFSET_MS = -3 * 60 * 60 * 1000;

const toDayNumber = (isoDate) => Math.floor(Date.parse(`${isoDate}T00:00:00Z`) / DAY_MS);

export const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const buildWeekStreak = ({ currentStreak = 0, lastActivityDate = null } = {}, nowMs) => {
  const today = Math.floor((nowMs + UTC_OFFSET_MS) / DAY_MS);
  // 1970-01-01 fue jueves: (día + 3) % 7 da 0 para lunes.
  const todayIndex = (((today + 3) % 7) + 7) % 7;
  const monday = today - todayIndex;

  const last = lastActivityDate ? toDayNumber(lastActivityDate) : null;
  const isActive = last !== null && currentStreak > 0 && today - last <= 1;
  const streak = isActive ? currentStreak : 0;
  const first = isActive ? last - streak + 1 : null;

  const days = WEEKDAY_LABELS.map((label, i) => {
    const day = monday + i;
    return {
      label,
      isToday: day === today,
      isDone: isActive && day >= first && day <= last,
    };
  });

  return { streak, days };
};
