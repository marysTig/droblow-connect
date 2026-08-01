import { Link, useRouterState } from "@tanstack/react-router";
import {
  Package,
  ShoppingBag,
  Wallet,
  UserRound,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n";

export function BottomTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { totalItems, setIsDrawerOpen } = useCart();
  const { t } = useI18n();

  const tabs = [
    {
      label: t("sidebar_products"),
      url: "/dashboard/products",
      icon: Package,
    },
    {
      label: t("sidebar_orders"),
      url: "/dashboard/orders",
      icon: ShoppingBag,
    },
    {
      label: t("sidebar_earnings"),
      url: "/dashboard/earnings",
      icon: Wallet,
    },
    {
      label: t("sidebar_profile"),
      url: "/dashboard/profile",
      icon: UserRound,
    },
  ];

  const isActive = (url: string) => pathname.startsWith(url);

  return (
    <>
      {/* Spacer so content doesn't hide behind the bar */}
      <div className="h-[68px] md:hidden" />

      <nav
        className="
          fixed bottom-0 left-0 right-0 z-50 md:hidden
          bg-background/95 backdrop-blur-xl
          border-t border-border
          flex items-stretch
          safe-area-pb
        "
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Regular tabs */}
        {tabs.map((tab) => {
          const active = isActive(tab.url);
          return (
            <Link
              key={tab.url}
              to={tab.url}
              className={`
                flex-1 flex flex-col items-center justify-center gap-0.5 py-2
                transition-all duration-200 relative group
                ${active ? "text-success" : "text-muted-foreground"}
              `}
            >
              {/* Active indicator pill */}
              {active && (
                <span
                  className="
                    absolute top-0 left-1/2 -translate-x-1/2
                    h-0.5 w-8 rounded-full bg-success
                  "
                />
              )}

              <tab.icon
                className={`
                  h-5 w-5 transition-transform duration-200
                  ${active ? "scale-110" : "group-active:scale-95"}
                `}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span
                className={`
                  text-[10px] font-medium leading-none transition-all duration-200
                  ${active ? "font-bold" : ""}
                `}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* Cart button — opens drawer */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="
            flex-1 flex flex-col items-center justify-center gap-0.5 py-2
            text-muted-foreground transition-all duration-200 relative group
            active:scale-95
          "
        >
          <span className="relative">
            <ShoppingCart
              className="h-5 w-5 transition-transform duration-200 group-active:scale-95"
              strokeWidth={1.8}
            />
            {totalItems > 0 && (
              <span
                className="
                  absolute -top-1.5 -right-1.5
                  h-4 w-4 min-w-4 rounded-full
                  bg-success text-[9px] font-bold text-white
                  flex items-center justify-center
                  border-2 border-background
                  animate-bounce-once
                "
              >
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </span>
          <span className="text-[10px] font-medium leading-none">
            {t("nav_cart") || "Panier"}
          </span>
        </button>
      </nav>
    </>
  );
}
