import { useEffect, useMemo, useState, useCallback } from 'react';
import { AuthContext } from './AuthContext.js';
import { studentLogin, teacherLogin, fetchMe } from '../api/authApi.js';

const TOKEN_KEY = 'ecolingo_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Patrón recomendado por la propia documentación de React para "fetch
  // on mount": IIFE async adentro del efecto + bandera `ignore` en el
  // cleanup, en vez de llamar a una función declarada aparte que hace
  // setState — así el linter no lo confunde con un caso de "setState
  // síncrono dentro de un efecto" (https://react.dev/learn/synchronizing
  // -with-effects#fetching-data).
  useEffect(() => {
    let ignore = false;

    (async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        if (!ignore) setIsLoading(false);
        return;
      }
      try {
        const profile = await fetchMe();
        if (!ignore) setUser(profile);
      } catch {
        // El interceptor de client.js ya limpia el token y redirige en
        // EXPIRED_TOKEN / INVALID_TOKEN (§0.3). Esto cubre el resto de
        // los casos (p. ej. backend caído) para que el estado local no
        // quede mostrando una sesión que en realidad no es válida.
        localStorage.removeItem(TOKEN_KEY);
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const loginStudent = useCallback(async (payload) => {
    const data = await studentLogin(payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser({ ...data.user, class: data.class });
    return data;
  }, []);

  const loginTeacher = useCallback(async (payload) => {
    const data = await teacherLogin(payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // F02 (riesgo señalado en Parte 3): la cabecera se desactualiza cuando
  // cambian XP/racha (p. ej. al terminar una lección en F04/F05). Se deja
  // este método ya listo para que F05 lo invoque — se acuerda ahí, no acá,
  // para no duplicar estado.
  const refreshUser = useCallback(async () => {
    const profile = await fetchMe();
    setUser(profile);
    return profile;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      loginStudent,
      loginTeacher,
      logout,
      refreshUser,
    }),
    [user, isLoading, loginStudent, loginTeacher, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};