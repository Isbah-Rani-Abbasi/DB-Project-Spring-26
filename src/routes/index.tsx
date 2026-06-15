import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, roleHomePath } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { session, appUser, student, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    if (!appUser) {
      // Auth user exists but no app row — go finish onboarding
      navigate({ to: "/complete-profile" });
      return;
    }
    if (appUser.role_id === 3 && !student) {
      navigate({ to: "/complete-profile" });
      return;
    }
    navigate({ to: roleHomePath(appUser.role_id) });
  }, [loading, session, appUser, student, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
