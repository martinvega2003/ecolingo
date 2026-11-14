// F08 — Parte 3, Pantalla 7 (Diseño p. 10). Orquesta los endpoints 16, 17,
// 18 y 20, más el 19 (vía ClassSettingsPanel) y el 26 de F01 (vía
// ResetPinModal/StudentsTable). El estado de cada módulo/alumno lo calcula
// siempre el servidor — este componente solo pinta lo que llega.
//
// Carga inicial (clase + stats + alumnos) y refetch de alumnos por cambio
// de orden están separados a propósito: cambiar "Ordenar por" NO debe
// volver a pedir stats/clase ni tirar la pantalla a un spinner de carga
// completa — antes lo hacía, y además, al traer stats de nuevo, los
// gráficos de Recharts se remontaban y volvían a animar como si la
// pantalla entera se hubiese recargado.
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Users } from 'lucide-react';
import Card from '../components/common/Card.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import StatsOverview from '../components/teacher/StatsOverview.jsx';
import StudentsTable from '../components/teacher/StudentsTable.jsx';
import ClassSettingsPanel from '../components/teacher/ClassSettingsPanel.jsx';
import ExportPanel from '../components/teacher/ExportPanel.jsx';
import ResetPinModal from '../components/teacher/ResetPinModal.jsx';
import {
  fetchTeacherClasses,
  fetchClassStudents,
  fetchClassStats,
  updateClassSettings,
  resetStudentPin,
  downloadClassExport,
  getErrorMessage,
} from '../api/teacherApi.js';

const DEFAULT_SORT = { sortBy: 'totalXp', order: 'desc' };

// El key por classCode remonta el detalle al cambiar de clase: el estado
// vuelve a 'loading' sin necesidad de un setState síncrono dentro del efecto.
export default function TeacherClassDetail() {
  const { classCode } = useParams();
  return <ClassDetail key={classCode} classCode={classCode} />;
}

function ClassDetail({ classCode }) {
  const navigate = useNavigate();

  const [state, setState] = useState('loading'); // loading | ready | error — solo para la carga inicial
  const [errorMessage, setErrorMessage] = useState('');
  const [classInfo, setClassInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [pinResult, setPinResult] = useState(null);

  // Carga inicial: clase + stats + alumnos, una sola vez por classCode (con
  // el orden inicial fijo — cambios posteriores de orden pasan por
  // reloadStudents, no por acá). El estado arranca en 'loading'; el reintento
  // (handler) lo reinicia y dispara el efecto con reloadKey.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchTeacherClasses(), fetchClassStats(classCode), fetchClassStudents(classCode, DEFAULT_SORT)])
      .then(([classesRes, statsRes, studentsRes]) => {
        if (cancelled) return;
        const found = classesRes.classes.find((c) => c.code === classCode);
        if (!found) {
          // NOT_RESOURCE_OWNER / CLASS_NOT_FOUND ya se habría disparado en
          // stats o students — esto cubre el caso raro de una carrera entre
          // llamadas. Vuelve al listado en vez de mostrar una pantalla a
          // medio llenar.
          navigate('/docente', { replace: true });
          return;
        }
        setClassInfo(found);
        setStats(statsRes);
        setStudents(studentsRes.students);
        setSort(DEFAULT_SORT);
        setState('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(getErrorMessage(err));
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [classCode, navigate, reloadKey]);

  const loadInitial = () => {
    setState('loading');
    setReloadKey((k) => k + 1);
  };

  // Refetch SOLO de la lista de alumnos — no toca classInfo, stats, ni el
  // estado de carga completa. La tabla vieja queda visible (con un
  // indicador sutil) hasta que llegan los datos nuevos.
  const reloadStudents = useCallback(
    (nextSort) => {
      setStudentsLoading(true);
      setStudentsError('');
      fetchClassStudents(classCode, nextSort)
        .then((res) => setStudents(res.students))
        .catch((err) => setStudentsError(getErrorMessage(err)))
        .finally(() => setStudentsLoading(false));
    },
    [classCode]
  );

  const handleSortChange = (sortBy, order) => {
    const nextSort = { sortBy, order };
    setSort(nextSort);
    reloadStudents(nextSort);
  };

  const handleSaveSettings = async (payload) => {
    const updated = await updateClassSettings(classCode, payload);
    setClassInfo(updated);
  };

  const handleResetPin = async (student) => {
    const result = await resetStudentPin(classCode, student.id);
    setPinResult(result);
    reloadStudents(sort); // el reseteo no cambia stats, pero refresca por si acaso hay más de un panel abierto
  };

  const handleExport = (include) => downloadClassExport(classCode, { include });

  if (state === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Cargando el panel…" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="p-6">
        <ErrorState description={errorMessage} onRetry={loadInitial} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/docente')}
          className="flex items-center gap-1 self-start text-xs font-semibold text-muted transition-colors hover:text-text"
        >
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
          Volver a mis clases
        </button>
        <Card className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/40 text-accent">
            <GraduationCap aria-hidden="true" className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-extrabold text-text">{classInfo.name}</h1>
            <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
              <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-bold text-text">{classInfo.code}</span>
              <span className="flex items-center gap-1">
                <Users aria-hidden="true" className="h-3 w-3" />
                {stats.studentCount} {stats.studentCount === 1 ? 'alumno' : 'alumnos'}
              </span>
            </p>
          </div>
        </Card>
      </header>

      <StatsOverview stats={stats} />

      <StudentsTable
        students={students}
        sortBy={sort.sortBy}
        order={sort.order}
        isRefreshing={studentsLoading}
        errorMessage={studentsError}
        onSortChange={handleSortChange}
        onResetPin={handleResetPin}
      />

      <ExportPanel onExport={handleExport} />

      <ClassSettingsPanel classInfo={classInfo} onSave={handleSaveSettings} />

      <ResetPinModal result={pinResult} onClose={() => setPinResult(null)} />
    </div>
  );
}
