import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Mail, Users, Sparkles, Check, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

const templates = [
  { name: "Classique", tone: "from-[#F5E6E0] to-white" },
  { name: "Bohème", tone: "from-amber-50 to-orange-100" },
  { name: "Minimaliste", tone: "from-neutral-50 to-neutral-200" },
  { name: "Floral", tone: "from-rose-50 to-pink-100" },
  { name: "Oriental", tone: "from-amber-100 to-yellow-200" },
  { name: "Champêtre", tone: "from-lime-50 to-emerald-100" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-ink">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="hidden gap-8 md:flex text-sm text-muted-foreground">
          <a href="#features" className="hover:text-ink transition">Fonctionnalités</a>
          <a href="#templates" className="hover:text-ink transition">Templates</a>
          <a href="#pricing" className="hover:text-ink transition">Tarifs</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Connexion</Button></Link>
          <Link to="/auth"><Button size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90">Commencer</Button></Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blush/40 via-background to-background" />
        <div className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/60 px-3 py-1 text-xs text-gold backdrop-blur">
            <Sparkles className="h-3 w-3" /> Créé avec amour, pour les amoureux
          </div>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
            Vos invitations de mariage, <span className="italic text-gold">réinventées</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Créez des invitations digitales élégantes, envoyez-les à vos invités et gérez tout — RSVP, plan de table, menus — depuis un espace unique.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 h-12 px-8 text-base">
                Créer mon invitation
              </Button>
            </Link>
            <a href="#templates">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-ink/20">
                Voir les templates
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl md:text-5xl">Tout ce qu'il faut, rien de superflu</h2>
          <p className="mt-4 text-muted-foreground">Trois étapes pour une organisation sans stress.</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { icon: Heart, title: "Créer", desc: "Choisissez parmi 12 templates raffinés et personnalisez chaque détail en quelques clics." },
            { icon: Mail, title: "Inviter", desc: "Envoyez un lien unique à chaque foyer. Chaque invité a sa page personnalisée." },
            { icon: Users, title: "Gérer", desc: "Suivez les RSVP en temps réel, gérez les menus, allergies et plan de table." },
          ].map((f) => (
            <Card key={f.title} className="border-border/60 bg-white p-8 shadow-none">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blush">
                <f.icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="font-display text-2xl">{f.title}</h3>
              <p className="mt-2 text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="bg-blush/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl md:text-5xl">Des templates pour tous les styles</h2>
            <p className="mt-4 text-muted-foreground">Classique, bohème, oriental, africain… trouvez l'invitation qui vous ressemble.</p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-3">
            {templates.map((t) => (
              <div key={t.name} className={`aspect-[3/4] rounded-2xl bg-gradient-to-br ${t.tone} shadow-sm border border-white/60 p-8 flex flex-col items-center justify-center text-center`}>
                <div className="text-xs uppercase tracking-[0.3em] text-ink/60">Save the date</div>
                <div className="mt-4 font-display text-2xl text-ink">Marie <span className="text-gold">&</span> Julien</div>
                <div className="mt-2 h-px w-12 bg-gold" />
                <div className="mt-4 text-xs text-ink/70">14 juin 2026</div>
                <div className="mt-auto text-[10px] uppercase tracking-widest text-ink/50">{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl md:text-5xl">Ils nous font confiance</h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { name: "Camille & Antoine", quote: "Nos invités ont adoré le mini-site. Plus jamais de tableur Excel !" },
            { name: "Sarah & Yannis", quote: "Le plan de table s'est fait en une soirée. Un vrai gain de temps." },
            { name: "Léa & Pierre", quote: "Élégant, simple, français. Exactement ce qu'on cherchait." },
          ].map((t) => (
            <Card key={t.name} className="border-border/60 bg-white p-6 shadow-none">
              <div className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-4 text-ink/80 italic">"{t.quote}"</p>
              <p className="mt-4 text-sm text-muted-foreground">— {t.name}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl md:text-5xl">Tarifs transparents</h2>
          <p className="mt-4 text-muted-foreground">Commencez gratuitement, passez au plan supérieur quand vous êtes prêts.</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { name: "Gratuit", price: "0€", desc: "Pour découvrir", features: ["1 invitation", "20 invités max", "Templates de base"] },
            { name: "Premium", price: "49€", desc: "Paiement unique", features: ["Invités illimités", "Tous les templates", "Plan de table", "Support prioritaire"], featured: true },
            { name: "Pro", price: "99€/mois", desc: "Pour wedding planners", features: ["Mariages illimités", "Marque blanche", "API & intégrations", "Support dédié"] },
          ].map((p) => (
            <Card key={p.name} className={`p-8 shadow-none ${p.featured ? "border-gold border-2 bg-white" : "border-border/60 bg-white"}`}>
              {p.featured && <div className="mb-3 inline-block rounded-full bg-gold px-3 py-0.5 text-xs text-gold-foreground">Le plus populaire</div>}
              <h3 className="font-display text-2xl">{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-4xl">{p.price}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 text-gold shrink-0" /> <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="block mt-8">
                <Button className={`w-full ${p.featured ? "bg-gold text-gold-foreground hover:bg-gold/90" : ""}`} variant={p.featured ? "default" : "outline"}>
                  Choisir
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" />
          <div className="text-sm text-muted-foreground flex gap-6">
            <a href="#features" className="hover:text-ink">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-ink">Tarifs</a>
            <a href="mailto:hello@nuptio.fr" className="hover:text-ink">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Nuptio. Fait avec amour.</p>
        </div>
      </footer>
    </div>
  );
}
