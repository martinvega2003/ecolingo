import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';
import { getResult } from '../controllers/resultController.js';

const router = Router();

router.get('/attempts/:attemptId/result', requireAuth, requireRole('student'), getResult);

export default router;
