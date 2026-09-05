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
export const unauthorized = (code, message, details = []) => new ApiError(401, code, message, details);
export const forbidden = (code, message, details = []) => new ApiError(403, code, message, details);
export const notFound = (code, message, details = []) => new ApiError(404, code, message, details);
export const conflict = (code, message, details = []) => new ApiError(409, code, message, details);
export const unprocessable = (code, message, details = []) => new ApiError(422, code, message, details);
