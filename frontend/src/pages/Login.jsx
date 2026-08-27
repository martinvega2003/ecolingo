// Parte 3, F01 — pantalla de login, ruta /login (§0.12).
// El diseño visual final es el de Diseño p. 4 (documento externo, fuera
// de mi alcance en esta sesión) — acá se resuelve la estructura y el
// comportamiento funcional sobre los tokens de Tailwind de §0.4. Ajustar
// espaciados/tipografía cuando tengan ese diseño a mano.
import { useState } from 'react';
import StudentLoginForm from '../components/auth/StudentLoginForm.jsx';
import TeacherLoginForm from '../components/auth/TeacherLoginForm.jsx';

const Login = () => {
  const [role, setRole] = useState('student'); // 'student' | 'teacher'

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-lg border border-hair border-surface bg-surface p-6">
        <h1 className="mb-1 text-xl font-semibold text-text">Ecolingo</h1>
        <p className="mb-6 text-sm text-muted">Educación financiera gamificada</p>

        <div className="mb-6 flex text-sm">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 border-b-2 pb-2 transition-colors ${
              role === 'student' ? 'border-accent text-text' : 'border-transparent text-muted'
            }`}
          >
            Soy alumno
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`flex-1 border-b-2 pb-2 transition-colors ${
              role === 'teacher' ? 'border-accent text-text' : 'border-transparent text-muted'
            }`}
          >
            Soy docente
          </button>
        </div>

        {role === 'student' ? <StudentLoginForm /> : <TeacherLoginForm />}
      </div>
    </main>
  );
};

export default Login;
