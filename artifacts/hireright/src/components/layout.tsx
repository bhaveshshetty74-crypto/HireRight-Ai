import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Briefcase, Users, FileCheck, BarChart, BookOpen, CreditCard } from "lucide-react";
import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4">
            <h1 className="text-xl font-bold tracking-tight text-primary">HireRight AI</h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/dashboard"}>
                  <Link href="/dashboard" data-testid="nav-dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.startsWith("/roles")}>
                  <Link href="/roles" data-testid="nav-roles">
                    <Briefcase className="h-4 w-4" />
                    <span>Roles</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.startsWith("/candidates")}>
                  <Link href="/candidates" data-testid="nav-candidates">
                    <Users className="h-4 w-4" />
                    <span>Candidates</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.startsWith("/screenings")}>
                  <Link href="/screenings" data-testid="nav-screenings">
                    <FileCheck className="h-4 w-4" />
                    <span>Screenings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/analytics"}>
                  <Link href="/analytics" data-testid="nav-analytics">
                    <BarChart className="h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/pricing"}>
                  <Link href="/pricing" data-testid="nav-pricing">
                    <CreditCard className="h-4 w-4" />
                    <span>Pricing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/help"}>
                  <Link href="/help" data-testid="nav-help">
                    <BookOpen className="h-4 w-4" />
                    <span>Help</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center h-12 px-4 border-b border-border bg-background shrink-0">
            <SidebarTrigger data-testid="sidebar-trigger" />
          </header>
          <main className="flex-1 overflow-y-auto bg-muted/20">
            <div className="mx-auto max-w-6xl p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
