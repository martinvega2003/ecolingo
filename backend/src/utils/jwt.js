// GUIA_DE_CODIGO.md §0.2 — JWT y modelo de autorización.
// Copiado literal del documento: payload exacto, HS256, iss/aud fijos.
import jwt from 'jsonwebtoken';

export const signToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
      fullName: user.fullName,
      classCode: user.classCode ?? null,
    },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_EXPIRES_IN,
      issuer: 'ecolingo-api',
      audience: 'ecolingo-web',
    }
  );

export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: 'ecolingo-api',
    audience: 'ecolingo-web',
  });
