import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWedding, useInvalidateWedding } from "@/hooks/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, XCircle, Heart, Users, Calendar } from "lucide-react";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { data: wedding, isLoading } = useWedding();

  if (isLoading) return <div className="p-8 text-muted-foreground">Chargement…</div>;
  if (!wedding) return <OnboardingForm />;
  return <DashboardContent weddingId={wedding.id} weddingDate={wedding.wedding_date} />;
}

function OnboardingForm() {
  const invalidate = useInvalidateWedding();
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase.from("weddings").insert({
      user_id: userData.user.id,
      partner1_name: p1,
      partner2_name: p2,
      wedding_date: date || null,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Votre mariage est créé !");
    invalidate();
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <div className="text-center mb-8">
        <Heart className="h-10 w-10 text-gold mx-auto" />
        <h1 className="font-display text-3xl mt-4">Créons votre mariage</h1>
        <p className="text-muted-foreground mt-2">Renseignez les infos de base pour commencer.</p>
      </div>
      <Card className="p-6 border-border/60">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Prénom marié·e 1</Label><Input required value={p1} onChange={(e) => setP1(e.target.value)} /></div>
            <div><Label>Prénom marié·e 2</Label><Input required value={p2} onChange={(e) => setP2(e.target.value)} /></div>
          </div>
          <div><Label>Date du mariage</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <Button type="submit" disabled={loading} className="w-full bg-gold text-gold-foreground hover:bg-gold/90">
            {loading ? "Création…" : "Créer mon mariage"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function DashboardContent({ weddingId, weddingDate }: { weddingId: string; weddingDate: string | null }) {
  const { data: stats } = useQuery({
    queryKey: ["rsvp-stats", weddingId],
    queryFn: async () => {
      const { data: guests } = await supabase.from("guests").select("id").eq("wedding_id", weddingId);
      const guestIds = (guests ?? []).map((g) => g.id);
      if (guestIds.length === 0) return { total: 0, yes: 0, no: 0, pending: 0 };
      const { data: responses } = await supabase.from("rsvp_responses").select("attending, guest_id").in("guest_id", guestIds);
      const yes = responses?.filter((r) => r.attending === "yes").length ?? 0;
      const no = responses?.filter((r) => r.attending === "no").length ?? 0;
      const responded = new Set(responses?.map((r) => r.guest_id));
      const pending = guestIds.length - responded.size;
      return { total: guestIds.length, yes, no, pending };
    },
  });

  const [countdown, setCountdown] = useState<number | null>(null);
  useEffect(() => {
    if (!weddingDate) return;
    setCountdown(differenceInDays(new Date(weddingDate), new Date()));
  }, [weddingDate]);

  return (
    <div className="p-6 md:p-10 space-y-8">
      <Card className="p-8 bg-gradient-to-br from-blush/50 to-white border-gold/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Compte à rebours</p>
            <div className="font-display text-6xl text-gold mt-2">{countdown ?? "—"}</div>
            <p className="text-sm text-muted-foreground mt-1">jours avant le grand jour</p>
          </div>
          <Calendar className="h-16 w-16 text-gold/40" />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Users} label="Invités" value={stats?.total ?? 0} color="text-ink" />
        <StatCard icon={CheckCircle2} label="Confirmés" value={stats?.yes ?? 0} color="text-emerald-600" />
        <StatCard icon={Clock} label="En attente" value={stats?.pending ?? 0} color="text-amber-600" />
        <StatCard icon={XCircle} label="Déclinés" value={stats?.no ?? 0} color="text-rose-600" />
      </div>

      <Card className="p-6 border-border/60">
        <h2 className="font-display text-2xl mb-4">Checklist rapide</h2>
        <ul className="space-y-3 text-sm">
          {[
            { done: true, label: "Créer votre mariage" },
            { done: false, label: "Personnaliser votre invitation", link: "/dashboard/invitation" },
            { done: false, label: "Ajouter vos invités", link: "/dashboard/guests" },
            { done: false, label: "Renseigner les infos pratiques", link: "/dashboard/info" },
            { done: false, label: "Créer votre plan de table", link: "/dashboard/seating" },
          ].map((item) => (
            <li key={item.label} className="flex items-center gap-3">
              <div className={`h-5 w-5 rounded-full border-2 ${item.done ? "bg-gold border-gold" : "border-muted-foreground/30"} flex items-center justify-center`}>
                {item.done && <CheckCircle2 className="h-3 w-3 text-white" />}
              </div>
              {item.link ? (
                <Link to={item.link} className="hover:text-gold">{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <Card className="p-5 border-border/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className={`font-display text-3xl mt-1 ${color}`}>{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color} opacity-40`} />
      </div>
    </Card>
  );
}