import { Link } from "@tanstack/react-router";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth";

export function PublicHeader() {
  const { t } = useI18n();
  const { totalItems, setIsDrawerOpen } = useCart();
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-10 text-[15px] font-semibold text-muted-foreground">
          <Link to="/" hash="how" className="hover:text-foreground transition-colors duration-150">
            {t("nav_how")}
          </Link>
          <Link
            to="/"
            hash="products"
            className="hover:text-foreground transition-colors duration-150"
          >
            {t("nav_products")}
          </Link>
          <Link to="/" hash="faq" className="hover:text-foreground transition-colors duration-150">
            {t("nav_faq")}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />



          {user ? (
            <Button
              asChild
              size="default"
              className="gradient-brand text-brand-foreground shadow-brand hover:opacity-95 text-[15px] font-semibold px-5 hidden sm:flex"
            >
              <Link to={isAdmin ? "/admin" : "/dashboard"}>
                {isAdmin ? t("sidebar_admin_panel") : t("sidebar_dashboard")}{" "}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="default"
                className="text-[15px] font-semibold px-5 hidden sm:flex"
              >
                <Link to="/login">{t("nav_sign_in")}</Link>
              </Button>
              <Button
                asChild
                size="default"
                className="gradient-brand text-brand-foreground shadow-brand hover:opacity-95 text-[15px] font-semibold px-5 hidden sm:flex"
              >
                <Link to="/register">
                  {t("nav_become_affiliate")} <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
