import client from './client.js';

// 12. GET /me/progress — resumen del alumno: currentStreak, lastActivityDate,
// completedModules, totalModules, completionPercentage, etc.
// (GUIA_DE_CODIGO.md, Parte 1 — F03, Endpoint 12).
export const fetchMyProgress = () => client.get('/me/progress').then((res) => res.data);
