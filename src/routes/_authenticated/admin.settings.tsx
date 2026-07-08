import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_EMAILS } from "@/lib/constants";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  ssr: false,
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white">Paramètres Admin</h1>
        <p className="text-neutral-400 text-sm mt-1">Configuration de la plateforme</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-neutral-900 border-white/10 p-6 space-y-4">
          <h2 className="font-display text-xl text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-gold" />
            Administrateurs
          </h2>
          <p className="text-neutral-400 text-sm">Emails ayant accès au panel admin :</p>
          <ul className="space-y-2">
            {ADMIN_EMAILS.map((email) => (
              <li key={email} className="flex items-center gap-2 text-sm text-white bg-neutral-800 rounded-lg px-3 py-2">
                <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold">
                  {email[0].toUpperCase()}
                </div>
                {email}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="bg-neutral-900 border-white/10 p-6 space-y-4">
          <h2 className="font-display text-xl text-white">Plateforme</h2>
          <div className="space-y-3">
            <div>
              <Label className="text-neutral-300">Nom de l'application</Label>
              <Input value="Nuptio" disabled className="bg-neutral-800 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-neutral-300">Version</Label>
              <Input value="1.0.0" disabled className="bg-neutral-800 border-white/10 text-white" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
