import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding } from "@/hooks/useWedding";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/seating")({
  component: SeatingPage,
});

function SeatingPage() {
  const { data: wedding } = useWedding();
  const qc = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newCap, setNewCap] = useState(8);

  const { data: tables = [] } = useQuery({
    queryKey: ["tables", wedding?.id],
    enabled: !!wedding,
    queryFn: async () => {
      const { data } = await supabase.from("tables_seating").select("*").eq("wedding_id", wedding!.id).order("table_number");
      return data ?? [];
    },
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["guests-simple", wedding?.id],
    enabled: !!wedding,
    queryFn: async () => {
      const { data } = await supabase.from("guests").select("id, full_name").eq("wedding_id", wedding!.id);
      return data ?? [];
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["assignments", wedding?.id],
    enabled: !!wedding,
    queryFn: async () => {
      if (tables.length === 0) return [];
      const { data } = await supabase.from("table_assignments").select("*").in("table_id", tables.map((t: any) => t.id));
      return data ?? [];
    },
  });

  const assignedIds = new Set(assignments.map((a: any) => a.guest_id));
  const unassigned = guests.filter((g: any) => !assignedIds.has(g.id));

  async function addTable() {
    if (!wedding || !newName) return;
    await supabase.from("tables_seating").insert({
      wedding_id: wedding.id,
      table_name: newName,
      capacity: newCap,
      table_number: tables.length + 1,
    });
    setNewName("");
    qc.invalidateQueries({ queryKey: ["tables", wedding.id] });
  }

  async function assignGuest(tableId: string, guestId: string) {
    await supabase.from("table_assignments").delete().eq("guest_id", guestId);
    if (guestId !== "none") {
      const { error } = await supabase.from("table_assignments").insert({ table_id: tableId, guest_id: guestId });
      if (error) return toast.error(error.message);
    }
    qc.invalidateQueries({ queryKey: ["assignments", wedding?.id] });
  }

  async function unassign(guestId: string) {
    await supabase.from("table_assignments").delete().eq("guest_id", guestId);
    qc.invalidateQueries({ queryKey: ["assignments", wedding?.id] });
  }

  async function removeTable(id: string) {
    await supabase.from("tables_seating").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["tables", wedding?.id] });
    qc.invalidateQueries({ queryKey: ["assignments", wedding?.id] });
  }

  if (!wedding) return <div className="p-8 text-muted-foreground">Créez d'abord votre mariage.</div>;

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl mb-6">Plan de table</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card className="p-4 border-border/60 flex items-end gap-2">
            <div className="flex-1"><label className="text-xs text-muted-foreground">Nom de la table</label>
              <Input placeholder="Ex : Table des Roses" value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
            <div className="w-24"><label className="text-xs text-muted-foreground">Places</label>
              <Input type="number" min={1} value={newCap} onChange={(e) => setNewCap(Number(e.target.value))} /></div>
            <Button onClick={addTable} className="bg-gold text-gold-foreground hover:bg-gold/90"><Plus className="h-4 w-4" /></Button>
          </Card>

          {tables.map((t: any) => {
            const seated = assignments.filter((a: any) => a.table_id === t.id);
            return (
              <Card key={t.id} className="p-5 border-border/60">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display text-lg">{t.table_name}</h3>
                    <p className="text-xs text-muted-foreground">{seated.length} / {t.capacity} places</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeTable(t.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-2">
                  {seated.map((a: any) => {
                    const g = guests.find((x: any) => x.id === a.guest_id);
                    return (
                      <div key={a.id} className="flex items-center justify-between text-sm bg-blush/30 rounded px-3 py-2">
                        <span>{g?.full_name ?? "Invité"}</span>
                        <Button variant="ghost" size="sm" onClick={() => unassign(a.guest_id)}>Retirer</Button>
                      </div>
                    );
                  })}
                  <Select value="none" onValueChange={(v) => assignGuest(t.id, v)}>
                    <SelectTrigger><SelectValue placeholder="+ Ajouter un invité" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" disabled>Sélectionner…</SelectItem>
                      {unassigned.map((g: any) => <SelectItem key={g.id} value={g.id}>{g.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            );
          })}
          {tables.length === 0 && <p className="text-muted-foreground text-sm">Aucune table. Créez-en une pour commencer.</p>}
        </div>

        <Card className="p-5 border-border/60 h-fit lg:sticky lg:top-6">
          <h3 className="font-display text-lg mb-3">Non placés ({unassigned.length})</h3>
          <div className="space-y-1 max-h-96 overflow-auto">
            {unassigned.map((g: any) => (
              <div key={g.id} className="text-sm px-2 py-1.5 rounded bg-muted/50">{g.full_name}</div>
            ))}
            {unassigned.length === 0 && <p className="text-xs text-muted-foreground">Tous les invités sont placés.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}