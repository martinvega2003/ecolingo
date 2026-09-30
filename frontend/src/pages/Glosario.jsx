// F10 — Glosario completo (Parte 3, GUIA_DE_CODIGO.md).
// Carga todo con el endpoint 27 (propuesto) al montarse — "se puede
// recorrer sin buscar". El filtro en vivo es JS puro sobre los datos ya
// cargados: no vuelve a llamar a /search.
import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Card from '../components/common/Card.jsx';
import { fetchGlossary, getErrorMessage } from '../api/searchApi.js';
import { normalize } from '../utils/text.js';

export default function Glosario() {
  const { slug } = useParams();
  const [state, setState] = useState('loading'); // loading | ready | error
  const [terms, setTerms] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState('');
  const [reloadToken, setReloadToken] = useState(0); // cambiar este valor dispara una recarga
  const highlightRef = useRef(null);

  // Patrón IIFE dentro del efecto (React Compiler purity rules, ver
  // /learnings.md del proyecto) — mismo criterio que LessonScreen.jsx (F04).
  useEffect(() => {
    let ignore = false;

    (async () => {
      setState('loading');
      try {
        const res = await fetchGlossary();
        if (ignore) return;
        setTerms(res.terms);
        setState('ready');
      } catch (err) {
        if (ignore) return;
        setErrorMessage(getErrorMessage(err));
        setState('error');
      }
    })();

    return () => {
      ignore = true;
    };
  }, [reloadToken]);

  // Si se llegó acá desde un resultado de /search (route: "/glosario/:slug"),
  // desplaza y resalta ese término una vez que ya está la lista completa.
  useEffect(() => {
    if (state === 'ready' && slug && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [state, slug]);

  const filteredTerms = useMemo(() => {
    const normalizedFilter = normalize(filter.trim());
    if (!normalizedFilter) return terms;
    return terms.filter(
      (t) =>
        normalize(t.term).includes(normalizedFilter) ||
        normalize(t.definition).includes(normalizedFilter) ||
        t.keywords.some((k) => normalize(k).includes(normalizedFilter))
    );
  }, [terms, filter]);

  // Agrupa por módulo (ya vienen ordenados: 1→5, transversales al final),
  // sin recalcular nada — solo detecta el cambio de título al iterar.
  const groups = useMemo(() => {
    const result = [];
    let currentKey;
    for (const term of filteredTerms) {
      const key = term.moduleTitle ?? 'Términos generales';
      if (key !== currentKey) {
        result.push({ key, terms: [term] });
        currentKey = key;
      } else {
        result[result.length - 1].terms.push(term);
      }
    }
    return result;
  }, [filteredTerms]);

  if (state === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Cargando el glosario…" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="p-6">
        <ErrorState description={errorMessage} onRetry={() => setReloadToken((t) => t + 1)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-lg font-medium text-text">Glosario</h1>
        <p className="text-sm text-muted">Todos los términos de economía personal del curso.</p>
      </div>

      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filtrar por palabra…"
        className="rounded-lg border border-hair border-muted bg-surface px-4 py-2 text-sm text-text placeholder:text-muted focus:border-info focus:outline-none"
      />

      {filteredTerms.length === 0 ? (
        <EmptyState
          title="Ningún término coincide"
          description="Probá con otra palabra, o borrá el filtro para ver el glosario completo."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.key} className="flex flex-col gap-2">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted">{group.key}</h2>
              {group.terms.map((term) => (
                <div key={term.id} ref={term.slug === slug ? highlightRef : undefined}>
                  <Card className={term.slug === slug ? 'border-info' : ''}>
                    <p className="text-sm font-medium text-text">{term.term}</p>
                    <p className="mt-1 text-xs text-muted">{term.definition}</p>
                  </Card>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
