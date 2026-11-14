// "Dato del día" del Mapa: lista fija en el cliente (no viene de la API).
// Son recordatorios cortos de los temas de los cinco módulos, no contenido
// teórico nuevo. Se muestra uno por día, rotando por día del año.
export const DAILY_FACTS = [
  'Si ahorrás ₲ 10.000 por semana, en un año juntás ₲ 520.000.',
  'Regla 50/30/20: 50 % para necesidades, 30 % para gustos y 20 % para ahorro o deudas.',
  'Un fondo de emergencia cubre entre 3 y 6 meses de tus gastos.',
  'Con el interés compuesto, los intereses también generan intereses: por eso conviene empezar temprano.',
  'Guardar ₲ 5.000 por día son ₲ 150.000 en un mes de 30 días.',
  'Pagar solo el mínimo de la tarjeta hace que la deuda dure más y cueste más en intereses.',
  'Diversificar es repartir tu dinero entre distintas inversiones para reducir el riesgo.',
  'Si una inversión promete mucha ganancia sin riesgo, desconfiá: a mayor ganancia, mayor riesgo.',
  'Anotar tus gastos durante un mes es el primer paso para armar un presupuesto.',
  'Una meta con monto y fecha («₲ 300.000 para diciembre») es más fácil de cumplir que «ahorrar más».',
];

const DAY_MS = 24 * 60 * 60 * 1000;

export const factForDay = (nowMs) => DAILY_FACTS[Math.floor(nowMs / DAY_MS) % DAILY_FACTS.length];
