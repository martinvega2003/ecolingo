import { useParams } from 'react-router-dom';
import EmptyState from './EmptyState.jsx';

// Placeholder genérico para toda ruta de §0.12 cuya feature todavía no
// está construida. F02 solo arma el armazón — "no incluye el contenido de
// cada pantalla" (Parte 3, F02). Cuando la feature real se construya, se
// reemplaza el elemento de esa <Route> en App.jsx por la pantalla real;
// no hace falta tocar este archivo.
const FeaturePlaceholder = ({ title, feature, owner }) => {
  const params = useParams();
  const paramEntries = Object.entries(params);

  return (
    <div className="p-6">
      <EmptyState
        title={title}
        description={`Pantalla de ${feature}, todavía no implementada (dueño: ${owner}).`}
      />
      {paramEntries.length > 0 && (
        <p className="text-center text-xs text-muted">
          {paramEntries.map(([key, value]) => `${key}: ${value}`).join(' · ')}
        </p>
      )}
    </div>
  );
};

export default FeaturePlaceholder;
