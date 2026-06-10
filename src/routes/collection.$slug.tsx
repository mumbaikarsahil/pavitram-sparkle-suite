import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";

export const Route = createFileRoute("/collection/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug.replace(/-/g, " ")} Collection — Pavitram` }],
    links: [{ rel: "canonical", href: `/collection/${params.slug}` }],
  }),
  component: CollectionPage,
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const { data: col } = useQuery({
    queryKey: ["collection", slug],
    queryFn: async () => (await supabase.from("collections").select("*").eq("slug", slug).maybeSingle()).data,
  });
  const { data: products } = useQuery({
    queryKey: ["collection-products", col?.id],
    enabled: !!col?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("slug,name,short_description,original_price,offer_price,badge,rating,rating_count")
        .eq("collection_id", col!.id);
      return (data ?? []) as ProductCardData[];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--plum)]">Collection</p>
      <h1 className="font-serif text-4xl lg:text-5xl mt-3">{col?.name ?? slug}</h1>
      <div className="gold-divider w-24 mt-3 mb-4" />
      {col?.description && <p className="text-muted-foreground max-w-2xl">{col.description}</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 mt-10">
        {(products ?? []).map((p) => <ProductCard key={p.slug} p={p} />)}
      </div>
      {(!products || products.length === 0) && (
        <p className="text-muted-foreground mt-8">No products in this collection yet. <Link to="/" className="text-[color:var(--plum)] underline">Back home</Link>.</p>
      )}
    </div>
  );
}
