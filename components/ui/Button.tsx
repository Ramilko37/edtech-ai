import { ArrowRight } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  icon?: boolean;
};

const variants = {
  primary:
    "bg-blueElectric text-white shadow-panel hover:bg-blueCore focus-visible:outline-blueElectric",
  secondary:
    "border border-line bg-white text-ink hover:border-blueElectric hover:text-blueCore focus-visible:outline-blueElectric",
  ghost:
    "text-ink hover:bg-blueElectric/10 focus-visible:outline-blueElectric",
};

export function buttonClasses(
  variant: ButtonProps["variant"] = "primary",
  className?: string,
) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    variants[variant],
    className,
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  icon,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClasses(variant, className)} {...props}>
      {children}
      {icon ? <ArrowRight aria-hidden className="size-4" /> : null}
    </button>
  );
}
