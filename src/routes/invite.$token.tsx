import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
import InviteEnvelope from "@/components/InviteEnvelope";
import Photo3D from "@/components/Photo3D";
import { motion, AnimatePresence } from "framer-motion";
import { isPremiumUnlocked, type Plan, type PaymentStatus } from "@/lib/plans";
import { Volume2, VolumeX } from "lucide-react";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [
      { title: "Vous êtes invité·e — Nuptio" },
      { name: "description", content: "Découvrez votre invitation de mariage et répondez en quelques clics." },
    ],
  }),
  component: InvitePage,
});

/* ─── Slow-connection / reduced-motion helpers ─────────────────── */

function useLightMode() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Respect user's OS-level reduced motion preference.
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // Network Information API (Chrome/Android). Safari iOS won't have it → default to full effects.
    const conn: any = (navigator as any).connection;
    const slow = conn && (conn.saveData || ["slow-2g", "2g", "3g"].includes(conn.effectiveType));
    setLight(Boolean(prefersReduced || slow));
  }, []);
  return light;
}

/* ─── Music Toggle (Premium only) ──────────────────────────────── */

function MusicToggle({ src }: { src: string }) {
  const [muted, setMuted] = useState(true); // start muted — Safari iOS blocks autoplay with sound
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.35;
    audio.muted = true;
    (audio as any).playsInline = true;
    audio.play().catch(() => {
      // Silent failure — some browsers still block; user gesture will unmute.
    });
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [src]);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    const next = !muted;
    a.muted = next;
    if (!next) a.play().catch(() => {});
    setMuted(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Activer la musique" : "Couper la musique"}
      className="fixed top-4 right-4 z-[60] h-11 w-11 rounded-full bg-white/90 backdrop-blur-sm border border-gold/40 flex items-center justify-center shadow-lg hover:bg-white transition"
    >
      {muted ? <VolumeX className="h-5 w-5 text-gold" /> : <Volume2 className="h-5 w-5 text-gold" />}
    </button>
  );
}

/* ─── Gold Particle Background ─────────────────────────────────── */

function GoldParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 2 + Math.random() * 3,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 5,
    opacity: 0.15 + Math.random() * 0.25,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: "radial-gradient(circle, #D4A574, #FFD700)",
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, p.opacity, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Parallax Background ──────────────────────────────────────── */

