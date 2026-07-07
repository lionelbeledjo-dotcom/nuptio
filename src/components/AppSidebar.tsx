import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Mail, Users, ClipboardCheck, LayoutGrid, Info, Settings, LogOut, ShieldCheck } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAdmin } from "@/hooks/useAdmin";

const items = [
  { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard, exact: true },
  { title: "Mon invitation", url: "/dashboard/invitation", icon: Mail },
  { title: "Mes invités", url: "/dashboard/guests", icon: Users },
  { title: "RSVP", url: "/dashboard/rsvp", icon: ClipboardCheck },
  { title: "Plan de table", url: "/dashboard/seating", icon: LayoutGrid },
  { title: "Infos pratiques", url: "/dashboard/info", icon: Info },
  { title: "Paramètres", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: isAdmin } = useAdmin();

  const isActive = (url: string, exact?: boolean) => (exact ? pathname === url : pathname === url || pathname.startsWith(url + "/"));

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!collapsed ? <Logo size="sm" /> : <div className="text-gold font-display text-xl text-center">N</div>}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard/admin")}>
                    <Link to="/dashboard/admin" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      {!collapsed && <span>Panel Admin</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Déconnexion</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
