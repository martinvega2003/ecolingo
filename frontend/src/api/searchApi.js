// Wrapper delgado sobre client.js (mismo patrón que api/teacherApi.js) —
// arma las llamadas de F10: endpoint 25 (búsqueda) y 27 (glosario
// completo, propuesto — ver backend/src/controllers/searchController.js).
import client, { getErrorMessage } from './client.js';

// 25. GET /search
export const fetchSearch = ({ q, type = 'all', limit = 20 } = {}) =>
  client.get('/search', { params: { q, type, limit } }).then((res) => res.data);

// 27. GET /glossary (propuesto)
export const fetchGlossary = () => client.get('/glossary').then((res) => res.data);

export { getErrorMessage };
