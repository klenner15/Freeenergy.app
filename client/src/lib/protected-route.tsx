import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation, RouteComponentProps } from "wouter";
import { UserRole } from "@shared/schema";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
  requiredRole?: keyof typeof UserRole;
};

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  console.log(`ProtectedRoute ${path} - user:`, user, "isLoading:", isLoading, "requiredRole:", requiredRole);

  if (isLoading) {
    console.log(`ProtectedRoute ${path} - Loading...`);
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // If user is not logged in, redirect to auth page
  if (!user) {
    console.log(`ProtectedRoute ${path} - No user, redirecting to auth`);
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If user doesn't have a role yet, redirect to role selection
  if (!user.role) {
    console.log(`ProtectedRoute ${path} - User has no role, redirecting to role selection`);
    return (
      <Route path={path}>
        <Redirect to="/role-selection" />
      </Route>
    );
  }

  // If a specific role is required, check it
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's role
    let redirectPath = "/";
    if (user.role === "MERCHANT") {
      redirectPath = "/merchant/dashboard";
    } else if (user.role === "DELIVERY") {
      redirectPath = "/delivery/dashboard";
    }

    console.log(`ProtectedRoute ${path} - User has role ${user.role} but ${requiredRole} is required, redirecting to ${redirectPath}`);
    return (
      <Route path={path}>
        <Redirect to={redirectPath} />
      </Route>
    );
  }

  console.log(`ProtectedRoute ${path} - Rendering component for user with role ${user.role}`);
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}
