import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success(t("dash_welcome"));

    const { data: profile } = await supabase
      .from("affiliates")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "admin") {
      navigate({ to: "/admin" });
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <AuthShell
      title={t("login_title")}
      subtitle={t("login_subtitle")}
      footer={<>{t("login_no_account")} <Link to="/register" className="text-success font-medium hover:underline">{t("login_register_link")}</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">{t("login_email")}</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5 h-11" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("login_password")}</Label>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground">{t("login_forgot")}</a>
          </div>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1.5 h-11" />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full h-11 gradient-brand text-brand-foreground shadow-brand">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("login_submit")}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </form>
    </AuthShell>
  );
}
