import client from './client.js';

// 7. POST /modules/:moduleId/attempts
export const startAttempt = (moduleId) => client.post(`/modules/${moduleId}/attempts`).then((res) => res.data);

// 8. GET /attempts/:attemptId
export const fetchAttempt = (attemptId) => client.get(`/attempts/${attemptId}`).then((res) => res.data);

// 9. POST /attempts/:attemptId/answers
export const submitAnswer = (attemptId, payload) =>
  client.post(`/attempts/${attemptId}/answers`, payload).then((res) => res.data);

// 10. POST /attempts/:attemptId/abandon
export const abandonAttempt = (attemptId) => client.post(`/attempts/${attemptId}/abandon`).then((res) => res.data);
