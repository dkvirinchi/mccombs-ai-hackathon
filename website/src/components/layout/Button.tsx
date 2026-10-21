import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 select-none";
const variants: Record<Variant, string> = {
  // Burnt orange fill with white text: ~4.6:1, the only sanctioned use of orange at small sizes.
  primary: "bg-orange text-white hover:bg-orange-deep active:bg-orange-deep",
  secondary: "bg-charcoal text-white hover:bg-charcoal-deep",
  ghost: "bg-transparent text-charcoal border border-charcoal/30 hover:border-charcoal hover:bg-limestone-soft",
};
const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type LinkProps = { href: string; variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function ButtonLink({ href, variant = "primary", size = "md", className = "", children }: LinkProps) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

type BtnProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant = "primary", size = "md", className = "", type = "button", ...rest }: BtnProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest} />;
}
