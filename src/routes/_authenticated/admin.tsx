import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAdmin } from "@/hooks/useAdmin";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { data: isAdmin, isLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Vérification des accès…</div>;
  if (!isAdmin) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-neutral-950 text-white">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-white/10 flex items-center gap-3 px-6 bg-neutral-900">
            <SidebarTrigger className="text-white hover:text-gold" />
            <div className="flex-1">
              <div className="font-display text-lg text-white">Nuptio <span className="text-gold">Admin</span></div>
              <div className="text-xs text-neutral-400">Panneau d'administration</div>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-neutral-950">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
