import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWedding, useInvalidateWedding } from "@/hooks/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/invitation")({
  component: InvitationPage,
});

const TEMPLATES = [
  { id: "classique", name: "Classique", tone: "from-[#F5E6E0] to-white" },
  { id: "boheme", name: "Bohème", tone: "from-amber-50 to-orange-100" },
  { id: "minimaliste", name: "Minimaliste", tone: "from-neutral-50 to-neutral-200" },
  { id: "floral", name: "Floral", tone: "from-rose-50 to-pink-100" },
  { id: "oriental", name: "Oriental", tone: "from-amber-100 to-yellow-200" },
  { id: "africain", name: "Africain", tone: "from-orange-100 to-red-200" },
  { id: "champetre", name: "Champêtre", tone: "from-lime-50 to-emerald-100" },
  { id: "luxe", name: "Luxe", tone: "from-neutral-900 to-neutral-700 text-white" },
  { id: "romantique", name: "Romantique", tone: "from-pink-100 to-rose-200" },
  { id: "moderne", name: "Moderne", tone: "from-slate-100 to-slate-200" },
  { id: "vintage", name: "Vintage", tone: "from-yellow-100 to-amber-200" },
  { id: "nature", name: "Nature", tone: "from-green-100 to-teal-200" },
];

function InvitationPage() {
  const { data: wedding } = useWedding();
  const invalidate = useInvalidateWedding();
  const [form, setForm] = useState({
    partner1_name: "", partner2_name: "", wedding_date: "",
    venue_ceremony: "", custom_message: "", template_id: "classique",
  });

  useEffect(() => {
    if (wedding) {
      setForm({
        partner1_name: wedding.partner1_name ?? "",
        partner2_name: wedding.partner2_name ?? "",
        wedding_date: wedding.wedding_date ?? "",
        venue_ceremony: wedding.venue_ceremony ?? "",
        custom_message: wedding.custom_message ?? "",
        template_id: wedding.template_id ?? "classique",
      });
    }
  }, [wedding]);

  if (!wedding) return <div className="p-8 text-muted-foreground">Créez d'abord votre mariage depuis le tableau de bord.</div>;

  async function save() {
    if (!wedding) return;
    const { error } = await supabase.from("weddings").update(form).eq("id", wedding.id);
    if (error) return toast.error(error.message);
    toast.success("Invitation enregistrée");
    invalidate();
  }

  const template = TEMPLATES.find((t) => t.id === form.template_id) ?? TEMPLATES[0];

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl">Mon invitation</h1>
        <p className="text-muted-foreground mt-1">Choisissez un template et personnalisez le contenu.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Card className="p-6 border-border/60">
            <h2 className="font-display text-xl mb-4">Template</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => setForm({ ...form, template_id: t.id })}
                  className={`relative aspect-[3/4] rounded-xl bg-gradient-to-br ${t.tone} border-2 transition ${form.template_id === t.id ? "border-gold" : "border-transparent hover:border-gold/40"} p-3 flex flex-col items-center justify-center`}>
                  {form.template_id === t.id && <Check className="absolute top-2 right-2 h-4 w-4 text-gold bg-white rounded-full p-0.5" />}
                  <span className="text-[10px] uppercase tracking-widest opacity-70">{t.name}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-border/60 space-y-4">
            <h2 className="font-display text-xl">Contenu</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Prénom 1</Label><Input value={form.partner1_name} onChange={(e) => setForm({ ...form, partner1_name: e.target.value })} /></div>
              <div><Label>Prénom 2</Label><Input value={form.partner2_name} onChange={(e) => setForm({ ...form, partner2_name: e.target.value })} /></div>
            </div>
            <div><Label>Date</Label><Input type="date" value={form.wedding_date ?? ""} onChange={(e) => setForm({ ...form, wedding_date: e.target.value })} /></div>
            <div><Label>Lieu de cérémonie</Label><Input value={form.venue_ceremony} onChange={(e) => setForm({ ...form, venue_ceremony: e.target.value })} /></div>
            <div><Label>Message personnel</Label><Textarea rows={4} value={form.custom_message} onChange={(e) => setForm({ ...form, custom_message: e.target.value })} /></div>
            <Button onClick={save} className="bg-gold text-gold-foreground hover:bg-gold/90">Enregistrer</Button>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Aperçu</p>
          <div className={`aspect-[9/16] rounded-3xl bg-gradient-to-br ${template.tone} shadow-xl border border-white/60 p-8 flex flex-col items-center justify-center text-center`}>
            <div className="text-[10px] uppercase tracking-[0.4em] opacity-70">Save the date</div>
            <div className="mt-6 font-display text-3xl">{form.partner1_name || "Prénom 1"}</div>
            <div className="font-display text-3xl text-gold my-1">&</div>
            <div className="font-display text-3xl">{form.partner2_name || "Prénom 2"}</div>
            <div className="mt-4 h-px w-16 bg-gold" />
            <div className="mt-4 text-sm opacity-80">
              {form.wedding_date ? format(new Date(form.wedding_date), "d MMMM yyyy", { locale: fr }) : "Date à venir"}
            </div>
            <div className="mt-2 text-sm opacity-70">{form.venue_ceremony || "Lieu à définir"}</div>
            {form.custom_message && <p className="mt-6 text-xs italic opacity-70 max-w-[80%]">"{form.custom_message}"</p>}
          </div>
        </div>
      </div>
    </div>
  );
}