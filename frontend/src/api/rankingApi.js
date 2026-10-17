import client from './client.js';
export { getErrorMessage } from './client.js';
export const fetchRanking = (scope = 'weekly') =>
  client.get('/ranking', { params: { scope } }).then((res) => res.data);
