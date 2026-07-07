import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, TrendingUp, ShieldCheck, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getEventLabel } from "@/lib/constants";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/dashboard/admin")({
  component: AdminPanel,
});

function AdminPanel() {
  const { data: isAdmin, isLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) return <div className="p-8 text-muted-foreground">Vérification…</div>;
  if (!isAdmin) return null;

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-gold" />
        <div>
          <h1 className="font-display text-3xl">Panel Administrateur</h1>
          <p className="text-muted-foreground text-sm">Vue globale de tous les utilisateurs et événements</p>
        </div>
      </div>

      <AdminStats />
      <AdminUsersTable />
    </div>
  );
}

function AdminStats() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { count: eventsCount } = await supabase.from("weddings").select("*", { count: "exact", head: true });
      const { count: guestsCount } = await supabase.from("guests").select("*", { count: "exact", head: true });
      return {
        users: usersCount ?? 0,
        events: eventsCount ?? 0,
        guests: guestsCount ?? 0,
      };
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6 border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Utilisateurs</p>
            <p className="font-display text-4xl mt-1 text-ink">{stats?.users ?? 0}</p>
          </div>
          <Users className="h-10 w-10 text-gold/40" />
        </div>
      </Card>
      <Card className="p-6 border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Événements créés</p>
            <p className="font-display text-4xl mt-1 text-ink">{stats?.events ?? 0}</p>
          </div>
          <Calendar className="h-10 w-10 text-gold/40" />
        </div>
      </Card>
      <Card className="p-6 border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Invités total</p>
            <p className="font-display text-4xl mt-1 text-ink">{stats?.guests ?? 0}</p>
          </div>
          <TrendingUp className="h-10 w-10 text-gold/40" />
        </div>
      </Card>
    </div>
  );
}

function AdminUsersTable() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: events } = await supabase
        .from("weddings")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: guestCounts } = await supabase
        .from("guests")
        .select("wedding_id");

      return (profiles ?? []).map((profile) => {
        const userEvents = (events ?? []).filter((e) => e.user_id === profile.id);
        const totalGuests = userEvents.reduce((acc, evt) => {
          return acc + (guestCounts ?? []).filter((g) => g.wedding_id === evt.id).length;
        }, 0);
        return {
          ...profile,
          events: userEvents,
          totalGuests,
        };
      });
    },
  });

  if (isLoading) return <div className="text-muted-foreground">Chargement des utilisateurs…</div>;

  return (
    <Card className="border-border/60 overflow-hidden">
      <div className="p-4 border-b border-border/60 bg-blush/20">
        <h2 className="font-display text-xl flex items-center gap-2">
          <Eye className="h-5 w-5 text-gold" />
          Tous les clients ({users?.length ?? 0})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="text-left p-3 font-medium">Utilisateur</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Inscription</th>
              <th className="text-left p-3 font-medium">Événements</th>
              <th className="text-left p-3 font-medium">Invités</th>
              <th className="text-left p-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-b border-border/40 hover:bg-blush/10 transition">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} className="h-8 w-8 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-xs">
                        {(user.full_name ?? user.email ?? "?")[0].toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium">{user.full_name ?? "—"}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{user.email ?? "—"}</td>
                <td className="p-3 text-muted-foreground">
                  {format(new Date(user.created_at), "dd/MM/yyyy", { locale: fr })}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {user.events.length === 0 && <span className="text-muted-foreground">Aucun</span>}
                    {user.events.map((evt) => (
                      <Badge key={evt.id} variant="secondary" className="text-[10px]">
                        {getEventLabel(evt.template_id)} — {evt.partner1_name}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="p-3 font-medium">{user.totalGuests}</td>
                <td className="p-3">
                  {user.events.length > 0 ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Actif</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Inactif</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
