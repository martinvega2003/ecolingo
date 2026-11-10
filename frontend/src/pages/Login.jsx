// Parte 3, F01 — pantalla de login, ruta /login (§0.12).
// El diseño visual final es el de Diseño p. 4 (documento externo, fuera
// de mi alcance en esta sesión) — acá se resuelve la estructura y el
// comportamiento funcional sobre los tokens de Tailwind de §0.4. Ajustar
// espaciados/tipografía cuando tengan ese diseño a mano.
// Visual: marca arriba, iconos financieros flotando muy sutiles de fondo,
// pestañas con subrayado animado y formulario que entra con un fundido.
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Coins, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
import StudentLoginForm from '../components/auth/StudentLoginForm.jsx';
import TeacherLoginForm from '../components/auth/TeacherLoginForm.jsx';
import Logo from '../components/common/Logo.jsx';

const ROLES = [
  { value: 'student', label: 'Soy alumno' },
  { value: 'teacher', label: 'Soy docente' },
];

// Decoración: posición, tamaño y retraso fijos (nada de Math.random en render).
const FLOATERS = [
  { Icon: PiggyBank, className: 'left-[8%] top-[14%] h-12 w-12', delay: 0 },
  { Icon: Coins, className: 'right-[10%] top-[20%] h-10 w-10', delay: 1.2 },
  { Icon: TrendingUp, className: 'left-[14%] bottom-[16%] h-11 w-11', delay: 2.1 },
  { Icon: Wallet, className: 'right-[12%] bottom-[12%] h-12 w-12', delay: 0.6 },
];

const Login = () => {
  const [role, setRole] = useState('student'); // 'student' | 'teacher'

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-primary/15 via-bg to-bg px-4 py-8">
      {FLOATERS.map(({ Icon, className, delay }, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className={`pointer-events-none absolute hidden text-primary/30 sm:block ${className}`}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
        >
          <Icon className="h-full w-full" />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <motion.div
            initial={{ scale: 0.6, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 12, delay: 0.1 }}
          >
            <Logo size="lg" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-extrabold text-text">Ecolingo</h1>
            <p className="text-sm text-muted">Aprendé a manejar tu plata jugando</p>
          </div>
        </div>

        <div className="rounded-2xl border border-hair border-muted bg-surface p-6">
          <div className="mb-6 flex border-b border-bg text-sm">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`relative flex-1 pb-2 font-medium transition-colors ${
                  role === r.value ? 'text-text' : 'text-muted hover:text-text'
                }`}
              >
                {r.label}
                {role === r.value && (
                  <motion.span
                    layoutId="login-role-underline"
                    className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
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
    </main>
  );
};

export default Login;
