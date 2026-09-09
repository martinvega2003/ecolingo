import mongoose from 'mongoose';
import { loginOrRegisterStudent, loginTeacher, getMe, resetStudentPin } from '../services/authService.js';
import { signToken } from '../utils/jwt.js';
import { badRequest } from '../utils/apiError.js';

// 2. POST /auth/student/login
export const studentLogin = async (req, res, next) => {
  try {
    const { user, classDoc, isNewUser } = await loginOrRegisterStudent(req.body);
    const token = signToken(user);

    res.status(isNewUser ? 201 : 200).json({
      token,
      user: {
        id: user.id,
        role: user.role,
        username: user.username,
        fullName: user.fullName,
        classCode: user.classCode,
        totalXp: user.totalXp,
        weeklyXp: user.weeklyXp,
        currentStreak: user.currentStreak,
        isNewUser,
      },
      class: {
        code: classDoc.code,
        name: classDoc.name,
        isPretestEnabled: classDoc.isPretestEnabled,
        isPosttestEnabled: classDoc.isPosttestEnabled,
        pretestFormUrl: classDoc.pretestFormUrl,
        posttestFormUrl: classDoc.posttestFormUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 3. POST /auth/teacher/login
export const teacherLogin = async (req, res, next) => {
  try {
    const teacher = await loginTeacher(req.body);
    const token = signToken(teacher);

    res.status(200).json({
      token,
      user: {
        id: teacher.id,
        role: teacher.role,
        fullName: teacher.fullName,
        email: teacher.email,
        classCode: null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 4. GET /auth/me
export const me = async (req, res, next) => {
  try {
    const profile = await getMe(req.user);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

// 26. PATCH /teacher/classes/:classCode/students/:userId/reset-pin
export const resetPin = async (req, res, next) => {
  try {
    const { classCode, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw badRequest('MALFORMED_ID', 'El parámetro de ruta no es un ObjectId válido.');
    }

    const result = await resetStudentPin({ teacherId: req.user.id, classCode, userId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
