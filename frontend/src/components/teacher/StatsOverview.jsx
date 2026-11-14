// F08 — Parte 3. Tarjetas de estadísticas + gráficos. Paleta obligatoria
// de tailwind.config.js pasada explícita a Recharts (fill/stroke) — riesgo
// documentado en la guía: "nunca la paleta default de la librería".
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, CalendarDays, CircleCheck, Layers, ListChecks, Timer, Users, Zap } from 'lucide-react';
import Card from '../common/Card.jsx';
import ModuleIcon from '../common/ModuleIcon.jsx';
import { colors } from '../../theme/colors.js';
import { getModuleTheme } from '../../theme/moduleTheme.js';
import { formatSeconds } from '../../utils/time.js';

// Los valores salen de tailwind.config.js (theme/colors.js): Recharts necesita
// el color como string, pero la paleta sigue definida en un solo lugar.
const TOKENS = colors;

// Clases completas y literales a propósito — Tailwind purga cualquier
// clase armada con interpolación de string (`text-${accent}` no generaría
// CSS), así que el mapeo tiene que quedar con los nombres enteros acá.
const TONE_CLASSES = {
  text: 'bg-surface-2 text-text',
  accent: 'bg-accent/15 text-accent',
  info: 'bg-info/15 text-info',
  warn: 'bg-warn/15 text-warn',
  gold: 'bg-gold/15 text-gold',
};

const StatCard = ({ icon: Icon, label, value, accent = 'text' }) => (
  <Card className="flex items-center gap-3">
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE_CLASSES[accent]}`}>
      <Icon aria-hidden="true" className="h-5 w-5" />
    </span>
    <div className="min-w-0">
      <p className="text-xl font-extrabold text-text">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
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
    <div className="rounded-xl border border-surface-2 bg-surface-2 px-3 py-2 text-xs text-text">
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
    // Cada barra en el color de su módulo (mismo que en el Mapa)
    color: TOKENS[getModuleTheme(m.order).colorKey],
    fullTitle: m.title,
    completedBy: m.completedBy,
    averageAccuracy: m.averageAccuracy,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Alumnos" value={stats.studentCount} accent="info" />
        <StatCard icon={Activity} label="Activos hoy" value={stats.activeToday} accent="accent" />
        <StatCard icon={CalendarDays} label="Activos esta semana" value={stats.activeThisWeek} accent="info" />
        <StatCard icon={Zap} label="XP promedio" value={stats.averageXp} accent="gold" />
        <StatCard icon={Layers} label="Módulos completados (prom.)" value={stats.averageCompletedModules} />
        <StatCard icon={Timer} label="Tiempo promedio / sesión" value={formatSeconds(stats.averageTimePerSessionSeconds)} />
        <StatCard icon={ListChecks} label="Intentos totales" value={stats.totalAttempts} />
        <StatCard icon={CircleCheck} label="Tasa de finalización" value={`${stats.completionRate}%`} accent="accent" />
      </div>

      {stats.moduleBreakdown.length > 0 && (
        <>
          <Card>
            <p className="mb-3 text-sm font-extrabold text-text">Alumnos que completaron cada módulo</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.muted} opacity={0.2} />
                  <XAxis dataKey="title" stroke={TOKENS.muted} fontSize={12} />
                  <YAxis stroke={TOKENS.muted} fontSize={12} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={TOOLTIP_CURSOR} />
                  <Bar dataKey="completedBy" name="Completado por" fill={TOKENS.info} radius={[6, 6, 0, 0]}>
                    {chartData.map((d) => (
                      <Cell key={d.title} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <p className="mb-3 text-sm font-extrabold text-text">Precisión promedio por módulo</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.muted} opacity={0.2} />
                  <XAxis dataKey="title" stroke={TOKENS.muted} fontSize={12} />
                  <YAxis stroke={TOKENS.muted} fontSize={12} domain={[0, 100]} unit="%" />
                  <Tooltip content={<ChartTooltip />} cursor={TOOLTIP_CURSOR} />
                  <Bar dataKey="averageAccuracy" name="Precisión" fill={TOKENS.accent} radius={[6, 6, 0, 0]}>
                    {chartData.map((d) => (
                      <Cell key={d.title} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <p className="mb-3 text-sm font-extrabold text-text">Desglose por módulo</p>
            <div className="flex flex-col gap-1">
              {stats.moduleBreakdown.map((m) => (
                <div
                  key={m.order}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-surface-2"
                >
                  <span className="flex items-center gap-2 font-bold text-text">
                    <ModuleIcon order={m.order} size="sm" />
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
