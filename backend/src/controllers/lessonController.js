// GUIA_DE_CODIGO.md — Parte 1, F04. Controladores finos: extraen
// req.params/req.body y delegan toda la lógica a lessonService.
import { startAttempt, getAttemptState, answerQuestion, abandonAttempt } from '../services/lessonService.js';

// 7. POST /modules/:moduleId/attempts
export const postStartAttempt = async (req, res, next) => {
  try {
    const result = await startAttempt({ userId: req.user.id, moduleId: req.params.moduleId });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// 8. GET /attempts/:attemptId
export const getAttempt = async (req, res, next) => {
  try {
    const result = await getAttemptState({ userId: req.user.id, attemptId: req.params.attemptId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// 9. POST /attempts/:attemptId/answers
export const postAnswer = async (req, res, next) => {
  try {
    const { questionId, selectedOptionKey, timeToAnswerSeconds } = req.body;
    const result = await answerQuestion({
      userId: req.user.id,
      attemptId: req.params.attemptId,
      questionId,
      selectedOptionKey,
      timeToAnswerSeconds,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// 10. POST /attempts/:attemptId/abandon
export const postAbandon = async (req, res, next) => {
  try {
    const result = await abandonAttempt({ userId: req.user.id, attemptId: req.params.attemptId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
