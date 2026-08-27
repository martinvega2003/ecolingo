import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/UseAuth.js';
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
      <label className="flex flex-col gap-1 text-sm text-muted">
        Email
        <input
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={handleChange('email')}
          placeholder="docente@colegio.edu.py"
          className="rounded-md border border-hair border-muted bg-surface px-3 py-2 text-text outline-none focus:border-info"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Contraseña
        <input
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange('password')}
          placeholder="••••••••"
          className="rounded-md border border-hair border-muted bg-surface px-3 py-2 text-text outline-none focus:border-info"
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-primary px-4 py-2 font-medium text-text transition-opacity disabled:opacity-60"
      >
        {isSubmitting ? 'Ingresando…' : 'Entrar'}
      </button>
    </form>
  );
};

export default TeacherLoginForm;