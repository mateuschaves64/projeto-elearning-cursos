import express from 'express';
import * as certificateController from '../controllers/certificateController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { issueCertificateSchema } from '../schemas/certificateSchema.js';

const router = express.Router();

// 1. POST /certificates -> Emitir certificado (Protegido por JWT)
router.post('/', authMiddleware, validate(issueCertificateSchema), certificateController.issueCertificate);

// 2. GET /certificates/me -> Meus certificados (Protegido por JWT)
router.get('/me', authMiddleware, certificateController.getMyCertificates);

export default router;
