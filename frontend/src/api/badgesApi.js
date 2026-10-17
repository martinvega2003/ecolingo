import client from './client.js';
export { getErrorMessage } from './client.js';
export const fetchMyBadges = () => client.get('/me/badges').then((res) => res.data);
