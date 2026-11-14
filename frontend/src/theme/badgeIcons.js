// Icono de cada insignia según su `code` (seed de insignias, F07). Reemplaza
// al campo `emoji` de la API en la interfaz: los emojis dependen de la fuente
// del sistema y fallan en Android viejos (GUIA_DEL_PROYECTO.md, Bloque 5.2).
// Un código nuevo que no esté en el mapa cae en el icono de reserva.
import { Award, ChartPie, CreditCard, Flame, Medal, PiggyBank, Star, Target, TrendingUp, Trophy, Zap } from 'lucide-react';

export const BADGE_ICONS = {
  PRIMER_AHORRO: PiggyBank,
  PRESUPUESTADOR: ChartPie,
  SIN_DEUDAS: CreditCard,
  INVERSIONES: TrendingUp,
  PLANIFICADOR: Target,
  MODULOS_COMPLETOS: Trophy,
  RACHA_7_DIAS: Flame,
  RESPUESTA_PERFECTA: Star,
  TOP_3_PODIO: Medal,
  VELOCISTA: Zap,
};

export const FALLBACK_BADGE_ICON = Award;
