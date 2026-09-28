import { useState } from 'react';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { updateProfile, changePassword, getErrorMessage } from '../api/profileApi.js';

export default function Perfil() {
  const { user, refreshUser } = useAuth();
  const isTeacher = user?.role === 'teacher';

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-lg font-medium text-text">Perfil de usuario</h1>
      <ProfileForm user={user} refreshUser={refreshUser} isTeacher={isTeacher} />
      {isTeacher && <PasswordForm />}
    </div>
  );
}

function ProfileForm({ user, refreshUser, isTeacher }) {
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMessage('');

    const payload = { fullName };
    if (isTeacher) payload.email = email;

    try {
      await updateProfile(payload);
      await refreshUser();
      setStatus('saved');
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setStatus('error');
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="fullName" className="text-xs text-muted">Nombre completo</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            minLength={3}
            maxLength={80}
            required
            className="rounded-md border border-hair border-muted bg-bg px-3 py-2 text-sm text-text"
          />
        </div>

        {isTeacher ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs text-muted">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-md border border-hair border-muted bg-bg px-3 py-2 text-sm text-text"
            />
          </div>
        ) : (
          <>
            <ReadOnlyField label="Usuario" value={user?.username} />
            <ReadOnlyField label="Código de clase" value={user?.classCode} note="No se puede modificar." />
          </>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Guardando…' : 'Guardar cambios'}
          </Button>
          {status === 'saved' && <span className="text-sm text-accent">✓ Guardado</span>}
        </div>

        {status === 'error' && <p className="text-sm text-danger">{errorMessage}</p>}
      </form>
    </Card>
  );
}

function ReadOnlyField({ label, value, note }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted">{label}</label>
      <input
        type="text"
        value={value ?? ''}
        disabled
        className="cursor-not-allowed rounded-md border border-hair border-muted bg-surface px-3 py-2 text-sm text-muted"
      />
      {note && <p className="text-xs text-muted">{note}</p>}
    </div>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMessage('');

    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setStatus('saved');
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setStatus('error');
    }
  };

  return (
    <Card>
      <h2 className="mb-3 text-sm font-medium text-text">Cambiar contraseña</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="currentPassword" className="text-xs text-muted">Contraseña actual</label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="rounded-md border border-hair border-muted bg-bg px-3 py-2 text-sm text-text"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="newPassword" className="text-xs text-muted">Contraseña nueva</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
            className="rounded-md border border-hair border-muted bg-bg px-3 py-2 text-sm text-text"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="secondary" disabled={status === 'saving'}>
            {status === 'saving' ? 'Guardando…' : 'Cambiar contraseña'}
          </Button>
          {status === 'saved' && <span className="text-sm text-accent">✓ Contraseña actualizada</span>}
        </div>

        {status === 'error' && <p className="text-sm text-danger">{errorMessage}</p>}
      </form>
    </Card>
  );
}
