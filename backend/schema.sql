-- CREATE DATABASE
CREATE DATABASE IF NOT EXISTS `career_ai` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `career_ai`;

-- 1. Table: user
CREATE TABLE IF NOT EXISTS `user` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('user', 'admin') DEFAULT 'user',
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `last_login` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: profile
CREATE TABLE IF NOT EXISTS `profile` (
    `profile_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `full_name` VARCHAR(150) DEFAULT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `bio` TEXT DEFAULT NULL,
    `avatar_url` VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: user_session
CREATE TABLE IF NOT EXISTS `user_session` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `device_info` VARCHAR(255) DEFAULT NULL,
    `location` VARCHAR(100) DEFAULT 'Hà Nội, VN',
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `is_current` BOOLEAN DEFAULT 1,
    `last_active` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: otp_verification
CREATE TABLE IF NOT EXISTS `otp_verification` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(150) NOT NULL,
    `otp_code` VARCHAR(6) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at` DATETIME NOT NULL,
    `is_used` BOOLEAN NOT NULL DEFAULT 0,
    `type` ENUM('register', 'forgot_password') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table: cv
CREATE TABLE IF NOT EXISTS `cv` (
    `cv_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `file_path` VARCHAR(255) NOT NULL,
    `file_type` VARCHAR(100) NOT NULL,
    `ats_score` INT DEFAULT 0,
    `analysis_result` JSON DEFAULT NULL,
    `improvement_suggestions` JSON DEFAULT NULL,
    `status` VARCHAR(50) DEFAULT 'analyzed',
    `upload_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table: career
CREATE TABLE IF NOT EXISTS `career` (
    `career_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `job_title` VARCHAR(150) NOT NULL,
    `match_percentage` INT DEFAULT 0,
    `job_description` TEXT DEFAULT NULL,
    `source` VARCHAR(50) DEFAULT 'ai',
    `salary` VARCHAR(100) DEFAULT NULL,
    `skills` JSON DEFAULT NULL,
    `potential` DECIMAL(3,1) DEFAULT 0.0,
    `trend_analysis` TEXT DEFAULT NULL,
    `generated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table: roadmap
CREATE TABLE IF NOT EXISTS `roadmap` (
    `roadmap_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `gap_id` INT DEFAULT NULL,
    `title` VARCHAR(150) NOT NULL,
    `total_months` INT DEFAULT 3,
    `completion_rate` INT DEFAULT 0,
    `status` ENUM('not_started', 'in_progress', 'completed') DEFAULT 'in_progress',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Table: skill
CREATE TABLE IF NOT EXISTS `skill` (
    `skill_id` INT AUTO_INCREMENT PRIMARY KEY,
    `skill_name` VARCHAR(100) NOT NULL UNIQUE,
    `category` VARCHAR(100) DEFAULT 'Other'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Table: goal
CREATE TABLE IF NOT EXISTS `goal` (
    `goal_id` INT AUTO_INCREMENT PRIMARY KEY,
    `roadmap_id` INT NOT NULL,
    `skill_id` INT NOT NULL,
    `target_month` INT NOT NULL,
    `suggested_courses` JSON DEFAULT NULL,
    `status` ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    `progress_percentage` INT DEFAULT 0,
    `started_at` DATETIME DEFAULT NULL,
    `completed_at` DATETIME DEFAULT NULL,
    FOREIGN KEY (`roadmap_id`) REFERENCES `roadmap` (`roadmap_id`) ON DELETE CASCADE,
    FOREIGN KEY (`skill_id`) REFERENCES `skill` (`skill_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Table: userskill
CREATE TABLE IF NOT EXISTS `userskill` (
    `user_id` INT NOT NULL,
    `skill_id` INT NOT NULL,
    `proficiency_level` VARCHAR(50) DEFAULT 'Intermediate',
    PRIMARY KEY (`user_id`, `skill_id`),
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`skill_id`) REFERENCES `skill` (`skill_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Table: portfolio
CREATE TABLE IF NOT EXISTS `portfolio` (
    `portfolio_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `slug` VARCHAR(150) NOT NULL UNIQUE,
    `title` VARCHAR(150) NOT NULL,
    `is_published` BOOLEAN DEFAULT 0,
    `view_count` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Table: experience
CREATE TABLE IF NOT EXISTS `experience` (
    `experience_id` INT AUTO_INCREMENT PRIMARY KEY,
    `profile_id` INT NOT NULL,
    `company` VARCHAR(150) NOT NULL,
    `position` VARCHAR(150) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE DEFAULT NULL,
    FOREIGN KEY (`profile_id`) REFERENCES `profile` (`profile_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Table: certificate
CREATE TABLE IF NOT EXISTS `certificate` (
    `certificate_id` INT AUTO_INCREMENT PRIMARY KEY,
    `profile_id` INT NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `organization` VARCHAR(150) NOT NULL,
    `issue_date` DATE DEFAULT NULL,
    FOREIGN KEY (`profile_id`) REFERENCES `profile` (`profile_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Table: education
CREATE TABLE IF NOT EXISTS `education` (
    `education_id` INT AUTO_INCREMENT PRIMARY KEY,
    `profile_id` INT NOT NULL,
    `school_name` VARCHAR(150) NOT NULL,
    `degree` VARCHAR(100) DEFAULT NULL,
    `major` VARCHAR(150) DEFAULT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE DEFAULT NULL,
    FOREIGN KEY (`profile_id`) REFERENCES `profile` (`profile_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
-- SEED DATA FOR DEFAULT USER (ID: 19)
-- ─────────────────────────────────────────────────────────────

-- Seed Default User
INSERT INTO `user` (`user_id`, `email`, `password_hash`, `role`, `status`, `last_login`)
VALUES (19, 'test@careerai.vn', '123456', 'user', 'active', NOW())
ON DUPLICATE KEY UPDATE `email` = `email`;

-- Seed Profile for User 19
INSERT INTO `profile` (`user_id`, `full_name`, `phone`, `bio`, `avatar_url`)
VALUES (19, 'Nguyễn Văn Minh', '0987654321', 'Software Engineer||Đam mê phát triển ứng dụng ReactJS, NodeJS và tích hợp các giải pháp AI vào đời sống.', NULL)
ON DUPLICATE KEY UPDATE `full_name` = `full_name`;

-- Seed Skills
INSERT INTO `skill` (`skill_id`, `skill_name`, `category`) VALUES
(1, 'React', 'Frontend'),
(2, 'JavaScript', 'Languages'),
(3, 'HTML5 & CSS3', 'Frontend'),
(4, 'Node.js', 'Backend'),
(5, 'Python', 'Languages'),
(6, 'SQL', 'Databases'),
(7, 'Git', 'Tools')
ON DUPLICATE KEY UPDATE `skill_name` = `skill_name`;

-- Seed User Skills for User 19
INSERT INTO `userskill` (`user_id`, `skill_id`, `proficiency_level`) VALUES
(19, 1, 'Advanced'),
(19, 2, 'Advanced'),
(19, 3, 'Advanced'),
(19, 4, 'Intermediate'),
(19, 5, 'Intermediate'),
(19, 6, 'Intermediate'),
(19, 7, 'Advanced')
ON DUPLICATE KEY UPDATE `proficiency_level` = `proficiency_level`;

-- Seed Experience (Projects)
INSERT INTO `experience` (`experience_id`, `profile_id`, `company`, `position`, `description`, `start_date`, `end_date`)
VALUES
(1, 1, 'Công ty Công nghệ ABC', 'Frontend Developer Intern', 'Phát triển các component ReactJS cho trang quản trị hệ thống, tối ưu hóa tốc độ tải trang tăng 20%. Hợp tác chặt chẽ với đội thiết kế UI/UX.', '2025-06-01', '2025-09-30'),
(2, 1, 'Dự án Cá nhân', 'Full-stack Developer', 'Xây dựng website quản lý công việc cá nhân tích hợp lịch nhắc nhở. Sử dụng ReactJS cho frontend và NodeJS/Express cho backend.', '2025-10-01', '2026-01-15')
ON DUPLICATE KEY UPDATE `company` = `company`;

-- Seed Certificate
INSERT INTO `certificate` (`certificate_id`, `profile_id`, `name`, `organization`, `issue_date`)
VALUES
(1, 1, 'Responsive Web Design', 'freeCodeCamp', '2024-08-15'),
(2, 1, 'EF SET English Certificate (C1 Advanced)', 'EF Education First', '2025-02-20')
ON DUPLICATE KEY UPDATE `name` = `name`;

-- Seed Education
INSERT INTO `education` (`education_id`, `profile_id`, `school_name`, `degree`, `major`, `start_date`, `end_date`)
VALUES
(1, 1, 'Trường Đại học Công nghệ thông tin', 'Cử nhân', 'Kỹ thuật Phần mềm', '2022-09-05', '2026-06-30')
ON DUPLICATE KEY UPDATE `school_name` = `school_name`;

-- Seed Portfolio
INSERT INTO `portfolio` (`portfolio_id`, `user_id`, `slug`, `title`, `is_published`, `view_count`)
VALUES (1, 19, 'nguyenvanminh', 'Portfolio của Nguyễn Văn Minh', 1, 150)
ON DUPLICATE KEY UPDATE `slug` = `slug`;
