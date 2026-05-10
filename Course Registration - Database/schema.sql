
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Active',
    role_id INT REFERENCES roles(role_id)
);

CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE programs (
    program_id SERIAL PRIMARY KEY,
    program_name VARCHAR(100) NOT NULL,
    department_id INT REFERENCES departments(department_id),
    duration_years INT NOT NULL
);

CREATE TABLE students (
    student_id INT PRIMARY KEY REFERENCES users(user_id),
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    program_id INT REFERENCES programs(program_id),
    current_semester INT DEFAULT 1,
    enrollment_year INT NOT NULL
);

CREATE TABLE faculty (
    faculty_id INT PRIMARY KEY REFERENCES users(user_id),
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    department_id INT REFERENCES departments(department_id),
    designation VARCHAR(50)
);

CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_title VARCHAR(150) NOT NULL,
    credit_hours INT NOT NULL,
    department_id INT REFERENCES departments(department_id)
);

CREATE TABLE prerequisites (
    course_id INT REFERENCES courses(course_id),
    prerequisite_course_id INT REFERENCES courses(course_id),
    PRIMARY KEY (course_id, prerequisite_course_id)
);

CREATE TABLE semesters (
    semester_id SERIAL PRIMARY KEY,
    term VARCHAR(20) NOT NULL, -- e.g., Fall, Spring
    year INT NOT NULL,
    start_date DATE,
    end_date DATE
);

CREATE TABLE course_offerings (
    offering_id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(course_id),
    faculty_id INT REFERENCES faculty(faculty_id),
    semester_id INT REFERENCES semesters(semester_id),
    section VARCHAR(10) NOT NULL,
    capacity INT DEFAULT 50,
    schedule_info VARCHAR(100)
);

CREATE TABLE registrations (
    registration_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id),
    offering_id INT REFERENCES course_offerings(offering_id),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Enrolled', -- Enrolled, Dropped, Waitlisted
    grade VARCHAR(5)
);

CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    voucher_id INT REFERENCES fee_vouchers(voucher_id) ON DELETE CASCADE,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) -- Maslan: 'Bank Deposit', 'Credit Card', 'Online Transfer'
);

INSERT INTO roles (role_id, role_name) VALUES 
(1, 'Admin'), 
(2, 'Faculty'), 
(3, 'Student');

INSERT INTO departments (department_id, department_name) VALUES 
(1, 'Computer Science'), 
(2, 'Software Engineering'), 
(3, 'Cyber Security'), 
(4, 'FinTech'), 
(5, 'Electrical Engineering');

INSERT INTO programs (program_id, program_name, department_id, duration_years) VALUES 
(1, 'BSCS', 1, 4), 
(2, 'BSSE', 2, 4), 
(3, 'BSCY', 3, 4), 
(4, 'BSFT', 4, 4), 
(5, 'BSEE', 5, 4);

INSERT INTO courses (course_code, course_title, credit_hours, department_id) VALUES

('NS1001', 'Applied Physics', 3, 1),
('MT1003', 'Calculus and Analytical Geometry', 3, 1),
('SS1012', 'Functional English', 2, 1),
('SL1012', 'Functional English - Lab', 1, 1),
('SS1013', 'Ideology and Constitution of Pakistan', 2, 1),
('CL1000', 'Introduction to Info and Comm Technology', 1, 1),
('CS1002', 'Programming Fundamentals', 3, 1),
('CL1002', 'Programming Fundamentals - Lab', 1, 1),
('SS1018', 'Understanding Holy Quran', 1, 1),

('SS2043', 'Civics and Community Engagement', 2, 1),
('EE1005', 'Digital Logic Design', 3, 5), 
('EL1005', 'Digital Logic Design - Lab', 1, 5), 
('SS1014', 'Expository Writing', 2, 1),
('SL1014', 'Expository Writing - Lab', 1, 1),
('SS1007', 'Islamic Studies/Ethics', 2, 1),
('MT1008', 'Multivariable Calculus', 3, 1),
('CS1004', 'Object Oriented Programming', 3, 1),
('CL1004', 'Object Oriented Programming - Lab', 1, 1),
('SS1019', 'Understanding Sirat-Un-Nabi (PBUH)', 1, 1);


