import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <p className="text-xs uppercase tracking-[0.35em] text-stone">{eyebrow}</p> : null}
      <h2 className="mt-3 font-serif text-3xl tracking-tight text-ink sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-sm leading-7 text-stone sm:text-base">{description}</p> : null}
    </div>
  );
}

