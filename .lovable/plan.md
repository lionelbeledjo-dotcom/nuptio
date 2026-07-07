# Nuptio — Plan de construction MVP

Application de création d'invitations de mariage digitales. Le périmètre est large : je propose de le livrer en 3 phases pour valider au fur et à mesure.

## Phase 1 — Fondations (design system + backend + auth)

1. **Design system** (`src/styles.css`)
   - Tokens dorés/rose poudré/noir doux en `oklch`
   - Polices Playfair Display (titres) + Inter (corps) via `<link>` dans `__root.tsx`
   - Variantes shadcn "gold" (Button, Card, Input)
   - Logo `Nuptio` composant réutilisable (cœur intégré dans le "i")

2. **Lovable Cloud activé** + schéma complet
   - Tables : `profiles`, `weddings`, `guests`, `rsvp_responses`, `tables_seating`, `table_assignments`
   - RLS scopée à `auth.uid()` via `weddings.user_id`
   - Policy publique `TO anon` sur `guests`/`weddings`/`rsvp_responses` filtrée par `invite_token` (via fonction SECURITY DEFINER `get_invite_by_token`)
   - Triggers : création auto `profiles` à l'inscription, génération `invite_token` (uuid) à l'insert d'un invité
   - GRANTS explicites sur chaque table

3. **Auth** (`/auth`)
   - Email/password + Google OAuth (via broker Lovable)
   - Layout `_authenticated/route.tsx` (managed)
   - Sign-out propre, header réactif à la session

4. **Landing page** (`/`)
   - Hero, features (3 cards), templates preview (grille 6), témoignages (3), pricing (3 plans), footer
   - Textes FR, mobile-first

## Phase 2 — Dashboard mariés

5. **Shell dashboard** (`/dashboard/*` sous `_authenticated/`)
   - Sidebar shadcn collapsible : Tableau de bord, Mon invitation, Mes invités, RSVP, Plan de table, Infos pratiques, Paramètres
   - Header avec nom du mariage + date (issu de `weddings`)
   - Onboarding : si aucun mariage, formulaire de création

6. **Tableau de bord** (`/dashboard`)
   - Compte à rebours calculé côté client
   - Stats RSVP (confirmés/attente/déclinés) via `useSuspenseQuery`
   - Checklist rapide (statique)

7. **Création d'invitation** (`/dashboard/invitation`)
   - Grille 12 templates (classique, bohème, minimaliste, floral, oriental, africain, champêtre, luxe, …)
   - Formulaire édition (noms, date, lieu, message)
   - Preview temps réel format carte mobile à droite
   - CTA "Générer les liens d'invitation" (crée les tokens si absents)

8. **Invités** (`/dashboard/guests`)
   - Table shadcn : Nom, Contact, Groupe, RSVP, Menu
   - Modal ajout, import CSV (parse côté client), filtres, notion de foyer (`household_id`)

9. **RSVP** (`/dashboard/rsvp`)
   - Camembert (recharts) confirmés/attente/déclinés
   - Liste détaillée (menu, allergies, +1)
   - Bouton "Relancer" (toast simulé)

10. **Plan de table** (`/dashboard/seating`)
    - Liste de tables (créer/renommer/capacité)
    - Dropdown d'assignation par invité, liste des non-placés

11. **Infos pratiques** (`/dashboard/info`)
    - Formulaire : lieux, horaires, dress code, FAQ (stockés dans `weddings` + colonnes JSON pour FAQ)
    - Preview mini-site

## Phase 3 — Vue invité publique

12. **`/invite/$token`**
    - Route publique SSR, lecture via RPC `get_invite_by_token`
    - Invitation animée (fade-in), timeline verticale, Google Maps embed (iframe), dress code
    - Formulaire RSVP (présence, nb personnes, menu, allergies, message) → insert dans `rsvp_responses`
    - Bouton "Ajouter au calendrier" (génère un `.ics`)
    - Mobile-first, grands textes

## Détails techniques

- **Stack** : TanStack Start + Supabase (Lovable Cloud), TanStack Query pour les fetchs, `createServerFn` uniquement là où nécessaire (le reste passe par le client Supabase authentifié côté navigateur pour rester simple sur ce MVP).
- **Realtime** : abonnement Supabase sur `rsvp_responses` pour rafraîchir le dashboard RSVP.
- **i18n** : tout le texte codé en dur en français (pas de librairie i18n pour le MVP).
- **SEO** : `head()` par route publique (`/`, `/auth`, `/invite/$token`).
- **Sécurité** : RLS strict + fonction SECURITY DEFINER pour la vue invité, aucun usage de `supabaseAdmin` côté client.

## Ce que je propose de faire maintenant

Je démarre par la **Phase 1** (design system + Cloud + schéma + auth + landing). Une fois validé visuellement, j'enchaîne Phase 2 puis Phase 3 dans les tours suivants — c'est trop volumineux pour un seul tour sans perdre en qualité.

Confirme-moi que je peux lancer la Phase 1 (ou dis-moi ce que tu veux réordonner).
