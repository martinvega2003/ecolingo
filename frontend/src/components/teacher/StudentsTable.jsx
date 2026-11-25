// F08 — Parte 3. Lista ordenable de alumnos con barra de progreso
// (endpoint 17) + botón de reseteo de PIN por fila (endpoint 26, F01).
import { useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Eye, EyeOff, Flame, KeyRound, Zap } from 'lucide-react';
import Avatar from '../common/Avatar.jsx';
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

// Solo se listan los alumnos con al menos un módulo completado: así las
// cuentas de prueba (0 módulos, 0 XP) no ensucian el panel sin borrarlas de
// la BD. Es un filtro de pantalla — el endpoint 17 sigue devolviendo todo.
// El docente puede mostrarlos con el interruptor del pie (p. ej. para
// resetear el PIN de un alumno que todavía no completó ningún módulo).
const MIN_COMPLETED_MODULES = 1;

export default function StudentsTable({
  students: allStudents,
  sortBy,
  order,
  isRefreshing = false,
  errorMessage = '',
  onSortChange,
  onResetPin,
}) {
  const [resettingId, setResettingId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const withProgress = allStudents.filter((s) => s.completedModules >= MIN_COMPLETED_MODULES);
  const noProgressCount = allStudents.length - withProgress.length;
  const students = showAll ? allStudents : withProgress;

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
        <p className="text-sm font-extrabold text-text">
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
            className="rounded-lg border border-surface-2 bg-surface-2 px-2 py-1.5 text-text outline-none focus:border-info"
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
            className="flex items-center gap-1 rounded-lg border border-surface-2 bg-surface-2 px-2 py-1.5 text-muted transition-colors hover:text-text"
            title="Invertir orden"
          >
            {order === 'asc' ? (
              <ArrowUpNarrowWide aria-hidden="true" className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownWideNarrow aria-hidden="true" className="h-3.5 w-3.5" />
            )}
            {order === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState
          title="Todavía no hay alumnos con módulos completados"
          description="Los alumnos aparecen acá apenas completan su primer módulo."
        />
      ) : (
        <div className={`flex flex-col gap-1 transition-opacity ${isRefreshing ? 'opacity-50' : ''}`}>
          {students.map((s) => (
            <div
              key={s.id}
              className="flex flex-col gap-2 rounded-xl p-2 transition-colors hover:bg-surface-2 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar fullName={s.fullName} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-text">
                    {s.fullName} <span className="font-medium text-muted">· {s.username}</span>
                  </p>
                  <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                    <span className="flex items-center gap-0.5 font-bold text-accent">
                      <Zap aria-hidden="true" className="h-3 w-3 fill-accent" />
                      {s.totalXp} XP
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Flame aria-hidden="true" className="h-3 w-3 text-warn" />
                      racha {s.currentStreak}
                    </span>
                    <span>{s.badgeCount} insignias</span>
                    <span>{s.totalAttempts} intentos</span>
                    <span>{formatSeconds(s.totalTimeSpentSeconds)} jugadas</span>
                    {s.lastActivityDate && <span>última actividad: {s.lastActivityDate}</span>}
                    {!s.isActive && <span className="font-semibold text-danger">inactivo</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:w-72">
                <div className="flex-1">
                  <ProgressBar
                    value={s.completedModules}
                    max={s.totalModules}
                    size="sm"
                    label={`${s.completedModules}/${s.totalModules} módulos (${s.completionPercentage}%)`}
                  />
                </div>
                <Button
                  variant="secondary"
                  icon={KeyRound}
                  disabled={resettingId === s.id}
                  onClick={() => handleReset(s)}
                  className="shrink-0 px-3 py-1.5 text-xs"
                  title="Generar un PIN nuevo para este alumno"
                >
                  {resettingId === s.id ? 'Reseteando…' : 'Resetear PIN'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {noProgressCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-pressed={showAll}
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-text"
        >
          {showAll ? (
            <EyeOff aria-hidden="true" className="h-3.5 w-3.5" />
          ) : (
            <Eye aria-hidden="true" className="h-3.5 w-3.5" />
          )}
          {showAll
            ? 'Ocultar alumnos sin módulos completados'
            : `Mostrar ${noProgressCount} ${noProgressCount === 1 ? 'alumno oculto' : 'alumnos ocultos'} (sin módulos completados)`}
        </button>
      )}

      {errorMessage && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}
    </Card>
  );
}
