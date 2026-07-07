import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Heart, Calendar, MapPin, Shirt, Clock } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [
      { title: "Vous êtes invité·e — Nuptio" },
      { name: "description", content: "Découvrez votre invitation de mariage et répondez en quelques clics." },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("get_invite_by_token", { _token: token });
      if (error) console.error(error);
      setInvite(data?.[0] ?? null);
      setLoading(false);
    })();
  }, [token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement…</div>;
  if (!invite) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <Heart className="h-10 w-10 text-gold" />
      <h1 className="font-display text-3xl mt-4">Invitation introuvable</h1>
      <p className="text-muted-foreground mt-2">Ce lien n'est pas valide ou a expiré.</p>
    </div>
  );

  const wedding_date_str = invite.wedding_date ? format(new Date(invite.wedding_date), "EEEE d MMMM yyyy", { locale: fr }) : "Date à venir";

  return (
    <div className={`min-h-screen bg-blush/30 pb-16 transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <header className="mx-auto max-w-2xl px-6 pt-8">
        <Logo size="sm" />
      </header>

      {/* Hero card */}
      <section className="mx-auto max-w-2xl px-6 mt-6">
        <Card className="p-10 md:p-14 border-gold/20 text-center bg-gradient-to-br from-white to-blush/40 shadow-xl">
          <p className="text-sm uppercase tracking-[0.4em] text-gold">Save the date</p>
          <p className="mt-8 text-lg text-muted-foreground">{invite.guest_name}, vous êtes cordialement invité·e au mariage de</p>
          <h1 className="font-display text-5xl md:text-6xl mt-6">{invite.partner1_name}</h1>
          <div className="font-display text-4xl md:text-5xl text-gold my-3">&</div>
          <h1 className="font-display text-5xl md:text-6xl">{invite.partner2_name}</h1>
          <div className="mt-8 h-px w-20 bg-gold mx-auto" />
          <p className="mt-6 font-display text-xl">{wedding_date_str}</p>
          {invite.custom_message && <p className="mt-8 italic text-muted-foreground max-w-md mx-auto">"{invite.custom_message}"</p>}
        </Card>
      </section>

      {/* Programme */}
      <section className="mx-auto max-w-2xl px-6 mt-8">
        <Card className="p-8 border-border/60">
          <h2 className="font-display text-2xl mb-6 flex items-center gap-2"><Calendar className="h-5 w-5 text-gold" /> Programme</h2>
          <div className="space-y-6 relative">
            {invite.venue_ceremony && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-gold text-white flex items-center justify-center"><Clock className="h-4 w-4" /></div>
                  {invite.venue_reception && <div className="w-px flex-1 bg-gold/30 mt-2" />}
                </div>
                <div className="pb-6">
                  <div className="text-sm text-gold font-medium">{invite.ceremony_time || "Horaire à venir"}</div>
                  <div className="font-display text-lg mt-1">Cérémonie</div>
                  <div className="text-muted-foreground text-sm mt-1 flex items-start gap-1"><MapPin className="h-3.5 w-3.5 mt-0.5" />{invite.venue_ceremony}</div>
                </div>
              </div>
            )}
            {invite.venue_reception && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-gold text-white flex items-center justify-center"><Clock className="h-4 w-4" /></div>
                </div>
                <div>
                  <div className="text-sm text-gold font-medium">{invite.reception_time || "Horaire à venir"}</div>
                  <div className="font-display text-lg mt-1">Réception</div>
                  <div className="text-muted-foreground text-sm mt-1 flex items-start gap-1"><MapPin className="h-3.5 w-3.5 mt-0.5" />{invite.venue_reception}</div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </section>

      {invite.map_url && (
        <section className="mx-auto max-w-2xl px-6 mt-6">
          <Card className="p-2 border-border/60 overflow-hidden">
            <iframe src={invite.map_url} className="w-full aspect-video rounded-lg" loading="lazy" />
          </Card>
        </section>
      )}

      {invite.dress_code && (
        <section className="mx-auto max-w-2xl px-6 mt-6">
          <Card className="p-6 border-border/60">
            <h2 className="font-display text-xl flex items-center gap-2"><Shirt className="h-5 w-5 text-gold" /> Dress code</h2>
            <p className="mt-2 text-lg">{invite.dress_code}</p>
          </Card>
        </section>
      )}

      {/* RSVP */}
      <section className="mx-auto max-w-2xl px-6 mt-6">
        <RsvpForm token={token} existing={invite.existing_response} wedding={invite} />
      </section>

      {invite.faq && Array.isArray(invite.faq) && invite.faq.length > 0 && (
        <section className="mx-auto max-w-2xl px-6 mt-6">
          <Card className="p-6 border-border/60">
            <h2 className="font-display text-xl mb-4">Questions fréquentes</h2>
            {(invite.faq as any[]).map((f, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="font-medium">{f.q}</div>
                <p className="text-sm text-muted-foreground mt-1">{f.a}</p>
              </div>
            ))}
          </Card>
        </section>
      )}

      <footer className="text-center mt-10 text-xs text-muted-foreground">
        Invitation créée avec <span className="text-gold">Nuptio</span>
      </footer>
    </div>
  );
}

function RsvpForm({ token, existing, wedding }: { token: string; existing: any; wedding: any }) {
  const [attending, setAttending] = useState<string>(existing?.attending ?? "yes");
  const [number, setNumber] = useState<number>(existing?.number_of_people ?? 1);
  const [menu, setMenu] = useState<string>(existing?.menu_choice ?? "");
  const [allergies, setAllergies] = useState<string>(existing?.allergies ?? "");
  const [message, setMessage] = useState<string>(existing?.message ?? "");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(!!existing);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.rpc("submit_rsvp", {
      _token: token,
      _attending: attending,
      _number_of_people: number,
      _menu_choice: menu || null,
      _allergies: allergies || null,
      _message: message || null,
    });
    setSaving(false);
    if (error) return toast.error("Erreur : " + error.message);
    toast.success("Merci pour votre réponse !");
    setDone(true);
  }

  function addToCalendar() {
    if (!wedding.wedding_date) return;
    const d = wedding.wedding_date.replace(/-/g, "");
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Mariage ${wedding.partner1_name} & ${wedding.partner2_name}\nDTSTART;VALUE=DATE:${d}\nDTEND;VALUE=DATE:${d}\nLOCATION:${wedding.venue_ceremony ?? ""}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "mariage.ics"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="p-6 md:p-8 border-gold/30 bg-white">
      <h2 className="font-display text-2xl text-center">Répondez à l'invitation</h2>
      {done && <p className="text-center text-emerald-700 mt-2 text-sm">Votre réponse a été enregistrée ✓ Vous pouvez la modifier.</p>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label className="text-base">Serez-vous présent·e ?</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[{ v: "yes", l: "Oui" }, { v: "no", l: "Non" }, { v: "maybe", l: "Peut-être" }].map((o) => (
              <button type="button" key={o.v} onClick={() => setAttending(o.v)}
                className={`py-3 rounded-lg border-2 text-lg transition ${attending === o.v ? "border-gold bg-gold/10 text-gold font-medium" : "border-border"}`}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
        {attending === "yes" && (
          <>
            <div>
              <Label className="text-base">Combien serez-vous ?</Label>
              <Input type="number" min={1} max={10} value={number} onChange={(e) => setNumber(Number(e.target.value))} className="text-lg h-12" />
            </div>
            <div>
              <Label className="text-base">Choix du menu</Label>
              <Select value={menu} onValueChange={setMenu}>
                <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="viande">Viande</SelectItem>
                  <SelectItem value="poisson">Poisson</SelectItem>
                  <SelectItem value="vegetarien">Végétarien</SelectItem>
                  <SelectItem value="halal">Halal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-base">Allergies</Label>
              <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} className="text-lg h-12" placeholder="Aucune" /></div>
          </>
        )}
        <div><Label className="text-base">Un mot pour les mariés (optionnel)</Label>
          <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
        <div className="flex flex-col gap-2 pt-2">
          <Button type="submit" disabled={saving} size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 h-14 text-lg">
            {saving ? "Envoi…" : "Envoyer ma réponse"}
          </Button>
          {wedding.wedding_date && (
            <Button type="button" variant="outline" onClick={addToCalendar} size="lg" className="h-12">
              <Calendar className="h-4 w-4 mr-2" /> Ajouter à mon calendrier
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}