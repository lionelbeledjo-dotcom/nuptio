import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding } from "@/hooks/useWedding";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Copy, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/guests")({
  component: GuestsPage,
});

const GROUPS = [
  { value: "famille_mariee", label: "Famille marié·e 1" },
  { value: "famille_marie", label: "Famille marié·e 2" },
  { value: "amis", label: "Amis" },
  { value: "collegues", label: "Collègues" },
  { value: "vip", label: "VIP" },
];

function GuestsPage() {
  const { data: wedding } = useWedding();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", group_label: "amis" });

  const { data: rows = [] } = useQuery({
    queryKey: ["guests", wedding?.id],
    enabled: !!wedding,
    queryFn: async () => {
      const { data } = await supabase
        .from("guests")
        .select("*, rsvp_responses(attending, menu_choice)")
        .eq("wedding_id", wedding!.id)
        .order("created_at");
      return data ?? [];
    },
  });

  const filtered = rows.filter((r: any) => {
    if (filterGroup !== "all" && r.group_label !== filterGroup) return false;
    if (filterStatus !== "all") {
      const status = r.rsvp_responses?.[0]?.attending ?? "pending";
      if (status !== filterStatus) return false;
    }
    return true;
  });

  async function addGuest() {
    if (!wedding || !form.full_name) return;
    const { error } = await supabase.from("guests").insert({ ...form, wedding_id: wedding.id });
    if (error) return toast.error(error.message);
    toast.success("Invité ajouté");
    setForm({ full_name: "", email: "", phone: "", group_label: "amis" });
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["guests", wedding.id] });
  }

  async function deleteGuest(id: string) {
    await supabase.from("guests").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["guests", wedding?.id] });
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié dans le presse-papier");
  }

  async function importCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !wedding) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const guests = lines.slice(1).map((line) => {
      const [full_name, email, phone, group_label] = line.split(",").map((s) => s?.trim().replace(/^"|"$/g, ""));
      return { full_name, email: email || null, phone: phone || null, group_label: group_label || "amis", wedding_id: wedding.id };
    }).filter((g) => g.full_name);
    if (guests.length === 0) return toast.error("CSV vide");
    const { error } = await supabase.from("guests").insert(guests);
    if (error) return toast.error(error.message);
    toast.success(`${guests.length} invités importés`);
    qc.invalidateQueries({ queryKey: ["guests", wedding.id] });
  }

  if (!wedding) return <div className="p-8 text-muted-foreground">Créez d'abord votre mariage.</div>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Mes invités</h1>
          <p className="text-muted-foreground text-sm mt-1">{rows.length} invité{rows.length > 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <label>
            <input type="file" accept=".csv" className="hidden" onChange={importCSV} />
            <Button variant="outline" asChild><span><Upload className="h-4 w-4 mr-2" />Importer CSV</span></Button>
          </label>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold text-gold-foreground hover:bg-gold/90"><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouvel invité</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Nom complet</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Téléphone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Groupe</Label>
                  <Select value={form.group_label} onValueChange={(v) => setForm({ ...form, group_label: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{GROUPS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button onClick={addGuest} className="bg-gold text-gold-foreground hover:bg-gold/90">Ajouter</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Groupe" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les groupes</SelectItem>
            {GROUPS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="yes">Confirmé</SelectItem>
            <SelectItem value="no">Décliné</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Groupe</TableHead>
              <TableHead>RSVP</TableHead>
              <TableHead>Menu</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">Aucun invité</TableCell></TableRow>
            )}
            {filtered.map((g: any) => {
              const resp = g.rsvp_responses?.[0];
              const status = resp?.attending ?? "pending";
              return (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.full_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{g.email || g.phone || "—"}</TableCell>
                  <TableCell><span className="text-xs">{GROUPS.find(x => x.value === g.group_label)?.label ?? g.group_label}</span></TableCell>
                  <TableCell>
                    <Badge variant={status === "yes" ? "default" : status === "no" ? "destructive" : "secondary"}
                      className={status === "yes" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}>
                      {status === "yes" ? "Confirmé" : status === "no" ? "Décliné" : "En attente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{resp?.menu_choice || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => copyLink(g.invite_token)}><Copy className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteGuest(g.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}