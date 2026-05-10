export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      course_offerings: {
        Row: {
          capacity: number | null
          course_id: number | null
          faculty_id: number | null
          offering_id: number
          schedule_info: string | null
          semester_id: number | null
        }
        Insert: {
          capacity?: number | null
          course_id?: number | null
          faculty_id?: number | null
          offering_id?: number
          schedule_info?: string | null
          semester_id?: number | null
        }
        Update: {
          capacity?: number | null
          course_id?: number | null
          faculty_id?: number | null
          offering_id?: number
          schedule_info?: string | null
          semester_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_offerings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "course_offerings_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["faculty_id"]
          },
          {
            foreignKeyName: "course_offerings_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["semester_id"]
          },
        ]
      }
      courses: {
        Row: {
          course_code: string
          course_id: number
          course_title: string
          credit_hours: number
          department_id: number | null
        }
        Insert: {
          course_code: string
          course_id?: number
          course_title: string
          credit_hours: number
          department_id?: number | null
        }
        Update: {
          course_code?: string
          course_id?: number
          course_title?: string
          credit_hours?: number
          department_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
          },
        ]
      }
      departments: {
        Row: {
          department_id: number
          department_name: string
        }
        Insert: {
          department_id?: number
          department_name: string
        }
        Update: {
          department_id?: number
          department_name?: string
        }
        Relationships: []
      }
      faculty: {
        Row: {
          department_id: number | null
          designation: string | null
          employee_id: string
          faculty_id: number
        }
        Insert: {
          department_id?: number | null
          designation?: string | null
          employee_id: string
          faculty_id?: number
        }
        Update: {
          department_id?: number | null
          designation?: string | null
          employee_id?: string
          faculty_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "faculty_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "faculty_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      fee_vouchers: {
        Row: {
          due_date: string
          issue_date: string | null
          semester_id: number | null
          status: string | null
          student_id: number | null
          total_amount: number
          voucher_id: number
        }
        Insert: {
          due_date: string
          issue_date?: string | null
          semester_id?: number | null
          status?: string | null
          student_id?: number | null
          total_amount: number
          voucher_id?: number
        }
        Update: {
          due_date?: string
          issue_date?: string | null
          semester_id?: number | null
          status?: string | null
          student_id?: number | null
          total_amount?: number
          voucher_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fee_vouchers_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["semester_id"]
          },
          {
            foreignKeyName: "fee_vouchers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_paid: number
          payment_date: string | null
          payment_id: number
          payment_method: string | null
          voucher_id: number | null
        }
        Insert: {
          amount_paid: number
          payment_date?: string | null
          payment_id?: number
          payment_method?: string | null
          voucher_id?: number | null
        }
        Update: {
          amount_paid?: number
          payment_date?: string | null
          payment_id?: number
          payment_method?: string | null
          voucher_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "fee_vouchers"
            referencedColumns: ["voucher_id"]
          },
        ]
      }
      prerequisites: {
        Row: {
          course_id: number
          prerequisite_course_id: number
        }
        Insert: {
          course_id: number
          prerequisite_course_id: number
        }
        Update: {
          course_id?: number
          prerequisite_course_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "prerequisites_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "prerequisites_prerequisite_course_id_fkey"
            columns: ["prerequisite_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["course_id"]
          },
        ]
      }
      programs: {
        Row: {
          department_id: number | null
          duration_years: number
          program_id: number
          program_name: string
        }
        Insert: {
          department_id?: number | null
          duration_years: number
          program_id?: number
          program_name: string
        }
        Update: {
          department_id?: number | null
          duration_years?: number
          program_id?: number
          program_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
          },
        ]
      }
      registrations: {
        Row: {
          grade: string | null
          offering_id: number | null
          registration_date: string | null
          registration_id: number
          status: string | null
          student_id: number | null
        }
        Insert: {
          grade?: string | null
          offering_id?: number | null
          registration_date?: string | null
          registration_id?: number
          status?: string | null
          student_id?: number | null
        }
        Update: {
          grade?: string | null
          offering_id?: number | null
          registration_date?: string | null
          registration_id?: number
          status?: string | null
          student_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "course_offerings"
            referencedColumns: ["offering_id"]
          },
          {
            foreignKeyName: "registrations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["student_id"]
          },
        ]
      }
      roles: {
        Row: {
          role_id: number
          role_name: string
        }
        Insert: {
          role_id?: number
          role_name: string
        }
        Update: {
          role_id?: number
          role_name?: string
        }
        Relationships: []
      }
      semesters: {
        Row: {
          end_date: string | null
          semester_id: number
          start_date: string | null
          term: string
          year: number
        }
        Insert: {
          end_date?: string | null
          semester_id?: number
          start_date?: string | null
          term: string
          year: number
        }
        Update: {
          end_date?: string | null
          semester_id?: number
          start_date?: string | null
          term?: string
          year?: number
        }
        Relationships: []
      }
      students: {
        Row: {
          current_semester: number | null
          enrollment_year: number
          max_credits: number
          program_id: number | null
          roll_number: string
          student_id: number
        }
        Insert: {
          current_semester?: number | null
          enrollment_year: number
          max_credits?: number
          program_id?: number | null
          roll_number: string
          student_id?: number
        }
        Update: {
          current_semester?: number | null
          enrollment_year?: number
          max_credits?: number
          program_id?: number | null
          roll_number?: string
          student_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "students_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          first_name: string
          gender: string | null
          last_name: string
          password_hash: string | null
          phone: string | null
          role_id: number | null
          status: string | null
          user_id: number
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          first_name: string
          gender?: string | null
          last_name: string
          password_hash?: string | null
          phone?: string | null
          role_id?: number | null
          status?: string | null
          user_id?: number
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          first_name?: string
          gender?: string | null
          last_name?: string
          password_hash?: string | null
          phone?: string | null
          role_id?: number | null
          status?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_app_user_id: { Args: never; Returns: number }
      current_role_id: { Args: never; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
