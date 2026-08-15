import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecolingo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const code = err.response?.data?.error?.code;
    if (code === 'EXPIRED_TOKEN' || code === 'INVALID_TOKEN' || code === 'MISSING_TOKEN') {
      localStorage.removeItem('ecolingo_token');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(err);
  }
);

/** Extrae un mensaje mostrable de cualquier error de la API. */
export const getErrorMessage = (err) =>
  err.response?.data?.error?.message ??
  'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.';

export default client;