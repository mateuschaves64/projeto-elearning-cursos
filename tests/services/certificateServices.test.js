import { CertificateService } from "../services/certificateServices.test.js"
import { BusinessRuleError, NotFoundError } from "../errors/AppError.js"
import { criarEstudante } from "../factories/studentFactory.js"

describe ('CertificateServive', () => {
    let certificateService
    let mockCertificateModel
    let mockGradeService

    beforeEach(() => {
        mockCertificateModel = {
            createCertificate: jest.fn(),
            getCertificateByUserAndCourse: jest.fn()
        };
        mockGradeService = {
            getStudentAverage: jest.fn()
        }
        certificateService = new CertificateService({
            certificateModel: mockCertificateModel,
            gradeService: mockGradeService,
        })
    })
})

describe('generateCertificate', () => {
    it('deve lançar BusinessRuleError ao tentar emitir certificado para aluno com média abaixo da mínima', async () => {
      const user = criarEstudante();
      const courseId = 100;

      mockGradeService.getStudentAverage.mockResolvedValue(5.0);

      await expect(
        certificateService.generateCertificate(user.id_users_pk, courseId)
      ).rejects.toThrow(BusinessRuleError);
    });

    it('deve emitir o certificado com sucesso quando a média for maior ou igual à mínima', async () => {
      const user = criarEstudante();
      const courseId = 100;
      const expectedCertificate = {
        id_certificates_pk: 1,
        users_id_fk: user.id_users_pk,
        courses_id_fk: courseId,
        issued_at: new Date('2026-03-01T10:00:00Z'),
      };

      mockGradeService.getStudentAverage.mockResolvedValue(8.5);
      mockCertificateModel.createCertificate.mockResolvedValue(expectedCertificate);

      const result = await certificateService.generateCertificate(user.id_users_pk, courseId);

      expect(mockGradeService.getStudentAverage).toHaveBeenCalledWith(user.id_users_pk, courseId);
      expect(mockCertificateModel.createCertificate).toHaveBeenCalledWith(user.id_users_pk, courseId);
      expect(result).toEqual(expectedCertificate);
    })

})