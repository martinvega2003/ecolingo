// F10 — Glosario completo (Parte 3, GUIA_DE_CODIGO.md; propuesta visual,
// Pantalla 9). Carga todo con el endpoint 27 (propuesto) al montarse — "se
// puede recorrer sin buscar". El filtro en vivo es JS puro sobre los datos
// ya cargados: no vuelve a llamar a /search.
// Visual: índice de letras para saltar rápido (columna en PC, fila
// deslizable en celular) y cada término con una franja del color de su módulo.
import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Card from '../components/common/Card.jsx';
import { fetchGlossary, getErrorMessage } from '../api/searchApi.js';
import { getModuleTheme } from '../theme/moduleTheme.js';
import { normalize } from '../utils/text.js';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Letra del índice: primera letra sin tilde y en mayúscula ("Índice" → "I").
const letterOf = (term) => normalize(term.trim()).charAt(0).toUpperCase();

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

  // Agrupa por letra inicial, en orden alfabético (índice A–Z). La API manda
  // los términos ordenados por módulo; acá solo se reordenan para mostrarlos.
  const groups = useMemo(() => {
    const sorted = [...filteredTerms].sort((x, y) => x.term.localeCompare(y.term, 'es'));
    const result = [];
    for (const term of sorted) {
      const letter = letterOf(term.term);
      const last = result[result.length - 1];
      if (last?.letter === letter) last.terms.push(term);
      else result.push({ letter, terms: [term] });
    }
    return result;
  }, [filteredTerms]);

  const availableLetters = useMemo(() => new Set(groups.map((g) => g.letter)), [groups]);

  // Leyenda: módulos presentes en el glosario, en orden (1→5), con su título.
  const legend = useMemo(() => {
    const byOrder = new Map();
    for (const t of terms) if (t.moduleOrder && !byOrder.has(t.moduleOrder)) byOrder.set(t.moduleOrder, t.moduleTitle);
    return [...byOrder.entries()].sort((x, y) => x[0] - y[0]);
  }, [terms]);

  const jumpToLetter = (letter) => {
    document.getElementById(`glosario-${letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
    <div className="grid gap-4 p-4 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start">
      {/* Índice: fila deslizable en celular, columna fija en PC */}
      <aside className="min-w-0 lg:sticky lg:top-20 lg:flex lg:flex-col lg:gap-4">
        <Card className="p-3">
          <p className="mb-2 hidden text-[11px] font-extrabold uppercase tracking-wider text-muted lg:block">Índice</p>
          <nav aria-label="Índice alfabético" className="flex gap-1 overflow-x-auto lg:grid lg:grid-cols-5 lg:overflow-visible">
            {ALPHABET.map((letter) => {
              const enabled = availableLetters.has(letter);
              return (
                <button
                  key={letter}
                  type="button"
                  disabled={!enabled}
                  onClick={() => jumpToLetter(letter)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold transition-colors ${
                    enabled ? 'bg-surface-2 text-text hover:bg-primary' : 'text-muted/40'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </nav>
        </Card>

        {legend.length > 0 && (
          <Card className="hidden p-3 lg:block">
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted">Por módulo</p>
            <ul className="flex flex-col gap-2">
              {legend.map(([order, title]) => (
                <li key={order} className="flex items-center gap-2 text-xs font-semibold text-text">
                  <span className={`h-3 w-3 shrink-0 rounded-full ${getModuleTheme(order).bg}`} />
                  {title}
                </li>
              ))}
              <li className="flex items-center gap-2 text-xs font-semibold text-text">
                <span className={`h-3 w-3 shrink-0 rounded-full ${getModuleTheme(null).bg}`} />
                General
              </li>
            </ul>
          </Card>
        )}
      </aside>

      <div className="flex min-w-0 flex-col gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-text">Glosario</h1>
          <p className="text-sm text-muted">
            {terms.length} {terms.length === 1 ? 'término' : 'términos'} de economía personal
          </p>
        </div>

        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar por palabra…"
            aria-label="Filtrar el glosario"
            className="w-full rounded-xl border border-surface-2 bg-surface py-2.5 pl-10 pr-4 text-sm text-text transition-colors placeholder:text-muted focus:border-info focus:outline-none"
          />
        </div>

        {filteredTerms.length === 0 ? (
          <EmptyState
            title="Ningún término coincide"
            description="Probá con otra palabra, o borrá el filtro para ver el glosario completo."
          />
        ) : (
          <div className="flex flex-col gap-5">
            {groups.map((group) => (
              <section key={group.letter} id={`glosario-${group.letter}`} className="flex scroll-mt-24 flex-col gap-2">
                <h2 className="text-lg font-extrabold text-accent">{group.letter}</h2>
                {group.terms.map((term) => (
                  <TermCard
                    key={term.id}
                    term={term}
                    isHighlighted={term.slug === slug}
                    highlightRef={term.slug === slug ? highlightRef : undefined}
                  />
                ))}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TermCard({ term, isHighlighted, highlightRef }) {
  const theme = getModuleTheme(term.moduleOrder);

  return (
    <div ref={highlightRef}>
      <Card className={`relative overflow-hidden pl-5 ${isHighlighted ? 'border-info' : ''}`}>
        {/* Franja del color del módulo */}
        <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${theme.bg}`} />
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-sm font-extrabold text-text">{term.term}</p>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${theme.soft} ${theme.text}`}>
            {term.moduleTitle ?? 'General'}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted">{term.definition}</p>
      </Card>
    </div>
  );
}
