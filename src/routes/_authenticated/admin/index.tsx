import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { appUser } = useAuth();

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, Admin {appUser?.first_name}!
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Admin panel is working perfectly! You can add more admin features here later.</p>
        </CardContent>
      </Card>
    </div>
  );
}