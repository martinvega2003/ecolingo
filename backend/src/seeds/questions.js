// GUIA_DE_CODIGO.md v2.2 — Parte 2, F04. Reparto de autoría actualizado
// (la fusión de módulos lo cambió): Persona A escribe los módulos 1 a 3
// — Ahorro e Interés, Presupuesto, Crédito y deuda (20 preguntas);
// Persona B escribe los módulos 4 y 5 — Inversión básica,

import { Module, Question } from '../models/index.js';

export const QUESTIONS_BY_MODULE = {
  // ── Módulo 1 · Ahorro e Interés — 8 preguntas · Persona A 
  'ahorro-e-interes': [
    {
      statement:
        'Ganás Gs. 1.500.000 por mes. ¿Cuánto deberías tener idealmente en tu fondo de emergencia?',
      options: [
        { key: 'A', text: 'Gs. 500.000, con eso alcanza para un imprevisto' },
        { key: 'B', text: 'Entre Gs. 4.500.000 y Gs. 9.000.000, de 3 a 6 meses de ingresos' },
        { key: 'C', text: 'No hace falta si tenés tarjeta de crédito' },
      ],
      correctOptionKey: 'B',
      explanation:
        'Un fondo de emergencia debe cubrir entre 3 y 6 meses de tus ingresos. Con Gs. 1.500.000 ' +
        'mensuales, el rango va de Gs. 4.500.000 a Gs. 9.000.000. La tarjeta no es un fondo de ' +
        'emergencia: es deuda que genera intereses.',
      conceptTag: 'fondo-de-emergencia',
    },
    {
      statement: 'Cobrás tu sueldo el día 30. ¿Cuál es la mejor estrategia para ahorrar?',
      options: [
        { key: 'A', text: 'Apartar el monto de ahorro apenas cobrás, antes de gastar' },
        { key: 'B', text: 'Gastar normalmente y ahorrar lo que sobre a fin de mes' },
        { key: 'C', text: 'Ahorrar solo los meses en que no tenés gastos grandes' },
      ],
      correctOptionKey: 'A',
      explanation:
        'Se llama "pagarse a uno mismo primero". Si esperás a que sobre, casi nunca sobra. Apartar ' +
        'el ahorro apenas cobrás lo convierte en un gasto fijo más, y el resto del mes te acomodás ' +
        'con lo que queda.',
      conceptTag: 'ahorro-automatico',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 2 de fondo de emergencia.',
      options: [
        { key: 'A', text: 'Opción de prueba A (correcta, solo para testear)' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'A',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'fondo-de-emergencia',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 2 de ahorro automático.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B (correcta, solo para testear)' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'B',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'ahorro-automatico',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 1 de metas de ahorro.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C (correcta, solo para testear)' },
      ],
      correctOptionKey: 'C',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'metas-de-ahorro',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 2 de metas de ahorro.',
      options: [
        { key: 'A', text: 'Opción de prueba A (correcta, solo para testear)' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'A',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'metas-de-ahorro',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 1 de capitalización.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B (correcta, solo para testear)' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'B',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'capitalizacion',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 2 de capitalización.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C (correcta, solo para testear)' },
      ],
      correctOptionKey: 'C',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'capitalizacion',
    },
  ],

  // ── Módulo 2 · Presupuesto — 6 preguntas · Persona A 
  presupuesto: [
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 1 de la regla 50/30/20.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B (correcta, solo para testear)' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'B',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'regla-50-30-20',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 2 de la regla 50/30/20.',
      options: [
        { key: 'A', text: 'Opción de prueba A (correcta, solo para testear)' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'A',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'regla-50-30-20',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 1 de gastos fijos vs. variables.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C (correcta, solo para testear)' },
      ],
      correctOptionKey: 'C',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'gastos-fijos-vs-variables',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 2 de gastos fijos vs. variables.',
      options: [
        { key: 'A', text: 'Opción de prueba A (correcta, solo para testear)' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'A',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'gastos-fijos-vs-variables',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 1 de balance ingreso-gasto.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B (correcta, solo para testear)' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'B',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'balance-ingreso-gasto',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 2 de balance ingreso-gasto.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C (correcta, solo para testear)' },
      ],
      correctOptionKey: 'C',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'balance-ingreso-gasto',
    },
  ],

  // ── Módulo 3 · Crédito y deuda — 6 preguntas · Persona A
  credito: [
    {
      statement:
        'Tenés una deuda en tarjeta al 28 % anual y un préstamo personal al 18 % anual. ' +
        '¿Cuál conviene pagar primero?',
      options: [
        { key: 'A', text: 'La tarjeta de crédito, porque tiene la tasa más alta' },
        { key: 'B', text: 'El préstamo personal, porque el monto es mayor' },
        { key: 'C', text: 'La deuda de cuota más baja, para sacarla rápido' },
      ],
      correctOptionKey: 'A',
      explanation:
        'El método avalancha prioriza la deuda de mayor tasa. Pagar primero la tarjeta al 28 % ' +
        'reduce más el costo total en intereses que cancelar el préstamo al 18 %, aunque este ' +
        'último tenga un saldo mayor.',
      conceptTag: 'metodo-avalancha',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 1 de tasa de interés.',
      options: [
        { key: 'A', text: 'Opción de prueba A (correcta, solo para testear)' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'A',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'tasa-de-interes',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 2 de tasa de interés.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B (correcta, solo para testear)' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'B',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'tasa-de-interes',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 2 de método avalancha.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C (correcta, solo para testear)' },
      ],
      correctOptionKey: 'C',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'metodo-avalancha',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 1 de historial crediticio.',
      options: [
        { key: 'A', text: 'Opción de prueba A (correcta, solo para testear)' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'A',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'historial-crediticio',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta 2 de historial crediticio.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B (correcta, solo para testear)' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'B',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'historial-crediticio',
    },
  ],

  // ── Módulo 4 · Inversión básica — 8 preguntas · Persona B 
  inversion: [
    {
      statement: '[PLACEHOLDER — Persona B, escribir contenido real] Pregunta 1 de riesgo.',
      options: [
        { key: 'A', text: 'Opción de prueba A (correcta, solo para testear)' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'A',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'riesgo',
    },
    {
      statement: '[PLACEHOLDER — Persona B, escribir contenido real] Pregunta 2 de riesgo.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B (correcta, solo para testear)' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'B',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'riesgo',
    },
    {
      statement: '[PLACEHOLDER — Persona B, escribir contenido real] Pregunta 1 de diversificación.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C (correcta, solo para testear)' },
      ],
      correctOptionKey: 'C',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'diversificacion',
    },
    {
      statement: '[PLACEHOLDER — Persona B, escribir contenido real] Pregunta 2 de diversificación.',
      options: [
        { key: 'A', text: 'Opción de prueba A (correcta, solo para testear)' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'A',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'diversificacion',
    },
    {
      statement: '[PLACEHOLDER — Persona B, escribir contenido real] Pregunta 1 de plazo fijo vs. acciones.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B (correcta, solo para testear)' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'B',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'plazo-fijo-vs-acciones',
    },
    {
      statement: '[PLACEHOLDER — Persona B, escribir contenido real] Pregunta 2 de plazo fijo vs. acciones.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C (correcta, solo para testear)' },
      ],
      correctOptionKey: 'C',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'plazo-fijo-vs-acciones',
    },
    {
      statement: '[PLACEHOLDER — Persona B, escribir contenido real] Pregunta 1 de estafas de inversión.',
      options: [
        { key: 'A', text: 'Opción de prueba A (correcta, solo para testear)' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'A',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'estafas-de-inversion',
    },
    {
      statement: '[PLACEHOLDER — Persona B, escribir contenido real] Pregunta 2 de estafas de inversión.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B (correcta, solo para testear)' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'B',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'estafas-de-inversion',
    },
  ],

  // ── Módulo 5 · Planificación financiera — 6 preguntas · Persona B 
  planificacion: [
    {
      statement: '[PLACEHOLDER — Persona B, escribir contenido real] Pregunta 1 de corto vs. largo plazo.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C (correcta, solo para testear)' },
      ],
      correctOptionKey: 'C',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'corto-vs-largo-plazo',
    },
    {
      statement: '[PLACEHOLDER — Persona B, escribir contenido real] Pregunta 2 de corto vs. largo plazo.',
      options: [
        { key: 'A', text: 'Opción de prueba A (correcta, solo para testear)' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'A',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'corto-vs-largo-plazo',
    },
    {
      statement: '[PLACEHOLDER — Persona B, escribir contenido real] Pregunta 1 de metas SMART.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B (correcta, solo para testear)' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'B',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'metas-smart',
    },
    {
      statement: '[PLACEHOLDER — Persona B, escribir contenido real] Pregunta 2 de metas SMART.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C (correcta, solo para testear)' },
      ],
      correctOptionKey: 'C',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'metas-smart',
    },
    {
      statement: '[PLACEHOLDER — Persona B, escribir contenido real] Pregunta 1 de revisión del plan.',
      options: [
        { key: 'A', text: 'Opción de prueba A (correcta, solo para testear)' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'A',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'revision-del-plan',
    },
    {
      statement: '[PLACEHOLDER — Persona B, escribir contenido real] Pregunta 2 de revisión del plan.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B (correcta, solo para testear)' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'B',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
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
  console.log(`✅ ${total} preguntas cargadas (3 reales + 31 placeholder)`);
};
