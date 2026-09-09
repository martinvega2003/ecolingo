import { verifyToken } from '../utils/jwt.js';
import { unauthorized } from '../utils/apiError.js';

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(unauthorized('MISSING_TOKEN', 'No se envió el header Authorization.'));
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      fullName: payload.fullName,
      classCode: payload.classCode ?? null,
    };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(unauthorized('EXPIRED_TOKEN', 'El token superó su tiempo de vida.'));
    }
    return next(unauthorized('INVALID_TOKEN', 'Firma inválida o token corrupto.'));
  }
};
