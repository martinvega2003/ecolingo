// Mapea rol -> ruta "home", según §0.12 de GUIA_DE_CODIGO.md (alumno ->
// /mapa, docente -> /docente). Un solo lugar para esta relación — la usan
// ProtectedRoute, PublicOnlyRoute y los formularios de login.
export const homeRouteForRole = (role) => (role === 'teacher' ? '/docente' : '/mapa');