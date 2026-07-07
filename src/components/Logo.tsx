import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };
  return (
    <Link to="/" className={cn("font-display font-semibold text-ink inline-flex items-baseline", sizes[size], className)}>
      <span>Nupt</span>
      <span className="relative inline-block">
        <span>i</span>
        <Heart className="absolute left-1/2 -top-1 -translate-x-1/2 h-2.5 w-2.5 fill-gold text-gold" />
      </span>
      <span>o</span>
    </Link>
  );
}