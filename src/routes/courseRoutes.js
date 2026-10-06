import express from 'express';
import * as courseController from '../controllers/courseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validate, validateParams } from '../middleware/validateMiddleware.js';
import {
  createCourseSchema,
  updateCourseSchema,
  idCourseSchema,
  addPrerequisiteSchema,
  prerequisiteParamsSchema
} from '../schemas/courseSchema.js';
import { USER_ROLES } from '../constants/statuses.js';

const router = express.Router();
const onlyInstructor = [authMiddleware, requireRole(USER_ROLES.INSTRUCTOR)];

// Cursos
router.get('/', courseController.getCourses);
router.get('/:id', validateParams(idCourseSchema), courseController.getCourseById);
router.post('/', ...onlyInstructor, validate(createCourseSchema), courseController.createCourse);
router.put('/:id', ...onlyInstructor, validateParams(idCourseSchema), validate(updateCourseSchema), courseController.updateCourse);

// Pré-requisitos
router.get('/:id/prerequisites', validateParams(idCourseSchema), courseController.getPrerequisites);
router.post('/:id/prerequisites', ...onlyInstructor, validateParams(idCourseSchema), validate(addPrerequisiteSchema), courseController.addPrerequisite);
router.delete('/:id/prerequisites/:requiredId', ...onlyInstructor, validateParams(prerequisiteParamsSchema), courseController.removePrerequisite);

export default router;
