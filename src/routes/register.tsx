import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Loader2, BookOpen } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import wilayasData from "../../wilayas-with-municipalities.json";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    wilaya: "",
    commune: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };
  const handleWilayaChange = (value: string) => setForm({ ...form, wilaya: value, commune: "" });
  const handleCommuneChange = (value: string) => setForm({ ...form, commune: value });

  const selectedWilaya = wilayasData.find((w) => w.nameFr === form.wilaya);
  const communes = selectedWilaya?.communes || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.wilaya ||
      !form.commune
    ) {
      toast.error(t("new_order_fill_all"));
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error("Le numéro de téléphone doit contenir 10 chiffres");
      return;
    }

    setIsLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
          wilaya: form.wilaya,
          commune: form.commune,
        },
      },
    });

    if (authError) {
      toast.error(authError.message);
      setIsLoading(false);
      return;
    }

    if (authData.user) {
      const { error: dbError } = await supabase.from("affiliates").insert({
        id: authData.user.id,
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        phone: form.phone,
        wilaya: form.wilaya,
        commune: form.commune,
        status: "active",
        joined: new Date().toISOString(),
      });
      if (dbError) console.error("Error creating profile:", dbError);
      toast.success("📧 Confirmez votre email — Un lien de confirmation vous a été envoyé par Droblow. Veuillez vérifier votre boîte mail pour activer votre compte.", {
        duration: 8000,
      });
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("register_title")}
      subtitle={t("register_subtitle")}
      footer={
        <div className="text-center text-base font-semibold w-full">
          {t("register_have_account")}{" "}
          <Link to="/login" className="text-success font-medium hover:underline">
            {t("register_sign_in")}
          </Link>
          <div className="mt-6 pt-6 border-t border-border flex justify-center">
            <a href="/Droblow_Affiliate_Formation.pdf" target="_blank" rel="noreferrer" className="flex w-full items-center justify-center text-center gap-2 text-white hover:underline font-bold text-sm sm:text-base bg-brand hover:bg-brand/90 transition-colors px-4 py-3 rounded-lg">
              <BookOpen className="h-5 w-5 shrink-0" /> <span dir="rtl" className="text-center text-balance">دورة التسويق بالعمولة + كيفية استخدام دروبلو أفلييت</span>
            </a>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName">{t("register_first_name")}</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className="mt-1.5 h-11"
            />
          </div>
          <div>
            <Label htmlFor="lastName">{t("register_last_name")}</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              className="mt-1.5 h-11"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">{t("register_email")}</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1.5 h-11"
          />
        </div>
        <div>
          <Label htmlFor="phone">{t("register_phone")}</Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (val.length <= 10) {
                setForm({ ...form, phone: val });
              }
            }}
            required
            pattern="\d{10}"
            maxLength={10}
            className="mt-1.5 h-11"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("register_wilaya")}</Label>
            <Select value={form.wilaya} onValueChange={handleWilayaChange}>
              <SelectTrigger className="mt-1.5 h-11 bg-background">
                <SelectValue placeholder={t("register_wilaya_ph")} />
              </SelectTrigger>
              <SelectContent>
                {wilayasData.map((w) => (
                  <SelectItem key={w.wilayaCode} value={w.nameFr}>
                    {w.wilayaCode} - {w.nameFr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("register_commune")}</Label>
            <Select
              value={form.commune}
              onValueChange={handleCommuneChange}
              disabled={!form.wilaya}
            >
              <SelectTrigger className="mt-1.5 h-11 bg-background">
                <SelectValue
                  placeholder={form.wilaya ? t("register_commune_ph") : t("register_commune_first")}
                />
              </SelectTrigger>
              <SelectContent>
                {communes.map((c) => (
                  <SelectItem key={c.nameFr} value={c.nameFr}>
                    {c.nameFr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="password">{t("register_password")}</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
            className="mt-1.5 h-11"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 gradient-brand text-brand-foreground shadow-brand"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("register_submit")}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
        <p className="text-xs text-muted-foreground text-center">{t("register_terms")}</p>
      </form>
    </AuthShell>
  );
}
