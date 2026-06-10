import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/site/SectionHeader";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import heroBridal from "@/assets/hero-bridal.jpg";
import heroPendant from "@/assets/hero-pendant.jpg";
import categoryCollection from "@/assets/category-collection.jpg";
import { ShieldCheck, Truck, RotateCcw, Sparkles, MapPin, ArrowRight, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pavitram Diamond Jewellery — Timeless Elegance. Crafted for You." },
      { name: "description", content: "Discover premium BIS-hallmarked gold, IGI-certified diamonds and heirloom-worthy Indian jewellery from Pavitram. Free insured shipping. 15-day returns." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const CATEGORIES = [
  { slug: "rings", label: "Rings" },
  { slug: "earrings", label: "Earrings" },
  { slug: "necklaces-pendants", label: "Pendants" },
  { slug: "bracelets-bangles", label: "Bangles" },
  { slug: "mangalsutras", label: "Mangalsutras" },
  { slug: "solitaires", label: "Solitaires" },
  { slug: "silver-jewellery", label: "Silver" },
  { slug: "gifting", label: "Gifting" },
];

const TESTIMONIALS = [
  { name: "Aanya M.", city: "Mumbai", text: "My bridal set from Pavitram is breathtaking. The craftsmanship is unmatched and the team made it feel personal at every step.", rating: 5 },
  { name: "Ritika S.", city: "Bengaluru", text: "Bought a solitaire pendant for our anniversary. It arrived beautifully packaged with the certificate. Truly heirloom quality.", rating: 5 },
  { name: "Neha K.", city: "Delhi", text: "Love the everyday luxe collection — light, elegant and perfect for daily wear. The 15-day return promise gave me confidence.", rating: 5 },
];

function HomePage() {
  const { data: bestsellers } = useQuery({
    queryKey: ["bestsellers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("slug,name,short_description,original_price,offer_price,badge,rating,rating_count")
        .eq("is_bestseller", true)
        .limit(4);
      return (data ?? []) as ProductCardData[];
    },
  });
  const { data: newArrivals } = useQuery({
    queryKey: ["new-arrivals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("slug,name,short_description,original_price,offer_price,badge,rating,rating_count")
        .eq("is_new_arrival", true)
        .limit(4);
      return (data ?? []) as ProductCardData[];
    },
  });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[image:var(--gradient-ivory)]">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-14 lg:py-24">
          <div className="order-2 lg:order-1">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--plum)]">The Bridal Edit · 2026</p>
            <h1 className="mt-4 font-serif text-5xl lg:text-7xl leading-[1.02] text-foreground">
              Heirloom diamonds,<br />
              <span className="italic text-[color:var(--plum)]">reimagined</span> for the modern bride.
            </h1>
            <div className="gold-divider w-28 my-7" />
            <p className="text-base text-muted-foreground max-w-md">
              Hand-crafted by master karigars. BIS-hallmarked gold. IGI-certified diamonds. Pieces designed to be passed down.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/collections" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)] transition-shadow">
                Explore The Bridal Edit <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/category/rings" className="inline-flex items-center gap-2 rounded-full border-2 border-[color:var(--plum)] px-7 py-3 text-sm font-medium text-[color:var(--plum)] hover:bg-[color:var(--primary-soft)] transition-colors">
                Shop New Arrivals
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-8 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[color:var(--gold)]" /> BIS Hallmarked</span>
              <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-[color:var(--gold)]" /> IGI Certified</span>
              <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-[color:var(--gold)]" /> Free Insured Shipping</span>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[4/5] max-w-md mx-auto rounded-3xl overflow-hidden shadow-[var(--shadow-lift)]">
              <img src={heroBridal} alt="Pavitram bridal jewellery" className="h-full w-full object-cover" />
            </div>
            <div className="hidden lg:block absolute -bottom-6 -left-6 w-44 rounded-2xl bg-card shadow-[var(--shadow-card)] p-4 border hairline">
              <img src={heroPendant} alt="" className="w-full aspect-square object-cover rounded-lg" />
              <p className="mt-2 text-xs font-serif">Twist Pendant</p>
              <p className="text-[11px] text-muted-foreground">From ₹29,760</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeader eyebrow="Shop by Category" title="Find your forever piece" />
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="group text-center">
              <div className="aspect-square rounded-full bg-[image:var(--gradient-ivory)] border hairline grid place-items-center overflow-hidden shadow-[var(--shadow-soft)] group-hover:shadow-[var(--shadow-card)] transition-shadow">
                <span className="font-serif text-2xl text-[color:var(--plum)]">{c.label.charAt(0)}</span>
              </div>
              <p className="mt-3 text-xs md:text-sm text-foreground group-hover:text-[color:var(--plum)]">{c.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <SectionHeader eyebrow="Featured Collections" title="Curated stories in gold & diamond" cta={{ label: "View all collections", to: "/collections" }} />
        <div className="grid lg:grid-cols-3 gap-6">
          {[
            { slug: "bridal", title: "The Bridal Edit", img: heroBridal, tag: "Heirloom" },
            { slug: "everyday-luxe", title: "Everyday Luxe", img: heroPendant, tag: "Daily Wear" },
            { slug: "festive", title: "Festive Glow", img: categoryCollection, tag: "Statement" },
          ].map((c) => (
            <Link key={c.slug} to="/collection/$slug" params={{ slug: c.slug }} className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
              <img src={c.img} alt={c.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--plum-deep)]/90 via-[color:var(--plum-deep)]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-[color:var(--ivory)]">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold)]">{c.tag}</p>
                <h3 className="font-serif text-2xl mt-1">{c.title}</h3>
                <p className="text-sm mt-3 inline-flex items-center gap-2 opacity-90 group-hover:gap-3 transition-all">Explore <ArrowRight className="h-4 w-4" /></p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeader eyebrow="Customer Favourites" title="Bestsellers" cta={{ label: "View all", to: "/category/rings" }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {(bestsellers ?? []).map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="bg-[color:var(--primary-soft)] py-20 mt-16">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader eyebrow="Just Landed" title="New Arrivals" cta={{ label: "Explore all", to: "/category/rings" }} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {(newArrivals ?? []).map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        </div>
      </section>

      {/* GIFTING */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center rounded-3xl bg-[image:var(--gradient-ivory)] p-8 lg:p-14 border hairline">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--plum)]">Gifting</p>
            <h2 className="mt-4 font-serif text-4xl lg:text-5xl">A keepsake, beautifully wrapped.</h2>
            <div className="gold-divider w-24 my-6" />
            <p className="text-muted-foreground max-w-md">Curated gifts from ₹4,999. Includes a signature Pavitram keepsake box, handwritten note, and complimentary engraving.</p>
            <Link to="/category/gifting" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground hover:shadow-[var(--shadow-card)]">
              Shop Gifting <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="aspect-[5/4] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
            <img src={categoryCollection} alt="Pavitram gifting" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, title: "100% Certified", sub: "Diamond Jewellery" },
            { icon: RotateCcw, title: "15-Day Returns", sub: "No questions asked" },
            { icon: Sparkles, title: "Lifetime Exchange", sub: "On all Pavitram pieces" },
            { icon: Truck, title: "Free & Insured", sub: "Shipping across India" },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-4 rounded-xl border hairline bg-card p-5">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--primary-soft)] text-[color:var(--plum)]"><Icon className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeader eyebrow="What our customers say" title="Loved by families across India" />
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl bg-card border hairline p-7 shadow-[var(--shadow-soft)]">
              <div className="flex gap-0.5 text-[color:var(--gold)]">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-4 font-serif text-lg leading-relaxed text-foreground">&ldquo;{t.text}&rdquo;</p>
              <p className="mt-6 text-sm text-muted-foreground">— {t.name}, {t.city}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STORE LOCATOR TEASER */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl bg-[color:var(--plum-deep)] text-[color:var(--ivory)] p-10 lg:p-14 flex flex-col lg:flex-row items-start lg:items-center gap-8 justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--gold)]">Visit a Pavitram boutique</p>
            <h2 className="mt-3 font-serif text-3xl lg:text-4xl">Try on. Be styled. Take home a story.</h2>
            <p className="mt-3 text-sm text-[color:var(--ivory)]/80 max-w-xl">Now in 6 cities across India — book a personal styling appointment or simply walk in.</p>
          </div>
          <Link to="/stores" className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] text-[color:var(--plum-deep)] px-7 py-3.5 text-sm font-medium hover:opacity-90">
            <MapPin className="h-4 w-4" /> Find a store
          </Link>
        </div>
      </section>
    </>
  );
}
