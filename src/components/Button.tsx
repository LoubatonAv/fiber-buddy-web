import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary: "bg-slate-950 text-white hover:bg-slate-800",
  secondary: "bg-slate-100 text-slate-950 hover:bg-slate-200",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: Props) {
  return (
    <button
      className={`rounded-full px-5 py-3 text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
