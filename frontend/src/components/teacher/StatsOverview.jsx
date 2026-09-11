// F08 — Parte 3. Tarjetas de estadísticas + gráficos. Paleta obligatoria
// de tailwind.config.js pasada explícita a Recharts (fill/stroke) — riesgo
// documentado en la guía: "nunca la paleta default de la librería".
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card.jsx';
import { formatSeconds } from '../../utils/time.js';

const TOKENS = {
  primary: '#1a6b3a',
  accent: '#4ade80',
  info: '#60a5fa',
  warn: '#f59e0b',
  muted: '#8b949e',
  surface: '#161b22',
  text: '#e6f5ee',
};

// Clases completas y literales a propósito — Tailwind purga cualquier
// clase armada con interpolación de string (`text-${accent}` no generaría
// CSS), así que el mapeo tiene que quedar con los nombres enteros acá.
const ACCENT_CLASSES = {
  text: 'text-text',
  accent: 'text-accent',
  info: 'text-info',
  warn: 'text-warn',
};

const StatCard = ({ label, value, accent = 'text' }) => (
  <Card className="flex flex-col gap-1">
    <p className="text-xs text-muted">{label}</p>
    <p className={`text-xl font-semibold ${ACCENT_CLASSES[accent]}`}>{value}</p>
  </Card>
);

// El "fondo blanco" al pasar el mouse no es el fill de la barra — es el
// cursor por defecto de <Tooltip> en un BarChart, que Recharts pinta como
// un rectángulo gris claro detrás de toda la categoría. Se reemplaza por
// un overlay sutil sobre la paleta del tema en vez del gris default.
const TOOLTIP_CURSOR = { fill: TOKENS.text, opacity: 0.06 };

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-hair border-muted bg-surface px-3 py-2 text-xs text-text">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function StatsOverview({ stats }) {
  const chartData = stats.moduleBreakdown.map((m) => ({
    title: `M${m.order}`,
    fullTitle: m.title,
    completedBy: m.completedBy,
    averageAccuracy: m.averageAccuracy,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Alumnos" value={stats.studentCount} />
        <StatCard label="Activos hoy" value={stats.activeToday} accent="accent" />
        <StatCard label="Activos esta semana" value={stats.activeThisWeek} accent="info" />
        <StatCard label="XP promedio" value={stats.averageXp} accent="warn" />
        <StatCard label="Módulos completados (prom.)" value={stats.averageCompletedModules} />
        <StatCard label="Tiempo promedio / sesión" value={formatSeconds(stats.averageTimePerSessionSeconds)} />
        <StatCard label="Intentos totales" value={stats.totalAttempts} />
        <StatCard label="Tasa de finalización" value={`${stats.completionRate}%`} accent="accent" />
      </div>

      {stats.moduleBreakdown.length > 0 && (
        <>
          <Card>
            <p className="mb-3 text-sm font-medium text-text">Alumnos que completaron cada módulo</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.muted} opacity={0.2} />
                  <XAxis dataKey="title" stroke={TOKENS.muted} fontSize={12} />
                  <YAxis stroke={TOKENS.muted} fontSize={12} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={TOOLTIP_CURSOR} />
                  <Bar dataKey="completedBy" name="Completado por" fill={TOKENS.info} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <p className="mb-3 text-sm font-medium text-text">Precisión promedio por módulo</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.muted} opacity={0.2} />
                  <XAxis dataKey="title" stroke={TOKENS.muted} fontSize={12} />
                  <YAxis stroke={TOKENS.muted} fontSize={12} domain={[0, 100]} unit="%" />
                  <Tooltip content={<ChartTooltip />} cursor={TOOLTIP_CURSOR} />
                  <Bar dataKey="averageAccuracy" name="Precisión" fill={TOKENS.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <p className="mb-3 text-sm font-medium text-text">Desglose por módulo</p>
            <div className="flex flex-col gap-1">
              {stats.moduleBreakdown.map((m) => (
                <div
                  key={m.order}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-white/5"
                >
                  <span className="text-text">
                    {m.order}. {m.title}
                  </span>
                  <span className="text-muted">
                    {m.completedBy} completaron · {m.averageAccuracy}% precisión ·{' '}
                    {formatSeconds(m.averageDurationSeconds)} promedio
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
