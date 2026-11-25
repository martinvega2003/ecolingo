// F08 — Parte 3. Formulario de ajustes de la clase (endpoint 19, PATCH
// parcial — solo se manda lo que cambió). Hoy expone únicamente "Clase
// activa". Los ajustes de pre-test/post-test se quitaron de la pantalla; no
// se envían en el PATCH, así que lo que ya haya guardado la clase queda
// intacto en la BD.
import { useState } from 'react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';

export default function ClassSettingsPanel({ classInfo, onSave }) {
  const [form, setForm] = useState({
    isActive: classInfo.isActive,
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
