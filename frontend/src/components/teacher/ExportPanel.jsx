// F08 — Parte 3. Exportación CSV del endpoint 20. Solo summary y answers
// están habilitados: 'attempts' no tiene columnas definidas en
// GUIA_DE_CODIGO.md (ver el gap documentado en teacherService.js) — se
// muestra deshabilitado en vez de mandar una request que el backend
// siempre va a rechazar con VALIDATION_ERROR.
import { useState } from 'react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';

export default function ExportPanel({ onExport }) {
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState(null);

  const handleExport = async (include) => {
    setDownloading(include);
    setError(null);
    try {
      await onExport(include);
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'No se pudo generar el archivo.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Card>
      <p className="mb-1 text-sm font-medium text-text">Exportar datos</p>
      <p className="mb-3 text-xs text-muted">CSV con BOM UTF-8, listo para abrir en Excel.</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={downloading === 'summary'} onClick={() => handleExport('summary')}>
          {downloading === 'summary' ? 'Generando…' : 'Resumen por alumno'}
        </Button>
        <Button variant="secondary" disabled={downloading === 'answers'} onClick={() => handleExport('answers')}>
          {downloading === 'answers' ? 'Generando…' : 'Respuestas detalladas'}
        </Button>
        <Button variant="ghost" disabled title="Pendiente de definir columnas en GUIA_DE_CODIGO.md">
          Intentos (pendiente de definir)
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </Card>
  );
}
