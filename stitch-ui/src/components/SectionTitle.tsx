export default function SectionTitle({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted">{eyebrow}</p>
      <h2 className="mt-3 text-[1.375rem] font-bold leading-[1.25] text-primary sm:text-[1.75rem]">{title}</h2>
      {body ? <p className="mt-4 text-sm leading-6 text-muted">{body}</p> : null}
    </div>
  );
}
