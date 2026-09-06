// GUIA_DE_CODIGO.md — Parte 1, F04. Todas las rutas exigen sesión de
// alumno (requireAuth + requireRole('student')) — el motor de lección
// no aplica a docentes.
import { Router } from 'express';
import { postStartAttempt, getAttempt, postAnswer, postAbandon } from '../controllers/lessonController.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = Router();

router.post('/modules/:moduleId/attempts', requireAuth, requireRole('student'), postStartAttempt); // 7
router.get('/attempts/:attemptId', requireAuth, requireRole('student'), getAttempt); // 8
router.post('/attempts/:attemptId/answers', requireAuth, requireRole('student'), postAnswer); // 9
router.post('/attempts/:attemptId/abandon', requireAuth, requireRole('student'), postAbandon); // 10

export default router;
