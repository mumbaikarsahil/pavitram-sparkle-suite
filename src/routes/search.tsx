import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — Pavitram" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["search", q],
    enabled: q.length > 1,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("slug,name,short_description,original_price,offer_price,badge,rating,rating_count")
        .ilike("name", `%${q}%`)
        .limit(24);
      return (data ?? []) as ProductCardData[];
    },
  });
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-serif text-3xl">Search</h1>
      <div className="gold-divider w-24 mt-3 mb-6" />
      <div className="flex items-center rounded-full border hairline bg-card px-5 py-3 max-w-2xl">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder="Search rings, earrings, pendants…" className="ml-3 w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
        {(data ?? []).map((p) => <ProductCard key={p.slug} p={p} />)}
      </div>
      {q.length > 1 && (data?.length ?? 0) === 0 && <p className="text-muted-foreground mt-8">No matches for &ldquo;{q}&rdquo;.</p>}
    </div>
  );
}
