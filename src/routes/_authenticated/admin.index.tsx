import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, TrendingUp, UserCheck, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getEventLabel } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/admin/")({
  ssr: false,
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="p-6 md:p-10 space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white">Vue d'ensemble</h1>
        <p className="text-neutral-400 text-sm mt-1">Statistiques et activité de la plateforme</p>
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
      const { data: recentUsers } = await supabase.from("profiles").select("id").order("created_at", { ascending: false }).limit(7);
      return {
        users: usersCount ?? 0,
        events: eventsCount ?? 0,
        guests: guestsCount ?? 0,
        newThisWeek: recentUsers?.length ?? 0,
      };
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard icon={Users} label="Utilisateurs" value={stats?.users ?? 0} />
      <StatCard icon={UserCheck} label="Nouveaux (7j)" value={stats?.newThisWeek ?? 0} />
      <StatCard icon={Calendar} label="Événements" value={stats?.events ?? 0} />
      <StatCard icon={TrendingUp} label="Invités total" value={stats?.guests ?? 0} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <Card className="p-6 bg-neutral-900 border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400">{label}</p>
          <p className="font-display text-4xl mt-1 text-white">{value}</p>
        </div>
        <Icon className="h-10 w-10 text-gold/60" />
      </div>
    </Card>
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

  if (isLoading) return <div className="text-neutral-400">Chargement…</div>;

  return (
    <Card className="bg-neutral-900 border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h2 className="font-display text-xl text-white flex items-center gap-2">
          <Eye className="h-5 w-5 text-gold" />
          Tous les clients ({users?.length ?? 0})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-neutral-800/50">
              <th className="text-left p-3 font-medium text-neutral-300">Utilisateur</th>
              <th className="text-left p-3 font-medium text-neutral-300">Email</th>
              <th className="text-left p-3 font-medium text-neutral-300">Inscription</th>
              <th className="text-left p-3 font-medium text-neutral-300">Événements</th>
              <th className="text-left p-3 font-medium text-neutral-300">Invités</th>
              <th className="text-left p-3 font-medium text-neutral-300">Statut</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} className="h-8 w-8 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-xs">
                        {(user.full_name ?? user.email ?? "?")[0].toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-white">{user.full_name ?? "—"}</span>
                  </div>
                </td>
                <td className="p-3 text-neutral-400">{user.email ?? "—"}</td>
                <td className="p-3 text-neutral-400">
                  {format(new Date(user.created_at), "dd/MM/yyyy", { locale: fr })}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {user.events.length === 0 && <span className="text-neutral-500">Aucun</span>}
                    {user.events.map((evt) => (
                      <Badge key={evt.id} className="bg-gold/20 text-gold border-gold/30 text-[10px]">
                        {getEventLabel(evt.template_id)} — {evt.partner1_name}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="p-3 font-medium text-white">{user.totalGuests}</td>
                <td className="p-3">
                  {user.events.length > 0 ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Actif</Badge>
                  ) : (
                    <Badge className="bg-neutral-700 text-neutral-400 border-neutral-600">Inactif</Badge>
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
