// F08 — Parte 3. Formulario de ajustes de la clase (endpoint 19, PATCH
// parcial — solo se manda lo que cambió). Estado local se prellena con la
// respuesta de GET /teacher/classes (endpoint 16) más los campos aditivos
// pretestFormUrl/posttestFormUrl — ver nota en teacherService.js.
//
// ⚠️ PENDIENTE DE DEFINIR (no es un bug de F08): hoy ningún alumno ve este
// link en ningún lado. El dato viaja bien de punta a punta (Class -> este
// PATCH -> POST /auth/student/login -> AuthProvider.user.class), pero
// ninguna pantalla del lado del alumno lo lee todavía — no hay ninguna
// feature del catálogo (F01-F12) que se haga cargo de mostrarlo. Dos
// caminos, a decidir con Cesar si da el tiempo:
//   1) Banner en el shell del alumno (F02) que lea user.class.pretestFormUrl
//      cuando isPretestEnabled === true — toca zona compartida
//      (AuthContext/AppLayout), no se construye acá sin acuerdo bilateral.
//   2) Docente comparte el link a mano (mismo patrón que el PIN reseteado:
//      "comunicarlo verbalmente") — ya funciona hoy sin cambiar nada, el
//      docente puede copiar el link desde este mismo formulario.
// No se construye ninguna de las dos opciones acá — queda a propósito sin
// resolver hasta que se decida.
import { useState } from 'react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';

const inputClass =
  'rounded-md border border-hair border-muted bg-surface px-3 py-2 text-text outline-none focus:border-info';

export default function ClassSettingsPanel({ classInfo, onSave }) {
  const [form, setForm] = useState({
    isActive: classInfo.isActive,
    isPretestEnabled: classInfo.isPretestEnabled,
    pretestFormUrl: classInfo.pretestFormUrl ?? '',
    isPosttestEnabled: classInfo.isPosttestEnabled,
    posttestFormUrl: classInfo.posttestFormUrl ?? '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await onSave({
        isActive: form.isActive,
        isPretestEnabled: form.isPretestEnabled,
        pretestFormUrl: form.pretestFormUrl.trim() === '' ? null : form.pretestFormUrl.trim(),
        isPosttestEnabled: form.isPosttestEnabled,
        posttestFormUrl: form.posttestFormUrl.trim() === '' ? null : form.posttestFormUrl.trim(),
      });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'No se pudieron guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <p className="mb-3 text-sm font-medium text-text">Ajustes de la clase</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
          />
          Clase activa
        </label>

        <div className="flex flex-col gap-2 rounded-md bg-bg/40 p-3">
          <label className="flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={form.isPretestEnabled}
              onChange={(e) => handleChange('isPretestEnabled', e.target.checked)}
            />
            Pre-test habilitado
          </label>
          {form.isPretestEnabled && (
            <>
              <input
                type="url"
                placeholder="https://forms.gle/..."
                value={form.pretestFormUrl}
                onChange={(e) => handleChange('pretestFormUrl', e.target.value)}
                className={inputClass}
              />
              <p className="text-xs text-warn">
                ⚠️ Pendiente de definir: los alumnos todavía no ven este link en la app — compartíselo vos
                directamente (WhatsApp, grupo de la clase, etc.) hasta que se decida si se agrega un aviso en
                su pantalla.
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-md bg-bg/40 p-3">
          <label className="flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={form.isPosttestEnabled}
              onChange={(e) => handleChange('isPosttestEnabled', e.target.checked)}
            />
            Post-test habilitado
          </label>
          {form.isPosttestEnabled && (
            <>
              <input
                type="url"
                placeholder="https://forms.gle/..."
                value={form.posttestFormUrl}
                onChange={(e) => handleChange('posttestFormUrl', e.target.value)}
                className={inputClass}
              />
              <p className="text-xs text-warn">
                ⚠️ Pendiente de definir: los alumnos todavía no ven este link en la app — compartíselo vos
                directamente (WhatsApp, grupo de la clase, etc.) hasta que se decida si se agrega un aviso en
                su pantalla.
              </p>
            </>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {saved && !error && <p className="text-sm text-accent">Cambios guardados.</p>}

        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Guardando…' : 'Guardar ajustes'}
        </Button>
      </form>
    </Card>
  );
}
