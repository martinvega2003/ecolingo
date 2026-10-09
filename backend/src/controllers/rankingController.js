import { getClassRanking } from '../services/rankingService.js';
import { badRequest } from '../utils/apiError.js';

const SCOPES = ['weekly', 'alltime'];

export async function getRanking(req, res, next) {
  try {
    const rawScope = req.query.scope ?? 'weekly';
    if (!SCOPES.includes(rawScope)) {
      throw badRequest('VALIDATION_ERROR', 'scope debe ser "weekly" o "alltime".', [
        { field: 'scope', issue: 'Valor no permitido.' },
      ]);
    }

    const rawLimit = req.query.limit !== undefined ? Number(req.query.limit) : 20;
    if (!Number.isInteger(rawLimit) || rawLimit < 1 || rawLimit > 100) {
      throw badRequest('VALIDATION_ERROR', 'limit debe ser un entero entre 1 y 100.', [
        { field: 'limit', issue: 'Fuera de rango.' },
      ]);
    }

    const ranking = await getClassRanking({
      requesterId: req.user.id,
      classCode: req.user.classCode,
      scope: rawScope,
      limit: rawLimit,
    });

    res.json(ranking);
  } catch (err) {
    next(err);
  }
}
