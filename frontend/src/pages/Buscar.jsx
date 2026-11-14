// F10 — Buscador de contenido (Parte 3, GUIA_DE_CODIGO.md; propuesta
// visual, Pantalla 8). Consume el endpoint 25 (GET /search) tal cual — el
// ranking y el isAccessible de cada módulo los calcula el servidor.
// Cada resultado lleva el icono y el color del módulo al que pertenece
// (campo moduleOrder de la respuesta).
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Lock, Search, X } from 'lucide-react';
import Card from '../components/common/Card.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ModuleIcon from '../components/common/ModuleIcon.jsx';
import { fetchSearch, getErrorMessage } from '../api/searchApi.js';
import { useAuth } from '../hooks/useAuth.js';
import { getModuleTheme } from '../theme/moduleTheme.js';

// Sugerencias de búsqueda: palabras que existen en el glosario sembrado.
const SUGGESTIONS = ['ahorro', 'presupuesto', 'deuda', 'plazo fijo'];

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
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-xl font-extrabold text-text">Buscar</h1>

      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscá módulos y términos…"
          aria-label="Buscar módulos y términos"
          autoFocus
          className="w-full rounded-2xl border-2 border-surface-2 bg-surface py-3.5 pl-12 pr-11 text-base text-text transition-colors placeholder:text-muted focus:border-info focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Borrar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-muted">Probá con:</span>
        {SUGGESTIONS.map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => setQuery(word)}
            className="rounded-full border border-surface-2 bg-surface px-3 py-1 font-semibold text-text transition-colors hover:border-info hover:text-info"
          >
            {word}
          </button>
        ))}
      </div>

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
            <button type="button" onClick={() => navigate('/glosario')} className="text-sm font-bold text-info hover:underline">
              Ver glosario completo
            </button>
          }
        />
      )}

      {state === 'ready' && data.results.length > 0 && (
        <div className="flex flex-col gap-5">
          {moduleResults.length > 0 && (
            <ResultGroup title="Módulos" results={moduleResults} role={user.role} onClick={handleResultClick} />
          )}
          {glossaryResults.length > 0 && (
            <ResultGroup
              title="Términos del glosario"
              results={glossaryResults}
              role={user.role}
              onClick={handleResultClick}
            />
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
    <section className="flex flex-col gap-2">
      <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
        {title} · {results.length}
      </h2>
      {results.map((result, i) => (
        <ResultRow key={result.id} result={result} role={role} index={i} onClick={() => onClick(result)} />
      ))}
    </section>
  );
}

function ResultRow({ result, role, index, onClick }) {
  const isModule = result.type === 'module';
  const isLockedModule = isModule && !result.isAccessible;
  const clickable = isResultClickable(result, role);
  const theme = getModuleTheme(result.moduleOrder);
  // Etiqueta del módulo: "Módulo N" para un módulo; para un término, de qué
  // módulo es (o "General" si es transversal).
  const tag = isModule ? `Módulo ${result.moduleOrder}` : result.moduleOrder ? `Módulo ${result.moduleOrder}` : 'General';

  const handleKeyDown = (event) => {
    if (!clickable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.04 }}
    >
      <Card
        onClick={clickable ? onClick : undefined}
        onKeyDown={handleKeyDown}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        className={`flex items-center gap-3 ${isLockedModule ? 'opacity-60' : clickable ? 'cursor-pointer hover:border-info' : ''}`}
      >
        <ModuleIcon
          order={result.moduleOrder}
          icon={isModule ? undefined : BookOpen}
          size="sm"
          locked={isLockedModule}
          className="h-10 w-10"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-text">{result.title}</p>
          <p className="mt-0.5 text-xs text-muted">{result.snippet}</p>
          {isLockedModule && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-warn">
              <Lock aria-hidden="true" className="h-3 w-3" />
              Módulo todavía no desbloqueado
            </p>
          )}
        </div>
        <span
          className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold sm:inline ${theme.soft} ${theme.text}`}
        >
          {tag}
        </span>
        {clickable && <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted" />}
      </Card>
    </motion.div>
  );
}
