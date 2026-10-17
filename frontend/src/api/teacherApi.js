// Wrapper delgado sobre client.js (mismo patrón que api/authApi.js y
// api/lessonApi.js) — arma las llamadas de F08 (endpoints 16-20) y del
// endpoint 26 (reset-pin, de F01, pero el botón que lo dispara vive acá).
import client, { getErrorMessage } from './client.js';

// 16. GET /teacher/classes
export const fetchTeacherClasses = () => client.get('/teacher/classes').then((res) => res.data);

// 17. GET /teacher/classes/:classCode/students
export const fetchClassStudents = (classCode, { sortBy, order } = {}) =>
  client.get(`/teacher/classes/${classCode}/students`, { params: { sortBy, order } }).then((res) => res.data);

// 18. GET /teacher/classes/:classCode/stats
export const fetchClassStats = (classCode) =>
  client.get(`/teacher/classes/${classCode}/stats`).then((res) => res.data);

// 19. PATCH /teacher/classes/:classCode/settings
export const updateClassSettings = (classCode, payload) =>
  client.patch(`/teacher/classes/${classCode}/settings`, payload).then((res) => res.data);

// 26. PATCH /teacher/classes/:classCode/students/:userId/reset-pin (F01)
export const resetStudentPin = (classCode, userId) =>
  client.patch(`/teacher/classes/${classCode}/students/${userId}/reset-pin`).then((res) => res.data);

// 20. GET /teacher/classes/:classCode/export
// responseType 'blob' + descarga manual: el endpoint requiere el header
// Authorization, así que no puede ser un <a href> plano — hay que pasar
// por axios con el token y disparar la descarga a mano.
export const downloadClassExport = async (classCode, { include = 'summary' } = {}) => {
  try {
    const res = await client.get(`/teacher/classes/${classCode}/export`, {
      params: { format: 'csv', include },
      responseType: 'blob',
    });

    const disposition = res.headers['content-disposition'] ?? '';
    const match = disposition.match(/filename="([^"]+)"/);
    const filename = match?.[1] ?? `ecolingo_${classCode}_${include}.csv`;

    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    // Con responseType 'blob', un error 4xx/5xx llega como Blob JSON en vez
    // de objeto — hay que releerlo a mano para que getErrorMessage funcione.
    if (err.response?.data instanceof Blob && err.response.data.type.includes('json')) {
      const text = await err.response.data.text();
      try {
        err.response.data = JSON.parse(text);
      } catch {
        // deja el blob como está si no era JSON parseable
      }
    }
    throw err;
  }
};

export { getErrorMessage };
