import express from 'express';
import * as gradeController from '../controllers/gradeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validate, validateParams } from '../middleware/validateMiddleware.js';
import { launchGradeSchema, enrollmentIdParamSchema } from '../schemas/gradeSchema.js';
import { USER_ROLES } from '../constants/statuses.js';

const router = express.Router();

// 1. POST /grades -> Lançar nota (Protegido por JWT + INSTRUCTOR)
router.post('/', authMiddleware, requireRole(USER_ROLES.INSTRUCTOR), validate(launchGradeSchema), gradeController.launchGrade);

// 2. GET /grades/enrollment/:enrollmentId -> Notas e média (Protegido por JWT; aluno só vê as suas)
router.get('/enrollment/:enrollmentId', authMiddleware, validateParams(enrollmentIdParamSchema), gradeController.getEnrollmentGrades);

export default router;
