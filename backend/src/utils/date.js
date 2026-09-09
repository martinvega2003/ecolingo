// GUIA_DE_CODIGO.md §0.8 — única fuente de verdad para fechas locales.
// Paraguay dejó de aplicar horario de verano desde 2024, por lo que el
// desfase de −3 es constante durante todo el período del piloto. Este
// supuesto queda documentado explícitamente acá, tal como pide el
// documento.
const PY_OFFSET_HOURS = -3;

const toLocalDate = (date = new Date()) => new Date(date.getTime() + PY_OFFSET_HOURS * 60 * 60 * 1000);

// → 'YYYY-MM-DD' en UTC-3 (America/Asuncion)
export const toLocalDateString = (date = new Date()) => toLocalDate(date).toISOString().slice(0, 10);

// → lunes 00:00 UTC-3, expresado como instante UTC. Usado para el corte
// semanal del ranking (F06) y de weeklyXp.
export const getWeekStart = (date = new Date()) => {
  const local = toLocalDate(date);
  const day = local.getUTCDay(); // 0 = domingo … 6 = sábado, sobre el reloj ya desplazado
  const diffToMonday = day === 0 ? 6 : day - 1;
  local.setUTCDate(local.getUTCDate() - diffToMonday);
  local.setUTCHours(0, 0, 0, 0);
  // Vuelve a UTC real restando el desfase que se sumó en toLocalDate.
  return new Date(local.getTime() - PY_OFFSET_HOURS * 60 * 60 * 1000);
};
