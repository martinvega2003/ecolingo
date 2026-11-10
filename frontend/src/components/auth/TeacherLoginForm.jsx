import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Loader2, Lock, Mail, TriangleAlert } from 'lucide-react';
import Input from '../common/Input.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { homeRouteForRole } from '../../utils/routes.js';

const TeacherLoginForm = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginTeacher } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { user } = await loginTeacher(form);
      // Redirección por rol (F01).
      navigate(homeRouteForRole(user.role), { replace: true });
    } catch (err) {
      const code = err.response?.data?.error?.code;
      // INVALID_CREDENTIALS es el único error de negocio documentado acá,
      // con el mismo mensaje para email inexistente y contraseña errada
      // a propósito (Parte 1, F01, endpoint 3) — no se distingue en la UI.
      setError(
        code === 'VALIDATION_ERROR'
          ? 'Revisá el email y la contraseña.'
          : 'Email o contraseña incorrectos.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Email"
        icon={Mail}
        type="email"
        required
        autoComplete="email"
        value={form.email}
        onChange={handleChange('email')}
        placeholder="docente@colegio.edu.py"
      />

      <Input
        label="Contraseña"
        icon={Lock}
        type="password"
        revealable
        required
        minLength={8}
        autoComplete="current-password"
        value={form.password}
        onChange={handleChange('password')}
        placeholder="••••••••"
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-text transition-all hover:bg-primary/85 active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100"
      >
        {isSubmitting ? (
          <>
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> Ingresando…
          </>
        ) : (
          <>
            Entrar <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
};

export default TeacherLoginForm;