// GUIA_DE_CODIGO.md — §0.10 (Índices, inventario completo).
//
// En desarrollo, Mongoose crea los índices solo con conectarse
// (autoIndex: true en config/database.js). En producción autoIndex está
// apagado a propósito (no se quiere un build de índice en background
// disparado por un simple restart del servidor) — así que el índice de
// texto de glossaryTerms (F10) hay que crearlo a mano acá, una vez,
// después de desplegar el modelo.
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import * as models from '../models/index.js';

await connectDatabase();

for (const [name, model] of Object.entries(models)) {
  await model.createIndexes();
  const idx = await model.collection.indexes();
  console.log(`✅ ${name}: ${idx.length} índices`);
}

await mongoose.disconnect();
console.log('🏁 Índices creados.');
