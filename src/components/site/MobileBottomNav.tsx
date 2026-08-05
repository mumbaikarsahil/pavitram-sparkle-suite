import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, Search, Heart, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/shop", label: "Shop", icon: LayoutGrid },
  { to: "/search", label: "Search", icon: Search },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account", label: "Account", icon: User },
] as const;

export function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t hairline">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link to={to} className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-foreground/70 hover:text-primary">
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