ALTER TABLE course_offerings DROP COLUMN IF EXISTS section;

ALTER TABLE course_offerings ALTER COLUMN faculty_id DROP NOT NULL;

INSERT INTO semesters (term,year, start_date, end_date) VALUES
('Fall',2024, '2024-08-15', '2024-12-25'), =
('Spring',2025, '2025-01-15', '2025-05-30'),
('Summer',2025, '2025-06-01', '2025-07-30'), 
('Fall', 2025, '2025-08-15', '2025-12-25'), 
('Spring',2026, '2026-01-15', '2026-05-30'); 


INSERT INTO course_offerings (course_id, semester_id) VALUES
(1, 1), 
(2, 1), 
(3, 1), 
(4, 1), 
(5, 1), 
(6, 1), 
(7, 1), 
(8, 1), 
(9, 1); 

INSERT INTO course_offerings (course_id, semester_id) VALUES
(10, 2), 
(11, 2), 
(12, 2), 
(13, 2), 
(14, 2), 
(15, 2), 
(16, 2), 
(17, 2), 
(18, 2), 
(19, 2); 

SELECT 
    c.course_title,
    CASE 
        WHEN p.prerequisite_course_id IS NULL THEN 'Eligible'
        
        WHEN EXISTS (
            SELECT 1 FROM registrations r 
            WHERE r.student_id = 36  -- Current Student
            AND r.course_id = p.prerequisite_course_id 
            AND r.status = 'Passed'
        ) THEN 'Eligible'
        
        ELSE 'Not Eligible'
    END AS eligibility_status
FROM courses c
LEFT JOIN prerequisites p ON c.course_id = p.course_id
WHERE c.course_id = 17; 


TRUNCATE TABLE registrations RESTART IDENTITY CASCADE;

INSERT INTO registrations (student_id, offering_id, registration_date, status, grade)
SELECT 
    s.student_id, 
    o.offering_id, 
    NOW() - INTERVAL '6 months',
    'Passed', 
    'B' 
FROM students s
JOIN course_offerings o ON o.semester_id = 1
WHERE s.enrollment_year = 2025;


UPDATE registrations 
SET status = 'Failed', grade = 'F'
WHERE student_id IN (
    SELECT student_id FROM students 
    WHERE enrollment_year = 2025 
    ORDER BY student_id ASC 
    LIMIT 10
)
AND offering_id = (
    SELECT offering_id FROM course_offerings WHERE course_id = 7 AND semester_id = 1 LIMIT 1
);

UPDATE registrations 
SET status = 'Failed', grade = 'F'
WHERE student_id IN (
    SELECT student_id FROM students 
    WHERE enrollment_year = 2025 
    ORDER BY student_id ASC 
    OFFSET 10 LIMIT 8
)
AND offering_id = (
    SELECT offering_id FROM course_offerings WHERE course_id = 2 AND semester_id = 1 LIMIT 1
);

UPDATE registrations 
SET status = 'Failed', grade = 'F'
WHERE student_id IN (
    SELECT student_id FROM students 
    WHERE enrollment_year = 2025 
    ORDER BY student_id ASC 
    OFFSET 18 LIMIT 5
)
AND offering_id = (
    SELECT offering_id FROM course_offerings WHERE course_id = 1 AND semester_id = 1 LIMIT 1
);

INSERT INTO course_offerings (course_id, semester_id)
VALUES 
(7, 2), 
(2, 2),
(1, 2); 

SELECT COUNT(*) FROM fee_vouchers 
WHERE student_id = Current_Student_ID 
AND status != 'Paid';

