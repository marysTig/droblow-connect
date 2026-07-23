import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import type { ReactNode } from "react";
import { Smartphone, ShoppingCart, Banknote } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex flex-col p-8 md:p-12">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Link to="/">
            <Logo />
          </Link>
          <LanguageSwitcher />
        </div>
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold text-primary tracking-tight text-center" dir="auto">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-center" dir="auto">
              {subtitle}
            </p>
            <div className="mt-8 space-y-4">{children}</div>
            <div className="mt-6 text-sm text-muted-foreground text-center" dir="auto">
              {footer}
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden gradient-navy">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-20 -left-10 h-72 w-72 rounded-full bg-brand/40 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-success/40 blur-3xl" />
        </div>
        <div className="relative h-full flex flex-col justify-center items-center p-12 lg:p-16 text-navy-foreground">
          <div className="max-w-xl relative z-10 flex flex-col items-center text-center">
            <h2
              className="text-4xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight"
              dir="auto"
            >
              {t("auth_no_product")}
              <br />
              <span className="text-[#22C55E]">{t("auth_no_stock")}</span>
              <br />
              {t("auth_no_capital")}
            </h2>
            <p className="mt-6 text-lg text-navy-foreground/80 leading-relaxed max-w-lg" dir="auto">
              {t("auth_start_selling")}
              <br />
              <br />
              {t("auth_commission")}{" "}
              <span className="text-[#22C55E] font-semibold">{t("auth_commission2")}</span>
              {t("auth_earn_more")}
            </p>

            <div className="mt-10 flex flex-row items-center justify-center gap-6 w-full flex-wrap">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-navy-foreground/10 text-[#22C55E]">
                  <Smartphone className="h-7 w-7" />
                </div>
                <div className="text-sm font-medium max-w-[100px] leading-tight">
                  {t("auth_publish")}
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-navy-foreground/10 text-[#22C55E]">
                  <ShoppingCart className="h-7 w-7" />
                </div>
                <div className="text-sm font-medium max-w-[100px] leading-tight">
                  {t("auth_marketplace")}
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-navy-foreground/10 text-[#22C55E]">
                  <Banknote className="h-7 w-7" />
                </div>
                <div className="text-sm font-medium max-w-[100px] leading-tight">
                  {t("auth_earn")}
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-navy-foreground/10 w-full flex flex-col items-center">
              <div className="text-2xl font-bold italic text-white" dir="auto">
                {t("auth_ambition")}
              </div>
              <div
                className="mt-4 text-[#22C55E] font-semibold text-lg flex items-center justify-center gap-2"
                dir="auto"
              >
                {t("auth_join")}
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-navy-foreground/40 z-10">
            © 2026 Droblow Affiliate
          </div>
        </div>
      </div>
    </div>
  );
}
