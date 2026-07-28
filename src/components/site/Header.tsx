import { Link } from "@tanstack/react-router";
import { Search, MapPin, User, Heart, ShoppingBag } from "lucide-react";
import { Logo } from "./Logo";

const NAV = [
  { label: "Rings", to: "/category/rings" },
  { label: "Earrings", to: "/category/earrings" },
  { label: "Bracelets & Bangles", to: "/category/bracelets-bangles" },
  { label: "Solitaires", to: "/category/solitaires" },
  { label: "Mangalsutras", to: "/category/mangalsutras" },
  { label: "Necklaces & Pendants", to: "/category/necklaces-pendants" },
  { label: "Silver Jewellery", to: "/category/silver-jewellery" },
  { label: "Gifting", to: "/category/gifting" },
  { label: "Collections", to: "/collections" },
  { label: "Stores", to: "/stores" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b hairline">
      {/* Promo strip */}
      <div className="bg-[color:var(--plum-deep)] text-[color:var(--ivory)] text-xs">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-center gap-2">
          <span className="text-[color:var(--gold)]">★</span>
          <span>FLAT 50% OFF on Making Charges of All Diamond Jewellery</span>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-6">
        <Logo className="h-16 w-auto shrink-0" />

        <div className="hidden md:flex flex-1 max-w-2xl items-center rounded-full border hairline bg-card px-5 py-2.5 shadow-[var(--shadow-soft)]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search for rings, earrings, pendants…"
            className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <nav className="ml-auto flex items-center gap-5 text-foreground/80">
          <Link to="/stores" className="hidden lg:inline-flex items-center gap-1.5 text-sm hover:text-primary">
            <MapPin className="h-4 w-4" /> Stores
          </Link>
          <Link to="/account" aria-label="Account" className="hover:text-primary"><User className="h-5 w-5" /></Link>
          <Link to="/wishlist" aria-label="Wishlist" className="hover:text-primary"><Heart className="h-5 w-5" /></Link>
          <Link to="/cart" aria-label="Cart" className="relative hover:text-primary">
            <ShoppingBag className="h-5 w-5" />
          </Link>
        </nav>
      </div>

      {/* Category nav */}
      <div className="hidden md:block border-t hairline">
        <nav className="mx-auto max-w-7xl px-4">
          <ul className="flex items-center gap-7 overflow-x-auto py-3 text-[13px] tracking-wide text-foreground/80">
            {NAV.map((n) => (
              <li key={n.to} className="shrink-0">
                <Link
                  to={n.to}
                  className="hover:text-primary relative py-1 transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-[color:var(--gold)] hover:after:w-full after:transition-all"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
