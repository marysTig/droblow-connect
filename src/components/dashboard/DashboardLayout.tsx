import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, PlusCircle, ShoppingBag, Wallet, ArrowDownToLine, UserRound, Search, Bell, Shield } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/brand/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const nav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Products", url: "/dashboard/products", icon: Package },
  { title: "New Order", url: "/dashboard/new-order", icon: PlusCircle },
  { title: "Orders", url: "/dashboard/orders", icon: ShoppingBag },
  { title: "Earnings", url: "/dashboard/earnings", icon: Wallet },
  { title: "Withdrawals", url: "/dashboard/withdrawals", icon: ArrowDownToLine },
  { title: "Profile", url: "/dashboard/profile", icon: UserRound },
];

const adminNav = [
  { title: "Admin Panel", url: "/admin", icon: Shield },
];

export function DashboardLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (u: string) => u === "/dashboard" ? pathname === u : pathname.startsWith(u);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/40">
        <Sidebar collapsible="icon">
          <SidebarHeader className="p-4"><Link to="/dashboard"><Logo /></Link></SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {nav.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                        <Link to={item.url} className="flex items-center gap-2.5">
                          <item.icon className="h-4 w-4" /><span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNav.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                        <Link to={item.url} className="flex items-center gap-2.5">
                          <item.icon className="h-4 w-4" /><span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-3">
            <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/60 p-2.5">
              <Avatar className="h-9 w-9"><AvatarImage src="https://i.pravatar.cc/60?img=12" /><AvatarFallback>AB</AvatarFallback></Avatar>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <div className="text-sm font-semibold truncate">Amine Bouzid</div>
                <div className="text-xs text-muted-foreground truncate">Affiliate · AF-1234</div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center gap-3 px-4 md:px-6">
            <SidebarTrigger />
            <div className="relative flex-1 max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders, products…" className="pl-9 h-10 bg-muted/50 border-transparent focus-visible:bg-background" />
            </div>
            <div className="flex-1 md:hidden" />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand" />
            </Button>
            <Button asChild size="sm" className="gradient-brand text-brand-foreground shadow-brand hidden sm:inline-flex">
              <Link to="/dashboard/new-order"><PlusCircle className="mr-1.5 h-4 w-4" /> New order</Link>
            </Button>
          </header>
          <main className="flex-1 p-4 md:p-8"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
