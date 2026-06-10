import { Link } from "@tanstack/react-router";

export function SectionHeader({
  eyebrow,
  title,
  cta,
}: {
  eyebrow?: string;
  title: string;
  cta?: { label: string; to: string };
}) {
  return (
    <div className="flex items-end justify-between gap-6 mb-8">
      <div>
        {eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--plum)] mb-2">{eyebrow}</p>
        )}
        <h2 className="font-serif text-3xl md:text-4xl text-foreground">{title}</h2>
        <div className="gold-divider w-24 mt-3" />
      </div>
      {cta && (
        <Link
          to={cta.to}
          className="hidden md:inline-flex text-sm text-[color:var(--plum)] hover:text-[color:var(--plum-deep)] underline-offset-4 hover:underline"
        >
          {cta.label} →
        </Link>
      )}
    </div>
  );
}
