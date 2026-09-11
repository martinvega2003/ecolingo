// F08 — Parte 3, criterio de aceptación: "el PIN nuevo se muestra una sola
// vez, en un modal, y no queda accesible después de cerrarlo" — el
// componente no guarda el PIN en ningún estado persistente, solo en la
// prop que recibe mientras isOpen es true.
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';

export default function ResetPinModal({ result, onClose }) {
  if (!result) return null;

  return (
    <Modal isOpen={Boolean(result)} onClose={onClose} title="PIN reseteado">
      <p className="mb-1 text-sm text-muted">
        Nuevo PIN para <span className="text-text">{result.fullName}</span> ({result.username}):
      </p>
      <p className="mb-4 text-center text-3xl font-semibold tracking-[0.4em] text-accent">{result.newPin}</p>
      <p className="mb-4 text-xs text-danger">
        Este PIN no se puede volver a consultar. Anotalo o compartíselo al alumno ahora.
      </p>
      <Button onClick={onClose} className="w-full">
        Listo
      </Button>
    </Modal>
  );
}
