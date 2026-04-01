import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.28em] text-stone">{label}</span>
      <input
        id={id}
        className={cn(
          "h-12 w-full rounded-2xl border border-sand bg-pearl px-4 text-sm text-ink outline-none transition focus:border-ink/50",
          error && "border-red-400",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </label>
  );
}

