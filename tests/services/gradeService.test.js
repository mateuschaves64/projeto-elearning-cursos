import { GradeService } from '../../src/services/GradeService.js';
import { BusinessRuleError, NotFoundError } from '../../src/errors/AppError.js';
import { criarEnrollment, criarTurma } from '../factories/enrollmentFactory.js';

describe('GradeService', () => {
  let gradeService;
  let mockGradeModel;
  let mockEnrollmentModel;
  let customClock;

  beforeEach(() => {
    mockGradeModel = {
      getGradesByEnrollment: jest.fn(),
      calculateAverage: jest.fn(),
    };

    mockEnrollmentModel = {
      getEnrollmentById: jest.fn(),
      updateEnrollment: jest.fn(),
    };

    customClock = jest.fn(() => new Date('2026-03-01T10:00:00Z'));

    gradeService = new GradeService({
      gradeModel: mockGradeModel,
      enrollmentModel: mockEnrollmentModel,
      clock: customClock,
    });
  });

  describe('lockSubject', () => {
    it('deve lançar BusinessRuleError se o prazo limite de trancamento for excedido', async () => {
      const turma = criarTurma({
        start_date: new Date('2026-01-01T00:00:00Z'),
        end_date: new Date('2026-02-01T00:00:00Z'),
      });
      const enrollment = criarEnrollment({ status: 'ACTIVE', users_id_fk: 1, classes: turma });

      mockEnrollmentModel.getEnrollmentById.mockResolvedValue(enrollment);

      await expect(
        gradeService.lockSubject(1, enrollment.id_enrollments_pk)
      ).rejects.toThrow(BusinessRuleError);
    });

    it('deve trancar a matéria com sucesso quando a solicitação estiver dentro do prazo', async () => {
      const turma = criarTurma({
        start_date: new Date('2026-03-01T00:00:00Z'),
        end_date: new Date('2026-06-01T00:00:00Z'),
      });
      const enrollment = criarEnrollment({ status: 'ACTIVE', users_id_fk: 1, classes: turma });

      mockEnrollmentModel.getEnrollmentById.mockResolvedValue(enrollment);
      mockEnrollmentModel.updateEnrollment.mockResolvedValue({
        ...enrollment,
        status: 'LOCKED',
      });

      const result = await gradeService.lockSubject(1, enrollment.id_enrollments_pk);

      expect(result.status).toBe('LOCKED');
      expect(mockEnrollmentModel.updateEnrollment).toHaveBeenCalled();
    });
  });
});