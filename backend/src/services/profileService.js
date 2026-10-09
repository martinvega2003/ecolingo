import bcrypt from 'bcrypt';
import { User } from '../models/index.js';
import { getMe, FULLNAME_RE, EMAIL_RE, collapseSpaces, toTitleCase } from './authService.js';
import { badRequest, unauthorized, forbidden, conflict, notFound } from '../utils/apiError.js';

const rounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

export const updateProfile = async (authUser, body) => {
  const user = await User.findById(authUser.id).select('+pinHash +passwordHash');
  if (!user) {
    throw notFound('USER_NOT_FOUND', 'El usuario del token ya no existe.');
  }

  const details = [];
  const updates = {};

  if (body.fullName !== undefined) {
    const collapsed = collapseSpaces(String(body.fullName));
    if (!FULLNAME_RE.test(collapsed)) {
      details.push({ field: 'fullName', issue: '3-80 caracteres. Solo letras, espacios, apóstrofes y guiones.' });
    } else {
      updates.fullName = toTitleCase(collapsed);
    }
  }

  if (body.email !== undefined) {
    if (user.role !== 'teacher') {
      throw forbidden('FORBIDDEN_ROLE', 'Un alumno no puede modificar email.');
    }
    const normalizedEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!EMAIL_RE.test(normalizedEmail)) {
      details.push({ field: 'email', issue: 'Formato de email inválido.' });
    } else {
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (existing) {
        throw conflict('EMAIL_ALREADY_REGISTERED', 'Ya existe otro docente con ese email.');
      }
      updates.email = normalizedEmail;
    }
  }

  if (details.length > 0) {
    throw badRequest('VALIDATION_ERROR', 'Uno o más campos no son válidos.', details);
  }

  if (Object.keys(updates).length > 0) {
    Object.assign(user, updates);
    await user.save();
  }

  return getMe({ id: user.id });
};

export const changePassword = async (authUser, { currentPassword, newPassword }) => {
  if (authUser.role !== 'teacher') {
    throw forbidden('FORBIDDEN_ROLE', 'El solicitante es un alumno.');
  }

  // Parte 1, endpoint 24: currentPassword es "Requerido" — su ausencia es
  // un 400, no un 401 INCORRECT_CURRENT_PASSWORD.
  if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
    throw badRequest('VALIDATION_ERROR', 'La contraseña actual es requerida.', [
      { field: 'currentPassword', issue: 'Requerido.' },
    ]);
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    throw badRequest('VALIDATION_ERROR', 'La contraseña nueva debe tener al menos 8 caracteres.', [
      { field: 'newPassword', issue: 'Mínimo 8 caracteres.' },
    ]);
  }

  const user = await User.findById(authUser.id).select('+passwordHash');
  if (!user) {
    throw notFound('USER_NOT_FOUND', 'El usuario del token ya no existe.');
  }

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) {
    throw unauthorized('INCORRECT_CURRENT_PASSWORD', 'La contraseña actual no coincide.');
  }

  if (newPassword === currentPassword) {
    throw badRequest('VALIDATION_ERROR', 'La contraseña nueva debe ser distinta de la actual.', [
      { field: 'newPassword', issue: 'Es igual a la actual.' },
    ]);
  }

  user.passwordHash = await bcrypt.hash(newPassword, rounds);
  await user.save();
};
