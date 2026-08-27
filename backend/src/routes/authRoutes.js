// GUIA_DE_CODIGO.md — Parte 1, F01. Rutas de los endpoints 2, 3, 4, 26.
import { Router } from 'express';
import { studentLogin, teacherLogin, me, resetPin } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = Router();

router.post('/auth/student/login', studentLogin); // 2
router.post('/auth/teacher/login', teacherLogin); // 3
router.get('/auth/me', requireAuth, me); // 4

// 26 — vive bajo /teacher, pero es parte de F01 (reseteo de PIN).
router.patch(
  '/teacher/classes/:classCode/students/:userId/reset-pin',
  requireAuth,
  requireRole('teacher'),
  resetPin
);

export default router;
