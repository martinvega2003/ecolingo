// GUIA_DE_CODIGO.md — Parte 1, F08 (endpoints 16-20). Dueño: Persona B.
// Sin colecciones nuevas (Parte 2, F08) — lee todas las existentes, escribe
// sobre `classes` (endpoint 19). El reseteo de PIN (endpoint 26) es de F01
// y no vive acá — ver controllers/authController.js.
import { User, Class, Module, Question, Progress, ModuleAttempt, UserBadge } from '../models/index.js';
import { badRequest, notFound, forbidden } from '../utils/apiError.js';
import { toLocalDateString, getWeekStart } from '../utils/date.js';

const round1 = (n) => Math.round(n * 10) / 10;

// --- Guard de pertenencia, mismo patrón que resetStudentPin (F01, endpoint
// 26, ver services/authService.js) — reutilizado acá porque la Parte 3
// exige "un docente no puede ver una clase de otro docente" en el panel
// entero, no solo en el endpoint 19 (el único que trae la tabla de errores
// explícita en Parte 1). ---
const assertClassOwnership = async (teacherId, classCode) => {
  const classDoc = await Class.findOne({ code: classCode });
  if (!classDoc) {
    throw notFound('CLASS_NOT_FOUND', 'El classCode no existe.');
  }
  if (String(classDoc.teacherId) !== String(teacherId)) {
    throw forbidden('NOT_RESOURCE_OWNER', 'La clase pertenece a otro docente.');
  }
  return classDoc;
};

const countStudentsByClassCode = async (codes) => {
  const counts = await User.aggregate([
    { $match: { classCode: { $in: codes }, role: 'student' } },
    { $group: { _id: '$classCode', count: { $sum: 1 } } },
  ]);
  return new Map(counts.map((c) => [c._id, c.count]));
};

// Shape de un elemento de clase — el mismo para el endpoint 16 y para la
// respuesta del 19 ("mismo shape que un elemento de GET /teacher/classes").
//
// ⚠️ Adición aditiva (§0.15 — "se agrega, nunca se renombra ni se elimina
// un campo existente"): pretestFormUrl/posttestFormUrl NO están en el
// ejemplo literal de Parte 1 para estos dos endpoints, pero sin ellos la
// pantalla de ajustes no tiene forma de mostrar la URL ya configurada antes
// de que el docente la edite. Avisar a Cesar — no le toca nada de esto,
// pero es un cambio de shape y corresponde que quede registrado.
const toClassSummary = (classDoc, studentCount) => ({
  code: classDoc.code,
  name: classDoc.name,
  studentCount,
  isActive: classDoc.isActive,
  isPretestEnabled: classDoc.isPretestEnabled,
  isPosttestEnabled: classDoc.isPosttestEnabled,
  pretestFormUrl: classDoc.pretestFormUrl,
  posttestFormUrl: classDoc.posttestFormUrl,
  createdAt: classDoc.createdAt,
});

// 16. GET /teacher/classes
export const listTeacherClasses = async (teacherId) => {
  const classes = await Class.find({ teacherId }).sort({ createdAt: 1 }).lean();
  const countByCode = await countStudentsByClassCode(classes.map((c) => c.code));

  return {
    classes: classes.map((c) => toClassSummary(c, countByCode.get(c.code) ?? 0)),
    total: classes.length,
  };
};

const SORTABLE_FIELDS = new Set(['totalXp', 'fullName', 'completedModules', 'lastActivityDate']);

