export type Plan = "free" | "standard" | "premium";
export type PaymentStatus = "pending" | "paid";

export const PLAN_INFO: Record<Plan, { label: string; price: string; cap: number; color: string }> = {
  free: { label: "Gratuit", price: "0€", cap: 20, color: "bg-neutral-200 text-neutral-800" },
  standard: { label: "Standard", price: "25€", cap: 100, color: "bg-blush text-ink" },
  premium: { label: "Premium", price: "49€", cap: 100, color: "bg-gold text-gold-foreground" },
};

/** Effective plan: unpaid standard/premium is treated as free until admin marks paid. */
export function effectivePlan(plan: Plan, status: PaymentStatus): Plan {
  if (plan === "free") return "free";
  return status === "paid" ? plan : "free";
}

export function guestCap(plan: Plan, status: PaymentStatus): number {
  return PLAN_INFO[effectivePlan(plan, status)].cap;
}

export function isPremiumUnlocked(plan: Plan, status: PaymentStatus): boolean {
  return effectivePlan(plan, status) === "premium";
}