// Mismo criterio de insensibilidad que el backend (searchService.js,
// Reglas de búsqueda F10): "buscar interes encuentra interés".
export const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// Dos primeras iniciales de un nombre, para los avatares (Avatar.jsx).
export const initialsOf = (fullName = '') =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
