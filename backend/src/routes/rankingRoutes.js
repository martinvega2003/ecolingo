import { Router } from 'express';
import { getRanking } from '../controllers/rankingController.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = Router();

router.get('/ranking', requireAuth, requireRole('student'), getRanking); // 15

export default router;
