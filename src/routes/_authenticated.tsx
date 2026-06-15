import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, ROLE, roleHomePath } from "@/lib/auth-context";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { session, appUser, student, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Agar abhi database se data aa raha hai, toh ruk jao
    if (loading) return;

    // 2. Agar session hi nahi hai, toh login par wapas
    if (!session) {
      navigate({ to: "/login" });
      return;
    }

    const isOnCompleteProfile = location.pathname.includes("complete-profile");

    // 3. MAIN FIX: Agar appUser mil gaya (Admin/Teacher/Student)
    if (appUser) {
      // Agar wo ghalti se complete-profile par khara hai, toh uske sahi home par bhej do
      if (isOnCompleteProfile) {
        navigate({ to: roleHomePath(appUser.role_id) as any });
      }
      
      // Agar student hai lekin data missing hai, tabhi complete-profile par bhejo
      if (appUser.role_id === ROLE.STUDENT && !student && !isOnCompleteProfile) {
        navigate({ to: "/complete-profile" });
      }
    } 
    // 4. Agar loading khatam ho gayi aur appUser phir bhi null hai, tabhi bhejo profile completion par
    else if (!isOnCompleteProfile) {
      navigate({ to: "/complete-profile" });
    }
  }, [loading, session, appUser, student, navigate, location.pathname]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Profile completion page ke liye saada layout
  if (location.pathname.includes("complete-profile")) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  // Final Safety Check
  if (!appUser && !location.pathname.includes("complete-profile")) {
    return null; 
  }

  // Dashboard Layout (Admin/Teacher/Student)
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur px-4">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground font-medium">
              University Portal — {
                appUser?.role_id === ROLE.ADMIN ? 'Admin' : 
                appUser?.role_id === ROLE.TEACHER ? 'Teacher' : 
                'Student'
              }
            </div>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}