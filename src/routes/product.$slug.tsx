import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { productImage } from "@/lib/product-image";
import { inr, discountPct } from "@/lib/format";
import { ChevronRight, Heart, ShieldCheck, Truck, RotateCcw, Star, MapPin, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Pavitram` },
      { name: "description", content: "Premium hallmarked Indian jewellery from Pavitram." },
    ],
    links: [{ rel: "canonical", href: `/product/${params.slug}` }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const [karat, setKarat] = useState("18KT");
  const [color, setColor] = useState("Rose Gold");
  const [pin, setPin] = useState("");

  const { data: p, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      if (!data) throw notFound();
      return data;
    },
  });

  const { data: related } = useQuery({
    queryKey: ["related", p?.category_id],
    enabled: !!p?.category_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("slug,name,short_description,original_price,offer_price,badge,rating,rating_count")
        .eq("category_id", p!.category_id!)
        .neq("slug", slug)
        .limit(4);
      return (data ?? []) as ProductCardData[];
    },
  });

  if (isLoading || !p) return <div className="mx-auto max-w-7xl px-6 py-20 text-center text-muted-foreground">Loading…</div>;

  const pct = discountPct(p.original_price, p.offer_price);

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/category/$slug" params={{ slug: "rings" }} className="hover:text-foreground">Jewellery</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{p.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12">
        {/* Gallery */}
        <div className="grid grid-cols-[80px_1fr] gap-4">
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <button key={i} className="aspect-square w-20 overflow-hidden rounded-lg border hairline bg-card hover:border-[color:var(--plum)]">
                <img src={productImage(p.slug)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-card border hairline">
            <img src={productImage(p.slug)} alt={p.name} className="h-full w-full object-cover" />
            {p.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-[color:var(--primary-soft)] text-[color:var(--plum-deep)] text-xs px-3 py-1.5">{p.badge}</span>
            )}
            <button aria-label="Wishlist" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-background/95 hover:text-[color:var(--plum)]"><Heart className="h-5 w-5" /></button>
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="font-serif text-3xl lg:text-4xl">{p.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {p.gold_purity ? `${p.gold_purity} ${color}` : p.metal_type} {p.certification && <>· {p.certification}</>}
          </p>
          <div className="flex items-center gap-2 mt-3 text-sm">
            <Star className="h-4 w-4 fill-[color:var(--gold)] text-[color:var(--gold)]" />
            <span className="font-medium">{p.rating?.toFixed(1)}</span>
            <span className="text-muted-foreground">({p.rating_count} reviews)</span>
          </div>

          <div className="gold-divider my-6" />

          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl">{inr(p.offer_price)}</span>
            {p.original_price > p.offer_price && (
              <>
                <span className="text-muted-foreground line-through">{inr(p.original_price)}</span>
                <span className="rounded-full bg-[color:var(--primary-soft)] text-[color:var(--plum)] text-xs px-2.5 py-1">{pct}% OFF</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>

          {/* Variant selectors */}
          {p.metal_type === "Gold" && (
            <>
              <div className="mt-7">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Metal Color</p>
                <div className="flex gap-3">
                  {["Rose Gold", "Yellow Gold", "White Gold"].map((c) => (
                    <button key={c} onClick={() => setColor(c)} className={`px-4 py-2 text-sm rounded-full border transition-colors ${color === c ? "border-[color:var(--plum)] bg-[color:var(--primary-soft)] text-[color:var(--plum-deep)]" : "border hairline hover:border-[color:var(--plum)]"}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Gold Purity</p>
                <div className="flex gap-3">
                  {["14KT", "18KT", "22KT"].map((k) => (
                    <button key={k} onClick={() => setKarat(k)} className={`px-5 py-2 text-sm rounded-full border ${karat === k ? "border-[color:var(--plum)] bg-[color:var(--primary-soft)] text-[color:var(--plum-deep)]" : "border hairline hover:border-[color:var(--plum)]"}`}>{k}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* CTAs */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <button onClick={() => toast.success("Added to cart")} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground hover:shadow-[var(--shadow-card)]">
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </button>
            <button onClick={() => toast.success("Added to wishlist")} className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[color:var(--plum)] px-6 py-3 text-sm font-medium text-[color:var(--plum)] hover:bg-[color:var(--primary-soft)]">
              <Heart className="h-4 w-4" /> Wishlist
            </button>
          </div>
          <button className="mt-3 w-full rounded-full bg-[color:var(--gold)] text-[color:var(--plum-deep)] px-6 py-3.5 text-sm font-medium hover:opacity-90">Buy Now</button>

          {/* Pincode */}
          <div className="mt-6 rounded-xl border hairline bg-card p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Delivery</p>
            <div className="flex gap-2">
              <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter pincode" className="flex-1 rounded-md border hairline px-3 py-2 text-sm outline-none focus:border-[color:var(--plum)]" />
              <button className="rounded-md bg-foreground text-background px-4 text-sm">Check</button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Estimated delivery in 3–7 business days. Free insured shipping.</p>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: ShieldCheck, l: "Certified" },
              { icon: RotateCcw, l: "15-day Returns" },
              { icon: Truck, l: "Free Shipping" },
            ].map(({ icon: I, l }) => (
              <div key={l} className="rounded-lg bg-[color:var(--primary-soft)] p-3 text-center">
                <I className="h-5 w-5 mx-auto text-[color:var(--plum)]" />
                <p className="text-[11px] mt-1.5">{l}</p>
              </div>
            ))}
          </div>

          {/* Accordion */}
          <div className="mt-8 space-y-2">
            {[
              { t: "Product Details", c: p.description },
              { t: "Certification", c: p.certification || "BIS-hallmarked gold. Diamonds certified by IGI / GIA where applicable." },
              { t: "Care Instructions", c: "Store separately in the Pavitram pouch. Avoid contact with perfume, cosmetics and water. Free professional cleaning at any Pavitram boutique." },
              { t: "Returns & Exchange", c: "15-day no-questions returns. Lifetime exchange at prevailing rates per our buyback grid." },
            ].map((a, i) => (
              <details key={i} className="group rounded-lg border hairline bg-card p-4">
                <summary className="cursor-pointer list-none flex items-center justify-between font-medium text-sm">
                  {a.t}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">⌄</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a.c}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      {related && related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-serif text-3xl">You may also like</h2>
          <div className="gold-divider w-24 mt-3 mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {related.map((r) => <ProductCard key={r.slug} p={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
