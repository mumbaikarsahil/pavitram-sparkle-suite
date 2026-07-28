import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/components/site/SectionHeader";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import heroBridal from "@/assets/model1a.png";
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
        {/* Reduced padding: py-6 on mobile, py-10 on tablet, py-14 on desktop. Enforced 2-columns everywhere with grid-cols-2 and no ordering changes. Gaps are tighter to accommodate the overlap. */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-2 gap-3 sm:gap-8 lg:gap-12 items-center py-6 sm:py-10 lg:py-14">
          
          {/* Left Side: Text Content - Higher z-index to keep critical text above image, but still allows some overlap from badges. */}
          <div className="relative z-20 flex flex-col justify-center pr-3">
            <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.28em] text-[color:var(--plum)] font-semibold">
              The Bridal Edit · 2026
            </p>
            <h1 className="mt-1.5 sm:mt-4 font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-foreground">
              Heirloom diamonds,<br />
              <span className="italic text-[color:var(--plum)]">reimagined</span> for the modern bride.
            </h1>
            <div className="gold-divider w-12 sm:w-24 my-3 sm:my-6" />
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground max-w-md leading-relaxed">
              Hand-crafted by master karigars. BIS-hallmarked gold. IGI-certified diamonds. Pieces designed to be passed down.
            </p>
            <div className="mt-4 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
              <Link to="/collections" className="inline-flex items-center justify-center gap-1 sm:gap-2 rounded-full bg-primary px-3.5 py-2 sm:px-7 sm:py-3.5 text-[11px] sm:text-sm font-medium text-primary-foreground shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)] transition-shadow">
                Explore Edit <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              </Link>
              <Link to="/category/rings" className="inline-flex items-center justify-center gap-1 sm:gap-2 rounded-full border border-[color:var(--plum)] sm:border-2 px-3.5 py-2 sm:px-7 sm:py-3 text-[11px] sm:text-sm font-medium text-[color:var(--plum)] hover:bg-[color:var(--primary-soft)] transition-colors">
                New Arrivals
              </Link>
            </div>
            {/* These badges might overlap slightly with the image - text is z-20, so it should stay clear, icons might touch. Gaps are tighter to make them fit. */}
            <div className="mt-5 sm:mt-10 flex flex-wrap gap-2 sm:gap-6 text-[10px] sm:text-xs text-muted-foreground font-medium">
              <span className="inline-flex items-center gap-1 sm:gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[color:var(--gold)] shrink-0" /> BIS Hallmarked</span>
              <span className="inline-flex items-center gap-1 sm:gap-1.5"><Sparkles className="h-3.5 w-3.5 text-[color:var(--gold)] shrink-0" /> IGI Certified</span>
              <span className="inline-flex items-center gap-1 sm:gap-1.5"><Truck className="h-3.5 w-3.5 text-[color:var(--gold)] shrink-0" /> Free Shipping</span>
            </div>
          </div>

          {/* Right Side: Simple Transparent Model Image with NEW Plum Background Glow and Large Mobile Overlap. Lower z-index so image doesn't totally hide text. */}
          <div className="relative z-10 flex justify-center items-center h-full pt-16 sm:pt-0 overflow-visible">
            
            {/* 1. New Ambient Secondary Color Glow (Plum) Behind the Model, significantly larger and centered on image div.blur-2xl sm:blur-3xl creates soft edge. -z-20 puts it way back. */}
            <div className="absolute w-[180%] h-[180%] -top-[40%] -left-[40%] -z-20 bg-[radial-gradient(ellipse_at_center,var(--plum-glow),transparent_65%)] blur-2xl sm:blur-3xl pointer-events-none" />

            <div className="relative w-full h-full">
              {/* Old max-width and sizing is removed to allow large mobile width and absolute positioning for overlap. */}
              
              {/* Old mask and image settings are maintained, but new sizing and positioning are applied. */}
              {/* On mobile: width is forced to 150% with max-w-none to make it massive and overflow the div. -translate-x-[25%] pulls it left over the text part. z-30 on the image element keeps it on top of its background glow. object-contain and object-bottom ensure model is whole and cuts nicely with mask. */}
              <img 
                src={heroBridal} 
                alt="Pavitram bridal jewellery model" 
                className="w-[150%] max-w-none absolute bottom-0 left-0 sm:relative sm:w-full sm:max-w-md sm:h-auto object-contain object-bottom drop-shadow-md -translate-x-[25%] sm:translate-x-0 z-30 [mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)]" 
              />
              
              {/* Old bottom glow is kept and scaled down slightly on mobile. */}
              <div className="absolute bottom-0 inset-x-0 h-12 sm:h-24 bg-gradient-to-t from-[color:var(--gold)]/25 via-[color:var(--gold)]/5 to-transparent blur-md sm:blur-lg z-20 pointer-events-none" />
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