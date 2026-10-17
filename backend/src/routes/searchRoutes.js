// GUIA_DE_CODIGO.md — Parte 1, F10. Rutas del endpoint 25 y del 27
// (propuesto, ver searchController.js).
import { Router } from 'express';
import { getSearchResults, getGlossary } from '../controllers/searchController.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = Router();

router.get('/search', requireAuth, getSearchResults); // 25
router.get('/glossary', requireAuth, getGlossary); // 27 (propuesto)

export default router;
