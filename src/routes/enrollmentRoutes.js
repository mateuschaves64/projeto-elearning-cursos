import express from 'express';
import * as enrollmentController from '../controllers/enrollmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate, validateParams } from '../middleware/validateMiddleware.js';
import { createEnrollmentSchema, idEnrollmentSchema } from '../schemas/enrollmentSchema.js';

const router = express.Router();

// 1. POST /enrollments -> Matricular-se (Protegido por JWT)
router.post('/', authMiddleware, validate(createEnrollmentSchema), enrollmentController.createEnrollment);

// 2. GET /enrollments/me -> Minhas matrículas (Protegido por JWT) - precisa vir ANTES de /:id
router.get('/me', authMiddleware, enrollmentController.getMyEnrollments);

// 3. PATCH /enrollments/:id/lock -> Trancar matrícula (Protegido por JWT)
router.patch('/:id/lock', authMiddleware, validateParams(idEnrollmentSchema), enrollmentController.lockEnrollment);

// 4. PATCH /enrollments/:id/reactivate -> Reativar matrícula (Protegido por JWT)
router.patch('/:id/reactivate', authMiddleware, validateParams(idEnrollmentSchema), enrollmentController.reactivateEnrollment);

export default router;
