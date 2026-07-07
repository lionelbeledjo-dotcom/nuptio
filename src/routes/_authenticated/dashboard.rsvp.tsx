import { createFileRoute } from "@tanstack/react-router";
import { useWedding } from "@/hooks/useWedding";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/rsvp")({
  ssr: false,
  component: RsvpPage,
});

function RsvpPage() {
  const { data: wedding } = useWedding();
  const { data } = useQuery({
    queryKey: ["rsvp-full", wedding?.id],
    enabled: !!wedding,
    queryFn: async () => {
      const { data: guests } = await supabase
        .from("guests")
        .select("id, full_name, rsvp_responses(attending, number_of_people, menu_choice, allergies, message, responded_at)")
        .eq("wedding_id", wedding!.id);
      return guests ?? [];
    },
  });

  if (!wedding) return <div className="p-8 text-muted-foreground">Créez d'abord votre mariage.</div>;

  const yes = data?.filter((g: any) => g.rsvp_responses[0]?.attending === "yes").length ?? 0;
  const no = data?.filter((g: any) => g.rsvp_responses[0]?.attending === "no").length ?? 0;
  const pending = (data?.length ?? 0) - yes - no;

  const chartData = [
    { name: "Confirmés", value: yes, color: "#10b981" },
    { name: "En attente", value: pending, color: "#f59e0b" },
    { name: "Déclinés", value: no, color: "#f43f5e" },
  ];

  const responded = data?.filter((g: any) => g.rsvp_responses.length > 0) ?? [];

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">RSVP</h1>
        <Button variant="outline" onClick={() => toast.success("Relance envoyée (simulée)")}>Relancer les non-répondants</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 border-border/60">
          <h2 className="font-display text-xl mb-4">Répartition</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={4}>
                  {chartData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-border/60">
          <h2 className="font-display text-xl mb-4">Résumé</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Total invités</span><b>{data?.length ?? 0}</b></li>
            <li className="flex justify-between text-emerald-700"><span>Confirmés</span><b>{yes}</b></li>
            <li className="flex justify-between text-amber-700"><span>En attente</span><b>{pending}</b></li>
            <li className="flex justify-between text-rose-700"><span>Déclinés</span><b>{no}</b></li>
          </ul>
        </Card>
      </div>

      <Card className="border-border/60 p-6">
        <h2 className="font-display text-xl mb-4">Réponses détaillées</h2>
        <div className="space-y-3">
          {responded.length === 0 && <p className="text-sm text-muted-foreground">Aucune réponse pour le moment.</p>}
          {responded.map((g: any) => {
            const r = g.rsvp_responses[0];
            return (
              <div key={g.id} className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-0">
                <div>
                  <div className="font-medium">{g.full_name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {r.number_of_people} pers. • {r.menu_choice || "menu non précisé"}
                    {r.allergies && ` • Allergies : ${r.allergies}`}
                  </div>
                  {r.message && <p className="mt-2 text-sm italic text-ink/70">"{r.message}"</p>}
                </div>
                <Badge className={r.attending === "yes" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : r.attending === "no" ? "bg-rose-100 text-rose-800 hover:bg-rose-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>
                  {r.attending === "yes" ? "Vient" : r.attending === "no" ? "Ne vient pas" : "Peut-être"}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}