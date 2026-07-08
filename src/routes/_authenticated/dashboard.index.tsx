import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useEvent, useInvalidateEvent } from "@/hooks/useEvent";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, XCircle, Users, Calendar, Heart, Cake, Baby, Gift, Sparkles } from "lucide-react";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";
import { EVENT_TYPES, getEventLabels, type EventType } from "@/lib/constants";
import { PLAN_INFO, guestCap, type Plan, type PaymentStatus } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  ssr: false,
  component: DashboardHome,
});

function DashboardHome() {
  const { data: event, isLoading } = useEvent();
  if (isLoading) return <div className="p-8 text-muted-foreground">Chargement…</div>;
  if (!event) return <OnboardingForm />;
  return (
    <DashboardContent
      eventId={event.id}
      eventDate={event.wedding_date}
      plan={(event.plan ?? "free") as Plan}
      paymentStatus={(event.payment_status ?? "pending") as PaymentStatus}
    />
  );
}

const iconMap: Record<string, React.ElementType> = {
  Heart, Cake, Baby, Gift, Sparkles,
};

function OnboardingForm() {
  const invalidate = useInvalidateEvent();
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const labels = getEventLabels(eventType);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!eventType) return toast.error("Choisissez un type d'événement");
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase.from("weddings").insert({
      user_id: userData.user.id,
      partner1_name: p1,
      partner2_name: p2 || p1,
      wedding_date: date || null,
      template_id: eventType,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(`Votre ${labels.title} est créé !`);
    invalidate();
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="text-center mb-8">
        <Sparkles className="h-10 w-10 text-gold mx-auto" />
        <h1 className="font-display text-3xl mt-4">Créons votre événement</h1>
        <p className="text-muted-foreground mt-2">Quel type d'invitation souhaitez-vous créer ?</p>
      </div>

      {/* Event type selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {EVENT_TYPES.map((type) => {
          const Icon = iconMap[type.icon] ?? Sparkles;
          const isSelected = eventType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setEventType(type.id as EventType)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                isSelected
                  ? "border-gold bg-gold/5 shadow-md scale-[1.02]"
                  : "border-border/60 bg-white hover:border-gold/40 hover:bg-blush/20"
              }`}
            >
              <Icon className={`h-8 w-8 mx-auto mb-2 ${isSelected ? "text-gold" : type.color}`} />
              <span className={`text-sm font-medium ${isSelected ? "text-gold" : "text-ink"}`}>{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form appears after choosing type */}
      {eventType && (
        <Card className="p-6 border-border/60 animate-in fade-in slide-in-from-bottom-2">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>{labels.person1}</Label>
                <Input required value={p1} onChange={(e) => setP1(e.target.value)} placeholder="Prénom / Nom" />
              </div>
              <div>
                <Label>{labels.person2}</Label>
                <Input value={p2} onChange={(e) => setP2(e.target.value)} placeholder={eventType === "ceremony" ? "Optionnel" : "Prénom / Nom"} />
              </div>
            </div>
            <div>
              <Label>{labels.date}</Label>
              <Input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v && new Date(`${v}T00:00:00`) < new Date(new Date().toDateString())) {
                    toast.error("La date ne peut pas être dans le passé");
                    return;
                  }
                  setDate(v);
                }}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gold text-gold-foreground hover:bg-gold/90">
              {loading ? "Création…" : `Créer mon ${labels.title}`}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}

function DashboardContent({
  eventId,
  eventDate,
  plan,
  paymentStatus,
}: {
  eventId: string;
  eventDate: string | null;
  plan: Plan;
  paymentStatus: PaymentStatus;
}) {
  const { data: stats } = useQuery({
    queryKey: ["rsvp-stats", eventId],
    queryFn: async () => {
      const { data: guests } = await supabase.from("guests").select("id").eq("wedding_id", eventId);
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

  const parsedEventDate = eventDate ? new Date(`${eventDate}T00:00:00`) : null;
  const isValidDate = parsedEventDate && !isNaN(parsedEventDate.getTime());
  const rawCountdown = isValidDate ? differenceInDays(parsedEventDate, new Date()) : null;
  const isPast = rawCountdown !== null && rawCountdown < 0;
  const countdown = isPast ? null : rawCountdown;

  const cap = guestCap(plan, paymentStatus);
  const used = stats?.total ?? 0;
  const remaining = Math.max(0, cap - used);
  const planInfo = PLAN_INFO[plan];
  const isLocked = plan !== "free" && paymentStatus !== "paid";

  return (
    <div className="p-6 md:p-10 space-y-8">
      <Card className="p-8 bg-gradient-to-br from-blush/50 to-white border-gold/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Compte à rebours</p>
            {isPast ? (
              <>
                <div className="font-display text-4xl text-gold mt-2">Événement passé</div>
                <p className="text-sm text-muted-foreground mt-1">Merci d'avoir célébré avec Nuptio</p>
              </>
            ) : (
              <>
                <div className="font-display text-6xl text-gold mt-2">{countdown ?? "—"}</div>
                <p className="text-sm text-muted-foreground mt-1">jours avant le jour J</p>
              </>
            )}
          </div>
          <Calendar className="h-16 w-16 text-gold/40" />
        </div>
      </Card>

      <Card className="p-6 border-border/60">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Formule active</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`${planInfo.color} border-0 text-sm px-3 py-1`}>{planInfo.label}</Badge>
              {isLocked && (
                <Badge variant="outline" className="border-amber-500 text-amber-700">
                  Paiement en attente
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {used} / {cap} invités — {remaining} restant{remaining > 1 ? "s" : ""}
            </p>
            <div className="mt-2 h-2 w-64 max-w-full rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full bg-gold transition-all"
                style={{ width: `${Math.min(100, (used / cap) * 100)}%` }}
              />
            </div>
          </div>
          {plan !== "premium" && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground max-w-xs">
                Pour passer à une formule supérieure, contactez-nous — l'activation est
                effectuée manuellement depuis l'espace admin.
              </p>
              <a
                href="mailto:contact@nuptio.app?subject=Passer%20à%20Premium"
                className="inline-block mt-2 text-sm text-gold hover:underline"
              >
                Passer à Premium →
              </a>
            </div>
          )}
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
            { done: true, label: "Créer votre événement" },
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
