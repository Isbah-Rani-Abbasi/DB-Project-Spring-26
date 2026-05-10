Database Project Report
Course Registration Portal & Management System
1. Abstract
The modern educational ecosystem requires robust, scalable, and automated systems to manage student data, academic records, and financial transactions. This project aims to develop a comprehensive University Student Portal. The system is designed to automate course registrations, enforce academic constraints (such as prerequisites and credit hour limits), and manage the fee billing process. By integrating a React-based frontend with a Supabase (PostgreSQL) backend, the application ensures real-time data synchronization, strict data integrity through relational constraints, and a seamless user experience.
2. Project Objectives
?Centralized Database Management: To design a 3rd Normal Form (3NF) compliant relational database to eliminate data redundancy.
?Automated Course Registration: To allow students to browse active semester offerings and enroll in courses dynamically.
?Academic Rule Enforcement: To programmatically restrict students from registering for courses if they have not passed the prerequisite subjects or if they exceed the maximum allowed credit hours (e.g., 18 credits).
?Financial Integration: To generate automated fee vouchers at the start of a semester and block course registration for students with unpaid or overdue financial dues.
?Seamless User Experience: To build an intuitive, fast, and responsive user interface using modern web technologies.
3. Technology Stack
?Frontend Development: React.js powered by Vite (for fast build times and optimized performance). 
?Backend & Database: Supabase (Cloud PostgreSQL). Supabase was chosen for its robust relational database capabilities, real-time subscriptions, and built-in API routing.
?Query Language: Standard SQL for schema definitions, triggers, and complex data retrieval.
?Version Control & Environment: Git (with .gitignore configured) and Node.js environment.


4. System Architecture & Core Modules
4.1. Authentication & Role Management
The system utilizes securely hashed credentials to authenticate users. Based on their roles, users are directed to the appropriate dashboard. Row Level Security (RLS) policies are planned for deployment to ensure that students can only access their personal academic and financial records.
4.2. Academic Module
?Course Catalog & Offerings: The system distinguishes between the master course catalog (courses) and the active subjects being taught in a specific term (course_offerings).
?Registration System: Students can add courses to their current semester. The system checks against seat capacities (e.g., max 50 students per offering) to prevent over-enrollment.
?Grading History: The database securely logs previous attempts, tracking whether a course was 'Passed', 'Failed', or is currently 'Enrolled'.
4.3. Financial & Billing Module
?Fee Vouchers: At the beginning of each active semester, fee challans are generated automatically based on fixed semester fees or calculated via credit hours.
?Payment Tracking: Receipts are logged into a separate payments table.
?Registration Block Constraint: A key feature of the portal is its conditional logic: the frontend queries the database for pending dues. If a student's fee_vouchers status is 'Unpaid', the registration module is automatically locked until clearance.
5. Database Schema & Design
The database was carefully architected following normalization principles to ensure data consistency. The core tables include:
1.students: Stores basic user profiles, enrollment years, and credit limits.
2.courses: The master inventory of subjects and their respective credit hours.
3.semesters & course_offerings: Manages the timeline and availability of courses per term.
4.registrations: A junction table linking students to course offerings, tracking enrollment status and final grades.
5.fee_vouchers & payments: Financial tables that handle billing cycles, due dates, and payment histories.
(Note: The complete Entity-Relationship Diagram and SQL schema queries are attached in the project appendix).
6. Challenges & Solutions
?Handling Complex Constraints: Implementing prerequisite checks required complex SQL queries to verify past 'Passed' statuses before allowing new insertions. This was resolved by implementing robust frontend querying logic that validates conditions before sending the INSERT command.
?Frontend-Backend Synchronization: Ensuring the frontend correctly interpreted database schemas without generating "dummy" data. This was mitigated by strictly providing the existing Supabase REST API endpoints and Publishable Keys to the frontend environment, ensuring it read directly from the live schema.
7.Project Timeline and Development Phases
The development of the University Management Portal was divided into five structured phases to ensure smooth execution, from database architecture to frontend integration.
Phase 1: Requirement Gathering & System Analysis (Week 1 - 2)
?Analyzed the core requirements of the university system.
?Defined user roles and access levels (Admin, Teacher, Student).
?Finalized the business logic and constraints, such as course prerequisites, credit hour limits, maximum seating capacities, and automated fee calculations.
Phase 2: Database Architecture & Backend Setup (Week 3 - 4)
?Designed the Entity-Relationship Diagram (ERD) to map out data flow.
?Set up the backend using Supabase (PostgreSQL).
?Created essential tables: students, courses, course_offerings, registrations, fee_vouchers, and payments.
?Implemented strict database constraints (Foreign Keys, Primary Keys) and generated initial CSV seed data for testing.
?Configured Supabase Authentication for secure login and role-based access.
Phase 3: Frontend Setup & UI/UX Design (Week 5 - 6)
?Initialized the frontend web application using React.js and Vite.
?Designed a clean, minimalist, and responsive user interface using Tailwind CSS.
?Developed the layout architecture, including the global sidebar toggle menu and portal-specific dashboards.
?Built the Authentication flows (Login/Sign-up) and the mandatory profile completion forms.
Phase 4: Core Development & System Integration (Week 7 - 8)
?Connected the React frontend with the Supabase backend using API endpoints.
?Student Portal: Implemented the course registration logic (filtering courses by semester, checking prerequisites, blocking enrollment if fees are unpaid).
?Admin Portal: Developed CRUD (Create, Read, Update, Delete) interfaces for the course catalog and teacher assignments.
?Teacher Portal: Built the data grid to display assigned courses and enrolled students.
?Automated the fee voucher generation upon successful course enrollment.
Phase 5: Testing, Debugging & Deployment (Week 9 - 10)
?Conducted End-to-End (E2E) testing to ensure database constraints (like seat limits and credit limits) correctly trigger errors on the frontend.
?Resolved UI/UX bugs and improved system loading times.
?Organized the codebase, exported the .sql schema and dummy data.
?Pushed the final project code and documentation securely to GitHub for version control and submission.
8. Conclusion
The University Student Portal successfully bridges the gap between academic administration and financial tracking. By leveraging modern tools like Supabase and React, the project delivers a scalable, highly constrained, and intelligent system capable of handling complex university rules automatically.