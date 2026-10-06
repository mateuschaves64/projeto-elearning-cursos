import { certificateService } from '../container.js';
import { handleError } from '../utils/handleError.js';

// 1. Emitir certificado (POST /certificates)
export const issueCertificate = async (req, res) => {
  try {
    const certificate = await certificateService.issueCertificate(req.user.id, req.body.enrollments_id_fk);
    return res.status(201).json({ message: 'Certificado emitido com sucesso!', data: certificate });
  } catch (error) {
    return handleError(res, error, 'Erro interno ao emitir certificado.');
  }
};

// 2. Listar meus certificados (GET /certificates/me)
export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await certificateService.listUserCertificates(req.user.id);
    return res.status(200).json(certificates);
  } catch (error) {
    return handleError(res, error, 'Erro interno ao listar certificados.');
  }
};
