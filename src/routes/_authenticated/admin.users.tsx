import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getEventLabel } from "@/lib/constants";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  ssr: false,
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-all-users"],
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
        return { ...profile, events: userEvents, totalGuests };
      });
    },
  });

  const filtered = (users ?? []).filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">Utilisateurs</h1>
          <p className="text-neutral-400 text-sm mt-1">{users?.length ?? 0} utilisateurs inscrits</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-neutral-800 border-white/10 text-white placeholder:text-neutral-500 w-64"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-neutral-400">Chargement…</div>
      ) : (
        <Card className="bg-neutral-900 border-white/10 overflow-hidden">
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
                {filtered.map((user) => (
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
                        {user.events.map((evt: any) => (
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
      )}
    </div>
  );
}