// 17. GET /teacher/classes/:classCode/students
export const listClassStudents = async (teacherId, classCode, { sortBy, order } = {}) => {
  await assertClassOwnership(teacherId, classCode);

  // Query params inválidos caen al default en vez de error — Parte 1 no
  // documenta un código de error para esta tabla (a diferencia del
  // endpoint 19, que sí trae uno explícito).
  const safeSortBy = SORTABLE_FIELDS.has(sortBy) ? sortBy : 'totalXp';
  const safeOrder = order === 'asc' ? 'asc' : 'desc';

  const students = await User.find({ classCode, role: 'student' })
    .select('fullName username totalXp weeklyXp currentStreak totalTimeSpentSeconds lastActivityDate isActive')
    .lean();
  const studentIds = students.map((s) => s._id);

  const totalModules = await Module.countDocuments({ isPublished: true });

  const [completedAgg, badgeAgg, attemptAgg] = await Promise.all([
    Progress.aggregate([
      { $match: { userId: { $in: studentIds }, status: 'completed' } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]),
    UserBadge.aggregate([
      { $match: { userId: { $in: studentIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]),
    ModuleAttempt.aggregate([
      { $match: { userId: { $in: studentIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]),
  ]);
  const completedByUser = new Map(completedAgg.map((p) => [String(p._id), p.count]));
  const badgesByUser = new Map(badgeAgg.map((b) => [String(b._id), b.count]));
  const attemptsByUser = new Map(attemptAgg.map((a) => [String(a._id), a.count]));

  const rows = students.map((s) => {
    const completedModules = completedByUser.get(String(s._id)) ?? 0;
    return {
      id: String(s._id),
      fullName: s.fullName,
      username: s.username,
      totalXp: s.totalXp,
      weeklyXp: s.weeklyXp,
      completedModules,
      totalModules,
      completionPercentage: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
      currentStreak: s.currentStreak,
      badgeCount: badgesByUser.get(String(s._id)) ?? 0,
      totalTimeSpentSeconds: s.totalTimeSpentSeconds,
      totalAttempts: attemptsByUser.get(String(s._id)) ?? 0,
      lastActivityDate: s.lastActivityDate,
      isActive: s.isActive,
    };
  });

  rows.sort((a, b) => {
    let cmp;
    if (safeSortBy === 'fullName') {
      cmp = a.fullName.localeCompare(b.fullName, 'es');
    } else if (safeSortBy === 'lastActivityDate') {
      cmp = (a.lastActivityDate ?? '').localeCompare(b.lastActivityDate ?? '');
    } else {
      cmp = a[safeSortBy] - b[safeSortBy];
    }
    return safeOrder === 'asc' ? cmp : -cmp;
  });

  return { classCode, students: rows, total: rows.length };
};

// accuracyPercentage no es un campo guardado en ningún lado (ni en
// ModuleAttempt ni en Progress) — Parte 1 lo da por sentado ("Media de
// accuracyPercentage de los intentos finalizados") sin definir la fórmula
// por intento. Se calcula acá como correctCount/respuestas dadas × 100.
// Documentado — avisar si Cesar necesitara esta misma cuenta en otro lado,
// para no duplicar la definición.
const accuracyExpr = {
  $cond: [
    { $gt: [{ $size: '$answers' }, 0] },
    { $multiply: [{ $divide: ['$correctCount', { $size: '$answers' }] }, 100] },
    0,
  ],
};

// 18. GET /teacher/classes/:classCode/stats
export const getClassStats = async (teacherId, classCode) => {
  await assertClassOwnership(teacherId, classCode);

  const students = await User.find({ classCode, role: 'student' })
    .select('totalXp lastActivityDate')
    .lean();
  const studentIds = students.map((s) => s._id);
  const studentCount = students.length;

  const today = toLocalDateString();
  const mondayThisWeek = toLocalDateString(getWeekStart());
  const activeToday = students.filter((s) => s.lastActivityDate === today).length;
  const activeThisWeek = students.filter((s) => s.lastActivityDate && s.lastActivityDate >= mondayThisWeek).length;
  const averageXp = studentCount > 0 ? Math.round(students.reduce((sum, s) => sum + s.totalXp, 0) / studentCount) : 0;

  const [statusAgg, completedAgg, moduleAttemptAgg, sessionAgg, modules] = await Promise.all([
    ModuleAttempt.aggregate([
      { $match: { userId: { $in: studentIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Progress.aggregate([
      { $match: { userId: { $in: studentIds }, status: 'completed' } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]),
    ModuleAttempt.aggregate([
      { $match: { userId: { $in: studentIds }, finishedAt: { $ne: null } } },
      { $project: { moduleId: 1, durationSeconds: 1, accuracyPercentage: accuracyExpr } },
      {
        $group: {
          _id: '$moduleId',
          averageAccuracy: { $avg: '$accuracyPercentage' },
          averageDurationSeconds: { $avg: '$durationSeconds' },
        },
      },
    ]),
    ModuleAttempt.aggregate([
      { $match: { userId: { $in: studentIds }, durationSeconds: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$durationSeconds' } } },
    ]),
    Module.find({ isPublished: true }).sort({ order: 1 }).select('order title').lean(),
  ]);

  const statusCounts = Object.fromEntries(statusAgg.map((s) => [s._id, s.count]));
  const completed = statusCounts.completed ?? 0;
  const failed = statusCounts.failed ?? 0;
  const abandoned = statusCounts.abandoned ?? 0;
  const inProgress = statusCounts.in_progress ?? 0;
  const totalFinished = completed + failed + abandoned;
  const totalAttempts = totalFinished + inProgress;
  const completionRate = totalFinished > 0 ? round1((completed / totalFinished) * 100) : 0;

  const completedModulesSum = completedAgg.reduce((sum, c) => sum + c.count, 0);
  const averageCompletedModules = studentCount > 0 ? round1(completedModulesSum / studentCount) : 0;

  const averageTimePerSessionSeconds = sessionAgg[0]?.avg != null ? Math.round(sessionAgg[0].avg) : 0;

  // completedBy por módulo — desde Progress (estado por alumno), no desde
  // ModuleAttempt (que puede tener varios intentos completados del mismo
  // módulo si el alumno repite).
  const completedByModuleAgg = await Progress.aggregate([
    { $match: { userId: { $in: studentIds }, status: 'completed' } },
    { $group: { _id: '$moduleId', count: { $sum: 1 } } },
  ]);
  const completedByModule = new Map(completedByModuleAgg.map((c) => [String(c._id), c.count]));
  const attemptStatsByModule = new Map(moduleAttemptAgg.map((m) => [String(m._id), m]));

  const moduleBreakdown = modules.map((mod) => {
    const stats = attemptStatsByModule.get(String(mod._id));
    return {
      order: mod.order,
      title: mod.title,
      completedBy: completedByModule.get(String(mod._id)) ?? 0,
      averageAccuracy: stats?.averageAccuracy != null ? round1(stats.averageAccuracy) : 0,
      averageDurationSeconds: stats?.averageDurationSeconds != null ? Math.round(stats.averageDurationSeconds) : 0,
    };
  });

  return {
    classCode,
    studentCount,
    activeToday,
    activeThisWeek,
    averageXp,
    averageCompletedModules,
    averageTimePerSessionSeconds,
    totalAttempts,
    completionRate,
    moduleBreakdown,
  };
};

// 19. PATCH /teacher/classes/:classCode/settings
const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const updateClassSettings = async (teacherId, classCode, patch) => {
  const classDoc = await assertClassOwnership(teacherId, classCode);

  const details = [];
  const $set = {};

  if (patch.isPretestEnabled !== undefined) {
    if (typeof patch.isPretestEnabled !== 'boolean') {
      details.push({ field: 'isPretestEnabled', issue: 'Debe ser booleano.' });
    } else {
      $set.isPretestEnabled = patch.isPretestEnabled;
    }
  }
  if (patch.isPosttestEnabled !== undefined) {
    if (typeof patch.isPosttestEnabled !== 'boolean') {
      details.push({ field: 'isPosttestEnabled', issue: 'Debe ser booleano.' });
    } else {
      $set.isPosttestEnabled = patch.isPosttestEnabled;
    }
  }
  if (patch.isActive !== undefined) {
    if (typeof patch.isActive !== 'boolean') {
      details.push({ field: 'isActive', issue: 'Debe ser booleano.' });
    } else {
      $set.isActive = patch.isActive;
    }
  }
  if (patch.pretestFormUrl !== undefined) {
    if (patch.pretestFormUrl !== null && !isValidUrl(patch.pretestFormUrl)) {
      details.push({ field: 'pretestFormUrl', issue: 'URL malformada.' });
    } else {
      $set.pretestFormUrl = patch.pretestFormUrl;
    }
  }
  if (patch.posttestFormUrl !== undefined) {
    if (patch.posttestFormUrl !== null && !isValidUrl(patch.posttestFormUrl)) {
      details.push({ field: 'posttestFormUrl', issue: 'URL malformada.' });
    } else {
      $set.posttestFormUrl = patch.posttestFormUrl;
    }
  }

  if (details.length > 0) {
    throw badRequest('VALIDATION_ERROR', 'Uno o más campos no son válidos.', details);
  }

  Object.assign(classDoc, $set);
  await classDoc.save();

  const countByCode = await countStudentsByClassCode([classDoc.code]);
  return toClassSummary(classDoc, countByCode.get(classDoc.code) ?? 0);
};

// 20. GET /teacher/classes/:classCode/export
export const SUMMARY_COLUMNS = [
  'username', 'fullName', 'totalXp', 'completedModules', 'completionPercentage', 'perfectModules',
  'badgeCount', 'totalAttempts', 'totalTimeSpentSeconds', 'currentStreak', 'longestStreak',
  'firstActivityDate', 'lastActivityDate', 'pretestScore', 'posttestScore', 'scoreDelta',
];

export const ANSWERS_COLUMNS = [
  'username', 'moduleOrder', 'moduleTitle', 'attemptId', 'attemptStatus', 'questionOrder',
  'conceptTag', 'selectedOptionKey', 'correctOptionKey', 'isCorrect', 'timeToAnswerSeconds', 'answeredAt',
];

const buildSummaryRows = async (studentIds, students) => {
  const totalModules = await Module.countDocuments({ isPublished: true });

  const [completedAgg, perfectAgg, badgeAgg, attemptAgg, firstActivityAgg] = await Promise.all([
    Progress.aggregate([
      { $match: { userId: { $in: studentIds }, status: 'completed' } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]),
    Progress.aggregate([
      { $match: { userId: { $in: studentIds }, isPerfect: true } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]),
    UserBadge.aggregate([
      { $match: { userId: { $in: studentIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]),
    ModuleAttempt.aggregate([
      { $match: { userId: { $in: studentIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]),
    // firstActivityDate no es un campo guardado (a diferencia de
    // lastActivityDate, que sí vive en User) — se deriva acá del primer
    // intento registrado. Sin intentos, la columna sale vacía.
    ModuleAttempt.aggregate([
      { $match: { userId: { $in: studentIds } } },
      { $group: { _id: '$userId', first: { $min: '$startedAt' } } },
    ]),
  ]);
  const completedByUser = new Map(completedAgg.map((p) => [String(p._id), p.count]));
  const perfectByUser = new Map(perfectAgg.map((p) => [String(p._id), p.count]));
  const badgesByUser = new Map(badgeAgg.map((b) => [String(b._id), b.count]));
  const attemptsByUser = new Map(attemptAgg.map((a) => [String(a._id), a.count]));
  const firstActivityByUser = new Map(firstActivityAgg.map((f) => [String(f._id), f.first]));

  return students.map((s) => {
    const completedModules = completedByUser.get(String(s._id)) ?? 0;
    const first = firstActivityByUser.get(String(s._id));
    return {
      username: s.username,
      fullName: s.fullName,
      totalXp: s.totalXp,
      completedModules,
      completionPercentage: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
      perfectModules: perfectByUser.get(String(s._id)) ?? 0,
      badgeCount: badgesByUser.get(String(s._id)) ?? 0,
      totalAttempts: attemptsByUser.get(String(s._id)) ?? 0,
      totalTimeSpentSeconds: s.totalTimeSpentSeconds,
      currentStreak: s.currentStreak,
      longestStreak: s.longestStreak,
      firstActivityDate: first ? toLocalDateString(first) : '',
      lastActivityDate: s.lastActivityDate ?? '',
      // Fase 2 (F12, opcional) todavía no está implementada — se emiten
      // vacías sin romper la estructura del archivo, tal como pide Parte 1.
      pretestScore: '',
      posttestScore: '',
      scoreDelta: '',
    };
  });
};

const buildAnswersRows = async (studentIds) => {
  const attempts = await ModuleAttempt.find({ userId: { $in: studentIds } })
    .select('userId moduleId status answers')
    .populate('userId', 'username')
    .populate('moduleId', 'order title')
    .lean();

  const questionIds = [...new Set(attempts.flatMap((a) => a.answers.map((ans) => String(ans.questionId))))];
  const questions = await Question.find({ _id: { $in: questionIds } }).select('conceptTag correctOptionKey').lean();
  const questionById = new Map(questions.map((q) => [String(q._id), q]));

  const rows = [];
  for (const attempt of attempts) {
    for (const ans of attempt.answers) {
      const q = questionById.get(String(ans.questionId));
      rows.push({
        username: attempt.userId?.username ?? '',
        moduleOrder: attempt.moduleId?.order ?? '',
        moduleTitle: attempt.moduleId?.title ?? '',
        attemptId: String(attempt._id),
        attemptStatus: attempt.status,
        questionOrder: ans.questionOrder,
        conceptTag: q?.conceptTag ?? '',
        selectedOptionKey: ans.selectedOptionKey,
        correctOptionKey: q?.correctOptionKey ?? '',
        isCorrect: ans.isCorrect,
        timeToAnswerSeconds: ans.timeToAnswerSeconds,
        answeredAt: ans.answeredAt ? new Date(ans.answeredAt).toISOString() : '',
      });
    }
  }
  return rows;
};

export const exportClassData = async (teacherId, classCode, { format, include }) => {
  await assertClassOwnership(teacherId, classCode);

  if (!['csv', 'json'].includes(format)) {
    throw badRequest('VALIDATION_ERROR', "El parámetro 'format' debe ser 'csv' o 'json'.", [
      { field: 'format', issue: `Valor recibido: ${format}` },
    ]);
  }
  if (!['summary', 'attempts', 'answers'].includes(include)) {
    throw badRequest('VALIDATION_ERROR', "El parámetro 'include' debe ser 'summary', 'attempts' o 'answers'.", [
      { field: 'include', issue: `Valor recibido: ${include}` },
    ]);
  }

  // ⚠️ GAP DE CONTRATO: Parte 1 (F08, endpoint 20) define las columnas de
  // include=summary y include=answers, pero NO las de include=attempts —
  // no hay ninguna tabla de columnas para ese nivel intermedio en todo el
  // documento. No lo invento (regla explícita: "si algo falta, avisar en
  // vez de improvisar"). Devuelve un error controlado hasta que se
  // defina y se cierre con acuerdo — no hace falta que sea bilateral con
  // Cesar (el endpoint es tuyo), pero sí que quede como decisión explícita
  // en vez de una forma de archivo inventada que después termine en el
  // Capítulo 5 de la tesis sin haber sido decidida a propósito.
  if (include === 'attempts') {
    throw badRequest(
      'VALIDATION_ERROR',
      "El nivel 'attempts' de export todavía no tiene columnas definidas en GUIA_DE_CODIGO.md — definilas antes de habilitarlo.",
      [{ field: 'include', issue: 'attempts: sin especificar en el contrato' }]
    );
  }

  const students = await User.find({ classCode, role: 'student' })
    .select('username fullName totalXp totalTimeSpentSeconds currentStreak longestStreak lastActivityDate')
    .lean();
  const studentIds = students.map((s) => s._id);

  if (include === 'summary') {
    const rows = await buildSummaryRows(studentIds, students);
    return { columns: SUMMARY_COLUMNS, rows };
  }

  const rows = await buildAnswersRows(studentIds);
  return { columns: ANSWERS_COLUMNS, rows };
};
