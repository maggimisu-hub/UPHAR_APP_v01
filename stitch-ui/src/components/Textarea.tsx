import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export default function Textarea({ label, error, ...props }: TextareaProps) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium tracking-[0.18em] text-muted uppercase">{label}</span>
      <textarea
        {...props}
        className={`min-h-32 w-full rounded-sm border bg-ivory px-4 py-3 text-base font-medium text-primary outline-none transition ${
          error ? "border-accent" : "border-primary/15 focus:border-accent"
        }`}
      />
      {error ? <span className="text-xs text-accent">{error}</span> : null}
    </label>
  );
}
