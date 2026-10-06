import express from 'express';
import * as classController from '../controllers/classController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validate, validateParams } from '../middleware/validateMiddleware.js';
import { createClassSchema, idClassSchema } from '../schemas/classSchema.js';
import { USER_ROLES } from '../constants/statuses.js';

const router = express.Router();
const onlyInstructor = [authMiddleware, requireRole(USER_ROLES.INSTRUCTOR)];

router.get('/', classController.getClasses);
router.get('/:id', validateParams(idClassSchema), classController.getClassById);
router.get('/:id/availability', validateParams(idClassSchema), classController.getClassAvailability);
router.post('/', ...onlyInstructor, validate(createClassSchema), classController.createClass);
router.patch('/:id/close', ...onlyInstructor, validateParams(idClassSchema), classController.closeClass);

export default router;
