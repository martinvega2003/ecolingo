import { badRequest } from '../utils/apiError.js';
import { search, listGlossaryTerms } from '../services/searchService.js';

const VALID_TYPES = ['all', 'module', 'glossary'];

/**
 * F10 — Endpoint 25: GET /search
 * GUIA_DE_CODIGO.md, Parte 1. Disponible para ambos roles.
 */
export async function getSearchResults(req, res, next) {
  try {
    const { q, type = 'all', limit = '20' } = req.query;

    if (!q || q.trim().length < 2) {
      return next(badRequest('SEARCH_QUERY_TOO_SHORT', 'La búsqueda necesita al menos 2 caracteres.'));
    }

    // La guía no da un error específico para q > 60 caracteres — se trata
    // como VALIDATION_ERROR, igual que type/limit fuera de rango.
    if (q.length > 60) {
      return next(badRequest('VALIDATION_ERROR', 'La búsqueda no puede superar los 60 caracteres.'));
    }

    if (!VALID_TYPES.includes(type)) {
      return next(badRequest('VALIDATION_ERROR', 'type debe ser "all", "module" o "glossary".'));
    }

    const limitNum = Number(limit);
    if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 50) {
      return next(badRequest('VALIDATION_ERROR', 'limit debe ser un entero entre 1 y 50.'));
    }

    const result = await search({
      q: q.trim(),
      type,
      limit: limitNum,
      userId: req.user.id,
      role: req.user.role,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * F10 — Endpoint 27 (propuesto): GET /glossary
 * No está en GUIA_DE_CODIGO.md — se agrega para cubrir "recorrer el
 * glosario completo sin buscar" (criterio de aceptación de F10),
 * que el endpoint 25 no puede cumplir (q mínimo 2 caracteres).
 */
export async function getGlossary(req, res, next) {
  try {
    const result = await listGlossaryTerms();
    res.json(result);
  } catch (err) {
    next(err);
  }
}
