// GUIA_DE_CODIGO.md — Parte 2, F01. Copiado literal del documento.
import bcrypt from 'bcrypt';
import { User, Class } from '../models/index.js';

export const seedClassroom = async () => {
  const email = process.env.SEED_TEACHER_EMAIL ?? 'docente@ecolingo.py';
  const password = process.env.SEED_TEACHER_PASSWORD ?? 'CambiarEstaClave2026';
  const rounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

  let teacher = await User.findOne({ email });
  if (!teacher) {
    teacher = await User.create({
      role: 'teacher',
      fullName: 'Docente Ecolingo',
      email,
      passwordHash: await bcrypt.hash(password, rounds),
    });
    console.log(`✅ Docente creado: ${email}`);
  } else {
    console.log(`ℹ️ Docente ya existente: ${email}`);
  }

  await Class.updateOne(
    { code: 'ECO2025' },
    {
      $set: { name: 'Grupo piloto — 3.º Curso', teacherId: teacher._id, isActive: true },
      $setOnInsert: { isPretestEnabled: false, isPosttestEnabled: false },
    },
    { upsert: true }
  );
  console.log('✅ Clase ECO2025 cargada');
};
