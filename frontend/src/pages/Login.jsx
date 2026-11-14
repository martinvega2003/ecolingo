// Parte 3, F01 — pantalla de login, ruta /login (§0.12).
// Visual (propuesta unificada, Pantalla 1): en PC la pantalla se divide en
// dos — a la izquierda la marca con el chanchito y monedas flotando, a la
// derecha el formulario. En celular el chanchito queda arriba del formulario.
// El comportamiento (roles, campos, errores, redirección) no cambia.
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StudentLoginForm from '../components/auth/StudentLoginForm.jsx';
import TeacherLoginForm from '../components/auth/TeacherLoginForm.jsx';
import Coin from '../components/common/Coin.jsx';
import Mascot from '../components/common/Mascot.jsx';
import { Wordmark } from '../components/common/Logo.jsx';

const ROLES = [
  { value: 'student', label: 'Soy alumno' },
  { value: 'teacher', label: 'Soy docente' },
];

// Monedas decorativas: posición, tamaño y retraso fijos (nada de Math.random en render).
const COINS = [
  { className: 'left-[12%] top-[14%] h-10 w-10', delay: 0 },
  { className: 'right-[16%] top-[22%] h-8 w-8', delay: 1.2 },
  { className: 'left-[20%] bottom-[20%] h-7 w-7', delay: 2.1 },
  { className: 'right-[12%] bottom-[14%] h-11 w-11', delay: 0.6 },
  { className: 'left-[46%] top-[8%] h-6 w-6', delay: 1.7 },
];

const FloatingCoins = () =>
  COINS.map(({ className, delay }, i) => (
    <motion.div
      key={i}
      aria-hidden="true"
      className={`pointer-events-none absolute opacity-80 ${className}`}
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <Coin className="h-full w-full" />
    </motion.div>
  ));

const Login = () => {
  const [role, setRole] = useState('student'); // 'student' | 'teacher'

  return (
    <main className="grid min-h-screen bg-bg md:grid-cols-2">
      {/* Columna de marca: solo en PC */}
      <section className="relative hidden flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/60 to-bg px-8 md:flex">
        <FloatingCoins />
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 14 }}
        >
          <Mascot title="Chanchito alcancía de Ecolingo" className="h-56 w-56" />
        </motion.div>
        <Wordmark className="mt-2 text-5xl" />
        <p className="mt-3 max-w-xs text-center text-base text-text/80">
          Aprendé a manejar tu plata jugando, a tu ritmo y con tu clase.
        </p>
      </section>

      {/* Columna del formulario */}
      <section className="flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          {/* Marca compacta: solo en celular */}
          <div className="mb-5 flex flex-col items-center text-center md:hidden">
            <Mascot title="Chanchito alcancía de Ecolingo" className="h-28 w-28" />
            <Wordmark className="text-3xl" />
            <p className="mt-1 text-sm text-muted">Aprendé a manejar tu plata jugando</p>
          </div>

          <div className="rounded-3xl border border-surface-2 bg-surface p-6">
            <div className="mb-6 flex rounded-full bg-bg p-1 text-sm">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  aria-pressed={role === r.value}
                  className={`relative flex-1 rounded-full px-3 py-2 font-bold transition-colors ${
                    role === r.value ? 'text-text' : 'text-muted hover:text-text'
                  }`}
                >
                  {role === r.value && (
                    <motion.span
                      layoutId="login-role-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{r.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={role}
                initial={{ opacity: 0, x: role === 'student' ? -12 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {role === 'student' ? <StudentLoginForm /> : <TeacherLoginForm />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default Login;
