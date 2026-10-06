// Único lugar que "monta" os services com as dependências REAIS (models com Prisma, gateway de e-mail).
// Os services em si nunca importam o banco, por isso são fáceis de testar com mocks.

import * as userModel from './models/userModel.js';
import * as courseModel from './models/courseModel.js';
import * as classModel from './models/classModel.js';
import * as enrollmentModel from './models/enrollmentModel.js';
import * as gradeModel from './models/gradeModel.js';
import * as certificateModel from './models/certificateModel.js';
import * as emailGateway from './gateways/emailGateway.js';

import { AuthService } from './services/AuthService.js';
import { CourseService } from './services/CourseService.js';
import { ClassService } from './services/ClassService.js';
import { EnrollmentService } from './services/EnrollmentService.js';
import { GradeService } from './services/GradeService.js';
import { CertificateService } from './services/CertificateService.js';

export const authService = new AuthService({ userModel });
export const courseService = new CourseService({ courseModel });
export const classService = new ClassService({ classModel, courseModel, enrollmentModel });
export const enrollmentService = new EnrollmentService({
  enrollmentModel, classModel, courseModel, userModel, emailGateway
});
export const gradeService = new GradeService({ gradeModel, enrollmentModel });
export const certificateService = new CertificateService({
  certificateModel, enrollmentModel, gradeService, emailGateway
});
