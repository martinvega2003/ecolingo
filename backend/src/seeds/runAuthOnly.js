// Runner TEMPORAL — solo para probar F01 en local, antes de que existan
// los seeds de las demás features (badges, modules, questions, glossary —
// ver §0.11). Cuando F03/F07/etc. tengan su seed propio, esto se
// reemplaza por el orquestador real de seeds/index.js, que llama a todos
// en orden. No confundir con el seed final del proyecto — avisar a Cesar
// antes de que alguien más corra esto pensando que es el completo.
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { seedClassroom } from './classroom.js';

const run = async () => {
  await connectDatabase();
  const dbName = mongoose.connection.name;
  console.log(`\n🌱 Seed (solo F01) sobre la base: ${dbName}\n`);

  // Misma salvaguarda que describe §0.11 para el orquestador completo.
  if (dbName.includes('prod') && process.env.CONFIRM_PROD_SEED !== 'yes') {
    console.error(
      '⛔ Estás apuntando a la base de PRODUCCIÓN.\n' +
        '   Si es intencional, ejecutá: CONFIRM_PROD_SEED=yes npm run seed:auth'
    );
    process.exit(1);
  }

  await seedClassroom();
  console.log('\n🏁 Seed de F01 completado.\n');
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('❌ El seed falló:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
