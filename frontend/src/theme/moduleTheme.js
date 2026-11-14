// Un color y un icono por módulo, usados en Mapa, Lección, Resultado,
// Buscar, Glosario y los gráficos del docente. La clave es `order` (1-5),
// que es lo que la API devuelve en todos lados (`order` en /modules y en
// /attempts/:id/result, `moduleOrder` en /search y /glossary).
//
// Las clases van completas y literales: Tailwind no genera CSS para clases
// armadas con interpolación (`bg-${color}` no existiría en el build).
import { BookOpen, ChartPie, CreditCard, PiggyBank, Target, TrendingUp } from 'lucide-react';

const THEMES = {
  1: {
    icon: PiggyBank,
    colorKey: 'mod-ahorro',
    text: 'text-mod-ahorro',
    bg: 'bg-mod-ahorro',
    soft: 'bg-mod-ahorro/15',
    border: 'border-mod-ahorro',
    softBorder: 'border-mod-ahorro/40',
  },
  2: {
    icon: ChartPie,
    colorKey: 'mod-presupuesto',
    text: 'text-mod-presupuesto',
    bg: 'bg-mod-presupuesto',
    soft: 'bg-mod-presupuesto/15',
    border: 'border-mod-presupuesto',
    softBorder: 'border-mod-presupuesto/40',
  },
  3: {
    icon: CreditCard,
    colorKey: 'mod-credito',
    text: 'text-mod-credito',
    bg: 'bg-mod-credito',
    soft: 'bg-mod-credito/15',
    border: 'border-mod-credito',
    softBorder: 'border-mod-credito/40',
  },
  4: {
    icon: TrendingUp,
    colorKey: 'mod-inversion',
    text: 'text-mod-inversion',
    bg: 'bg-mod-inversion',
    soft: 'bg-mod-inversion/15',
    border: 'border-mod-inversion',
    softBorder: 'border-mod-inversion/40',
  },
  5: {
    icon: Target,
    colorKey: 'mod-plan',
    text: 'text-mod-plan',
    bg: 'bg-mod-plan',
    soft: 'bg-mod-plan/15',
    border: 'border-mod-plan',
    softBorder: 'border-mod-plan/40',
  },
};

// Términos transversales del glosario (moduleOrder: null) o un módulo que
// todavía no tenga tema asignado.
const GENERAL_THEME = {
  icon: BookOpen,
  colorKey: 'muted',
  text: 'text-muted',
  bg: 'bg-muted',
  soft: 'bg-muted/15',
  border: 'border-muted',
  softBorder: 'border-muted/40',
};

export const getModuleTheme = (order) => THEMES[order] ?? GENERAL_THEME;

export const MODULE_ORDERS = [1, 2, 3, 4, 5];
