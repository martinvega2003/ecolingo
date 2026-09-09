// GUIA_DE_CODIGO.md §0.2 — Middleware requireRole('student' | 'teacher').
// Se aplica después de requireAuth. Error: FORBIDDEN_ROLE (403).
import { forbidden } from '../utils/apiError.js';

export const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return next(forbidden('FORBIDDEN_ROLE', 'El rol del token no habilita este endpoint.'));
  }
  return next();
};
