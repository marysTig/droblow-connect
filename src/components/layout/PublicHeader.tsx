import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X, Globe } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";

export function PublicHeader() {
  const { t, lang, setLang } = useI18n();
  const { totalItems, setIsDrawerOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on scroll or resize
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, []);

  // Block body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = [
    { label: t("nav_how"), hash: "how" },
    { label: t("nav_products"), hash: "products" },
    { label: t("nav_faq"), hash: "faq" },
  ];

  const toggleLang = () => setLang(lang === "fr" ? "ar" : "fr");

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-14 sm:h-16">

        {/* ── Logo ── */}
        <Link to="/" onClick={() => setMenuOpen(false)} className="shrink-0">
          <Logo />
        </Link>

        {/* ── Desktop nav (hidden on mobile) ── */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-muted-foreground">
          {navLinks.map((l) => (
            <Link
              key={l.hash}
              to="/"
              hash={l.hash}
              className="hover:text-foreground transition-colors duration-150"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2">
          {/* Language toggle - desktop */}
          <button
            onClick={toggleLang}
            className="hidden md:flex items-center gap-1.5 p-2 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Globe className="h-4 w-4" />
            {lang.toUpperCase()}
          </button>

          {user ? (
            <Button
              asChild
              size="sm"
              className="gradient-brand text-brand-foreground shadow-brand hover:opacity-95 font-semibold px-3 sm:px-5 text-[13px] sm:text-[15px]"
            >
              <Link to={isAdmin ? "/admin" : "/dashboard/products"}>
                <span className="hidden sm:inline">
                  {isAdmin ? t("sidebar_admin_panel") : t("sidebar_dashboard")}
                </span>
                <span className="sm:hidden">Mon compte</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              {/* Sign in — desktop only */}
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden md:flex font-semibold text-[15px] px-4"
              >
                <Link to="/login">{t("nav_sign_in")}</Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="gradient-brand text-brand-foreground shadow-brand hover:opacity-95 font-semibold text-[13px] sm:text-[15px] px-3 sm:px-5"
              >
                <Link to="/register">
                  <span className="hidden sm:inline">{t("nav_become_affiliate")} </span>
                  <span className="sm:hidden">{t("nav_become_affiliate")}</span>
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}

          {/* ── Hamburger (mobile only) ── */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden ml-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown menu ── */}
      <div
        className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          border-t border-border/60 bg-background/98 backdrop-blur-xl
          ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <nav className="px-4 py-3 flex flex-col gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.hash}
              to="/"
              hash={l.hash}
              onClick={() => setMenuOpen(false)}
              className="flex items-center px-3 py-3 rounded-xl text-base font-semibold text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            >
              {l.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="my-1 border-t border-border/50" />

          {/* Language toggle - mobile */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-semibold text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
          >
            <Globe className="h-5 w-5" />
            {lang === "fr" ? "Français" : "العربية"}
          </button>

          {/* Auth links in mobile menu */}
          {!user && (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center px-3 py-3 rounded-xl text-base font-semibold text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            >
              {t("nav_sign_in")}
            </Link>
          )}

          <Link
            to={user ? (isAdmin ? "/admin" : "/dashboard/products") : "/register"}
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 mt-1 mb-2 px-4 py-3 rounded-xl gradient-brand text-brand-foreground font-bold text-base shadow-brand"
          >
            {user
              ? isAdmin
                ? t("sidebar_admin_panel")
                : t("sidebar_dashboard")
              : t("nav_become_affiliate")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
