import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${capitalise(params.slug)} — Pavitram Diamond Jewellery` },
      { name: "description", content: `Shop premium ${capitalise(params.slug)} from Pavitram. BIS hallmarked, IGI certified, free shipping.` },
      { property: "og:title", content: `${capitalise(params.slug)} — Pavitram` },
    ],
    links: [{ rel: "canonical", href: `/category/${params.slug}` }],
  }),
  component: CategoryPage,
});

function capitalise(s: string) { return s.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" "); }

const METALS = ["Gold", "Silver", "Platinum"];
const PURITIES = ["14KT", "18KT", "22KT"];
const SORTS = [
  { v: "featured", l: "Featured" },
  { v: "newest", l: "Newest" },
  { v: "price-asc", l: "Price: Low to High" },
  { v: "price-desc", l: "Price: High to Low" },
  { v: "rating", l: "Best Rated" },
];

function CategoryPage() {
  const { slug } = Route.useParams();
  const [sort, setSort] = useState("featured");
  const [metal, setMetal] = useState<string[]>([]);
  const [purity, setPurity] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState(200000);

  const { data: cat } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["plp", slug, sort, metal, purity, priceMax],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("slug,name,short_description,original_price,offer_price,badge,rating,rating_count,created_at,metal_type,gold_purity")
        .eq("is_active", true)
        .lte("offer_price", priceMax);
      if (cat?.id) q = q.eq("category_id", cat.id);
      if (metal.length) q = q.in("metal_type", metal);
      if (purity.length) q = q.in("gold_purity", purity);
      if (sort === "newest") q = q.order("created_at", { ascending: false });
      else if (sort === "price-asc") q = q.order("offer_price", { ascending: true });
      else if (sort === "price-desc") q = q.order("offer_price", { ascending: false });
      else if (sort === "rating") q = q.order("rating", { ascending: false });
      else q = q.order("is_featured", { ascending: false });
      const { data } = await q.limit(48);
      return (data ?? []) as ProductCardData[];
    },
    enabled: !!cat || slug === "all",
  });

  const toggle = (list: string[], v: string, set: (l: string[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Breadcrumbs */}
      <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{cat?.name ?? capitalise(slug)}</span>
      </nav>

      <header className="mb-8">
        <h1 className="font-serif text-4xl lg:text-5xl">{cat?.name ?? capitalise(slug)}</h1>
        <div className="gold-divider w-24 mt-3" />
        {cat?.description && <p className="mt-3 text-muted-foreground max-w-2xl">{cat.description}</p>}
      </header>

      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        {/* Filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-32 space-y-8">
            <FilterGroup title="Metal Type">
              {METALS.map((m) => (
                <Check key={m} label={m} checked={metal.includes(m)} onChange={() => toggle(metal, m, setMetal)} />
              ))}
            </FilterGroup>
            <FilterGroup title="Gold Purity">
              {PURITIES.map((p) => (
                <Check key={p} label={p} checked={purity.includes(p)} onChange={() => toggle(purity, p, setPurity)} />
              ))}
            </FilterGroup>
            <FilterGroup title="Price">
              <input type="range" min={5000} max={200000} step={5000} value={priceMax} onChange={(e) => setPriceMax(+e.target.value)} className="w-full accent-[color:var(--plum)]" />
              <p className="text-xs text-muted-foreground mt-2">Up to ₹{priceMax.toLocaleString("en-IN")}</p>
            </FilterGroup>
          </div>
        </aside>

        {/* Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">{products?.length ?? 0} products</p>
            <div className="flex items-center gap-3">
              <button className="lg:hidden inline-flex items-center gap-2 rounded-full border hairline px-4 py-2 text-sm">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border hairline bg-card px-4 py-2 text-sm">
                {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
          </div>

          {products?.length === 0 ? (
            <div className="rounded-2xl border hairline bg-card p-12 text-center">
              <p className="font-serif text-xl">No pieces match your filters.</p>
              <p className="text-sm text-muted-foreground mt-2">Try widening the price range or removing a filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
              {(products ?? []).map((p) => <ProductCard key={p.slug} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-serif text-base mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-[color:var(--plum)]" />
      <span className="text-foreground/80">{label}</span>
    </label>
  );
}
