// Aísla Date.now() en un módulo sin componentes.
export const now = () => Date.now();

// Aditivo para F08 (panel del docente): formatea segundos como "Xm Ys"
// para totalTimeSpentSeconds / averageDurationSeconds. No toca lo de arriba.
export const formatSeconds = (totalSeconds) => {
  const safe = Math.max(0, Math.round(totalSeconds ?? 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};