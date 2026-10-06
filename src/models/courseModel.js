// Lógica de banco para Cursos/Disciplinas e seus pré-requisitos.

import prisma from '../../db.js';

// Traz os pré-requisitos junto (já com o título do curso exigido)
const includePrerequisites = {
  prerequisites: {
    include: {
      required_course: { select: { id_courses_pk: true, title: true } }
    }
  }
};

export const getAllCourses = async () => {
  return await prisma.courses.findMany({
    include: includePrerequisites,
    orderBy: { title: 'asc' }
  });
};

export const getCourseById = async (id) => {
  return await prisma.courses.findUnique({
    where: { id_courses_pk: Number(id) },
    include: includePrerequisites
  });
};

export const getCourseByTitle = async (title) => {
  return await prisma.courses.findUnique({
    where: { title }
  });
};

export const createCourse = async (data) => {
  return await prisma.courses.create({ data });
};

export const updateCourse = async (id, data) => {
  return await prisma.courses.update({
    where: { id_courses_pk: Number(id) },
    data
  });
};

// ---------- Pré-requisitos ----------

// Retorna uma lista simples: [{ id_courses_pk, title }, ...] dos cursos exigidos
export const getPrerequisitesByCourseId = async (courseId) => {
  const links = await prisma.course_prerequisites.findMany({
    where: { courses_id_fk: Number(courseId) },
    include: {
      required_course: { select: { id_courses_pk: true, title: true } }
    }
  });

  return links.map((link) => link.required_course);
};

// Retorna TODAS as ligações do sistema: [{ courses_id_fk, required_courses_id_fk }, ...]
// (usado para detectar pré-requisito circular)
export const getAllPrerequisiteLinks = async () => {
  return await prisma.course_prerequisites.findMany({
    select: { courses_id_fk: true, required_courses_id_fk: true }
  });
};

export const getPrerequisiteLink = async (courseId, requiredCourseId) => {
  return await prisma.course_prerequisites.findFirst({
    where: {
      courses_id_fk: Number(courseId),
      required_courses_id_fk: Number(requiredCourseId)
    }
  });
};

export const addPrerequisite = async (courseId, requiredCourseId) => {
  return await prisma.course_prerequisites.create({
    data: {
      courses_id_fk: Number(courseId),
      required_courses_id_fk: Number(requiredCourseId)
    }
  });
};

export const removePrerequisite = async (courseId, requiredCourseId) => {
  return await prisma.course_prerequisites.deleteMany({
    where: {
      courses_id_fk: Number(courseId),
      required_courses_id_fk: Number(requiredCourseId)
    }
  });
};
