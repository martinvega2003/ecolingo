// Runner de desarrollo local. Sigue sin ser el orquestador final de
// §0.11 (todavía faltan los seeds de F06/F09/F10/F12, y los módulos 3-6
// están sin contenido real) — pero ya cubre F01 + F04 para probar en
// local. Reemplaza a runAuthOnly.js.
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { seedClassroom } from './classroom.js';
import { seedModules } from './modules.js';
import { seedQuestions } from './questions.js';
import { seedBadges } from './badges.js';

const run = async () => {
  await connectDatabase();
  const dbName = mongoose.connection.name;
  console.log(`\n🌱 Seed de desarrollo (F01 + F04) sobre la base: ${dbName}\n`);

  if (dbName.includes('prod') && process.env.CONFIRM_PROD_SEED !== 'yes') {
    console.error(
      '⛔ Estás apuntando a la base de PRODUCCIÓN.\n' +
        '   Si es intencional, ejecutá: CONFIRM_PROD_SEED=yes npm run seed:dev'
    );
    process.exit(1);
  }

  await seedClassroom();
  await seedModules(); // tiene que ir antes de seedQuestions
  await seedQuestions();
  await seedBadges();

  console.log('\n🏁 Seed de desarrollo completado.\n');
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('❌ El seed falló:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
