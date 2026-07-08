import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/revenue")({
  ssr: false,
  component: AdminRevenuePage,
});

function AdminRevenuePage() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white">Revenus</h1>
        <p className="text-neutral-400 text-sm mt-1">Suivi du chiffre d'affaires</p>
      </div>

      <Card className="bg-neutral-900 border-white/10 p-8 text-center">
        <BarChart3 className="h-12 w-12 text-gold/40 mx-auto mb-4" />
        <h2 className="font-display text-xl text-white">Module en construction</h2>
        <p className="text-neutral-400 mt-2 text-sm max-w-md mx-auto">
          Les statistiques de revenus apparaîtront ici une fois les abonnements et paiements activés.
        </p>
      </Card>
    </div>
  );
}
