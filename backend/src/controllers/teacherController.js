// GUIA_DE_CODIGO.md — Parte 1, F08. Rutas de los endpoints 16-20.
import {
  listTeacherClasses,
  listClassStudents,
  getClassStats,
  updateClassSettings,
  exportClassData,
} from '../services/teacherService.js';
import { toCsv } from '../utils/csv.js';
import { toLocalDateString } from '../utils/date.js';

// 16. GET /teacher/classes
export const getClasses = async (req, res, next) => {
  try {
    const result = await listTeacherClasses(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// 17. GET /teacher/classes/:classCode/students
export const getStudents = async (req, res, next) => {
  try {
    const { classCode } = req.params;
    const { sortBy, order } = req.query;
    const result = await listClassStudents(req.user.id, classCode, { sortBy, order });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// 18. GET /teacher/classes/:classCode/stats
export const getStats = async (req, res, next) => {
  try {
    const { classCode } = req.params;
    const result = await getClassStats(req.user.id, classCode);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// 19. PATCH /teacher/classes/:classCode/settings
export const patchSettings = async (req, res, next) => {
  try {
    const { classCode } = req.params;
    const result = await updateClassSettings(req.user.id, classCode, req.body ?? {});
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// 20. GET /teacher/classes/:classCode/export
export const getExport = async (req, res, next) => {
  try {
    const { classCode } = req.params;
    const format = req.query.format ?? 'csv';
    const include = req.query.include ?? 'summary';

    const { columns, rows } = await exportClassData(req.user.id, classCode, { format, include });

    if (format === 'json') {
      return res.status(200).json({ classCode, include, rows });
    }

    const csv = toCsv(columns, rows);
    const filename = `ecolingo_${classCode}_${include}_${toLocalDateString()}.csv`;
    res
      .status(200)
      .set('Content-Type', 'text/csv; charset=utf-8')
      .set('Content-Disposition', `attachment; filename="${filename}"`)
      .send(csv);
  } catch (err) {
    next(err);
  }
};
