// F10 — Buscador de contenido (Parte 3, GUIA_DE_CODIGO.md pág. 80-81).
// Consume el endpoint 25 (GET /search) tal cual — el ranking y el
// isAccessible de cada módulo los calcula el servidor.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { fetchSearch, getErrorMessage } from '../api/searchApi.js';
import { useAuth } from '../hooks/useAuth.js';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 350;

export default function Buscar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | ready | error
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadToken, setReloadToken] = useState(0); // cambiar este valor dispara una recarga

  const trimmedQuery = query.trim();

  // Patrón IIFE dentro del efecto (React Compiler purity rules, ver
  // /learnings.md del proyecto) — evita el setState síncrono directo en
  // el cuerpo del efecto, mismo criterio que LessonScreen.jsx (F04).
  useEffect(() => {
    let ignore = false;

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      (() => {
        setState('idle');
        setData(null);
      })();
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      (async () => {
        setState('loading');
        try {
          const res = await fetchSearch({ q: trimmedQuery });
          if (ignore) return;
          setData(res);
          setState('ready');
        } catch (err) {
          if (ignore) return;
          setErrorMessage(getErrorMessage(err));
          setState('error');
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [trimmedQuery, reloadToken]);

  const handleResultClick = (result) => {
    if (!isResultClickable(result, user.role)) return;
    navigate(result.route);
  };

  const glossaryResults = data?.results.filter((r) => r.type === 'glossary') ?? [];
  const moduleResults = data?.results.filter((r) => r.type === 'module') ?? [];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-lg font-medium text-text">Buscador</h1>
        <p className="text-sm text-muted">Buscá módulos y términos de economía personal.</p>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Escribí al menos 2 caracteres…"
        autoFocus
        className="rounded-lg border border-hair border-muted bg-surface px-4 py-2 text-sm text-text placeholder:text-muted focus:border-info focus:outline-none"
      />

      {state === 'idle' && (
        <p className="py-8 text-center text-sm text-muted">Escribí al menos 2 caracteres para buscar.</p>
      )}

      {state === 'loading' && (
        <div className="flex justify-center py-8">
          <Spinner label="Buscando…" />
        </div>
      )}

      {state === 'error' && <ErrorState description={errorMessage} onRetry={() => setReloadToken((t) => t + 1)} />}

      {state === 'ready' && data.results.length === 0 && (
        <EmptyState
          title="Sin resultados"
          description={`No encontramos nada para "${data.query}". Probá con otra palabra o mirá el glosario completo.`}
          action={
            <button type="button" onClick={() => navigate('/glosario')} className="text-sm font-medium text-info">
              Ver glosario completo
            </button>
          }
        />
      )}

      {state === 'ready' && data.results.length > 0 && (
        <div className="flex flex-col gap-5">
          {glossaryResults.length > 0 && (
            <ResultGroup title="Glosario" results={glossaryResults} role={user.role} onClick={handleResultClick} />
          )}
          {moduleResults.length > 0 && (
            <ResultGroup title="Módulos" results={moduleResults} role={user.role} onClick={handleResultClick} />
          )}
        </div>
      )}
    </div>
  );
}

// Glosario: siempre clickeable, para los dos roles (route: "/glosario/:slug").
// Módulo: clickeable solo para el alumno, y solo si está desbloqueado — para
// el docente isAccessible siempre viene en true (pág. 43), pero no hay
// ninguna pantalla equivalente a /mapa para ese rol (ProtectedRoute lo
// rebota a /docente), así que ahí se muestra igual que un módulo
// desbloqueado (sin atenuar) pero sin acción al click. Decisión de Martín,
// 2026-09-30.
function isResultClickable(result, role) {
  if (result.type === 'glossary') return true;
  return result.isAccessible && role === 'student';
}

function ResultGroup({ title, results, role, onClick }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted">{title}</h2>
      {results.map((result) => (
        <ResultRow key={result.id} result={result} role={role} onClick={() => onClick(result)} />
      ))}
    </div>
  );
}

function ResultRow({ result, role, onClick }) {
  const isLockedModule = result.type === 'module' && !result.isAccessible;
  const clickable = isResultClickable(result, role);

  return (
    <Card
      onClick={clickable ? onClick : undefined}
      className={isLockedModule ? 'opacity-60' : clickable ? 'cursor-pointer hover:border-info' : ''}
    >
      <p className="text-sm font-medium text-text">{result.title}</p>
      <p className="mt-1 text-xs text-muted">{result.snippet}</p>
      {isLockedModule && <p className="mt-1 text-xs text-warn">Módulo todavía no desbloqueado</p>}
    </Card>
  );
}
