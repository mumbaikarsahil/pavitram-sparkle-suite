import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroBridal from "@/assets/hero-bridal.jpg";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [{ title: "Collections — Pavitram Diamond Jewellery" }],
    links: [{ rel: "canonical", href: "/collections" }],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const { data } = useQuery({
    queryKey: ["collections-all"],
    queryFn: async () => (await supabase.from("collections").select("*").order("sort_order")).data ?? [],
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--plum)]">Pavitram Edits</p>
      <h1 className="font-serif text-4xl lg:text-5xl mt-3">Collections</h1>
      <div className="gold-divider w-24 mt-3" />

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        {data?.map((c) => (
          <Link key={c.id} to="/collection/$slug" params={{ slug: c.slug }} className="group relative aspect-[5/4] overflow-hidden rounded-3xl shadow-[var(--shadow-card)]">
            <img src={heroBridal} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--plum-deep)]/85 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-[color:var(--ivory)]">
              <h3 className="font-serif text-3xl">{c.name}</h3>
              <p className="text-sm opacity-90 mt-2 max-w-md">{c.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
