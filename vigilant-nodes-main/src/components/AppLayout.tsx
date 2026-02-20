import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, LayoutDashboard, User, HelpCircle, Settings, LogOut, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/profile", label: "Profile", icon: User },
  { path: "/help", label: "Help & Support", icon: HelpCircle },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
          {/* Header with logo */}
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-bold text-sidebar-foreground font-mono tracking-tight truncate">
                  MULE<span className="text-primary">DETECT</span>
                </span>
                <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest truncate">
                  Detection Platform
                </span>
              </div>
            </div>
          </SidebarHeader>

          {/* Navigation */}
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={location.pathname === item.path}
                        onClick={() => navigate(item.path)}
                        className={
                          location.pathname === item.path
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "hover:bg-secondary/60"
                        }
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Footer with user info + logout */}
          <SidebarFooter className="p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-medium text-sidebar-foreground truncate">
                  {user?.name || "User"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {user?.email || ""}
                </span>
              </div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Logout"
                  onClick={() => { logout(); navigate("/login"); }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="cyber-grid">
          {/* Top bar */}
          <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                {navItems.find((i) => i.path === location.pathname)?.label || ""}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-mono text-success font-medium">System Active</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/15">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-mono text-primary font-medium">v2.0</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 md:p-6 max-w-6xl mx-auto w-full">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="border-t border-border py-4 px-4 mt-auto">
            <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Money Muling Detection Platform — Graph-Based Financial Crime Analysis</span>
              <span>Built with React + Cytoscape.js</span>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
