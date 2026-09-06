// GUIA_DE_CODIGO.md — Parte 1, F03. Rutas de los endpoints 5, 6, 12.
import { Router } from 'express';
import { getModules, getModuleDetail } from '../controllers/modulesController.js';
import { getProgress } from '../controllers/meController.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = Router();

router.get('/modules', requireAuth, getModules); // 5
router.get('/modules/:moduleId', requireAuth, getModuleDetail); // 6
router.get('/me/progress', requireAuth, getProgress); // 12

export default router;
