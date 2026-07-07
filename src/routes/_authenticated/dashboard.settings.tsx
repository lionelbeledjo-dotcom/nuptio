import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setEmail(data.user.email ?? "");
      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", data.user.id).maybeSingle();
      setFullName(p?.full_name ?? "");
    })();
  }, []);

  async function save() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", data.user.id);
    toast.success("Profil mis à jour");
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <h1 className="font-display text-3xl mb-6">Paramètres</h1>
      <Card className="p-6 border-border/60 space-y-4">
        <div><Label>Email</Label><Input value={email} disabled /></div>
        <div><Label>Nom complet</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <Button onClick={save} className="bg-gold text-gold-foreground hover:bg-gold/90">Enregistrer</Button>
          <Button variant="outline" onClick={signOut}>Se déconnecter</Button>
        </div>
      </Card>
    </div>
  );
}