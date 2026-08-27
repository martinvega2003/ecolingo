import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/UseAuth.js';
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
      <div className="flex rounded-md border border-hair border-muted p-1 text-sm">
        <button
          type="button"
          onClick={() => handleModeChange('returning')}
          className={`flex-1 rounded px-3 py-1.5 transition-colors ${
            mode === 'returning' ? 'bg-primary text-text' : 'text-muted'
          }`}
        >
          Ya tengo cuenta
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('new')}
          className={`flex-1 rounded px-3 py-1.5 transition-colors ${
            mode === 'new' ? 'bg-primary text-text' : 'text-muted'
          }`}
        >
          Soy nuevo
        </button>
      </div>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Usuario
        <input
          type="text"
          required
          minLength={3}
          maxLength={20}
          autoComplete="username"
          value={form.username}
          onChange={handleChange('username')}
          placeholder="ana_r"
          className="rounded-md border border-hair border-muted bg-surface px-3 py-2 text-text outline-none focus:border-info"
        />
      </label>

      {mode === 'new' && (
        <label className="flex flex-col gap-1 text-sm text-muted">
          Nombre completo
          <input
            type="text"
            required
            minLength={3}
            maxLength={80}
            value={form.fullName}
            onChange={handleChange('fullName')}
            placeholder="Ana Rodríguez"
            className="rounded-md border border-hair border-muted bg-surface px-3 py-2 text-text outline-none focus:border-info"
          />
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm text-muted">
        Código de clase
        <input
          type="text"
          required
          minLength={4}
          maxLength={12}
          value={form.classCode}
          onChange={handleChange('classCode')}
          placeholder="ECO2025"
          className="rounded-md border border-hair border-muted bg-surface px-3 py-2 uppercase text-text outline-none focus:border-info"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        PIN (4 dígitos)
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          required
          minLength={4}
          maxLength={4}
          value={form.pin}
          onChange={handleChange('pin')}
          placeholder="••••"
          className="rounded-md border border-hair border-muted bg-surface px-3 py-2 tracking-[0.5em] text-text outline-none focus:border-info"
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
        {isSubmitting ? 'Ingresando…' : mode === 'new' ? 'Crear cuenta' : 'Entrar'}
      </button>
    </form>
  );
};

export default StudentLoginForm;