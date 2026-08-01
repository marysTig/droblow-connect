import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  X,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Wallet,
  UserRound,
  Truck,
  LifeBuoy,
  Shield,
  LogOut,
  ChevronRight,
  Building,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/brand/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MobileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenuDrawer({ open, onClose }: MobileMenuDrawerProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (url: string) =>
    url === "/dashboard" ? pathname === url : pathname.startsWith(url);

  const mainNav = [
    { title: t("sidebar_dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("sidebar_products"), url: "/dashboard/products", icon: Package },
    { title: t("sidebar_orders"), url: "/dashboard/orders", icon: ShoppingBag },
    { title: t("sidebar_earnings"), url: "/dashboard/earnings", icon: Wallet },
    { title: t("sidebar_shipping"), url: "/dashboard/shipping", icon: Truck },
    { title: t("sidebar_profile"), url: "/dashboard/profile", icon: UserRound },
    { title: t("nav_immobilier"), url: "/dashboard/immobilier", icon: Building },
    { title: "Support", url: "/dashboard/support", icon: LifeBuoy },
  ];

  const adminNav = isAdmin
    ? [{ title: t("sidebar_admin_panel"), url: "/admin", icon: Shield }]
    : [];

  const handleSignOut = async () => {
    onClose();
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden
          transition-opacity duration-300
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-[70] w-72 md:hidden
          bg-card border-r border-border shadow-2xl
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <Logo />
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/60">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="gradient-brand text-brand-foreground font-bold text-sm">
                {(user?.email || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {user?.user_metadata?.first_name || (user?.email ? user.email.split("@")[0] : "User")}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {user?.email}
              </div>
              <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
                {isAdmin ? t("sidebar_admin") : "Affilié"}
              </span>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {/* Main section label */}
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {t("sidebar_main")}
          </div>

          {mainNav.map((item) => {
            const active = isActive(item.url);
            return (
              <Link
                key={item.url}
                to={item.url}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 group relative
                  ${
                    active
                      ? "bg-success/10 text-success font-semibold"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-success" />
                )}
                <item.icon
                  className={`h-4 w-4 shrink-0 ${active ? "text-success" : "text-muted-foreground group-hover:text-foreground"}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="flex-1">{item.title}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 text-success" />}
              </Link>
            );
          })}

          {/* Admin section */}
          {adminNav.length > 0 && (
            <>
              <div className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {t("sidebar_admin")}
              </div>
              {adminNav.map((item) => {
                const active = isActive(item.url);
                return (
                  <Link
                    key={item.url}
                    to={item.url}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-150 group relative
                      ${active ? "bg-brand/10 text-brand font-semibold" : "text-foreground/70 hover:bg-muted hover:text-foreground"}
                    `}
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
                    <span className="flex-1">{item.title}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer — logout */}
        <div className="px-3 py-3 border-t border-border shrink-0">
          <button
            onClick={handleSignOut}
            className="
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-destructive hover:bg-destructive/10 transition-all duration-150 group
            "
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">{t("sidebar_logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
