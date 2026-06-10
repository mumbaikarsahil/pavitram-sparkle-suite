import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { inr, discountPct } from "@/lib/format";
import { productImage } from "@/lib/product-image";

export type ProductCardData = {
  slug: string;
  name: string;
  short_description: string | null;
  original_price: number;
  offer_price: number;
  badge: string | null;
  rating: number | null;
  rating_count: number | null;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const pct = discountPct(p.original_price, p.offer_price);
  return (
    <Link
      to="/product/$slug"
      params={{ slug: p.slug }}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-xl bg-card hairline border shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]">
        {p.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-[color:var(--primary-soft)] text-[color:var(--plum-deep)] text-[11px] font-medium px-3 py-1 border hairline">
            {p.badge}
          </span>
        )}
        <button
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-foreground/70 hover:text-primary"
          onClick={(e) => { e.preventDefault(); }}
        >
          <Heart className="h-4 w-4" />
        </button>
        <div className="aspect-square overflow-hidden bg-[color:var(--muted)]">
          <img
            src={productImage(p.slug)}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </div>
      <div className="px-1 pt-4">
        <h3 className="font-serif text-base text-foreground line-clamp-1">{p.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.short_description}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-medium text-foreground">{inr(p.offer_price)}</span>
          {p.original_price > p.offer_price && (
            <>
              <span className="text-xs text-muted-foreground line-through">{inr(p.original_price)}</span>
              <span className="text-xs text-[color:var(--plum)]">{pct}% off</span>
            </>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-[color:var(--gold)] text-[color:var(--gold)]" />
          <span className="text-foreground/80">{p.rating?.toFixed(1) ?? "—"}</span>
          <span>({p.rating_count ?? 0})</span>
          <span className="ml-auto text-[color:var(--plum)]">Free Shipping</span>
        </div>
      </div>
    </Link>
  );
}
