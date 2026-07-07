export const EVENT_TYPES = [
  { id: "wedding", label: "Mariage", icon: "Heart", color: "text-rose-500" },
  { id: "anniversary", label: "Anniversaire", icon: "Cake", color: "text-amber-500" },
  { id: "baptism", label: "Baptême", icon: "Baby", color: "text-sky-500" },
  { id: "engagement", label: "Fiançailles", icon: "Gift", color: "text-purple-500" },
  { id: "ceremony", label: "Autre cérémonie", icon: "Sparkles", color: "text-emerald-500" },
] as const;

export type EventType = (typeof EVENT_TYPES)[number]["id"];

export const ADMIN_EMAILS = [
  "lbcloudadmin@gmail.com",
  "lioneldesignweb@gmail.com",
];

export function getEventLabel(eventType: EventType | string | null | undefined) {
  const found = EVENT_TYPES.find((e) => e.id === eventType);
  return found?.label ?? "Événement";
}

export function getEventLabels(eventType: EventType | string | null | undefined) {
  switch (eventType) {
    case "wedding":
      return { person1: "Marié·e 1", person2: "Marié·e 2", date: "Date du mariage", title: "mariage" };
    case "engagement":
      return { person1: "Fiancé·e 1", person2: "Fiancé·e 2", date: "Date des fiançailles", title: "fiançailles" };
    case "anniversary":
      return { person1: "Nom de l'organisateur", person2: "Personne célébrée", date: "Date de l'anniversaire", title: "anniversaire" };
    case "baptism":
      return { person1: "Parent / Organisateur", person2: "Enfant", date: "Date du baptême", title: "baptême" };
    default:
      return { person1: "Organisateur", person2: "Co-organisateur (optionnel)", date: "Date de l'événement", title: "événement" };
  }
}
