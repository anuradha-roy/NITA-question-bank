USE devDB;

-- Uncomment the following lines before docker compose to resetup the database

-- DROP TABLE IF EXISTS `department`;
-- DROP TABLE IF EXISTS `course`;
-- DROP TABLE IF EXISTS `question_paper`;

-- Create department table
CREATE TABLE `department` (
  `id` varchar(255) PRIMARY KEY,
  `name` varchar(255)
);

-- Create course table
CREATE TABLE `course` (
  `code` varchar(10) PRIMARY KEY,
  `course_title` varchar(255),
  `department_id` varchar(255)
  -- FOREIGN KEY (`department_id`) REFERENCES `department` (`id`)
);


-- Create question_paper table with DELETE on CASCADE
CREATE TABLE `question_paper` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `url` text,
  `year` varchar(4),
  `semester` varchar(10),
  `exam_type` varchar(10),
  `course_code` varchar(255)
  -- FOREIGN KEY (`course_code`) REFERENCES `course` (`code`)
);


