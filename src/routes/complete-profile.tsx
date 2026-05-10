import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, ROLE } from "@/lib/auth-context";

// @ts-ignore - TanStack router ko ignore karne ke liye taake error na de
export const Route = createFileRoute("/complete-profile")({
  component: CompleteProfilePage,
});

function CompleteProfilePage() {
  const { session, refresh, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

 const handleSaveProfile = async () => {
  if (!session) return;
  setLoading(true);

  try {
    // 1. Pehle 'users' table mein entry (agar nahi hai)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .upsert({
        auth_user_id: session.user.id,
        email: session.user.email,
        first_name: "New",
        last_name: "Student",
        role_id: ROLE.STUDENT,
      } as any, { onConflict: 'auth_user_id' })
      .select()
      .single();

    if (userError) throw userError;

    // 2. CRITICAL: Ab 'students' table mein bhi entry lazmi hai!
    // Iske baghair portal aapko loop mein phansaye rakhega
    const { error: studentError } = await supabase
      .from("students")
      .upsert({
        student_id: userData.user_id, // Ye users table ki primary key hai
        roll_number: `ST-${Math.floor(1000 + Math.random() * 9000)}`, // Temporary roll number
        enrollment_year: new Date().getFullYear(),
        max_credits: 18,
      } as any, { onConflict: 'student_id' });

    if (studentError) throw studentError;

    // 3. Sab theek ho gaya, ab refresh aur redirect
    await refresh();
    
    // Thora sa intezar taake state update ho jaye
    setTimeout(() => {
      window.location.href = "/student";
    }, 500);

  } catch (error: any) {
    console.error("Error:", error.message);
    alert("Setup failed: " + error.message);
  } finally {
    setLoading(false);
  }
};
  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" as any });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Incomplete!</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Aapka login ban gaya hai, bas database mein connection baqi hai. Isey complete karein taake portal khul sake.
        </p>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={handleSaveProfile} 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            {loading ? "Saving Data..." : "Complete My Profile"}
          </button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full text-red-600 font-medium px-4 py-2.5 rounded-lg hover:bg-red-50 border border-red-100 transition-colors"
          >
            Logout & Go Back
          </button>
        </div>
      </div>
    </div>
  );
}