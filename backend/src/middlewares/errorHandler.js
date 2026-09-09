import { ApiError } from '../utils/apiError.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details ?? [] },
    });
  }

  // Errores de validación nativos de Mongoose (p. ej. .save() fuera de un
  // controlador que ya valida a mano) — mismo envoltorio, no se deja pasar
  // el objeto de error nativo de Mongoose.
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, issue: e.message }));
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Uno o más campos no son válidos.', details },
    });
  }

  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'El cuerpo de la petición no es JSON válido.', details: [] },
    });
  }

  console.error('❌ Error no controlado:', err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Error no controlado.', details: [] },
  });
};
