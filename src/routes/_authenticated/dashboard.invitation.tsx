import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useWedding, useInvalidateWedding } from "@/hooks/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileDown, QrCode, ImagePlus, X, ExternalLink } from "lucide-react";
import { TemplateGrid, EVENT_TYPES, TEMPLATES } from "@/components/templates/EventTemplates";
import { exportInvitationPdf } from "@/lib/exportPdf";
import { QRInvite } from "@/components/QRInvite";

export const Route = createFileRoute("/_authenticated/dashboard/invitation")({
  ssr: false,
  component: InvitationPage,
});

function InvitationPage() {
  const { data: wedding } = useWedding();
  const invalidate = useInvalidateWedding();

  const [eventType, setEventType] = useState("wedding");
  const [form, setForm] = useState({
    partner1_name: "",
    partner2_name: "",
    wedding_date: "",
    venue_ceremony: "",
    custom_message: "",
    template_id: "classique_royal",
  });
  const [customPhotos, setCustomPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [exporting, setExporting] = useState(false);

  const { data: firstGuest } = useQuery({
    queryKey: ["first-guest-invite", wedding?.id],
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
      // Try to parse event_type and photos from custom_message JSON
      let message = wedding.custom_message ?? "";
      let parsedEventType = "wedding";
      let parsedPhotos: string[] = [];

      try {
        const parsed = JSON.parse(message);
        if (parsed && typeof parsed === "object" && parsed._nuptio_meta) {
          parsedEventType = parsed.event_type || "wedding";
          parsedPhotos = parsed.custom_photos || [];
          message = parsed.message || "";
        }
      } catch {
        // Not JSON, use as plain message
      }

      setEventType(parsedEventType);
      setCustomPhotos(parsedPhotos);
      setForm({
        partner1_name: wedding.partner1_name ?? "",
        partner2_name: wedding.partner2_name ?? "",
        wedding_date: wedding.wedding_date ?? "",
        venue_ceremony: wedding.venue_ceremony ?? "",
        custom_message: message,
        template_id: wedding.template_id ?? "classique_royal",
      });
    }
  }, [wedding]);

  const isWedding = eventType === "wedding" || eventType === "engagement";

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((t) => t.id === form.template_id),
    [form.template_id]
  );

  if (!wedding) {
    return (
      <div className="p-8 text-muted-foreground">
        Creez d'abord votre evenement depuis le tableau de bord.
      </div>
    );
  }

  function buildCustomMessage(): string {
    return JSON.stringify({
      _nuptio_meta: true,
      event_type: eventType,
      custom_photos: customPhotos,
      message: form.custom_message,
    });
  }

  async function save() {
    if (!wedding) return;
    const payload = {
      partner1_name: form.partner1_name,
      partner2_name: form.partner2_name,
      wedding_date: form.wedding_date || null,
      venue_ceremony: form.venue_ceremony,
      custom_message: buildCustomMessage(),
      template_id: form.template_id,
    };
    const { error } = await supabase
      .from("weddings")
      .update(payload)
      .eq("id", wedding.id);
    if (error) return toast.error(error.message);
    toast.success("Invitation enregistree avec succes");
    invalidate();
  }

  function addPhoto() {
    const url = newPhotoUrl.trim();
    if (!url) return;
    if (customPhotos.length >= 6) {
      toast.error("Maximum 6 photos autorisees");
      return;
    }
    setCustomPhotos([...customPhotos, url]);
    setNewPhotoUrl("");
  }

  function removePhoto(index: number) {
    setCustomPhotos(customPhotos.filter((_, i) => i !== index));
  }

  async function handleExportPdf() {
    setExporting(true);
    try {
      await exportInvitationPdf("invitation-preview", `invitation-${form.partner1_name || "nuptio"}`);
      toast.success("PDF exporte avec succes");
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'export PDF");
    } finally {
      setExporting(false);
    }
  }

  const invitationUrl = firstGuest?.invite_token
    ? `${window.location.origin}/invite/${firstGuest.invite_token}`
    : `${window.location.origin}/invite/preview`;

  const previewData = {
    name1: form.partner1_name || (isWedding ? "Prenom 1" : "Organisateur"),
    name2: form.partner2_name || (isWedding ? "Prenom 2" : ""),
    date: form.wedding_date || "",
    venue: form.venue_ceremony || "",
    message: form.custom_message || "",
    eventType,
    photos: customPhotos,
  };

  const PreviewComponent = selectedTemplate?.preview;

  return (
    <div className="p-6 md:p-10 min-h-screen">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl" style={{ color: "#2D2D2D" }}>
            Mon invitation
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Configurez le type d'événement, choisissez un template et personnalisez votre invitation.
          </p>
        </div>
        {firstGuest?.invite_token && (
          <Button variant="outline" asChild>
            <a href={`${window.location.origin}/invite/${firstGuest.invite_token}`} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />Aperçu invité
            </a>
          </Button>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Form */}
        <div className="space-y-8">
          {/* Event Type Selector */}
          <Card className="p-6 border-border/60 shadow-sm">
            <h2 className="font-display text-xl mb-5" style={{ color: "#D4A574" }}>
              Type d'evenement
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {EVENT_TYPES.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => setEventType(evt.id)}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 transition-all duration-200 ${
                    eventType === evt.id
                      ? "border-[#D4A574] bg-[#D4A574]/5 shadow-md"
                      : "border-border/40 hover:border-[#D4A574]/40 hover:bg-muted/30"
                  }`}
                >
                  <span className="text-lg">
                    {evt.icon === "Heart" && "❤"}
                    {evt.icon === "Cake" && "🎂"}
                    {evt.icon === "Baby" && "👶"}
                    {evt.icon === "Ring" && "💍"}
                    {evt.icon === "Star" && "⭐"}
                  </span>
                  <span className="text-xs font-medium text-center">{evt.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Template Grid */}
          <Card className="p-6 border-border/60 shadow-sm">
            <h2 className="font-display text-xl mb-5" style={{ color: "#D4A574" }}>
              Template
            </h2>
            <TemplateGrid
              onSelect={(id) => setForm({ ...form, template_id: id })}
              selectedId={form.template_id}
              eventType={eventType}
              previewData={previewData}
            />
          </Card>

          {/* Content Form */}
          <Card className="p-6 border-border/60 shadow-sm space-y-5">
            <h2 className="font-display text-xl" style={{ color: "#D4A574" }}>
              Contenu
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  {isWedding ? "Prenom 1" : "Nom de l'organisateur"}
                </Label>
                <Input
                  value={form.partner1_name}
                  onChange={(e) => setForm({ ...form, partner1_name: e.target.value })}
                  placeholder={isWedding ? "Julie" : "Marie Dupont"}
                  className="border-border/60 focus:border-[#D4A574] focus:ring-[#D4A574]/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  {isWedding ? "Prenom 2" : "Nom de l'evenement"}
                </Label>
                <Input
                  value={form.partner2_name}
                  onChange={(e) => setForm({ ...form, partner2_name: e.target.value })}
                  placeholder={isWedding ? "Marc" : "Fete des 30 ans"}
                  className="border-border/60 focus:border-[#D4A574] focus:ring-[#D4A574]/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Date</Label>
              <Input
                type="date"
                value={form.wedding_date ?? ""}
                onChange={(e) => setForm({ ...form, wedding_date: e.target.value })}
                className="border-border/60 focus:border-[#D4A574] focus:ring-[#D4A574]/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Lieu</Label>
              <Input
                value={form.venue_ceremony}
                onChange={(e) => setForm({ ...form, venue_ceremony: e.target.value })}
                placeholder="Chateau de Versailles"
                className="border-border/60 focus:border-[#D4A574] focus:ring-[#D4A574]/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Message personnel</Label>
              <Textarea
                rows={4}
                value={form.custom_message}
                onChange={(e) => setForm({ ...form, custom_message: e.target.value })}
                placeholder="Nous serions ravis de partager ce moment avec vous..."
                className="border-border/60 focus:border-[#D4A574] focus:ring-[#D4A574]/20 resize-none"
              />
            </div>
          </Card>

          {/* Photo Upload Section */}
          <Card className="p-6 border-border/60 shadow-sm space-y-5">
            <h2 className="font-display text-xl" style={{ color: "#D4A574" }}>
              <ImagePlus className="inline-block w-5 h-5 mr-2 -mt-0.5" />
              Photos
            </h2>
            <p className="text-sm text-muted-foreground">
              Ajoutez jusqu'à 6 photos pour personnaliser votre invitation.
            </p>

            {/* Existing photos */}
            {customPhotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {customPhotos.map((url, i) => (
                  <div
                    key={i}
                    className="relative group rounded-lg border border-border/60 overflow-hidden bg-muted/20 aspect-square"
                  >
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ""; (e.target as HTMLImageElement).alt = "Erreur de chargement"; }} />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {customPhotos.length < 6 && (
              <>
                {/* Upload file */}
                <div className="space-y-3">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-xl p-6 cursor-pointer hover:border-[#D4A574] hover:bg-[#D4A574]/5 transition">
                    <ImagePlus className="h-8 w-8 text-[#D4A574] mb-2" />
                    <span className="text-sm text-muted-foreground">Cliquez pour uploader une photo</span>
                    <span className="text-xs text-muted-foreground mt-1">JPG, PNG — max 5 Mo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) { toast.error("Fichier trop volumineux (max 5 Mo)"); return; }
                        const ext = file.name.split(".").pop() || "jpg";
                        const path = `invitations/${wedding!.id}/${Date.now()}.${ext}`;
                        const bucketNames = ["photos", "PHOTOS", "Photos"];
                        let uploaded = false;
                        for (const bucket of bucketNames) {
                          const { error } = await supabase.storage.from(bucket).upload(path, file);
                          if (!error) {
                            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
                            setCustomPhotos([...customPhotos, urlData.publicUrl]);
                            toast.success("Photo ajoutée !");
                            uploaded = true;
                            break;
                          }
                          if (error && !error.message.includes("not found")) {
                            toast.error("Erreur upload : " + error.message);
                            return;
                          }
                        }
                        if (!uploaded) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setCustomPhotos([...customPhotos, reader.result as string]);
                            toast.success("Photo ajoutée (en local) !");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  {/* OR paste URL */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex-1 h-px bg-border/60" />
                    <span>ou collez une URL</span>
                    <div className="flex-1 h-px bg-border/60" />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="https://exemple.com/ma-photo.jpg"
                      className="border-border/60 focus:border-[#D4A574] focus:ring-[#D4A574]/20"
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPhoto(); } }}
                    />
                    <Button
                      type="button"
                      onClick={addPhoto}
                      variant="outline"
                      className="border-[#D4A574] text-[#D4A574] hover:bg-[#D4A574]/10 shrink-0"
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              </>
            )}

            {customPhotos.length >= 6 && (
              <p className="text-sm text-amber-600">Maximum de 6 photos atteint.</p>
            )}
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={save}
              className="bg-[#D4A574] text-white hover:bg-[#C49564] shadow-md px-6"
            >
              Enregistrer
            </Button>

            <Button
              onClick={handleExportPdf}
              disabled={exporting}
              variant="outline"
              className="border-[#D4A574] text-[#D4A574] hover:bg-[#D4A574]/10 gap-2"
            >
              <FileDown className="w-4 h-4" />
              {exporting ? "Export en cours..." : "Exporter PDF"}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-[#D4A574] text-[#D4A574] hover:bg-[#D4A574]/10 gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  Voir le QR code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-center" style={{ color: "#D4A574" }}>
                    QR Code de l'invitation
                  </DialogTitle>
                </DialogHeader>
                <div className="flex justify-center py-6">
                  <QRInvite
                    url={invitationUrl}
                    guestName={form.partner1_name || undefined}
                    size={180}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:sticky lg:top-6 h-fit space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
            Apercu en direct
          </p>
          <div id="invitation-preview" className="rounded-2xl overflow-hidden shadow-xl border border-border/30">
            {PreviewComponent ? (
              <PreviewComponent {...previewData} />
            ) : (
              <div className="aspect-[3/4] bg-gradient-to-br from-[#F5E6E0] to-white flex flex-col items-center justify-center text-center p-8">
                <div className="text-[10px] uppercase tracking-[0.4em] opacity-70">
                  Save the date
                </div>
                <div className="mt-6 font-display text-3xl">
                  {form.partner1_name || "Prenom 1"}
                </div>
                <div className="font-display text-3xl my-1" style={{ color: "#D4A574" }}>
                  &
                </div>
                <div className="font-display text-3xl">
                  {form.partner2_name || "Prenom 2"}
                </div>
                <div className="mt-4 h-px w-16" style={{ backgroundColor: "#D4A574" }} />
                <div className="mt-4 text-sm opacity-80">
                  {form.wedding_date
                    ? format(new Date(form.wedding_date), "d MMMM yyyy", { locale: fr })
                    : "Date a venir"}
                </div>
                <div className="mt-2 text-sm opacity-70">
                  {form.venue_ceremony || "Lieu a definir"}
                </div>
                {form.custom_message && (
                  <p className="mt-6 text-xs italic opacity-70 max-w-[80%]">
                    "{form.custom_message}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick info */}
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Informations
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Type :</span>{" "}
                {EVENT_TYPES.find((e) => e.id === eventType)?.label}
              </p>
              <p>
                <span className="font-medium">Template :</span>{" "}
                {selectedTemplate?.name || "---"}
              </p>
              {form.wedding_date && (
                <p>
                  <span className="font-medium">Date :</span>{" "}
                  {format(new Date(form.wedding_date), "d MMMM yyyy", { locale: fr })}
                </p>
              )}
              {customPhotos.length > 0 && (
                <p>
                  <span className="font-medium">Photos :</span> {customPhotos.length}/6
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
