// NOTA: GUIA_DE_CODIGO.md §0.6 lista apiError.js como util compartido y
// §0.1 define el *contrato* que tiene que producir (envoltorio
// { error: { code, message, details } } + tabla de código HTTP↔code),
// pero no da una implementación literal como sí hace con jwt.js. Esto es
// la implementación estándar de ese contrato — no una cita del documento.
// Recomendado: que Cesar la revise como cualquier archivo de utils/
// (zona compartida, §0.6) antes de mergear a dev.

export class ApiError extends Error {
  constructor(status, code, message, details = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Atajos para los códigos de error que usa F01 (catálogo completo en
// §0.1). No agregar códigos que no estén en ese catálogo — cada feature
// suma los suyos a medida que los necesita.
export const badRequest = (code, message, details = []) => new ApiError(400, code, message, details);
export const unauthorized = (code, message) => new ApiError(401, code, message);
export const forbidden = (code, message) => new ApiError(403, code, message);
export const notFound = (code, message) => new ApiError(404, code, message);
export const conflict = (code, message) => new ApiError(409, code, message);
