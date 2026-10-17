// GUIA_DE_CODIGO.md — Parte 1, F08. Rutas de los endpoints 16, 17, 18, 19, 20.
// El endpoint 26 (reset-pin) NO va acá — es de F01, ver routes/authRoutes.js.
import { Router } from 'express';
import { getClasses, getStudents, getStats, patchSettings, getExport } from '../controllers/teacherController.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = Router();

router.use('/teacher/classes', requireAuth, requireRole('teacher'));

router.get('/teacher/classes', getClasses); // 16
router.get('/teacher/classes/:classCode/students', getStudents); // 17
router.get('/teacher/classes/:classCode/stats', getStats); // 18
router.patch('/teacher/classes/:classCode/settings', patchSettings); // 19
router.get('/teacher/classes/:classCode/export', getExport); // 20

export default router;
