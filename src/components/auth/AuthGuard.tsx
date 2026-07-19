import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export function AuthGuard({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate({ to: "/login" });
      } else if (requireAdmin && !isAdmin) {
        navigate({ to: "/dashboard" }); // Or unauthorized page
      }
    }
  }, [user, isAdmin, isLoading, navigate, requireAdmin]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user || (requireAdmin && !isAdmin)) {
    return null; // Prevents rendering protected content before redirect
  }

  return <>{children}</>;
}
