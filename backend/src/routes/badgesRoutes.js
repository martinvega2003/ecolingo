import { Router } from 'express';
import { getMyBadges, getBadgeCatalog } from '../controllers/badgesController.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = Router();

router.get('/me/badges', requireAuth, requireRole('student'), getMyBadges); // 13
router.get('/badges', requireAuth, getBadgeCatalog); // 14

export default router;
