// GUIA_DE_CODIGO.md — Parte 1, F01 (endpoints 2, 3, 4, 26) + Parte 2
// (hashPin/verifyPin/generateRandomPin son literales del documento).
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User, Class } from '../models/index.js';
import { badRequest, notFound, conflict, unauthorized, forbidden } from '../utils/apiError.js';

const rounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

// --- PIN — literal de la Parte 2 de la guía ---
export const hashPin = (pin) => bcrypt.hash(pin, rounds);
export const verifyPin = (pin, pinHash) => bcrypt.compare(pin, pinHash);
export const generateRandomPin = () => String(Math.floor(1000 + Math.random() * 9000));

// --- Validación — patrones y normalización exactos de la tabla del
// endpoint 2 (Parte 1, F01). ---
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const CLASS_CODE_RE = /^[A-Z0-9]{4,12}$/;
const PIN_RE = /^\d{4}$/;
const FULLNAME_RE = /^[\p{L}\s'-]{3,80}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const collapseSpaces = (s) => s.trim().replace(/\s+/g, ' ');

// "Se normaliza a Title Case y se colapsan espacios múltiples" (endpoint 2).
const toTitleCase = (s) =>
  collapseSpaces(s)
    .toLowerCase()
    .split(' ')
    .map((word) =>
      word
        .split('-')
        .map((part) =>
          part
            .split("'")
            .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
            .join("'")
        )
        .join('-')
    )
    .join(' ');

const validateStudentLoginPayload = ({ username, fullName, classCode, pin }) => {
  const details = [];

  const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
  if (!USERNAME_RE.test(normalizedUsername)) {
    details.push({
      field: 'username',
      issue: 'Debe tener 3-20 caracteres: minúsculas, números o guion bajo.',
    });
  }

  const normalizedClassCode = typeof classCode === 'string' ? classCode.trim().toUpperCase() : '';
  if (!CLASS_CODE_RE.test(normalizedClassCode)) {
    details.push({ field: 'classCode', issue: 'Debe tener 4-12 caracteres alfanuméricos.' });
  }

  const normalizedPin = typeof pin === 'string' ? pin.trim() : '';
  if (!PIN_RE.test(normalizedPin)) {
    details.push({ field: 'pin', issue: 'Debe ser exactamente 4 dígitos.' });
  }

  // fullName solo es obligatorio en el registro — acá solo se valida SI vino.
  let normalizedFullName;
  if (fullName !== undefined && fullName !== null && fullName !== '') {
    const collapsed = collapseSpaces(String(fullName));
    if (!FULLNAME_RE.test(collapsed)) {
      details.push({
        field: 'fullName',
        issue: '3-80 caracteres. Solo letras, espacios, apóstrofes y guiones.',
      });
    } else {
      normalizedFullName = toTitleCase(collapsed);
    }
  }

  if (details.length > 0) {
    throw badRequest('VALIDATION_ERROR', 'Uno o más campos no son válidos.', details);
  }

  return { username: normalizedUsername, classCode: normalizedClassCode, pin: normalizedPin, fullName: normalizedFullName };
};

// Endpoint 2 — POST /auth/student/login
export const loginOrRegisterStudent = async (rawPayload) => {
  const { username, classCode, pin, fullName } = validateStudentLoginPayload(rawPayload);

  const classDoc = await Class.findOne({ code: classCode, isActive: true });
  if (!classDoc) {
    throw notFound('INVALID_CLASS_CODE', 'El código de clase no existe o no está activo.');
  }

  const existing = await User.findOne({ classCode, username, role: 'student' }).select('+pinHash');

  // ⚠️ Ver aviso en el chat: el catálogo de errores y los criterios de
  // aceptación (Parte 3, F01) piden USERNAME_TAKEN acá. El párrafo "Regla
  // de coincidencia" de la Parte 1 dice, en cambio, que si el usuario
  // existe se verifica el PIN "sin mirar fullName" — sin esta rama.
  // Implementado con USERNAME_TAKEN por ser la lectura mayoritaria (2 de
  // 3 menciones del documento). Pendiente de acuerdo bilateral.
  if (existing && fullName) {
    throw conflict('USERNAME_TAKEN', 'Ese nombre de usuario ya está en uso en esta clase.');
  }

  if (!existing) {
    if (!fullName) {
      throw notFound(
        'USER_NOT_FOUND',
        'El usuario no existe en esta clase. Si es tu primer ingreso, completá también tu nombre.'
      );
    }
    const pinHash = await hashPin(pin);
    const created = await User.create({ role: 'student', fullName, username, classCode, pinHash });
    return { user: created, classDoc, isNewUser: true };
  }

  const pinMatches = await verifyPin(pin, existing.pinHash);
  if (!pinMatches) {
    throw unauthorized('INVALID_PIN', 'El PIN no coincide con el registrado.');
  }

  return { user: existing, classDoc, isNewUser: false };
};

// Endpoint 3 — POST /auth/teacher/login
export const loginTeacher = async ({ email, password }) => {
  const details = [];

  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(normalizedEmail)) {
    details.push({ field: 'email', issue: 'Formato de email inválido.' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    details.push({ field: 'password', issue: 'Debe tener al menos 8 caracteres.' });
  }
  if (details.length > 0) {
    throw badRequest('VALIDATION_ERROR', 'Uno o más campos no son válidos.', details);
  }

  // Mismo mensaje para email inexistente y contraseña incorrecta — no
  // revelar qué emails están registrados (Parte 1, F01, endpoint 3).
  const teacher = await User.findOne({ email: normalizedEmail, role: 'teacher' }).select('+passwordHash');
  if (!teacher) {
    throw unauthorized('INVALID_CREDENTIALS', 'Email o contraseña incorrectos.');
  }

  const matches = await bcrypt.compare(password, teacher.passwordHash);
  if (!matches) {
    throw unauthorized('INVALID_CREDENTIALS', 'Email o contraseña incorrectos.');
  }

  return teacher;
};

// Endpoint 4 — GET /auth/me
export const getMe = async (authUser) => {
  const user = await User.findById(authUser.id);
  if (!user) {
    throw notFound('USER_NOT_FOUND', 'El usuario del token ya no existe.');
  }

  if (user.role === 'teacher') {
    const classCount = await Class.countDocuments({ teacherId: user._id });
    return {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      classCode: null,
      classCount,
    };
  }

  const classDoc = user.classCode ? await Class.findOne({ code: user.classCode }) : null;

  // ⚠️ completedModules, totalModules y badgeCount dependen de los modelos
  // Module/Progress (F03, Persona A) y UserBadge (F07, Persona A), que
  // todavía no existen en esta etapa (solo F01). Se resuelven contra el
  // *registro* de Mongoose (mongoose.models), no contra un nombre de
  // colección adivinado: en cuanto F03/F07 registren sus modelos reales,
  // esto empieza a contar bien solo, sin tocar este archivo. Mientras
  // tanto devuelve 0 — que es el estado real de un alumno sin módulos.
  // Avisado en el chat.
  const ModuleModel = mongoose.models.Module;
  const ProgressModel = mongoose.models.Progress;
  const UserBadgeModel = mongoose.models.UserBadge;

  const [totalModules, completedModules, badgeCount] = await Promise.all([
    ModuleModel ? ModuleModel.countDocuments() : 0,
    ProgressModel ? ProgressModel.countDocuments({ userId: user._id, status: 'completed' }) : 0,
    UserBadgeModel ? UserBadgeModel.countDocuments({ userId: user._id }) : 0,
  ]);

  return {
    id: user.id,
    role: user.role,
    fullName: user.fullName,
    classCode: user.classCode,
    totalXp: user.totalXp,
    weeklyXp: user.weeklyXp,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    completedModules,
    totalModules,
    badgeCount,
    class: classDoc
      ? {
          code: classDoc.code,
          name: classDoc.name,
          isPretestEnabled: classDoc.isPretestEnabled,
          isPosttestEnabled: classDoc.isPosttestEnabled,
          pretestFormUrl: classDoc.pretestFormUrl,
          posttestFormUrl: classDoc.posttestFormUrl,
        }
      : null,
  };
};

// Endpoint 26 — PATCH /teacher/classes/:classCode/students/:userId/reset-pin
export const resetStudentPin = async ({ teacherId, classCode, userId }) => {
  const classDoc = await Class.findOne({ code: classCode });
  if (!classDoc) {
    throw notFound('CLASS_NOT_FOUND', 'El classCode no existe.');
  }
  if (String(classDoc.teacherId) !== String(teacherId)) {
    throw forbidden('NOT_RESOURCE_OWNER', 'La clase pertenece a otro docente.');
  }

  const student = await User.findOne({ _id: userId, classCode, role: 'student' });
  if (!student) {
    throw notFound('USER_NOT_FOUND', 'El userId no existe en esa clase.');
  }

  const newPin = generateRandomPin();
  student.pinHash = await hashPin(newPin);
  await student.save();

  // El PIN se devuelve en texto plano una sola vez (endpoint 26) — nunca
  // queda almacenado así ni se puede volver a consultar.
  return { username: student.username, fullName: student.fullName, newPin };
};
