import { getModuleResult } from '../services/resultService.js';

export const getResult = async (req, res, next) => {
  try {
    const result = await getModuleResult(req.user, req.params.attemptId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
