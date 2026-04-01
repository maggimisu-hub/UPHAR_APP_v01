import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type BaseProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
};

type NativeButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type LinkButtonProps = BaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className"> & {
    href: string;
  };

const variants = {
  primary: "bg-ink text-pearl hover:bg-black",
  secondary: "border border-ink bg-transparent text-ink hover:bg-ink hover:text-pearl",
  ghost: "bg-transparent text-ink hover:bg-black/5",
};

const sizes = {
  sm: "h-10 px-4 text-xs uppercase tracking-[0.25em]",
  md: "h-11 px-5 text-xs uppercase tracking-[0.28em]",
  lg: "h-12 px-6 text-xs uppercase tracking-[0.3em]",
};

function sharedClassName({ variant = "primary", size = "md", className }: Omit<BaseProps, "children">) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full transition duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button(props: NativeButtonProps | LinkButtonProps) {
  if (typeof props.href === "string") {
    const { href, variant, size, className, children, ...rest } = props as LinkButtonProps;

    return (
      <Link href={href} className={sharedClassName({ variant, size, className })} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant, size, className, children, type, ...rest } = props as NativeButtonProps;
  const buttonType: "button" | "submit" | "reset" = type === "submit" || type === "reset" ? type : "button";

  return (
    <button type={buttonType} className={sharedClassName({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}

