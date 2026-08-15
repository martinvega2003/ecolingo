/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117', // fondo de la aplicación
        surface: '#161b22', // cards, módulos, filas de ranking
        primary: '#1a6b3a', // botones principales, bordes activos
        accent: '#4ade80', // XP, destacados, respuestas correctas
        info: '#60a5fa', // módulo activo, posición propia en ranking
        warn: '#f59e0b', // racha diaria, estadísticas de posición
        danger: '#ef4444', // respuestas incorrectas, vida perdida
        text: '#e6f5ee', // títulos y texto principal
        muted: '#8b949e', // descripciones, subtítulos, etiquetas
      },
      borderWidth: { hair: '0.5px' },
    },
  },
  plugins: [],
};

