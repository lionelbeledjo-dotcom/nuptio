import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useEvent } from "@/hooks/useEvent";
import { getEventLabel } from "@/lib/constants";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { data: event } = useEvent();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border/60 flex items-center gap-3 px-4 bg-white">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              {event ? (
                <div>
                  <div className="font-display text-lg truncate">
                    {event.partner1_name} <span className="text-gold">&</span> {event.partner2_name}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="bg-gold/10 text-gold px-2 py-0.5 rounded-full text-[10px] font-medium uppercase">
                      {getEventLabel(event.template_id)}
                    </span>
                    {event.wedding_date && (
                      <span>{format(new Date(event.wedding_date), "d MMMM yyyy", { locale: fr })}</span>
                    )}
                  </div>
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