function ParallaxBackground() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    function handleScroll() {
      setOffsetY(window.scrollY);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse at 20% 20%, rgba(212, 165, 116, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(245, 230, 224, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(255, 215, 0, 0.03) 0%, transparent 70%)
        `,
        transform: `translateY(${offsetY * 0.15}px)`,
      }}
    />
  );
}

/* ─── Section Animation Wrapper ────────────────────────────────── */

const sectionVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.section
      className={className}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay }}
    >
      {children}
    </motion.section>
  );
}

/* ─── Main Page ────────────────────────────────────────────────── */

function InvitePage() {
  const { token } = Route.useParams();
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const lightMode = useLightMode();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("get_invite_by_token", { _token: token });
      if (error) console.error(error);
      const row = data?.[0] ?? null;
      setInvite(row);
      // Non-premium (or slow connection): skip the envelope reveal entirely.
      if (row) {
        const premium = isPremiumUnlocked(
          (row.plan ?? "free") as Plan,
          (row.payment_status ?? "pending") as PaymentStatus,
        );
        if (!premium) setEnvelopeOpened(true);
      }
      setLoading(false);
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDF8F5] to-[#F5E6E0]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full"
          />
          <p className="text-muted-foreground font-display text-lg">Chargement de votre invitation...</p>
        </motion.div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gradient-to-br from-[#FDF8F5] to-[#F5E6E0]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <Heart className="h-10 w-10 text-gold" />
          <h1 className="font-display text-3xl mt-4">Invitation introuvable</h1>
          <p className="text-muted-foreground mt-2">Ce lien n'est pas valide ou a expiré.</p>
        </motion.div>
      </div>
    );
  }

  const wedding_date_str = invite.wedding_date ? format(new Date(invite.wedding_date), "EEEE d MMMM yyyy", { locale: fr }) : "Date à venir";
  const isPremium = isPremiumUnlocked(
    (invite.plan ?? "free") as Plan,
    (invite.payment_status ?? "pending") as PaymentStatus,
  );
  const showImmersive = isPremium && !lightMode;

  return (
    <>
      {/* Immersive music toggle (Premium only, if audio configured on the event) */}
      {isPremium && invite.music_url && <MusicToggle src={invite.music_url} />}

      {/* Envelope Opening Phase — Premium only */}
      <AnimatePresence>
        {!envelopeOpened && showImmersive && (
          <motion.div
            className="fixed inset-0 z-50"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <InviteEnvelope onOpened={() => setEnvelopeOpened(true)}>
              <div className="flex flex-col items-center gap-1">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4A574]">Save the date</p>
                <p className="font-serif text-sm mt-1">{invite.partner1_name}</p>
                <span className="text-[#D4A574] font-serif">&</span>
                <p className="font-serif text-sm">{invite.partner2_name}</p>
                <div className="w-8 h-px bg-[#D4A574] my-1.5 opacity-50" />
                <p className="text-[9px] text-gray-500">{wedding_date_str}</p>
              </div>
            </InviteEnvelope>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Invitation Content (revealed after envelope) */}
      <AnimatePresence>
        {envelopeOpened && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="min-h-screen bg-gradient-to-b from-[#FDF8F5] via-blush/20 to-[#FDF8F5] pb-16 relative"
          >
            {showImmersive && <ParallaxBackground />}
            {showImmersive && <GoldParticles />}

            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mx-auto max-w-2xl px-6 pt-8 relative z-10"
            >
              <Logo size="sm" />
            </motion.header>

            {/* Hero Card */}
            <motion.section
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mx-auto max-w-2xl px-6 mt-6 relative z-10"
            >
              <Card className="p-10 md:p-14 border-gold/20 text-center bg-gradient-to-br from-white to-blush/40 shadow-2xl relative overflow-hidden">
                {/* Decorative corner ornaments */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gold/30 rounded-tl-sm" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gold/30 rounded-tr-sm" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gold/30 rounded-bl-sm" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gold/30 rounded-br-sm" />

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="text-sm uppercase tracking-[0.4em] text-gold"
                >
                  Save the date
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="mt-8 text-lg text-muted-foreground"
                >
                  {invite.guest_name}, vous êtes cordialement invité·e au mariage de
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4, type: "spring", stiffness: 100 }}
                  className="font-display text-5xl md:text-6xl mt-6"
                >
                  {invite.partner1_name}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
                  className="font-display text-4xl md:text-5xl text-gold my-3"
                >
                  &
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.8, type: "spring", stiffness: 100 }}
                  className="font-display text-5xl md:text-6xl"
                >
                  {invite.partner2_name}
                </motion.h1>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 2.0, duration: 0.6 }}
                  className="mt-8 h-px w-20 bg-gold mx-auto origin-center"
                />

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.2 }}
                  className="mt-6 font-display text-xl"
                >
                  {wedding_date_str}
                </motion.p>

                {/* Calendar button near date */}
                {invite.wedding_date && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.4 }}
                    className="mt-4"
                  >
                    <CalendarButton wedding={invite} variant="ghost" />
                  </motion.div>
                )}

                {invite.custom_message && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.6 }}
                    className="mt-8 italic text-muted-foreground max-w-md mx-auto"
                  >
                    "{invite.custom_message}"
                  </motion.p>
                )}
              </Card>
            </motion.section>

            {/* Photo3D Section */}
            {invite.photos && Array.isArray(invite.photos) && invite.photos.length > 0 && (
              <AnimatedSection className="mx-auto max-w-2xl px-6 mt-10 relative z-10" delay={0.1}>
                <Photo3D photos={invite.photos} layout="stack" />
              </AnimatedSection>
            )}

            {/* Programme */}
            <AnimatedSection className="mx-auto max-w-2xl px-6 mt-8 relative z-10" delay={0.1}>
              <Card className="p-8 border-border/60 backdrop-blur-sm bg-white/90">
                <h2 className="font-display text-2xl mb-6 flex items-center gap-2"><Calendar className="h-5 w-5 text-gold" /> Programme</h2>
                <div className="space-y-6 relative">
                  {invite.venue_ceremony && (
                    <motion.div
                      className="flex gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-gold text-white flex items-center justify-center"><Clock className="h-4 w-4" /></div>
                        {invite.venue_reception && <div className="w-px flex-1 bg-gold/30 mt-2" />}
                      </div>
                      <div className="pb-6">
                        <div className="text-sm text-gold font-medium">{invite.ceremony_time || "Horaire à venir"}</div>
                        <div className="font-display text-lg mt-1">Cérémonie</div>
                        <div className="text-muted-foreground text-sm mt-1 flex items-start gap-1"><MapPin className="h-3.5 w-3.5 mt-0.5" />{invite.venue_ceremony}</div>
                      </div>
                    </motion.div>
                  )}
                  {invite.venue_reception && (
                    <motion.div
                      className="flex gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-gold text-white flex items-center justify-center"><Clock className="h-4 w-4" /></div>
                      </div>
                      <div>
                        <div className="text-sm text-gold font-medium">{invite.reception_time || "Horaire à venir"}</div>
                        <div className="font-display text-lg mt-1">Réception</div>
                        <div className="text-muted-foreground text-sm mt-1 flex items-start gap-1"><MapPin className="h-3.5 w-3.5 mt-0.5" />{invite.venue_reception}</div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </Card>
            </AnimatedSection>

            {/* Map */}
            {invite.map_url && (
              <AnimatedSection className="mx-auto max-w-2xl px-6 mt-6 relative z-10" delay={0.1}>
                <Card className="p-2 border-border/60 overflow-hidden backdrop-blur-sm bg-white/90">
                  <iframe src={invite.map_url} className="w-full aspect-video rounded-lg" loading="lazy" />
                </Card>
              </AnimatedSection>
            )}

            {/* Dress Code */}
            {invite.dress_code && (
              <AnimatedSection className="mx-auto max-w-2xl px-6 mt-6 relative z-10" delay={0.1}>
                <Card className="p-6 border-border/60 backdrop-blur-sm bg-white/90">
                  <h2 className="font-display text-xl flex items-center gap-2"><Shirt className="h-5 w-5 text-gold" /> Dress code</h2>
                  <p className="mt-2 text-lg">{invite.dress_code}</p>
                </Card>
              </AnimatedSection>
            )}

            {/* RSVP */}
            <AnimatedSection className="mx-auto max-w-2xl px-6 mt-6 relative z-10" delay={0.1}>
              <RsvpForm token={token} existing={invite.existing_response} wedding={invite} />
            </AnimatedSection>

            {/* FAQ */}
            {invite.faq && Array.isArray(invite.faq) && invite.faq.length > 0 && (
              <AnimatedSection className="mx-auto max-w-2xl px-6 mt-6 relative z-10" delay={0.1}>
                <Card className="p-6 border-border/60 backdrop-blur-sm bg-white/90">
                  <h2 className="font-display text-xl mb-4">Questions fréquentes</h2>
                  {(invite.faq as any[]).map((f, i) => (
                    <motion.div
                      key={i}
                      className="mb-4 last:mb-0"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="font-medium">{f.q}</div>
                      <p className="text-sm text-muted-foreground mt-1">{f.a}</p>
                    </motion.div>
                  ))}
                </Card>
              </AnimatedSection>
            )}

            <motion.footer
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-10 text-xs text-muted-foreground relative z-10"
            >
              {!isPremium ? (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/70 border border-gold/30">
                  Créé avec <span className="text-gold font-medium">Nuptio</span>
                </span>
              ) : (
                <>Invitation créée avec <span className="text-gold">Nuptio</span></>
              )}
            </motion.footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Calendar Button (reusable) ───────────────────────────────── */

function CalendarButton({ wedding, variant = "outline" }: { wedding: any; variant?: "outline" | "ghost" }) {
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
    <Button
      type="button"
      variant={variant}
      onClick={addToCalendar}
      size={variant === "ghost" ? "sm" : "lg"}
      className={variant === "ghost" ? "text-gold hover:text-gold/80 hover:bg-gold/5" : "h-12"}
    >
      <Calendar className="h-4 w-4 mr-2" /> Ajouter au calendrier
    </Button>
  );
}

/* ─── RSVP Form ────────────────────────────────────────────────── */

function RsvpForm({ token, existing, wedding }: { token: string; existing: any; wedding: any }) {
  const [attending, setAttending] = useState<string>(existing?.attending ?? "yes");
  const [number, setNumber] = useState<number>(existing?.number_of_people ?? 1);
  const [menu, setMenu] = useState<string>((existing?.menu_choice as string) ?? "");
  const [allergies, setAllergies] = useState<string>((existing?.allergies as string) ?? "");
  const [message, setMessage] = useState<string>((existing?.message as string) ?? "");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(!!existing);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.rpc("submit_rsvp", {
      _token: token,
      _attending: attending,
      _number_of_people: number,
      _menu_choice: menu || "",
      _allergies: allergies || "",
      _message: message || "",
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
    <Card className="p-6 md:p-8 border-gold/30 bg-white/95 backdrop-blur-sm shadow-lg">
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
