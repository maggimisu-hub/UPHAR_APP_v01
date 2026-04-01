import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium tracking-[0.18em] text-muted uppercase">{label}</span>
      <input
        {...props}
        className={`h-12 w-full rounded-sm border bg-ivory px-4 text-base font-medium text-primary outline-none transition ${
          error ? "border-accent" : "border-primary/15 focus:border-accent"
        }`}
      />
      {error ? <span className="text-xs text-accent">{error}</span> : null}
    </label>
  );
}
