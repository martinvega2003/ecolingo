// Wrapper delgado sobre client.js (§0.1/§0.3 de GUIA_DE_CODIGO.md — no se
// toca ese archivo, ya existe). Solo arma las llamadas de F01.
import client from './client.js';

// 2. POST /auth/student/login
export const studentLogin = (payload) => client.post('/auth/student/login', payload).then((res) => res.data);

// 3. POST /auth/teacher/login
export const teacherLogin = (payload) => client.post('/auth/teacher/login', payload).then((res) => res.data);

// 4. GET /auth/me
export const fetchMe = () => client.get('/auth/me').then((res) => res.data);
