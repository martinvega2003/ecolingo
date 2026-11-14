// Bloque gris pulsante para pantallas que cargan listas (reemplaza el texto
// plano "Cargando…"). Se le da tamaño y forma con className.
const Skeleton = ({ className = '' }) => (
  <div aria-hidden="true" className={`animate-pulse rounded-2xl bg-surface ${className}`} />
);

export default Skeleton;
