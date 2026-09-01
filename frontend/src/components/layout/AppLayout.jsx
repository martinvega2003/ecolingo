import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import StudentTabs from './StudentTabs.jsx';

// Armazón compartido de F02: cabecera + (opcional) tabs + contenido de la
// ruta activa. showTabs se usa solo en las rutas de alumno con los tres
// tabs (Módulos/Ranking/Logros, guard student); el resto (docente, y las
// rutas student|teacher como /perfil, /buscar, /glosario) va sin tabs.
// max-w-3xl evita que el contenido quede demasiado estirado en pantallas
// grandes (criterio de aceptación: "layout correcto en 1280 px").
const AppLayout = ({ showTabs = false }) => (
  <div className="min-h-screen bg-bg text-text">
    <Header />
    {showTabs && <StudentTabs />}
    <main className={`mx-auto max-w-3xl ${showTabs ? 'pb-16 md:pb-0' : ''}`}>
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
