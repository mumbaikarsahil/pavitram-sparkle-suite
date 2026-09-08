import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, Search, Heart, User } from "lucide-react";

// ✨ FIX: Capitalized "/Shop" and "/Search" to match TanStack Router's strict typing
const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/Shop", label: "Shop", icon: LayoutGrid },
  { to: "/Search", label: "Search", icon: Search },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/login", label: "Account", icon: User },
] as const;

export function MobileBottomNav() {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only trigger if scrolled more than 50px to prevent jitter at the very top
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsScrollingDown(true);
      } else if (currentScrollY < lastScrollY) {
        setIsScrollingDown(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav 
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E9D8C3] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out"
      // Accounts for iOS safe areas at the bottom of the screen
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <ul className="flex w-full justify-around items-end pt-3 pb-2 px-2">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1 flex justify-center">
            <Link 
              to={to} 
              activeProps={{ className: "text-[#4A1F58]" }}
              inactiveProps={{ className: "text-zinc-400 hover:text-[#C9A15B]" }}
              className="flex flex-col items-center justify-end w-full transition-colors group"
            >
              <Icon 
                className={`transition-all duration-300 ${
                  isScrollingDown ? 'w-5 h-5 mb-1' : 'w-[22px] h-[22px] mb-1.5'
                }`} 
                strokeWidth={1.5}
              />
              <span 
                className={`font-sans font-bold uppercase tracking-[0.15em] transition-all duration-300 overflow-hidden flex items-center justify-center ${
                  isScrollingDown 
                    ? 'h-0 opacity-0 text-[0px]' 
                    : 'h-3 opacity-100 text-[8px]'
                }`}
              >
                {label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}