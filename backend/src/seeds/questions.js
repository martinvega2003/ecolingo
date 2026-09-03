// GUIA_DE_CODIGO.md — Parte 2, F04.
//
// 'ahorro': las 2 preguntas son literales del documento (ya venían
// completas y listas para usar).
// 'presupuesto': el documento NO trae su contenido — la Parte 2 asigna
// los módulos 1-4 a Persona A (Cesar). Las 3 preguntas de acá son
// PLACEHOLDER, marcadas explícitamente en el enunciado para que nadie
// las confunda con contenido real del piloto. Cesar las reemplaza
// cuando escriba las preguntas reales del módulo 2.
import { Module, Question } from '../models/index.js';

export const QUESTIONS_BY_MODULE = {
  // ── Módulo 1 · Ahorro — 2 preguntas · contenido real (dado en el documento) ──
  ahorro: [
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
  ],

  // ── Módulo 2 · Presupuesto — 3 preguntas · PLACEHOLDER, no es contenido real ──
  presupuesto: [
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta de ejemplo 1 sobre la regla 50/30/20.',
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
      statement: '[PLACEHOLDER — Persona A] Pregunta de ejemplo 2 sobre gastos fijos.',
      options: [
        { key: 'A', text: 'Opción de prueba A (correcta, solo para testear)' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C' },
      ],
      correctOptionKey: 'A',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'gastos-fijos',
    },
    {
      statement: '[PLACEHOLDER — Persona A] Pregunta de ejemplo 3 sobre gastos variables.',
      options: [
        { key: 'A', text: 'Opción de prueba A' },
        { key: 'B', text: 'Opción de prueba B' },
        { key: 'C', text: 'Opción de prueba C (correcta, solo para testear)' },
      ],
      correctOptionKey: 'C',
      explanation: '[PLACEHOLDER] Reemplazar con una explicación real antes del piloto.',
      conceptTag: 'gastos-variables',
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
  console.log(`✅ ${total} preguntas cargadas (2 reales de "ahorro" + 3 placeholder de "presupuesto")`);
};
