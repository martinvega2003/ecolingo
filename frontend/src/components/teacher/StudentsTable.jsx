// F08 — Parte 3. Lista ordenable de alumnos con barra de progreso
// (endpoint 17) + botón de reseteo de PIN por fila (endpoint 26, F01).
import { useState } from 'react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';
import ProgressBar from '../common/ProgressBar.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatSeconds } from '../../utils/time.js';

const SORT_OPTIONS = [
  { value: 'totalXp', label: 'XP total' },
  { value: 'fullName', label: 'Nombre' },
  { value: 'completedModules', label: 'Módulos completados' },
  { value: 'lastActivityDate', label: 'Última actividad' },
];

export default function StudentsTable({
  students,
  sortBy,
  order,
  isRefreshing = false,
  errorMessage = '',
  onSortChange,
  onResetPin,
}) {
  const [resettingId, setResettingId] = useState(null);

  const handleToggleOrder = () => onSortChange(sortBy, order === 'asc' ? 'desc' : 'asc');

  const handleReset = async (student) => {
    setResettingId(student.id);
    try {
      await onResetPin(student);
    } finally {
      setResettingId(null);
    }
  };

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-text">
          Alumnos ({students.length})
          {isRefreshing && <span className="ml-2 text-muted">actualizando…</span>}
        </p>
        <div className="flex items-center gap-2 text-xs">
          <label className="text-muted" htmlFor="sortBy">
            Ordenar por
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value, order)}
            className="rounded-md border border-hair border-muted bg-surface px-2 py-1 text-text outline-none focus:border-info"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleToggleOrder}
            className="rounded-md border border-hair border-muted px-2 py-1 text-muted hover:text-text"
            title="Invertir orden"
          >
            {order === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState
          title="Todavía no hay alumnos"
          description="Compartí el código de la clase para que se registren desde el login."
        />
      ) : (
        <div className={`flex flex-col gap-1 transition-opacity ${isRefreshing ? 'opacity-50' : ''}`}>
          {students.map((s) => (
            <div
              key={s.id}
              className="flex flex-col gap-2 rounded-md p-2 transition-colors hover:bg-white/5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-text">
                    {s.fullName} <span className="text-muted">· {s.username}</span>
                  </p>
                  <p className="text-xs text-muted">
                    {s.totalXp} XP · racha {s.currentStreak} · {s.badgeCount} insignias ·{' '}
                    {s.totalAttempts} intentos · {formatSeconds(s.totalTimeSpentSeconds)} jugadas
                    {!s.isActive && <span className="ml-2 text-danger">· inactivo</span>}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  disabled={resettingId === s.id}
                  onClick={() => handleReset(s)}
                  className="text-xs"
                >
                  {resettingId === s.id ? 'Reseteando…' : 'Resetear PIN'}
                </Button>
              </div>
              <ProgressBar
                value={s.completedModules}
                max={s.totalModules}
                label={`${s.completedModules}/${s.totalModules} módulos (${s.completionPercentage}%)`}
              />
            </div>
          ))}
        </div>
      )}

      {errorMessage && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}
    </Card>
  );
}
