-- CreateTable
CREATE TABLE `users` (
    `id_users_pk` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id_users_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id_courses_pk` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `workload_hours` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `title`(`title`),
    PRIMARY KEY (`id_courses_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_prerequisites` (
    `id_course_prerequisites_pk` INTEGER NOT NULL AUTO_INCREMENT,
    `courses_id_fk` INTEGER NOT NULL,
    `required_courses_id_fk` INTEGER NOT NULL,

    INDEX `required_courses_id_fk`(`required_courses_id_fk`),
    UNIQUE INDEX `unique_course_prerequisite`(`courses_id_fk`, `required_courses_id_fk`),
    PRIMARY KEY (`id_course_prerequisites_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classes` (
    `id_classes_pk` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `max_students` INTEGER NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    `start_date` DATETIME(0) NOT NULL,
    `end_date` DATETIME(0) NOT NULL,
    `courses_id_fk` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `courses_id_fk`(`courses_id_fk`),
    PRIMARY KEY (`id_classes_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enrollments` (
    `id_enrollments_pk` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `locked_at` DATETIME(0) NULL,
    `final_grade` DOUBLE NULL,
    `users_id_fk` INTEGER NOT NULL,
    `classes_id_fk` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `classes_id_fk`(`classes_id_fk`),
    UNIQUE INDEX `unique_user_class`(`users_id_fk`, `classes_id_fk`),
    PRIMARY KEY (`id_enrollments_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grades` (
    `id_grades_pk` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `value` DOUBLE NOT NULL,
    `weight` DOUBLE NOT NULL,
    `enrollments_id_fk` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `unique_enrollment_grade_title`(`enrollments_id_fk`, `title`),
    PRIMARY KEY (`id_grades_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certificates` (
    `id_certificates_pk` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `average` DOUBLE NOT NULL,
    `issued_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `enrollments_id_fk` INTEGER NOT NULL,

    UNIQUE INDEX `code`(`code`),
    UNIQUE INDEX `enrollments_id_fk`(`enrollments_id_fk`),
    PRIMARY KEY (`id_certificates_pk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_prerequisites` ADD CONSTRAINT `course_prerequisites_ibfk_1` FOREIGN KEY (`courses_id_fk`) REFERENCES `courses`(`id_courses_pk`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `course_prerequisites` ADD CONSTRAINT `course_prerequisites_ibfk_2` FOREIGN KEY (`required_courses_id_fk`) REFERENCES `courses`(`id_courses_pk`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `classes` ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`courses_id_fk`) REFERENCES `courses`(`id_courses_pk`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`users_id_fk`) REFERENCES `users`(`id_users_pk`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`classes_id_fk`) REFERENCES `classes`(`id_classes_pk`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `grades` ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`enrollments_id_fk`) REFERENCES `enrollments`(`id_enrollments_pk`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`enrollments_id_fk`) REFERENCES `enrollments`(`id_enrollments_pk`) ON DELETE CASCADE ON UPDATE RESTRICT;
