import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Hash, Lock, Loader2, TriangleAlert, User, UserRound } from 'lucide-react';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { homeRouteForRole } from '../../utils/routes.js';

const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Revisá los datos: hay algún campo con formato inválido.',
  INVALID_CLASS_CODE: 'Ese código de clase no existe o no está activo.',
  USER_NOT_FOUND: 'No encontramos ese usuario en la clase. Si es tu primer ingreso, elegí "Soy nuevo".',
  USERNAME_TAKEN: 'Ese nombre de usuario ya está en uso en esta clase. Elegí otro.',
  INVALID_PIN: 'El PIN no coincide.',
};

const initialState = { username: '', fullName: '', classCode: '', pin: '' };

const StudentLoginForm = () => {
  const [mode, setMode] = useState('returning'); // 'new' | 'returning'
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginStudent } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        username: form.username,
        classCode: form.classCode,
        pin: form.pin,
        ...(mode === 'new' ? { fullName: form.fullName } : {}),
      };
      const { user } = await loginStudent(payload);
      // Redirección por rol (F01).
      navigate(homeRouteForRole(user.role), { replace: true });
    } catch (err) {
      const code = err.response?.data?.error?.code;
      setError(ERROR_MESSAGES[code] ?? 'No pudimos iniciar sesión. Intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Usuario"
        icon={User}
        type="text"
        required
        minLength={3}
        maxLength={20}
        autoComplete="username"
        value={form.username}
        onChange={handleChange('username')}
        placeholder="ana_r"
      />

      <AnimatePresence initial={false}>
        {mode === 'new' && (
          <motion.div
            key="fullName"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Input
              label="Nombre completo"
              icon={UserRound}
              type="text"
              required
              minLength={3}
              maxLength={80}
              value={form.fullName}
              onChange={handleChange('fullName')}
              placeholder="Ana Rodríguez"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Input
        label="Código de clase"
        icon={Hash}
        type="text"
        required
        minLength={4}
        maxLength={12}
        value={form.classCode}
        onChange={handleChange('classCode')}
        placeholder="ECO2026"
        inputClassName="uppercase"
      />

      <Input
        label="PIN (4 dígitos)"
        icon={Lock}
        type="password"
        revealable
        inputMode="numeric"
        pattern="[0-9]*"
        required
        minLength={4}
        maxLength={4}
        value={form.pin}
        onChange={handleChange('pin')}
        placeholder="••••"
        inputClassName="tracking-[0.4em]"
      />

      <AnimatePresence>
        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-start gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <Button type="submit" disabled={isSubmitting} className="w-full py-3 text-base">
        {isSubmitting ? (
          <>
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> Ingresando…
          </>
        ) : (
          <>
            {mode === 'new' ? 'Crear cuenta' : 'Entrar'} <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </>
        )}
      </Button>

      {/* Alterna entre ingresar y registrarse (antes era un selector arriba del formulario) */}
      <p className="text-center text-sm text-muted">
        {mode === 'returning' ? '¿Primera vez?' : '¿Ya tenés cuenta?'}{' '}
        <button
          type="button"
          onClick={() => handleModeChange(mode === 'returning' ? 'new' : 'returning')}
          className="font-bold text-accent hover:underline"
        >
          {mode === 'returning' ? 'Creá tu cuenta' : 'Ingresá'}
        </button>
      </p>
    </form>
  );
};

export default StudentLoginForm;