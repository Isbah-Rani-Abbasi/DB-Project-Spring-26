import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";



export type AppUser = {

  user_id: number;

  first_name: string;

  last_name: string;

  email: string;

  role_id: number | null;

};



export type StudentRecord = {

  student_id: number;

  roll_number: string;

  current_semester: number | null;

  enrollment_year: number;

  max_credits: number;

  program_id: number | null;

};



type AuthCtx = {

  session: Session | null;

  appUser: AppUser | null;

  student: StudentRecord | null;

  loading: boolean;

  refresh: () => Promise<void>;

  signOut: () => Promise<void>;

};



const Ctx = createContext<AuthCtx | undefined>(undefined);



export function AuthProvider({ children }: { children: ReactNode }) {

  const [session, setSession] = useState<Session | null>(null);

  const [appUser, setAppUser] = useState<AppUser | null>(null);

  const [student, setStudent] = useState<StudentRecord | null>(null);

  const [loading, setLoading] = useState(true);



  const loadProfile = useCallback(async (s: Session | null) => {

    if (!s) {

      setAppUser(null);

      setStudent(null);

      return;

    }

    const { data: u } = await supabase

      .from("users")

      .select("user_id, first_name, last_name, email, role_id")

      .eq("auth_user_id", s.user.id)

      .maybeSingle();

    setAppUser(u ?? null);

    if (u && u.role_id === 3) {

      const { data: st } = await supabase

        .from("students")

        .select("student_id, roll_number, current_semester, enrollment_year, max_credits, program_id")

        .eq("student_id", u.user_id)

        .maybeSingle();

      setStudent(st ?? null);

    } else {

      setStudent(null);

    }

  }, []);



  const refresh = useCallback(async () => {

    const { data } = await supabase.auth.getSession();

    await loadProfile(data.session);

  }, [loadProfile]);



  useEffect(() => {

    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {

      if (!mounted) return;

      setSession(s);

      // Defer DB calls

      setTimeout(() => loadProfile(s), 0);

    });

    supabase.auth.getSession().then(async ({ data }) => {

      if (!mounted) return;

      setSession(data.session);

      await loadProfile(data.session);

      setLoading(false);

    });

    return () => {

      mounted = false;

      sub.subscription.unsubscribe();

    };

  }, [loadProfile]);



  const signOut = async () => {

    await supabase.auth.signOut();

  };



  return (

    <Ctx.Provider value={{ session, appUser, student, loading, refresh, signOut }}>

      {children}

    </Ctx.Provider>

  );

}



export function useAuth() {

  const ctx = useContext(Ctx);

  if (!ctx) throw new Error("useAuth must be inside AuthProvider");

  return ctx;

}



export const ROLE = { ADMIN: 1, TEACHER: 2, STUDENT: 3 } as const;



export function roleHomePath(roleId: number | null | undefined): string {

  if (roleId === ROLE.ADMIN) return "/admin";

  if (roleId === ROLE.TEACHER) return "/teacher";

  return "/student";

}