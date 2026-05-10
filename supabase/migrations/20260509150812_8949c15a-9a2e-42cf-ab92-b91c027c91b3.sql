-- Link Supabase auth to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE;
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;

-- Sequences first
CREATE SEQUENCE IF NOT EXISTS public.students_student_id_seq;
SELECT setval('public.students_student_id_seq', COALESCE((SELECT MAX(student_id) FROM public.students), 0) + 1, false);
ALTER TABLE public.students ALTER COLUMN student_id SET DEFAULT nextval('public.students_student_id_seq');
ALTER SEQUENCE public.students_student_id_seq OWNED BY public.students.student_id;

CREATE SEQUENCE IF NOT EXISTS public.faculty_faculty_id_seq;
SELECT setval('public.faculty_faculty_id_seq', COALESCE((SELECT MAX(faculty_id) FROM public.faculty), 0) + 1, false);
ALTER TABLE public.faculty ALTER COLUMN faculty_id SET DEFAULT nextval('public.faculty_faculty_id_seq');
ALTER SEQUENCE public.faculty_faculty_id_seq OWNED BY public.faculty.faculty_id;

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS max_credits integer NOT NULL DEFAULT 18;

-- Seed roles
INSERT INTO public.roles (role_id, role_name) VALUES (1, 'Admin') ON CONFLICT (role_id) DO NOTHING;
INSERT INTO public.roles (role_id, role_name) VALUES (2, 'Teacher') ON CONFLICT (role_id) DO NOTHING;
INSERT INTO public.roles (role_id, role_name) VALUES (3, 'Student') ON CONFLICT (role_id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('public.roles','role_id'), GREATEST((SELECT MAX(role_id) FROM public.roles), 1));

-- Helpers
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT user_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_role_id()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1
$$;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "users self read" ON public.users FOR SELECT TO authenticated
USING (auth_user_id = auth.uid() OR public.current_role_id() = 1);
CREATE POLICY "users self insert" ON public.users FOR INSERT TO authenticated
WITH CHECK (auth_user_id = auth.uid());
CREATE POLICY "users self update" ON public.users FOR UPDATE TO authenticated
USING (auth_user_id = auth.uid() OR public.current_role_id() = 1);

-- STUDENTS
CREATE POLICY "students self read" ON public.students FOR SELECT TO authenticated
USING (student_id = public.current_app_user_id() OR public.current_role_id() IN (1,2));
CREATE POLICY "students self insert" ON public.students FOR INSERT TO authenticated
WITH CHECK (student_id = public.current_app_user_id());
CREATE POLICY "students self update" ON public.students FOR UPDATE TO authenticated
USING (student_id = public.current_app_user_id() OR public.current_role_id() = 1);

-- FACULTY
CREATE POLICY "faculty read" ON public.faculty FOR SELECT TO authenticated USING (true);
CREATE POLICY "faculty self insert" ON public.faculty FOR INSERT TO authenticated
WITH CHECK (faculty_id = public.current_app_user_id());
CREATE POLICY "faculty update" ON public.faculty FOR UPDATE TO authenticated
USING (faculty_id = public.current_app_user_id() OR public.current_role_id() = 1);

-- Reference reads
CREATE POLICY "roles read" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "departments read" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "programs read" ON public.programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "semesters read" ON public.semesters FOR SELECT TO authenticated USING (true);
CREATE POLICY "prerequisites read" ON public.prerequisites FOR SELECT TO authenticated USING (true);

-- COURSES
CREATE POLICY "courses read" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "courses admin write" ON public.courses FOR ALL TO authenticated
USING (public.current_role_id() = 1) WITH CHECK (public.current_role_id() = 1);

-- OFFERINGS
CREATE POLICY "offerings read" ON public.course_offerings FOR SELECT TO authenticated USING (true);
CREATE POLICY "offerings admin write" ON public.course_offerings FOR ALL TO authenticated
USING (public.current_role_id() = 1) WITH CHECK (public.current_role_id() = 1);

-- REGISTRATIONS
CREATE POLICY "registrations read" ON public.registrations FOR SELECT TO authenticated
USING (student_id = public.current_app_user_id() OR public.current_role_id() IN (1,2));
CREATE POLICY "registrations insert" ON public.registrations FOR INSERT TO authenticated
WITH CHECK (student_id = public.current_app_user_id());
CREATE POLICY "registrations update" ON public.registrations FOR UPDATE TO authenticated
USING (public.current_role_id() IN (1,2));
CREATE POLICY "registrations delete" ON public.registrations FOR DELETE TO authenticated
USING (student_id = public.current_app_user_id() OR public.current_role_id() = 1);

-- FEE VOUCHERS
CREATE POLICY "vouchers read" ON public.fee_vouchers FOR SELECT TO authenticated
USING (student_id = public.current_app_user_id() OR public.current_role_id() = 1);
CREATE POLICY "vouchers insert" ON public.fee_vouchers FOR INSERT TO authenticated
WITH CHECK (student_id = public.current_app_user_id());
CREATE POLICY "vouchers update" ON public.fee_vouchers FOR UPDATE TO authenticated
USING (student_id = public.current_app_user_id() OR public.current_role_id() = 1);

-- PAYMENTS
CREATE POLICY "payments read" ON public.payments FOR SELECT TO authenticated
USING (public.current_role_id() = 1 OR EXISTS (
  SELECT 1 FROM public.fee_vouchers v WHERE v.voucher_id = payments.voucher_id AND v.student_id = public.current_app_user_id()
));
CREATE POLICY "payments insert" ON public.payments FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.fee_vouchers v WHERE v.voucher_id = payments.voucher_id AND v.student_id = public.current_app_user_id()
));