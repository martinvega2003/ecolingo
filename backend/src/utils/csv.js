// GUIA_DE_CODIGO.md — Parte 1, F08, endpoint 20. Helper genérico, sin
// dependencia externa (no había ninguna librería de CSV en package.json y
// el formato de salida es simple: columnas fijas, filas planas).
//
// BOM obligatorio (§ riesgo de F08): sin él, Excel en Windows muestra
// "Rodríguez" corrupto y el anexo del TCC queda comprometido.
const escapeCsvField = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * @param {string[]} columns nombres de columna, en el orden exacto del contrato
 * @param {Record<string, unknown>[]} rows una fila por objeto; se leen solo las claves en `columns`
 * @returns {string} CSV con BOM UTF-8, separador de línea \r\n
 */
export const toCsv = (columns, rows) => {
  const header = columns.join(',');
  const lines = rows.map((row) => columns.map((col) => escapeCsvField(row[col])).join(','));
  return '\uFEFF' + [header, ...lines].join('\r\n');
};
