// F09 — Perfil (Endpoints 23 y 24; propuesta visual, Pantalla 7).
// Avatar de iniciales, nombre, usuario y clase; para el alumno, cuatro datos
// (XP, racha, módulos, insignias) para que el perfil no sea solo un
// formulario. Los campos que no se pueden editar llevan candado.
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, CircleCheck, Flame, KeyRound, Layers, Lock, Save, Zap } from 'lucide-react';
import Avatar from '../components/common/Avatar.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { fetchMyBadges } from '../api/badgesApi.js';
import { fetchMyProgress } from '../api/progressApi.js';
import { updateProfile, changePassword, getErrorMessage } from '../api/profileApi.js';

const FIELD_CLASS =
  'w-full rounded-xl border border-surface-2 bg-surface-2 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-info';

export default function Perfil() {
  const { user, refreshUser } = useAuth();
  const isTeacher = user?.role === 'teacher';

  return (
    <div className={`grid gap-4 p-4 ${isTeacher ? 'mx-auto max-w-3xl' : 'md:grid-cols-[18rem_minmax(0,1fr)] md:items-start'}`}>
      <div className="flex flex-col gap-4">
        <IdentityCard user={user} isTeacher={isTeacher} />
        {!isTeacher && <StudentStats user={user} />}
      </div>
      <div className="flex flex-col gap-4">
        <ProfileForm user={user} refreshUser={refreshUser} isTeacher={isTeacher} />
        {isTeacher && <PasswordForm />}
      </div>
    </div>
  );
}

function IdentityCard({ user, isTeacher }) {
  return (
    <Card className="flex flex-col items-center gap-2 py-6 text-center">
      <Avatar fullName={user?.fullName} size="lg" highlight />
      <h1 className="mt-1 text-xl font-extrabold text-text">{user?.fullName}</h1>
      {isTeacher ? (
        <p className="text-sm text-muted">Docente · {user?.email}</p>
      ) : (
        <>
          <p className="text-sm font-semibold text-muted">@{user?.username}</p>
          <p className="text-xs text-muted">
            {user?.class?.name ? `${user.class.name} · ` : ''}
            {user?.classCode}
          </p>
        </>
      )}
    </Card>
  );
}

// Cuatro datos del alumno. XP y racha salen de la sesión (GET /auth/me);
// módulos del Endpoint 12 (GET /me/progress) e insignias del Endpoint 13
// (GET /me/badges). Si alguna de las dos llamadas falla, ese dato muestra "–".
function StudentStats({ user }) {
  const [progress, setProgress] = useState(null);
  const [badges, setBadges] = useState(null);

  useEffect(() => {
    let ignore = false;
    fetchMyProgress()
      .then((res) => {
        if (!ignore) setProgress(res);
      })
      .catch(() => {});
    fetchMyBadges()
      .then((res) => {
        if (!ignore) setBadges(res);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatBox icon={Zap} tone="text-accent" value={user?.totalXp ?? 0} label="XP total" />
      <StatBox icon={Flame} tone="text-warn" value={user?.currentStreak ?? 0} label="días de racha" />
      <StatBox
        icon={Layers}
        tone="text-info"
        value={progress ? `${progress.completedModules}/${progress.totalModules}` : '–'}
        label="módulos"
      />
      <StatBox
        icon={Award}
        tone="text-gold"
        value={badges ? `${badges.unlockedCount}/${badges.totalCount}` : '–'}
        label="insignias"
      />
    </div>
  );
}

function StatBox({ icon: Icon, tone, value, label }) {
  return (
    <Card className="flex flex-col items-center gap-0.5 py-3 text-center">
      <Icon aria-hidden="true" className={`h-5 w-5 ${tone}`} />
      <p className="text-lg font-extrabold text-text">{value}</p>
      <p className="text-[11px] font-semibold text-muted">{label}</p>
    </Card>
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
      <h2 className="mb-4 text-base font-extrabold text-text">Tus datos</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="text-xs font-semibold text-muted">Nombre completo</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            minLength={3}
            maxLength={80}
            required
            className={FIELD_CLASS}
          />
        </div>

        {isTeacher ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-muted">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={FIELD_CLASS}
            />
          </div>
        ) : (
          <>
            <ReadOnlyField label="Usuario" value={user?.username} />
            <ReadOnlyField label="Código de clase" value={user?.classCode} note="No se puede modificar." />
          </>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" icon={Save} disabled={status === 'saving'}>
            {status === 'saving' ? 'Guardando…' : 'Guardar cambios'}
          </Button>
          {status === 'saved' && <SavedBadge text="Guardado" />}
        </div>

        {status === 'error' && <p className="text-sm text-danger">{errorMessage}</p>}
      </form>
    </Card>
  );
}

// Campo de solo lectura (username y classCode del alumno — F09: "se muestran
// de solo lectura"). El candado deja claro que no es un error que no se pueda editar.
function ReadOnlyField({ label, value, note }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted">{label}</span>
      <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-surface-2 px-3 py-2.5 text-sm text-muted">
        <span className="truncate">{value ?? ''}</span>
        <Lock aria-label="No se puede modificar" className="h-3.5 w-3.5 shrink-0" />
      </div>
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
      <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-text">
        <KeyRound aria-hidden="true" className="h-4 w-4 text-muted" />
        Cambiar contraseña
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="currentPassword" className="text-xs font-semibold text-muted">Contraseña actual</label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className={FIELD_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="newPassword" className="text-xs font-semibold text-muted">Contraseña nueva</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
            className={FIELD_CLASS}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="secondary" icon={KeyRound} disabled={status === 'saving'}>
            {status === 'saving' ? 'Guardando…' : 'Cambiar contraseña'}
          </Button>
          {status === 'saved' && <SavedBadge text="Contraseña actualizada" />}
        </div>

        {status === 'error' && <p className="text-sm text-danger">{errorMessage}</p>}
      </form>
    </Card>
  );
}

// Confirmación visual al guardar (criterio de F09): el check aparece con un pequeño "pop".
function SavedBadge({ text }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 16 }}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
    >
      <CircleCheck aria-hidden="true" className="h-4 w-4" />
      {text}
    </motion.span>
  );
}
