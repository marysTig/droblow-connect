import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const navigate = useNavigate();
  return (
    <AuthShell
      title="Become an Affiliate"
      subtitle="Start earning on delivered orders across Algeria."
      footer={<>Already have an account? <Link to="/login" className="text-success font-medium hover:underline">Sign in</Link></>}
    >
      <form onSubmit={(e) => { e.preventDefault(); navigate({ to: "/dashboard" }); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>First name</Label><Input className="mt-1.5 h-11" defaultValue="Amine" /></div>
          <div><Label>Last name</Label><Input className="mt-1.5 h-11" defaultValue="Bouzid" /></div>
        </div>
        <div><Label>Email</Label><Input type="email" className="mt-1.5 h-11" defaultValue="amine@example.dz" /></div>
        <div><Label>Phone</Label><Input className="mt-1.5 h-11" defaultValue="0555 12 34 56" /></div>
        <div><Label>Password</Label><Input type="password" className="mt-1.5 h-11" defaultValue="strongpass" /></div>
        <Button type="submit" className="w-full h-11 gradient-brand text-brand-foreground shadow-brand">
          Create account <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="text-xs text-muted-foreground text-center">By continuing you agree to our Terms and Privacy Policy.</p>
      </form>
    </AuthShell>
  );
}
