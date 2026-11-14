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
        // ── Propuesta visual unificada (nov 2026) ──────────────────────
        'surface-2': '#21262d', // hover, inputs, elementos elevados sobre surface
        gold: '#fbbf24', // monedas, medallas, dato del día
        bronze: '#d97706', // aro de la moneda y tercer puesto del podio
        // Un color por módulo (ver src/theme/moduleTheme.js)
        'mod-ahorro': '#22c55e', // módulo 1 — Ahorro e Interés
        'mod-presupuesto': '#3b82f6', // módulo 2 — Presupuesto
        'mod-credito': '#f97316', // módulo 3 — Crédito y deuda
        'mod-inversion': '#a855f7', // módulo 4 — Inversión básica
        'mod-plan': '#ec4899', // módulo 5 — Planificación financiera
        // Mascota (chanchito alcancía): solo los usa Mascot.jsx / Coin.jsx
        'mascot-light': '#86efac', // panza y hocico
        'mascot-mid': '#22c55e', // oreja y cola
        'mascot-dark': '#16a34a', // patas e interior de la oreja
        'mascot-deep': '#166534', // ranura y orificios del hocico
        'mascot-coin': '#92400e', // símbolo ₲ de la moneda
      },
      borderWidth: { hair: '0.5px' },
      fontFamily: {
        sans: ['"Nunito Variable"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

