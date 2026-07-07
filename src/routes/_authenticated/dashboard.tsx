import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useWedding } from "@/hooks/useWedding";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { data: wedding } = useWedding();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border/60 flex items-center gap-3 px-4 bg-white">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              {wedding ? (
                <div>
                  <div className="font-display text-lg truncate">
                    {wedding.partner1_name} <span className="text-gold">&</span> {wedding.partner2_name}
                  </div>
                  {wedding.wedding_date && (
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(wedding.wedding_date), "d MMMM yyyy", { locale: fr })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="font-display text-lg">Bienvenue sur Nuptio</div>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}