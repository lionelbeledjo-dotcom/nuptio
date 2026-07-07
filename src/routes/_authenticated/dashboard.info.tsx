import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWedding, useInvalidateWedding } from "@/hooks/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/info")({
  ssr: false,
  component: InfoPage,
});

type Faq = { q: string; a: string };

function InfoPage() {
  const { data: wedding } = useWedding();
  const invalidate = useInvalidateWedding();
  const [form, setForm] = useState({
    venue_ceremony: "", venue_reception: "", ceremony_time: "", reception_time: "",
    dress_code: "", map_url: "",
  });
  const [faq, setFaq] = useState<Faq[]>([]);

  const { data: firstGuest } = useQuery({
    queryKey: ["first-guest", wedding?.id],
    enabled: !!wedding,
    queryFn: async () => {
      const { data } = await supabase
        .from("guests")
        .select("invite_token")
        .eq("wedding_id", wedding!.id)
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (wedding) {
      setForm({
        venue_ceremony: wedding.venue_ceremony ?? "",
        venue_reception: wedding.venue_reception ?? "",
        ceremony_time: wedding.ceremony_time ?? "",
        reception_time: wedding.reception_time ?? "",
        dress_code: wedding.dress_code ?? "",
        map_url: wedding.map_url ?? "",
      });
      setFaq(Array.isArray(wedding.faq) ? (wedding.faq as any) : []);
    }
  }, [wedding]);

  if (!wedding) return <div className="p-8 text-muted-foreground">Créez d'abord votre événement.</div>;

  async function save() {
    if (!wedding) return;
    const { error } = await supabase.from("weddings").update({ ...form, faq }).eq("id", wedding.id);
    if (error) return toast.error(error.message);
    toast.success("Infos enregistrées");
    invalidate();
  }

  const previewUrl = firstGuest?.invite_token
    ? `${window.location.origin}/invite/${firstGuest.invite_token}`
    : null;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Infos pratiques</h1>
          <p className="text-muted-foreground text-sm mt-1">Ce que verront vos invités sur leur page.</p>
        </div>
        {previewUrl ? (
          <Button variant="outline" asChild>
            <a href={previewUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-2" />Aperçu invité</a>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            <ExternalLink className="h-4 w-4 mr-2" />Aperçu invité (ajoutez un invité d'abord)
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="p-6 border-border/60 space-y-4">
          <h2 className="font-display text-xl">Lieux & horaires</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Lieu cérémonie</Label><Input value={form.venue_ceremony} onChange={(e) => setForm({ ...form, venue_ceremony: e.target.value })} /></div>
            <div><Label>Horaire</Label><Input placeholder="15h00" value={form.ceremony_time} onChange={(e) => setForm({ ...form, ceremony_time: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Lieu réception</Label><Input value={form.venue_reception} onChange={(e) => setForm({ ...form, venue_reception: e.target.value })} /></div>
            <div><Label>Horaire</Label><Input placeholder="19h00" value={form.reception_time} onChange={(e) => setForm({ ...form, reception_time: e.target.value })} /></div>
          </div>
          <div><Label>Dress code</Label><Input value={form.dress_code} onChange={(e) => setForm({ ...form, dress_code: e.target.value })} /></div>
          <div><Label>URL Google Maps (embed)</Label>
            <Input placeholder="https://www.google.com/maps/embed?..." value={form.map_url} onChange={(e) => setForm({ ...form, map_url: e.target.value })} />
          </div>
        </Card>

        <Card className="p-6 border-border/60 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">FAQ</h2>
            <Button size="sm" variant="outline" onClick={() => setFaq([...faq, { q: "", a: "" }])}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
          </div>
          {faq.length === 0 && <p className="text-sm text-muted-foreground">Aucune question ajoutée.</p>}
          {faq.map((f, i) => (
            <div key={i} className="space-y-2 border-b border-border/60 pb-4 last:border-0">
              <div className="flex gap-2">
                <Input placeholder="Question" value={f.q} onChange={(e) => setFaq(faq.map((x, j) => j === i ? { ...x, q: e.target.value } : x))} />
                <Button variant="ghost" size="icon" onClick={() => setFaq(faq.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <Textarea placeholder="Réponse" rows={2} value={f.a} onChange={(e) => setFaq(faq.map((x, j) => j === i ? { ...x, a: e.target.value } : x))} />
            </div>
          ))}
        </Card>
      </div>

      <div className="mt-6"><Button onClick={save} className="bg-gold text-gold-foreground hover:bg-gold/90">Enregistrer</Button></div>
    </div>
  );
}
