import { Router } from 'express';
import { patchMe, patchPassword } from '../controllers/profileController.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = Router();

router.patch('/me', requireAuth, patchMe); // 23
router.patch('/me/password', requireAuth, patchPassword); // 24

export default router;
