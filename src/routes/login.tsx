import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your affiliate dashboard."
      footer={<>Don't have an account? <Link to="/register" className="text-success font-medium hover:underline">Sign up</Link></>}
    >
      <form onSubmit={(e) => { e.preventDefault(); navigate({ to: "/dashboard" }); }} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue="demo@droblow.dz" className="mt-1.5 h-11" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground">Forgot?</a>
          </div>
          <Input id="password" type="password" defaultValue="demo1234" className="mt-1.5 h-11" />
        </div>
        <Button type="submit" className="w-full h-11 gradient-brand text-brand-foreground shadow-brand">
          Sign in <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </AuthShell>
  );
}
