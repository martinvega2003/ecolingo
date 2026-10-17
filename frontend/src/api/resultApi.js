import client from './client.js';
export { getErrorMessage } from './client.js';

export const fetchResult = (attemptId) =>
  client.get(`/attempts/${attemptId}/result`).then((res) => res.data);
