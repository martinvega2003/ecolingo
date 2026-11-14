// Valores de la paleta para librerías que necesitan el color como string
// (Recharts). Se leen de tailwind.config.js para que la paleta siga definida
// en un solo lugar: ningún componente escribe un hexadecimal.
import tailwindConfig from '../../tailwind.config.js';

export const colors = tailwindConfig.theme.extend.colors;
