// GUIA_DE_CODIGO.md — Parte 2, F04. Banco de preguntas reales del piloto:
// 40 preguntas, 8 por módulo, 3 alternativas (A/B/C). Reemplaza al seed
// con preguntas de prueba. Fuente: Ecolingo_Banco_Preguntas_F04.docx.
//
// Idempotente: seedQuestions hace upsert por (moduleId, order), así que se
// puede correr varias veces sin duplicar. El orden del array define `order`.
//
// Cuidado al editar: correctOptionKey y explanation nunca llegan al
// navegador antes de responder (D-07, Question.publicProjection).

import { Module, Question } from '../models/index.js';

export const QUESTIONS_BY_MODULE = {
  // ── Ahorro e Interés — 8 preguntas
  'ahorro-e-interes': [
    {
      statement: 'Lucía tiene un trabajo de medio tiempo y gastaba todo lo que ganaba. Un mes se rompió su celular y no tenía cómo cubrir la reparación. ¿Qué le hubiera ayudado a resolver esta situación sin pedir dinero prestado?',
      options: [
        { key: 'A', text: 'Tener un fondo de emergencia ahorrado para gastos imprevistos' },
        { key: 'B', text: 'Haber comprado un celular más caro para evitar que se rompa' },
        { key: 'C', text: 'Gastar menos en el celular pagando solo la cuota mínima del plan' },
      ],
      correctOptionKey: 'A',
      explanation: 'Un fondo de emergencia es dinero reservado específicamente para imprevistos (salud, reparaciones, pérdida de ingresos). Tenerlo evita recurrir a deudas cuando surge un gasto inesperado.',
      conceptTag: 'fondo-de-emergencia',
    },
    {
      statement: '¿Cuál de estas situaciones es un uso apropiado del fondo de emergencia?',
      options: [
        { key: 'A', text: 'Comprar las zapatillas que salieron a la venta esta semana' },
        { key: 'B', text: 'Pagar las vacaciones de fin de año' },
        { key: 'C', text: 'Cubrir una consulta médica urgente no planificada' },
      ],
      correctOptionKey: 'C',
      explanation: 'El fondo de emergencia está pensado para gastos urgentes e imprevistos, como una emergencia de salud. Gastos planificados deben salir de otras categorías del presupuesto.',
      conceptTag: 'fondo-de-emergencia',
    },
    {
      statement: 'El ahorro automático consiste en programar una transferencia de una parte del dinero hacia una cuenta de ahorro apenas se recibe un ingreso. ¿Cuál es su principal ventaja frente a \'ahorrar lo que sobra a fin de mes\'?',
      options: [
        { key: 'A', text: 'Garantiza una tasa de interés más alta que cualquier otro método' },
        { key: 'B', text: 'El ahorro se separa antes de poder gastarlo, sin depender de la fuerza de voluntad' },
        { key: 'C', text: 'Elimina por completo la necesidad de hacer un presupuesto' },
      ],
      correctOptionKey: 'B',
      explanation: 'Al automatizar el ahorro, el dinero se aparta antes de que pueda gastarse en otra cosa. Esto evita depender de \'acordarse\' o \'tener voluntad\', que es la razón más común por la que el ahorro a fin de mes falla.',
      conceptTag: 'ahorro-automatico',
    },
    {
      statement: 'Matías programó que, cada vez que le pagan, el 10% se transfiera automáticamente a una cuenta de ahorro aparte. ¿Qué principio está aplicando?',
      options: [
        { key: 'A', text: 'Pagarse a sí mismo primero, antes de gastar en otras cosas' },
        { key: 'B', text: 'Esperar a fin de mes para ver cuánto le sobra' },
        { key: 'C', text: 'Ahorrar solo cuando recibe un ingreso extra' },
      ],
      correctOptionKey: 'A',
      explanation: '"Pagarte a vos mismo primero" significa apartar el ahorro apenas llega el ingreso, antes de cualquier otro gasto. Es la base del ahorro automático.',
      conceptTag: 'ahorro-automatico',
    },
    {
      statement: 'Valentina quiere ahorrar ₲1.500.000 para una bicicleta en 6 meses. ¿Cuánto debería apartar por mes, de manera constante, para lograr su meta?',
      options: [
        { key: 'A', text: '₲150.000 por mes' },
        { key: 'B', text: '₲500.000 por mes' },
        { key: 'C', text: '₲250.000 por mes' },
      ],
      correctOptionKey: 'C',
      explanation: '1.500.000 ÷ 6 meses = 250.000 guaraníes por mes. Definir un monto mensual concreto a partir de una meta y un plazo es la base de un plan de ahorro realista.',
      conceptTag: 'metas-de-ahorro',
    },
    {
      statement: '¿Cuál de estas es una meta de ahorro bien definida?',
      options: [
        { key: 'A', text: 'Quiero ahorrar algo de dinero en algún momento' },
        { key: 'B', text: 'Quiero ahorrar ₲2.000.000 para un curso de inglés en 10 meses' },
        { key: 'C', text: 'Quiero tener más plata que mis amigos' },
      ],
      correctOptionKey: 'B',
      explanation: 'Una meta de ahorro bien definida tiene un monto específico, un objetivo claro y un plazo, lo que permite calcular cuánto ahorrar por período.',
      conceptTag: 'metas-de-ahorro',
    },
    {
      statement: 'Si depositás dinero en una cuenta con interés compuesto, ¿qué ocurre con los intereses que generás cada mes?',
      options: [
        { key: 'A', text: 'Se suman al capital y, desde ese momento, también generan intereses' },
        { key: 'B', text: 'Se pierden si no los retirás de inmediato' },
        { key: 'C', text: 'Se devuelven solo al final del plazo, sin afectar el cálculo mensual' },
      ],
      correctOptionKey: 'A',
      explanation: 'En el interés compuesto, los intereses se capitalizan: se suman al capital y a partir de ahí también producen intereses. Por eso el dinero crece cada vez más rápido con el tiempo.',
      conceptTag: 'capitalizacion',
    },
    {
      statement: 'Dos amigos ahorran la misma cantidad inicial a la misma tasa de interés compuesto, pero uno la deja invertida 10 años y el otro solo 2 años. ¿Qué pasará con sus montos finales?',
      options: [
        { key: 'A', text: 'Serán iguales, porque la tasa de interés es la misma para ambos' },
        { key: 'B', text: 'El que ahorró 2 años tendrá más, porque retiró antes' },
        { key: 'C', text: 'El que ahorró 10 años tendrá considerablemente más, por el efecto acumulado del interés compuesto' },
      ],
      correctOptionKey: 'C',
      explanation: 'El interés compuesto crece de forma acelerada con el tiempo: cuanto más tiempo está invertido el dinero, mayor es el efecto de la capitalización.',
      conceptTag: 'capitalizacion',
    },
  ],
  // ── Presupuesto — 8 preguntas
  'presupuesto': [
    {
      statement: 'Según la regla 50/30/20, si Ana gana ₲4.000.000 por mes, ¿cuánto debería destinar aproximadamente a sus necesidades básicas (alquiler, comida, transporte)?',
      options: [
        { key: 'A', text: '₲800.000' },
        { key: 'B', text: '₲2.000.000' },
        { key: 'C', text: '₲1.200.000' },
      ],
      correctOptionKey: 'B',
      explanation: 'La regla 50/30/20 sugiere destinar el 50% del ingreso a necesidades. El 50% de 4.000.000 es 2.000.000 de guaraníes.',
      conceptTag: 'regla-50-30-20',
    },
    {
      statement: 'En la regla 50/30/20, ¿a qué categoría corresponde el 20% del ingreso?',
      options: [
        { key: 'A', text: 'Ahorro y pago de deudas' },
        { key: 'B', text: 'Deseos y gastos no esenciales' },
        { key: 'C', text: 'Necesidades básicas' },
      ],
      correctOptionKey: 'A',
      explanation: 'La regla divide el ingreso en 50% necesidades, 30% deseos y 20% ahorro/pago de deudas. Reservar ese 20% de forma constante permite construir un fondo de emergencia o cumplir metas financieras.',
      conceptTag: 'regla-50-30-20',
    },
    {
      statement: 'Marcos gana ₲2.500.000 por mes y quiere aplicar la regla 50/30/20. ¿Cuánto debería destinar al ahorro?',
      options: [
        { key: 'A', text: '₲750.000, que es el 30% de su ingreso' },
        { key: 'B', text: '₲1.250.000, que es el 50% de su ingreso' },
        { key: 'C', text: '₲500.000, que es el 20% de su ingreso' },
      ],
      correctOptionKey: 'C',
      explanation: 'El 20% va al ahorro: ₲2.500.000 × 0,20 = ₲500.000. El 50% (₲1.250.000) es para necesidades y el 30% (₲750.000) para deseos.',
      conceptTag: 'regla-50-30-20',
    },
    {
      statement: '¿Cuál de los siguientes es un ejemplo de gasto fijo?',
      options: [
        { key: 'A', text: 'Las salidas con amigos el fin de semana' },
        { key: 'B', text: 'El alquiler mensual de la vivienda' },
        { key: 'C', text: 'Las compras de ropa durante las rebajas' },
      ],
      correctOptionKey: 'B',
      explanation: 'Un gasto fijo se mantiene igual (o casi igual) mes a mes, como el alquiler. Los gastos variables cambian según las decisiones y la época del mes.',
      conceptTag: 'gastos-fijos-vs-variables',
    },
    {
      statement: '¿Por qué es útil distinguir entre gastos fijos y variables al armar un presupuesto?',
      options: [
        { key: 'A', text: 'Porque ayuda a identificar en qué categorías hay margen real para ajustar o reducir gastos' },
        { key: 'B', text: 'Porque los gastos fijos nunca se pueden pagar a tiempo' },
        { key: 'C', text: 'Porque los gastos variables no deben incluirse en el presupuesto' },
      ],
      correctOptionKey: 'A',
      explanation: 'Los gastos fijos son difíciles de reducir rápido, mientras que los variables sí se pueden ajustar más fácilmente. Distinguirlos ayuda a saber dónde conviene recortar.',
      conceptTag: 'gastos-fijos-vs-variables',
    },
    {
      statement: 'Si una persona ingresa ₲3.000.000 por mes y gasta ₲3.400.000, ¿cómo describirías su balance financiero?',
      options: [
        { key: 'A', text: 'Positivo, porque tiene más gastos que ingresos' },
        { key: 'B', text: 'Neutro, porque los montos son parecidos' },
        { key: 'C', text: 'Negativo, lo que probablemente la lleve a endeudarse para cubrir la diferencia' },
      ],
      correctOptionKey: 'C',
      explanation: 'Cuando los gastos superan a los ingresos, el balance es negativo. Esa diferencia suele cubrirse con deuda si se repite mes a mes.',
      conceptTag: 'balance-ingreso-gasto',
    },
    {
      statement: '¿Qué acción ayuda directamente a mejorar un balance ingreso-gasto negativo?',
      options: [
        { key: 'A', text: 'Ignorar el balance mientras se pueda seguir pagando con tarjeta' },
        { key: 'B', text: 'Aumentar los ingresos, reducir los gastos, o ambas cosas a la vez' },
        { key: 'C', text: 'Esperar a que el próximo mes sea automáticamente mejor' },
      ],
      correctOptionKey: 'B',
      explanation: 'El balance mejora cuando el ingreso supera al gasto: eso se logra aumentando ingresos, reduciendo gastos, o combinando ambas estrategias.',
      conceptTag: 'balance-ingreso-gasto',
    },
    {
      statement: 'Al terminar el mes, Sofía anota que ingresó ₲2.000.000 y gastó ₲1.700.000. ¿Cuál es su balance y qué le conviene hacer con la diferencia?',
      options: [
        { key: 'A', text: 'Positivo de ₲300.000; le conviene destinarlo al ahorro o a una meta' },
        { key: 'B', text: 'Negativo de ₲300.000; le conviene pedir un préstamo para cubrirlo' },
        { key: 'C', text: 'Positivo de ₲300.000; le conviene gastarlo en deseos para que no se pierda' },
      ],
      correctOptionKey: 'A',
      explanation: 'Ingresó más de lo que gastó, así que su balance es positivo (₲300.000). Ese excedente es una buena oportunidad para ahorrar o avanzar hacia una meta.',
      conceptTag: 'balance-ingreso-gasto',
    },
  ],
  // ── Crédito y deuda — 8 preguntas
  'credito': [
    {
      statement: '¿Qué representa la tasa de interés que cobra una entidad financiera al otorgar un crédito?',
      options: [
        { key: 'A', text: 'Un descuento que se aplica al monto solicitado' },
        { key: 'B', text: 'Un impuesto fijo que cobra el Estado por cada préstamo' },
        { key: 'C', text: 'El precio que paga quien pide prestado por usar el dinero de otra persona o entidad' },
      ],
      correctOptionKey: 'C',
      explanation: 'La tasa de interés es el costo de usar dinero prestado: es lo que la entidad cobra por prestarlo, y lo que el ahorrista recibe cuando deposita su dinero en el banco.',
      conceptTag: 'tasa-de-interes',
    },
    {
      statement: 'Tres entidades ofrecen el mismo monto de crédito al mismo plazo: Entidad A (20% anual), Entidad B (10%) y Entidad C (15%). ¿Cuál conviene elegir, en igualdad de las demás condiciones?',
      options: [
        { key: 'A', text: 'Entidad A, porque tiene el nombre que empieza primero' },
        { key: 'B', text: 'Entidad B, porque tiene la tasa más baja y el costo total será menor' },
        { key: 'C', text: 'Entidad C, porque es un término medio' },
      ],
      correctOptionKey: 'B',
      explanation: 'A igual monto y plazo, una tasa de interés más baja significa pagar menos dinero en total por el mismo préstamo.',
      conceptTag: 'tasa-de-interes',
    },
    {
      statement: 'Camila pide un préstamo de ₲1.000.000 a un año con una tasa del 12% anual (interés simple). ¿Cuánto paga solo de intereses al cabo del año?',
      options: [
        { key: 'A', text: '₲120.000' },
        { key: 'B', text: '₲12.000' },
        { key: 'C', text: '₲1.120.000' },
      ],
      correctOptionKey: 'A',
      explanation: 'El interés es el 12% de ₲1.000.000, es decir ₲120.000. Los ₲1.120.000 son el total que devuelve (capital + intereses), no solo los intereses.',
      conceptTag: 'tasa-de-interes',
    },
    {
      statement: 'Joaquín tiene tres deudas con distintas tasas de interés. Si aplica el método avalancha, ¿cuál debería priorizar primero (pagando el máximo posible, mientras paga el mínimo de las otras)?',
      options: [
        { key: 'A', text: 'La deuda con el monto total más alto, sin importar la tasa' },
        { key: 'B', text: 'La deuda más antigua, sin importar la tasa' },
        { key: 'C', text: 'La deuda con la tasa de interés más alta' },
      ],
      correctOptionKey: 'C',
      explanation: 'El método avalancha prioriza pagar primero la deuda con la tasa de interés más alta, porque es la que genera más costo con el tiempo.',
      conceptTag: 'metodo-avalancha',
    },
    {
      statement: '¿Cuál es la principal ventaja del método avalancha frente a pagar las deudas en orden aleatorio?',
      options: [
        { key: 'A', text: 'Permite terminar de pagar todas las deudas en el mismo mes' },
        { key: 'B', text: 'Reduce el monto total de intereses pagados a lo largo del tiempo' },
        { key: 'C', text: 'Elimina por completo la necesidad de pagar el mínimo de las otras deudas' },
      ],
      correctOptionKey: 'B',
      explanation: 'Al atacar primero la deuda más cara, se reduce la cantidad total de intereses acumulados durante todo el proceso de pago.',
      conceptTag: 'metodo-avalancha',
    },
    {
      statement: '¿Qué es el historial crediticio de una persona?',
      options: [
        { key: 'A', text: 'El registro de su comportamiento de pago en préstamos y tarjetas anteriores' },
        { key: 'B', text: 'La lista de productos que compró en el supermercado' },
        { key: 'C', text: 'El saldo actual que tiene en su cuenta de ahorro' },
      ],
      correctOptionKey: 'A',
      explanation: 'El historial crediticio registra si una persona pagó sus créditos a tiempo o tuvo atrasos. Las entidades lo consultan para decidir si otorgan un nuevo préstamo y en qué condiciones.',
      conceptTag: 'historial-crediticio',
    },
    {
      statement: '¿Qué consecuencia puede tener un mal historial crediticio (pagos atrasados o impagos) en el futuro?',
      options: [
        { key: 'A', text: 'Ninguna, el historial crediticio no afecta decisiones futuras' },
        { key: 'B', text: 'Automáticamente le aumentan el salario para compensar' },
        { key: 'C', text: 'Le será más difícil obtener nuevos créditos, o se los darán con condiciones menos favorables' },
      ],
      correctOptionKey: 'C',
      explanation: 'Un mal historial crediticio hace que las entidades consideren a la persona como un cliente de mayor riesgo, lo que puede traducirse en rechazo del crédito o tasas más altas.',
      conceptTag: 'historial-crediticio',
    },
    {
      statement: '¿Cuál de estas conductas ayuda a construir un buen historial crediticio?',
      options: [
        { key: 'A', text: 'Pagar solo la cuota mínima y atrasarse de vez en cuando' },
        { key: 'B', text: 'Pagar las cuotas en la fecha de vencimiento' },
        { key: 'C', text: 'Pedir varios créditos al mismo tiempo para demostrar solvencia' },
      ],
      correctOptionKey: 'B',
      explanation: 'Pagar a tiempo muestra a las entidades que sos una persona confiable. Los atrasos y el endeudamiento excesivo empeoran el historial.',
      conceptTag: 'historial-crediticio',
    },
  ],
  // ── Inversión básica — 8 preguntas
  'inversion': [
    {
      statement: 'En general, ¿cuál es la relación entre el riesgo y el rendimiento esperado de una inversión?',
      options: [
        { key: 'A', text: 'A mayor riesgo, generalmente mayor es el rendimiento esperado' },
        { key: 'B', text: 'El riesgo y el rendimiento no tienen ninguna relación' },
        { key: 'C', text: 'A mayor riesgo, siempre menor es el rendimiento' },
      ],
      correctOptionKey: 'A',
      explanation: 'En inversiones, el riesgo y el rendimiento esperado suelen ir de la mano: a mayor riesgo de perder dinero, mayor es la ganancia potencial que se exige para compensarlo.',
      conceptTag: 'riesgo',
    },
    {
      statement: '¿Qué significa que una inversión tenga \'bajo riesgo\'?',
      options: [
        { key: 'A', text: 'Que es imposible perder dinero con ella' },
        { key: 'B', text: 'Que siempre genera ganancias muy altas en poco tiempo' },
        { key: 'C', text: 'Que la probabilidad de perder el capital es menor, aunque suele ofrecer menor rendimiento' },
      ],
      correctOptionKey: 'C',
      explanation: 'Una inversión de bajo riesgo tiene menor probabilidad de pérdida, pero eso normalmente viene con un rendimiento esperado también más bajo. Ninguna inversión está libre de riesgo por completo.',
      conceptTag: 'riesgo',
    },
    {
      statement: '¿Qué significa diversificar una inversión?',
      options: [
        { key: 'A', text: 'Invertir todo el dinero en una sola opción para concentrar las ganancias' },
        { key: 'B', text: 'Repartir el dinero entre distintas opciones de inversión para reducir el riesgo total' },
        { key: 'C', text: 'Cambiar de inversión todos los días según las noticias' },
      ],
      correctOptionKey: 'B',
      explanation: 'Diversificar significa repartir el dinero entre distintos tipos de inversión, en lugar de concentrarlo en una sola opción.',
      conceptTag: 'diversificacion',
    },
    {
      statement: '¿Por qué se dice que \'no hay que poner todos los huevos en la misma canasta\' al invertir?',
      options: [
        { key: 'A', text: 'Porque concentrar todo el dinero en una sola inversión aumenta el riesgo de perderlo todo si esa opción falla' },
        { key: 'B', text: 'Porque es una recomendación sin relación con las finanzas' },
        { key: 'C', text: 'Porque siempre es mejor invertir en una sola empresa conocida' },
      ],
      correctOptionKey: 'A',
      explanation: 'Si todo el dinero está en una sola inversión y esta falla, se pierde todo. Repartirlo entre varias opciones reduce ese riesgo.',
      conceptTag: 'diversificacion',
    },
    {
      statement: '¿Cuál de estas afirmaciones describe mejor la diferencia entre un plazo fijo y una acción?',
      options: [
        { key: 'A', text: 'Ambos ofrecen exactamente la misma ganancia y el mismo riesgo' },
        { key: 'B', text: 'El plazo fijo siempre rinde más que cualquier acción' },
        { key: 'C', text: 'El plazo fijo ofrece una ganancia fija y de bajo riesgo; la acción, una ganancia variable con mayor riesgo' },
      ],
      correctOptionKey: 'C',
      explanation: 'Un plazo fijo paga una tasa conocida de antemano y es de bajo riesgo. Una acción representa parte de una empresa: su valor puede subir o bajar, con mayor riesgo pero también mayor potencial de ganancia.',
      conceptTag: 'plazo-fijo-vs-acciones',
    },
    {
      statement: 'Si una persona prioriza la seguridad de no perder su dinero antes que la posibilidad de una ganancia alta, ¿qué opción se ajusta mejor a su perfil?',
      options: [
        { key: 'A', text: 'Comprar acciones de una empresa nueva y poco conocida' },
        { key: 'B', text: 'Un plazo fijo en una entidad financiera' },
        { key: 'C', text: 'Invertir todo en una sola acción muy volátil' },
      ],
      correctOptionKey: 'B',
      explanation: 'El plazo fijo es una opción de bajo riesgo con una ganancia conocida de antemano, acorde a quienes priorizan la seguridad del capital.',
      conceptTag: 'plazo-fijo-vs-acciones',
    },
    {
      statement: 'Un desconocido te ofrece \'duplicar tu dinero en una semana, sin riesgo\' si invertís con él. ¿Qué deberías pensar sobre esta oferta?',
      options: [
        { key: 'A', text: 'Que es una señal de alerta típica de una estafa, porque ninguna inversión real promete alta ganancia sin riesgo' },
        { key: 'B', text: 'Que es una gran oportunidad porque lo normal es que las inversiones sean así' },
        { key: 'C', text: 'Que conviene invertir igual, porque en el peor de los casos no se pierde nada' },
      ],
      correctOptionKey: 'A',
      explanation: 'Toda inversión real implica algún nivel de riesgo, y nadie puede garantizar ganancias altas en poco tiempo sin riesgo. Esa promesa es una señal común de estafa.',
      conceptTag: 'estafas-de-inversion',
    },
    {
      statement: '¿Cuál de las siguientes es una señal de alerta frente a una posible estafa de inversión?',
      options: [
        { key: 'A', text: 'La entidad está regulada y registrada oficialmente' },
        { key: 'B', text: 'Te explican con claridad los riesgos posibles de la inversión' },
        { key: 'C', text: 'Te presionan para invertir rápido, \'antes de que se acabe el cupo\', sin darte tiempo para analizar' },
      ],
      correctOptionKey: 'C',
      explanation: 'La presión para decidir rápido, sin tiempo para investigar o consultar, es una táctica común en estafas de inversión.',
      conceptTag: 'estafas-de-inversion',
    },
  ],
  // ── Planificación financiera — 8 preguntas
  'planificacion': [
    {
      statement: '¿Cuál de estas metas es un ejemplo de meta financiera de largo plazo?',
      options: [
        { key: 'A', text: 'Ahorrar para salir el próximo fin de semana' },
        { key: 'B', text: 'Juntar dinero para pagar los estudios universitarios en varios años' },
        { key: 'C', text: 'Pagar la factura de internet de este mes' },
      ],
      correctOptionKey: 'B',
      explanation: 'Una meta de largo plazo suele tomar varios años en cumplirse. Las metas de corto plazo se cumplen en semanas o pocos meses.',
      conceptTag: 'corto-vs-largo-plazo',
    },
    {
      statement: '¿Por qué es útil distinguir entre metas financieras de corto y de largo plazo?',
      options: [
        { key: 'A', text: 'Porque permite definir distintas estrategias de ahorro e inversión según el tiempo disponible para cada meta' },
        { key: 'B', text: 'Porque las metas de corto plazo nunca se pueden lograr' },
        { key: 'C', text: 'Porque no hay ninguna diferencia real entre ambos tipos de metas' },
      ],
      correctOptionKey: 'A',
      explanation: 'El plazo de una meta influye en cómo conviene ahorrar o invertir: para el corto plazo conviene priorizar la seguridad y disponibilidad del dinero; para el largo plazo se pueden considerar opciones con mayor potencial de crecimiento.',
      conceptTag: 'corto-vs-largo-plazo',
    },
    {
      statement: 'Diego quiere comprarse una bicicleta en 3 meses y también juntar dinero para su primer auto en 8 años. ¿Cómo se clasifican estas metas?',
      options: [
        { key: 'A', text: 'Ambas son de corto plazo' },
        { key: 'B', text: 'La bicicleta es de largo plazo y el auto de corto plazo' },
        { key: 'C', text: 'La bicicleta es de corto plazo y el auto de largo plazo' },
      ],
      correctOptionKey: 'C',
      explanation: 'Una meta a pocos meses es de corto plazo; una meta a varios años es de largo plazo. Separarlas ayuda a elegir cuánto ahorrar y dónde.',
      conceptTag: 'corto-vs-largo-plazo',
    },
    {
      statement: 'Una meta financiera "SMART" se caracteriza principalmente por ser:',
      options: [
        { key: 'A', text: 'Secreta, Motivadora y Automática' },
        { key: 'B', text: 'Específica, Medible, Alcanzable, Relevante y con un plazo de Tiempo definido' },
        { key: 'C', text: 'Solo aplicable a empresas grandes, no a personas' },
      ],
      correctOptionKey: 'B',
      explanation: 'SMART resume las características de una buena meta: Específica, Medible, Alcanzable, Relevante y con un plazo de Tiempo definido.',
      conceptTag: 'metas-smart',
    },
    {
      statement: '¿Cuál de estas metas cumple mejor con el criterio SMART?',
      options: [
        { key: 'A', text: '"Quiero ahorrar ₲1.800.000 para fin de año"' },
        { key: 'B', text: '"Quiero tener más plata algún día"' },
        { key: 'C', text: '"Quiero ser rico como mis ídolos"' },
      ],
      correctOptionKey: 'A',
      explanation: 'Esta meta es específica (monto claro), medible, y tiene un plazo de tiempo definido. Las otras son vagas y no permiten armar un plan concreto.',
      conceptTag: 'metas-smart',
    },
    {
      statement: 'Una persona escribe como meta: "Quiero ahorrar más". ¿Qué le falta para que sea una meta SMART?',
      options: [
        { key: 'A', text: 'Nada, ya es una meta suficientemente clara' },
        { key: 'B', text: 'Ser más difícil, para que se esfuerce más' },
        { key: 'C', text: 'Ser específica y medible: cuánto, para qué y en qué plazo' },
      ],
      correctOptionKey: 'C',
      explanation: 'Una meta SMART es específica, medible, alcanzable, relevante y con plazo. "Ahorrar más" no dice cuánto, para qué ni cuándo; por ejemplo: "ahorrar ₲600.000 en 6 meses para un celular".',
      conceptTag: 'metas-smart',
    },
    {
      statement: 'Después de armar un plan financiero y empezar a seguirlo, ¿qué se recomienda hacer periódicamente?',
      options: [
        { key: 'A', text: 'Nada, un plan financiero no debe tocarse una vez creado' },
        { key: 'B', text: 'Revisarlo y ajustarlo si cambian los ingresos, gastos o metas' },
        { key: 'C', text: 'Rehacerlo por completo desde cero cada mes' },
      ],
      correctOptionKey: 'B',
      explanation: 'Un plan financiero conviene revisarlo periódicamente para ajustarlo si cambian las circunstancias, sin necesidad de rehacerlo todo de cero.',
      conceptTag: 'revision-del-plan',
    },
    {
      statement: 'Si una persona revisa su plan financiero y nota que no está logrando ahorrar lo planeado mes a mes, ¿qué debería hacer?',
      options: [
        { key: 'A', text: 'Analizar qué está fallando (gastos, ingresos, metas poco realistas) y ajustar el plan en consecuencia' },
        { key: 'B', text: 'Ignorarlo y esperar que se resuelva solo' },
        { key: 'C', text: 'Abandonar por completo la idea de tener un plan financiero' },
      ],
      correctOptionKey: 'A',
      explanation: 'La revisión periódica sirve para detectar cuando algo no está funcionando y poder ajustarlo a tiempo.',
      conceptTag: 'revision-del-plan',
    },
  ],
};

export const seedQuestions = async () => {
  let total = 0;
  for (const [slug, questions] of Object.entries(QUESTIONS_BY_MODULE)) {
    const mod = await Module.findOne({ slug });
    if (!mod) throw new Error(`Módulo no encontrado: ${slug}. ¿Corriste seedModules primero?`);
    if (questions.length !== mod.questionCount) {
      throw new Error(
        `El módulo "${slug}" declara questionCount=${mod.questionCount} pero el seed trae ${questions.length} preguntas.`
      );
    }
    for (const [i, q] of questions.entries()) {
      await Question.updateOne(
        { moduleId: mod._id, order: i + 1 },
        { $set: { ...q, moduleId: mod._id, order: i + 1 } },
        { upsert: true, runValidators: true }
      );
      total++;
    }
  }
  console.log(`✅ ${total} preguntas cargadas`);
};
