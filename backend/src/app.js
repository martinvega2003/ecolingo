import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import modulesRoutes from './routes/modulesRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
app.use(express.json({ limit: '100kb' }));

// Endpoint 1 del Contrato Técnico (§0.7, literal del documento)
app.get('/api/v1/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    database: states[mongoose.connection.readyState] ?? 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// F01 — Autenticación (Parte 1: endpoints 2, 3, 4, 26)
app.use('/api/v1', authRoutes);

// F03 — Mapa de Módulos (Parte 1: endpoints 5, 6, 12)
app.use('/api/v1', modulesRoutes);

// 404 con el envoltorio de error estándar — literal de §0.7. Nota: el
// código NOT_FOUND no figura en la tabla del catálogo de §0.1, aunque sí
// se usa acá tal cual lo trae el documento; vale la pena agregarlo a la
// tabla de §0.1 para que el catálogo quede completo.
app.use((req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Recurso no encontrado.', details: [] },
  });
});

// Traduce cualquier error lanzado (incluidos los de F01) al mismo envoltorio.
app.use(errorHandler);

export default app;