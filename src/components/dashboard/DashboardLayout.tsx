import { Link, Outlet, useRouterState, useNavigate, useSearch } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Wallet,
  ArrowDownToLine,
  UserRound,
  Search,
  Bell,
  Shield,
  LogOut,
  Truck,
  LifeBuoy,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/brand/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationsPopover } from "./NotificationsPopover";

export function DashboardLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchState = useSearch({ strict: false }) as { q?: string };
  const searchStr = searchState.q || "";
  const isActive = (u: string) => (u === "/dashboard" ? pathname === u : pathname.startsWith(u));
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const nav = [
    { title: t("sidebar_dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("sidebar_products"), url: "/dashboard/products", icon: Package },
    { title: t("sidebar_orders"), url: "/dashboard/orders", icon: ShoppingBag },
    { title: t("sidebar_earnings"), url: "/dashboard/earnings", icon: Wallet },
    { title: t("sidebar_shipping"), url: "/dashboard/shipping", icon: Truck },
    { title: t("sidebar_profile"), url: "/dashboard/profile", icon: UserRound },
    { title: "Support", url: "/dashboard/support", icon: LifeBuoy },
  ];

  const adminNav = [{ title: t("sidebar_admin_panel"), url: "/admin", icon: Shield }];

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/40">
        <Sidebar collapsible="icon">
          <SidebarHeader className="p-4">
            <Link to="/dashboard">
              <Logo />
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{t("sidebar_main")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {nav.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                        <Link to={item.url} className="flex items-center gap-2.5">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {isAdmin && (
              <SidebarGroup>
                <SidebarGroupLabel>{t("sidebar_admin")}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminNav.map((item) => (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          tooltip={item.title}
                        >
                          <Link to={item.url} className="flex items-center gap-2.5">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter className="p-3">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-sidebar-accent/60 p-2.5">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                  <div className="text-sm font-semibold truncate">
                    {user?.user_metadata?.first_name || user?.email}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {isAdmin ? t("sidebar_admin") : "Affiliate"}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="group-data-[collapsible=icon]:hidden text-muted-foreground hover:text-foreground"
                onClick={handleSignOut}
                title={t("sidebar_logout")}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center gap-3 px-4 md:px-6">
            <SidebarTrigger />
            {pathname === "/dashboard/products" ? (
              <div className="relative flex-1 max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchStr}
                  onChange={(e) => navigate({ to: "/dashboard/products", search: (prev: any) => ({ ...prev, q: e.target.value }), replace: true })}
                  placeholder={t("sidebar_search")}
                  className="pl-9 h-10 bg-muted/50 border-transparent focus-visible:bg-background"
                />
              </div>
            ) : (
              <div className="flex-1 max-w-md hidden md:block" />
            )}
            <div className="flex-1 md:hidden" />
            <LanguageSwitcher />
            {/* Cart icon – only on /dashboard/products */}
            {pathname === "/dashboard/products" && <CartIconButton />}
            <NotificationsPopover />
          </header>
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function CartIconButton() {
  const { totalItems, setIsDrawerOpen } = useCart();
  return (
    <button
      onClick={() => setIsDrawerOpen(true)}
      className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
    >
      <ShoppingBag className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-brand text-[9px] font-bold text-white flex items-center justify-center border-2 border-background">
          {totalItems}
        </span>
      )}
    </button>
  );
}
