// Mismo criterio de insensibilidad que el backend (searchService.js,
// Reglas de búsqueda F10): "buscar interes encuentra interés".
export const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
