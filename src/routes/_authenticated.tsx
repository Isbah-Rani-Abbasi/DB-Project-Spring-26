import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, ROLE } from "@/lib/auth-context";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { session, appUser, student, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    // 1. Agar session hi nahi hai toh login pe pheinko
    if (!session) {
      navigate({ to: "/login" });
      return;
    }

    // 2. Redirect Logic: Sirf tab redirect karo agar user profile page par NAHI hai
    const isOnCompleteProfile = location.pathname.includes("complete-profile");
    
    if (!isOnCompleteProfile) {
      if (!appUser) {
        navigate({ to: "/complete-profile" });
      } else if (appUser.role_id === ROLE.STUDENT && !student) {
        navigate({ to: "/complete-profile" });
      }
    }
  }, [loading, session, appUser, student, navigate, location.pathname]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 3. FIX: Agar hum profile completion page par hain, toh baghair kisi check ke Outlet dikhao
  if (location.pathname.includes("complete-profile")) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  // 4. Safety Guard: Agar appUser abhi tak load nahi hua aur hum profile page par bhi nahi hain
  if (!appUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p>Verifying Profile...</p>
        </div>
      </div>
    );
  }

  // 5. Main Portal Layout (Admin/Teacher/Student jinka data complete hai)
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur px-4">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground font-medium">
              University Portal — {appUser.role_id === ROLE.ADMIN ? 'Admin' : 'Student'}
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