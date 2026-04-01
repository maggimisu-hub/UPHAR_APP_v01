import { Link } from "react-router-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const baseClassName =
  "inline-flex items-center justify-center rounded-sm px-5 py-3 text-sm font-semibold tracking-[0.08em] transition duration-300";

const variants = {
  primary: "bg-accent text-ivory hover:opacity-90",
  secondary: "border border-accent text-accent hover:bg-accent hover:text-ivory",
  ghost: "text-primary hover:text-accent",
};

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const classes = `${baseClassName} ${variants[variant]} ${className}`.trim();

  if (href) {
    return (
      <Link to={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
