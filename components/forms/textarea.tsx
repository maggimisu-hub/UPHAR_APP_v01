import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.28em] text-stone">{label}</span>
      <textarea
        id={id}
        className={cn(
          "min-h-32 w-full rounded-2xl border border-sand bg-pearl px-4 py-3 text-sm text-ink outline-none transition focus:border-ink/50",
          error && "border-red-400",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </label>
  );
}

