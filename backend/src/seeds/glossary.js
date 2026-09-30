// GUIA_DE_CODIGO.md — Parte 2, F10. 34 términos (dentro del rango 30-45)
// Contenido para los 5 módulos — igual que las preguntas placeholder
// ya sembradas (ver /projects/.../overview.md, "Current state")
import { GlossaryTerm } from '../models/index.js';

export const GLOSSARY = [
  // ── Módulo 1 — Ahorro e Interés ──────────────────────────────
  {
    term: 'Fondo de emergencia',
    slug: 'fondo-de-emergencia',
    definition:
      'Dinero apartado y disponible que cubre entre 3 y 6 meses de tus gastos. Sirve para imprevistos —una urgencia médica, quedarte sin trabajo— sin tener que endeudarte.',
    keywords: ['fondo de emergencia', 'colchon', 'ahorro de emergencia', 'imprevistos'],
    moduleOrder: 1,
    displayOrder: 1,
  },
  {
    term: 'Ahorro automático',
    slug: 'ahorro-automatico',
    definition:
      'Transferir una parte fija de tu ingreso a una cuenta de ahorro apenas lo recibís, antes de gastarlo en otra cosa. Elimina la decisión de "¿ahorro o no?" en cada mes.',
    keywords: ['ahorro automatico', 'ahorro programado', 'pagate a vos primero'],
    moduleOrder: 1,
    displayOrder: 2,
  },
  {
    term: 'Meta de ahorro',
    slug: 'meta-de-ahorro',
    definition:
      'Un objetivo de ahorro concreto, con monto y fecha —por ejemplo, 500.000 Gs. en 6 meses para un celular—. Tener la meta clara hace más fácil sostener el hábito.',
    keywords: ['meta de ahorro', 'metas de ahorro', 'objetivo de ahorro'],
    moduleOrder: 1,
    displayOrder: 3,
  },
  {
    term: 'Capitalización',
    slug: 'capitalizacion',
    definition:
      'Proceso por el cual los intereses generados se suman al capital y pasan a generar nuevos intereses. Es lo que hace que un ahorro crezca cada vez más rápido con el tiempo.',
    keywords: ['capitalizacion', 'interes sobre interes'],
    moduleOrder: 1,
    displayOrder: 4,
  },
  {
    term: 'Interés compuesto',
    slug: 'interes-compuesto',
    definition:
      'El interés que se calcula sobre el capital inicial más los intereses ya acumulados, no solo sobre el capital original. Es el motor detrás de la capitalización.',
    keywords: ['interes compuesto', 'capitalizacion de intereses'],
    moduleOrder: 1,
    displayOrder: 5,
  },
  {
    term: 'Cuenta de ahorro',
    slug: 'cuenta-de-ahorro',
    definition:
      'Producto bancario pensado para guardar dinero de forma segura y accesible, que además paga una tasa de interés (generalmente baja) sobre el saldo.',
    keywords: ['cuenta de ahorro', 'caja de ahorro'],
    moduleOrder: 1,
    displayOrder: 6,
  },

  // ── Módulo 2 — Presupuesto ───────────────────────────────────
  {
    term: 'Regla 50/30/20',
    slug: 'regla-50-30-20',
    definition:
      'Forma simple de repartir tus ingresos: 50 % para necesidades, 30 % para gustos y 20 % para ahorro o pago de deudas.',
    keywords: ['regla 50 30 20', 'reparto de ingresos', 'presupuesto'],
    moduleOrder: 2,
    displayOrder: 1,
  },
  {
    term: 'Gasto fijo',
    slug: 'gasto-fijo',
    definition:
      'Un gasto que se repite todos los meses por el mismo monto (o casi), como el alquiler o una cuota. Es el más fácil de predecir al armar un presupuesto.',
    keywords: ['gasto fijo', 'gastos fijos'],
    moduleOrder: 2,
    displayOrder: 2,
  },
  {
    term: 'Gasto variable',
    slug: 'gasto-variable',
    definition:
      'Un gasto que cambia de mes a mes, como la comida, el transporte o el ocio. Suele ser el que más margen deja para ajustar cuando el presupuesto aprieta.',
    keywords: ['gasto variable', 'gastos variables'],
    moduleOrder: 2,
    displayOrder: 3,
  },
  {
    term: 'Balance ingreso-gasto',
    slug: 'balance-ingreso-gasto',
    definition:
      'La diferencia entre lo que entra (ingresos) y lo que sale (gastos) en un período. Positivo significa que sobra para ahorrar; negativo, que se está gastando de más.',
    keywords: ['balance ingreso gasto', 'flujo de caja personal', 'balance mensual'],
    moduleOrder: 2,
    displayOrder: 4,
  },
  {
    term: 'Presupuesto',
    slug: 'presupuesto',
    definition:
      'Un plan que anticipa cuánto vas a ganar y cuánto vas a gastar en un período, distribuido por categorías. Sirve para decidir antes de gastar, no para justificar después.',
    keywords: ['presupuesto', 'plan de gastos'],
    moduleOrder: 2,
    displayOrder: 5,
  },
  {
    term: 'Ingreso disponible',
    slug: 'ingreso-disponible',
    definition:
      'Lo que efectivamente te queda para gastar o ahorrar después de descontar impuestos y descuentos obligatorios de tu ingreso bruto.',
    keywords: ['ingreso disponible', 'ingreso neto'],
    moduleOrder: 2,
    displayOrder: 6,
  },

  // ── Módulo 3 — Crédito y deuda ────────────────────────────────
  {
    term: 'Tasa de interés',
    slug: 'tasa-de-interes',
    definition:
      'El costo de pedir dinero prestado (o la ganancia por prestarlo), expresado como un porcentaje del monto. A mayor tasa, más caro es el crédito o más rinde el ahorro.',
    keywords: ['tasa de interes', 'tasas de interes'],
    moduleOrder: 3,
    displayOrder: 1,
  },
  {
    term: 'Método avalancha',
    slug: 'metodo-avalancha',
    definition:
      'Estrategia para salir de deudas pagando primero la de mayor tasa de interés. Es la que menos intereses te hace pagar en total.',
    keywords: ['metodo avalancha', 'avalancha', 'pagar deudas', 'tasa mas alta'],
    moduleOrder: 3,
    displayOrder: 2,
  },
  {
    term: 'Historial crediticio',
    slug: 'historial-crediticio',
    definition:
      'Registro de cómo una persona pagó sus deudas en el pasado —a tiempo o con atraso—. Los bancos lo consultan antes de aprobar un nuevo préstamo o tarjeta.',
    keywords: ['historial crediticio', 'historial de credito', 'reporte crediticio'],
    moduleOrder: 3,
    displayOrder: 3,
  },
  {
    term: 'Deuda',
    slug: 'deuda',
    definition:
      'Dinero que una persona debe a otra (banco, financiera, persona) y que se compromete a devolver, generalmente con intereses, en un plazo acordado.',
    keywords: ['deuda', 'deudas'],
    moduleOrder: 3,
    displayOrder: 4,
  },
  {
    term: 'Mora',
    slug: 'mora',
    definition:
      'La situación de atraso en el pago de una deuda. Además de generar intereses adicionales (moratorios), un historial con mora dificulta acceder a crédito en el futuro.',
    keywords: ['mora', 'atraso en el pago', 'interes moratorio'],
    moduleOrder: 3,
    displayOrder: 5,
  },
  {
    term: 'Línea de crédito',
    slug: 'linea-de-credito',
    definition:
      'Un monto máximo que una entidad financiera autoriza a usar cuando haga falta, sin tener que pedir un préstamo nuevo cada vez. Solo se pagan intereses sobre lo usado.',
    keywords: ['linea de credito', 'limite de credito'],
    moduleOrder: 3,
    displayOrder: 6,
  },

  // ── Módulo 4 — Inversión básica ───────────────────────────────
  {
    term: 'Riesgo (financiero)',
    slug: 'riesgo-financiero',
    definition:
      'La posibilidad de perder parte o todo el dinero invertido. En general, a mayor rentabilidad esperada, mayor es también el riesgo que se asume.',
    keywords: ['riesgo financiero', 'riesgo de inversion'],
    moduleOrder: 4,
    displayOrder: 1,
  },
  {
    term: 'Diversificación',
    slug: 'diversificacion',
    definition:
      'Repartir el dinero entre distintos tipos de inversión en vez de ponerlo todo en una sola. Si una falla, las demás pueden compensar la pérdida.',
    keywords: ['diversificacion', 'no poner todos los huevos en la misma canasta'],
    moduleOrder: 4,
    displayOrder: 2,
  },
  {
    term: 'Plazo fijo',
    slug: 'plazo-fijo',
    definition:
      'Depósito bancario que se compromete a no retirar durante un período determinado a cambio de una tasa de interés fija. Es de bajo riesgo, pero de rentabilidad limitada.',
    keywords: ['plazo fijo', 'deposito a plazo'],
    moduleOrder: 4,
    displayOrder: 3,
  },
  {
    term: 'Acción (bursátil)',
    slug: 'accion-bursatil',
    definition:
      'Una porción de propiedad de una empresa que se compra y vende en una bolsa de valores. Su precio sube o baja según cómo le va a la empresa y al mercado.',
    keywords: ['accion bursatil', 'acciones', 'bolsa de valores'],
    moduleOrder: 4,
    displayOrder: 4,
  },
  {
    term: 'Estafa de inversión',
    slug: 'estafa-de-inversion',
    definition:
      'Un esquema que promete rentabilidades muy altas y garantizadas con poco o ningún riesgo —una señal de alerta casi segura—, y que paga a los primeros con el dinero de los últimos (esquema Ponzi).',
    keywords: ['estafa de inversion', 'esquema ponzi', 'piramide financiera'],
    moduleOrder: 4,
    displayOrder: 5,
  },
  {
    term: 'Rentabilidad',
    slug: 'rentabilidad',
    definition:
      'La ganancia que produce una inversión, medida como porcentaje de lo invertido en un período. Se usa para comparar qué tan conveniente es una opción frente a otra.',
    keywords: ['rentabilidad', 'retorno de la inversion'],
    moduleOrder: 4,
    displayOrder: 6,
  },

  // ── Módulo 5 — Planificación financiera ───────────────────────
  {
    term: 'Meta SMART',
    slug: 'meta-smart',
    definition:
      'Un objetivo financiero Específico, Medible, Alcanzable, Relevante y con un Tiempo definido. Por ejemplo: "ahorrar 2.000.000 Gs. en 12 meses para la universidad".',
    keywords: ['meta smart', 'metas smart', 'objetivo smart'],
    moduleOrder: 5,
    displayOrder: 1,
  },
  {
    term: 'Corto plazo',
    slug: 'corto-plazo',
    definition:
      'Horizonte financiero de hasta un año, aproximadamente. Las metas de corto plazo (un viaje, un equipo) suelen ir en instrumentos líquidos y de bajo riesgo.',
    keywords: ['corto plazo', 'metas de corto plazo'],
    moduleOrder: 5,
    displayOrder: 2,
  },
  {
    term: 'Largo plazo',
    slug: 'largo-plazo',
    definition:
      'Horizonte financiero de varios años en adelante —la universidad, la jubilación—. Da más margen para asumir riesgo a cambio de mayor rentabilidad esperada.',
    keywords: ['largo plazo', 'metas de largo plazo'],
    moduleOrder: 5,
    displayOrder: 3,
  },
  {
    term: 'Revisión del plan financiero',
    slug: 'revision-del-plan-financiero',
    definition:
      'Volver a mirar periódicamente el presupuesto y las metas para ajustarlos si cambió la situación —un nuevo ingreso, un gasto imprevisto—. Un plan que nunca se revisa se vuelve obsoleto.',
    keywords: ['revision del plan financiero', 'revisar el presupuesto'],
    moduleOrder: 5,
    displayOrder: 4,
  },
  {
    term: 'Planificación financiera',
    slug: 'planificacion-financiera',
    definition:
      'El proceso de definir metas de dinero claras y trazar el camino —presupuesto, ahorro, inversión— para alcanzarlas en el tiempo previsto.',
    keywords: ['planificacion financiera', 'plan financiero'],
    moduleOrder: 5,
    displayOrder: 5,
  },
  {
    term: 'Jubilación',
    slug: 'jubilacion',
    definition:
      'La etapa de la vida en la que una persona deja de trabajar y vive de sus ahorros o de una pensión. Cuanto antes se empieza a ahorrar para ella, menos esfuerzo mensual requiere.',
    keywords: ['jubilacion', 'retiro', 'ahorro para el retiro'],
    moduleOrder: 5,
    displayOrder: 6,
  },

  // ── Transversales (moduleOrder: null) ─────────────────────────
  {
    term: 'Inflación',
    slug: 'inflacion',
    definition:
      'El aumento generalizado y sostenido de los precios en una economía. Hace que el mismo monto de dinero alcance para comprar menos con el paso del tiempo.',
    keywords: ['inflacion', 'perdida de poder adquisitivo'],
    moduleOrder: null,
    displayOrder: 1,
  },
  {
    term: 'Liquidez',
    slug: 'liquidez',
    definition:
      'Qué tan rápido y fácil es convertir un activo en dinero en efectivo sin perder valor. El efectivo es 100 % líquido; un inmueble, muy poco.',
    keywords: ['liquidez', 'disponibilidad del dinero'],
    moduleOrder: null,
    displayOrder: 2,
  },
  {
    term: 'Interés simple',
    slug: 'interes-simple',
    definition:
      'Interés que se calcula siempre sobre el capital original, sin sumar los intereses ya generados. A diferencia del interés compuesto, no acelera su crecimiento con el tiempo.',
    keywords: ['interes simple'],
    moduleOrder: null,
    displayOrder: 3,
  },
  {
    term: 'Educación financiera',
    slug: 'educacion-financiera',
    definition:
      'El conjunto de conocimientos y hábitos que permiten tomar mejores decisiones de dinero: presupuestar, ahorrar, usar el crédito con responsabilidad e invertir.',
    keywords: ['educacion financiera', 'alfabetizacion financiera'],
    moduleOrder: null,
    displayOrder: 4,
  },
];

export const seedGlossary = async () => {
  for (const glossaryTerm of GLOSSARY) {
    await GlossaryTerm.updateOne({ slug: glossaryTerm.slug }, { $set: glossaryTerm }, { upsert: true });
  }
  console.log(`✅ ${GLOSSARY.length} términos de glosario cargados`);
};
