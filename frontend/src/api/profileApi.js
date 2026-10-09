import client from './client.js';
export { getErrorMessage } from './client.js';
export const updateProfile = (payload) => client.patch('/me', payload).then((res) => res.data);
export const changePassword = (payload) => client.patch('/me/password', payload).then(() => undefined);
