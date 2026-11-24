import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  ChevronDown,
  Navigation,
  Store,
  ChevronRight,
  MapPin,
  Menu,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Logo } from "./Logo";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url?: string;
  model_image_url?: string;
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function Header() {
  const navigate = useNavigate({ from: "/" });

  const [categories, setCategories] = useState<Category[]>([]);
  const [storeLocations, setStoreLocations] = useState<any[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [activeParent, setActiveParent] = useState<Category | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);

  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [activeLocationLabel, setActiveLocationLabel] = useState<string | null>(null);
  const [nearestStore, setNearestStore] = useState<any | null>(null);
  const [nearestDistance, setNearestDistance] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasPromptedLocation, setHasPromptedLocation] = useState(false);

  const locationMenuRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("pavitram_user");
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user data");
        }
      } else {
        setCurrentUser(null);
      }
    };

    checkUser();
    window.addEventListener("authStateChange", checkUser);
    return () => window.removeEventListener("authStateChange", checkUser);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationMenuRef.current && locationMenuRef.current.contains(event.target as Node)) {
        return;
      }
      if ((event.target as Element).closest(".location-toggle-btn")) {
        return;
      }
      setIsLocationMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    async function fetchStores() {
      try {
        const { data, error } = await supabase
          .from("store_locations")
          .select("name, address, phone, latitude, longitude")
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data) {
          const formattedStores = data.map((store) => ({
            ...store,
            lat: Number(store.latitude),
            lng: Number(store.longitude),
          }));
          setStoreLocations(formattedStores);
        }
      } catch (err) {
        console.error("Failed to fetch store locations:", err);
      }
    }
    fetchStores();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCats(true);
      try {
        const { data, error } = await supabase
          .from("ecommerce_categories")
          .select("id, name, slug, parent_id, image_url, model_image_url")
          .eq("is_active", true)
          .order("name", { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error("Header category fetch error:", err);
      } finally {
        setIsLoadingCats(false);
      }
    };

    fetchCategories();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pavitram_user");
    setCurrentUser(null);
    window.dispatchEvent(new Event("authStateChange"));
    navigate({ to: "/" });
  };

  const topCategories = categories.filter((cat) => !cat.parent_id);
  const subCategories = activeParent
    ? categories.filter((cat) => cat.parent_id === activeParent.id)
    : [];

  const handleLocateMe = () => {
    setIsLocating(true);
    setHasPromptedLocation(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          let closest = null;
          let minDistance = Infinity;

          storeLocations.forEach((store) => {
            if (store.lat && store.lng) {
              const dist = getDistanceFromLatLonInKm(userLat, userLng, store.lat, store.lng);
              if (dist < minDistance) {
                minDistance = dist;
                closest = store;
              }
            }
          });

          setNearestStore(closest);
          setNearestDistance(minDistance);
          setActiveLocationLabel("Current Location");
          setLocationQuery("");
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleLocationMenuClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const willOpen = !isLocationMenuOpen;
    setIsLocationMenuOpen(willOpen);

    if (willOpen && !hasPromptedLocation && !nearestStore) {
      handleLocateMe();
    }
  };

  const handleLocationSearch = async () => {
    const query = locationQuery.trim();
    if (!query) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", India")}&format=json&limit=1`
      );
      const data = await response.json();

      let closest = null;
      let minDistance = Infinity;

      if (data && data.length > 0) {
        const userLat = parseFloat(data[0].lat);
        const userLng = parseFloat(data[0].lon);

        storeLocations.forEach((store) => {
          if (store.lat && store.lng) {
            const dist = getDistanceFromLatLonInKm(userLat, userLng, store.lat, store.lng);
            if (dist < minDistance) {
              minDistance = dist;
              closest = store;
            }
          }
        });

        setNearestStore(closest);
        setNearestDistance(minDistance);
        setActiveLocationLabel(query.toUpperCase());
      } else {
        const lowerQuery = query.toLowerCase();
        const keywords = lowerQuery.split(/\s+/);

        const matches = storeLocations.filter((store) => {
          const storeSearchableText =
            `${store.name} ${store.address} ${store.phone || ""}`.toLowerCase();
          return keywords.every((keyword) => storeSearchableText.includes(keyword));
        });

        if (matches.length > 0) {
          setNearestStore(matches[0]);
          setNearestDistance(null);
          setActiveLocationLabel(query.toUpperCase());
        } else {
          setNearestStore(null);
          setNearestDistance(null);
        }
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      setNearestStore(null);
      setNearestDistance(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 font-sans border-b border-[#E9D8C3]/60 bg-[#FFFDF9] relative">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      {/* CLEAN MOBILE NAVIGATION BAR */}
<div className="md:hidden h-[72px] w-full flex items-center justify-between px-3 sm:px-4 relative z-10">
  {/* Left: Menu Button + Main Logo */}
  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-10">
    <button
      onClick={() => setIsMobileMenuOpen(true)}
      aria-label="Menu"
      className="text-[#302832] hover:text-[#C9A15B] active:scale-95 transition-all shrink-0 p-1.5"
    >
      <Menu strokeWidth={1.6} className="w-[22px] h-[22px]" />
    </button>

    <Link to="/" aria-label="Pavitram Home" className="flex items-center shrink-0">
      <Logo className="h-10 sm:h-11 w-auto object-contain shrink-0" />
    </Link>
  </div>

  {/* Center: Larger Branded Text Logo */}
  <Link
    to="/"
    className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-10"
  >
    <img
      src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/logo2.webp"
      alt="Pavitram Diamond Jewellery"
      className="h-[30px] sm:h-[36px] w-auto object-contain"
    />
  </Link>

  {/* Right: Action Pill */}
  <div className="shrink-0 flex items-center gap-2.5 sm:gap-3 bg-white rounded-full shadow-sm border border-[#E9D8C3] px-3 py-2 z-10">
    <button
      onClick={handleLocationMenuClick}
      aria-label="Locate Store"
      className="relative text-[#4A1F58] hover:text-[#C9A15B] active:scale-90 transition-all location-toggle-btn"
    >
      <Store strokeWidth={1.6} className="w-[18px] h-[18px] pointer-events-none" />
      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#C9A15B] rounded-full pointer-events-none" />
    </button>
    <Link to="/Search" aria-label="Search" className="text-[#302832] hover:text-[#C9A15B] transition-colors">
      <Search strokeWidth={1.6} className="w-[18px] h-[18px]" />
    </Link>
    <Link to="/cart" aria-label="Cart" className="text-[#302832] hover:text-[#C9A15B] transition-colors relative">
      <ShoppingBag strokeWidth={1.6} className="w-[18px] h-[18px]" />
      <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-[#C9A15B] rounded-full shadow-[0_0_0_2px_#FFFDF9]" />
    </Link>
  </div>
</div>

      {/* CLEAN DESKTOP NAVIGATION BAR */}
      <div className="hidden md:flex mx-auto max-w-[1400px] px-4 md:px-8 py-4 items-center justify-between gap-6 relative z-10 h-[88px]">
        {/* Brand Logo */}
        <div className="shrink-0 flex items-center">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="h-[46px] w-auto object-contain shrink-0" />
            <img
              src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/logo2.webp"
              alt="Pavitram Diamond Jewellery"
              className="h-10 w-auto object-contain shrink-0"
            />
          </Link>
        </div>

        {/* Clean Search Bar */}
        <div className="flex-1 max-w-[540px] flex items-center px-2">
          <div className="w-full h-[44px] flex items-center rounded-full border border-[#E9D8C3] bg-white px-5 focus-within:border-[#C9A15B] focus-within:shadow-md transition-all shadow-sm group">
            <Search
              strokeWidth={1.6}
              className="h-4 w-4 text-zinc-400 group-focus-within:text-[#C9A15B] transition-colors"
            />
            <input
              type="search"
              placeholder="Search for diamond rings, earrings, necklaces..."
              className="ml-3 w-full h-full bg-transparent text-[13px] font-sans outline-none placeholder:text-zinc-400 text-[#302832]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate({ to: "/Search", search: { q: e.currentTarget.value } as any });
                }
              }}
            />
          </div>
        </div>

        {/* Right Actions: Interactive Store Locator Pill + User/Wishlist/Cart */}
        <div className="flex items-center gap-6 h-full shrink-0">
          <div className="relative flex h-full items-center">
            <button
              type="button"
              onClick={handleLocationMenuClick}
              className="location-toggle-btn group flex h-[46px] items-center gap-3 cursor-pointer bg-[#FCF9F5] hover:bg-white border border-[#C9A15B]/60 hover:border-[#4A1F58] shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] px-5 rounded-full transition-all duration-200"
            >
              <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#4A1F58]/10 text-[#4A1F58] group-hover:bg-[#4A1F58] group-hover:text-white transition-colors pointer-events-none">
                <MapPin strokeWidth={1.75} className="w-3.5 h-3.5" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A15B] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C9A15B]" />
                </span>
              </div>

              <div className="flex flex-col items-start justify-center pointer-events-none text-left">
                <span className="text-[9px] text-[#C9A15B] font-sans font-bold uppercase tracking-[0.14em] leading-none mb-1">
                  {nearestStore ? `Nearest: ${nearestStore.name.split(" ")[0]}` : "Locate Store"}
                </span>
                <span className="text-[12px] font-sans font-bold text-[#4A1F58] flex items-center gap-1 leading-none uppercase tracking-wider">
                  {activeLocationLabel ? activeLocationLabel : "Find a Showroom"}
                  <ChevronDown
                    strokeWidth={2.2}
                    className={`w-3.5 h-3.5 text-[#C9A15B] transition-transform duration-200 ${
                      isLocationMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </div>
            </button>
          </div>

          <nav className="flex items-center gap-5">
            {currentUser ? (
              <div className="relative group flex items-center cursor-pointer">
                <span className="text-[12px] font-sans font-bold text-[#4A1F58] uppercase tracking-widest group-hover:text-[#C9A15B] transition-colors">
                  HI, {currentUser.full_name?.split(" ")[0].toUpperCase() || "USER"}
                </span>
                <div className="absolute top-full right-0 mt-4 w-40 bg-white border border-[#E9D8C3] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all rounded-sm z-50">
                  <div className="flex flex-col py-2">
                    <Link
                      to="/Account"
                      className="px-4 py-2 text-xs font-sans text-zinc-600 hover:bg-[#F7F1E8] hover:text-[#4A1F58]"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/Account"
                      className="px-4 py-2 text-xs font-sans text-zinc-600 hover:bg-[#F7F1E8] hover:text-[#4A1F58]"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-left px-4 py-2 text-xs font-sans text-rose-600 hover:bg-rose-50 w-full"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                aria-label="Account"
                className="text-[#302832] hover:text-[#C9A15B] transition-colors"
              >
                <User strokeWidth={1.5} className="h-6 w-6" />
              </Link>
            )}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="text-[#302832] hover:text-[#C9A15B] transition-colors"
            >
              <Heart strokeWidth={1.5} className="h-[22px] w-[22px]" />
            </Link>
            <Link
              to="/cart"
              aria-label="Cart"
              className="text-[#302832] hover:text-[#C9A15B] transition-colors relative"
            >
              <ShoppingBag strokeWidth={1.5} className="h-[22px] w-[22px]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C9A15B] rounded-full shadow-sm" />
            </Link>
          </nav>
        </div>
      </div>

      {/* GLOBAL LOCATION DROPDOWN */}
      {isLocationMenuOpen && (
        <div
          ref={locationMenuRef}
          className="absolute top-[78px] md:top-[92px] right-2 md:right-8 w-[calc(100vw-16px)] md:w-[360px] bg-white rounded-xl md:rounded-sm shadow-[0_20px_50px_rgba(74,31,88,0.12)] border border-[#E9D8C3] p-6 z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="text-center mb-5">
            <h4 className="text-[#4A1F58] font-serif font-medium text-xl mb-1.5">
              Find Your Nearest Showroom
            </h4>
            <p className="text-xs font-sans text-zinc-500 leading-relaxed">
              Check in-store availability, book a visit, or get directions to Pavitram.
            </p>
          </div>

          {/* Prominent 1-Tap GPS Locate Button */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="w-full py-2.5 px-4 mb-4 rounded-lg bg-[#4A1F58] hover:bg-[#302832] active:scale-[0.98] disabled:opacity-70 text-white text-[11px] font-sans font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting Location...
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5 text-[#C9A15B]" /> Locate Nearest Store
              </>
            )}
          </button>

          <div className="flex items-center border-b border-[#E9D8C3] focus-within:border-[#4A1F58] pb-2 mb-5 transition-colors">
            <MapPin strokeWidth={1.5} className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Or enter City / Pincode"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLocationSearch()}
              className="flex-1 outline-none text-sm font-sans text-[#302832] bg-transparent placeholder:text-zinc-400"
            />
            <button
              onClick={handleLocationSearch}
              disabled={isSearching}
              className="text-[10px] font-bold text-[#4A1F58] uppercase tracking-[0.15em] hover:text-[#C9A15B] transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {isSearching && <Loader2 className="w-3 h-3 animate-spin" />}
              {activeLocationLabel ? "Change" : "Search"}
            </button>
          </div>

          {nearestStore ? (
            <div
              onClick={() => {
                setIsLocationMenuOpen(false);
                navigate({ to: "/stores", search: { q: nearestStore.name } as any });
              }}
              className="flex items-center gap-4 bg-[#F7F1E8] border border-[#E9D8C3] rounded-lg p-4 hover:border-[#C9A15B] transition-all mb-4 group cursor-pointer"
            >
              <div className="bg-[#4A1F58] text-white rounded-md w-12 h-12 flex flex-col items-center justify-center shrink-0">
                {nearestDistance !== null ? (
                  <>
                    <span className="text-sm font-serif font-medium leading-none">
                      {nearestDistance.toFixed(1)}
                    </span>
                    <span className="text-[8px] font-sans font-medium tracking-widest mt-1 opacity-80 uppercase">
                      KM
                    </span>
                  </>
                ) : (
                  <Store strokeWidth={1.5} className="w-5 h-5 opacity-90" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-zinc-500 block mb-1">
                  Nearest Showroom
                </span>
                <span className="text-sm font-serif font-medium text-[#302832] flex items-center justify-between group-hover:text-[#4A1F58] transition-colors">
                  <span className="truncate max-w-[170px]">{nearestStore.name}</span>
                  <ChevronRight strokeWidth={1.5} className="w-4 h-4 text-[#C9A15B] shrink-0" />
                </span>
              </div>
            </div>
          ) : (
            locationQuery &&
            !isSearching && (
              <div className="text-center py-3 text-xs font-sans text-rose-500 bg-rose-50 rounded-md mb-4">
                No stores found matching your search.
              </div>
            )
          )}

          <div className="text-center pt-1">
            <Link
              to="/stores"
              onClick={() => setIsLocationMenuOpen(false)}
              className="text-[10px] font-sans font-bold text-[#C9A15B] hover:text-[#4A1F58] uppercase tracking-[0.15em] inline-flex items-center justify-center gap-1 group transition-colors"
            >
              View All Showrooms{" "}
              <ChevronRight
                strokeWidth={2}
                className="w-3 h-3 group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      )}

      {/* CLEAN DESKTOP CATEGORY NAVIGATION BAR */}
      <div
        className="hidden md:block relative bg-[#4A1F58] border-t border-b border-[#30103A] z-40"
        onMouseLeave={() => {
          setIsMenuOpen(false);
          setActiveParent(null);
        }}
      >
        <nav className="relative z-10 mx-auto max-w-[1400px] px-8 h-[50px] flex items-center justify-center overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <ul className="flex items-center gap-10">
            {topCategories.map((parent) => {
              const hasChildren = categories.some((c) => c.parent_id === parent.id);
              const isSelected = activeParent?.id === parent.id && isMenuOpen;
              return (
                <li
                  key={parent.id}
                  className="h-full flex items-center shrink-0 group"
                  onMouseEnter={() => {
                    setActiveParent(parent);
                    setIsMenuOpen(true);
                    setIsLocationMenuOpen(false);
                  }}
                >
                  <Link
                    to="/category/$slug"
                    params={{ slug: parent.slug }}
                    className={`whitespace-nowrap flex items-center gap-1.5 text-[11px] font-sans font-bold tracking-[0.15em] uppercase transition-colors h-full border-b-2 ${
                      isSelected
                        ? "text-white border-white"
                        : "text-white/80 border-transparent hover:text-white"
                    }`}
                  >
                    {parent.name}
                    {hasChildren && (
                      <ChevronDown
                        strokeWidth={2}
                        className={`h-3 w-3 transition-transform ${
                          isSelected ? "rotate-180 text-white" : "text-white/50 group-hover:text-white"
                        }`}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {isMenuOpen && activeParent && (
          <div
            className="absolute left-0 top-full w-full bg-[#FFFDF9] shadow-[0_20px_40px_rgba(74,31,88,0.1)] z-50 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-[#E9D8C3]"
            onMouseEnter={() => setIsMenuOpen(true)}
          >
            <div className="mx-auto max-w-[1400px] px-12 py-10 grid grid-cols-12 gap-10 relative">
              <div className="col-span-2 space-y-4 border-r border-[#E9D8C3] pr-6 relative z-10">
                <h4 className="text-[10px] font-sans font-bold text-[#C9A15B] uppercase tracking-[0.2em] mb-6">
                  Featured
                </h4>
                <ul className="space-y-4 text-xs font-sans font-medium text-zinc-500 tracking-wide">
                  <li>
                    <Link
                      to="/category/$slug"
                      params={{ slug: activeParent.slug }}
                      className="hover:text-[#4A1F58] text-[#302832] font-bold block transition-colors"
                    >
                      All {activeParent.name}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/category/$slug"
                      params={{ slug: activeParent.slug }}
                      className="hover:text-[#4A1F58] block transition-colors"
                    >
                      Latest Designs
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/category/$slug"
                      params={{ slug: activeParent.slug }}
                      className="hover:text-[#4A1F58] block transition-colors"
                    >
                      Bestsellers
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/category/$slug"
                      params={{ slug: activeParent.slug }}
                      className="hover:text-[#4A1F58] block transition-colors"
                    >
                      Ready to Ship
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="col-span-3 space-y-4 border-r border-[#E9D8C3] pr-6 relative z-10">
                <h4 className="text-[10px] font-sans font-bold text-[#C9A15B] uppercase tracking-[0.2em] mb-6">
                  Shop By Style
                </h4>
                {subCategories.length === 0 ? (
                  <p className="text-xs font-sans text-zinc-400 italic">No styles listed.</p>
                ) : (
                  <ul className="space-y-4">
                    {subCategories.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          to="/category/$slug"
                          params={{ slug: sub.slug }}
                          className="text-xs font-sans font-medium text-zinc-500 hover:text-[#4A1F58] transition-colors block tracking-wide"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-span-2 space-y-4 border-r border-[#E9D8C3] pr-6 relative z-10">
                <h4 className="text-[10px] font-sans font-bold text-[#C9A15B] uppercase tracking-[0.2em] mb-6">
                  Shop By Price
                </h4>
                <ul className="space-y-4 text-xs font-sans font-medium text-zinc-500 tracking-wide">
                  <li>
                    <Link
                      to="/category/$slug"
                      params={{ slug: activeParent.slug }}
                      className="hover:text-[#4A1F58] block transition-colors"
                    >
                      Under ₹ 15,000
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/category/$slug"
                      params={{ slug: activeParent.slug }}
                      className="hover:text-[#4A1F58] block transition-colors"
                    >
                      ₹ 15k - ₹ 30k
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/category/$slug"
                      params={{ slug: activeParent.slug }}
                      className="hover:text-[#4A1F58] block transition-colors"
                    >
                      ₹ 30k - ₹ 50k
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/category/$slug"
                      params={{ slug: activeParent.slug }}
                      className="hover:text-[#4A1F58] block transition-colors"
                    >
                      Above ₹ 50,000
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="col-span-5 grid grid-cols-2 gap-6 pl-4 relative z-10">
                <Link
                  to="/category/$slug"
                  params={{ slug: activeParent.slug }}
                  onClick={() => setIsMenuOpen(false)}
                  className="group relative rounded-sm overflow-hidden bg-white border border-[#E9D8C3] flex flex-col justify-between aspect-[4/5] shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="w-full h-3/4 overflow-hidden bg-[#F7F1E8]">
                    {activeParent.image_url ? (
                      <img
                        src={activeParent.image_url}
                        alt={activeParent.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300 font-sans text-xs uppercase tracking-widest">
                        {activeParent.name}
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-white text-center border-t border-[#E9D8C3]">
                    <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#302832] group-hover:text-[#C9A15B] transition-colors">
                      Explore {activeParent.name}
                    </span>
                  </div>
                </Link>
                <Link
                  to="/category/$slug"
                  params={{ slug: activeParent.slug }}
                  onClick={() => setIsMenuOpen(false)}
                  className="group relative rounded-sm overflow-hidden bg-zinc-100 flex flex-col justify-end aspect-[4/5] shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="absolute inset-0 z-0 bg-[#E9D8C3]">
                    {(activeParent.model_image_url || activeParent.image_url) && (
                      <img
                        src={activeParent.model_image_url || activeParent.image_url}
                        alt={`${activeParent.name} Model`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 origin-center"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4A1F58]/90 via-[#4A1F58]/20 to-transparent opacity-80 z-10 pointer-events-none transition-opacity group-hover:opacity-100" />
                  <div className="relative z-20 p-6 text-left w-full">
                    <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-[#C9A15B] block mb-1">
                      Curated Collection
                    </span>
                    <h5 className="text-2xl font-serif font-medium text-white leading-tight mb-2">
                      {activeParent.name}
                    </h5>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE SLIDE-OUT DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-0 left-0 w-[85%] max-w-[340px] h-[100dvh] bg-[#FFFDF9] shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#E9D8C3] shrink-0 bg-white shadow-sm">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[#4A1F58] hover:text-[#C9A15B] transition-colors -ml-2"
              >
                <X strokeWidth={2} className="w-6 h-6" />
              </button>

              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 flex justify-center items-center gap-2 px-1"
              >
                <Logo className="h-8 w-auto object-contain shrink-0" />
                <img
                  src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/logo2.webp"
                  alt="Pavitram Diamond Jewellery"
                  className="h-6 w-auto object-contain shrink-0"
                />
              </Link>
              <div className="w-10 shrink-0" />
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col">
              <div className="py-2 flex-1">
                {isLoadingCats ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-[#C9A15B]" />
                  </div>
                ) : topCategories.length === 0 ? (
                  <div className="text-center py-8 text-sm text-zinc-500">No categories found.</div>
                ) : (
                  topCategories.map((parent) => {
                    const children = categories.filter((c) => c.parent_id === parent.id);
                    const isExpanded = expandedMobileCat === parent.id;

                    return (
                      <div key={parent.id} className="border-b border-[#E9D8C3]/50 mx-4">
                        <div
                          className="flex items-center justify-between py-4 cursor-pointer"
                          onClick={() => {
                            if (children.length) {
                              setExpandedMobileCat(isExpanded ? null : parent.id);
                            } else {
                              setIsMobileMenuOpen(false);
                              navigate({ to: "/category/$slug", params: { slug: parent.slug } });
                            }
                          }}
                        >
                          <span className="text-sm font-sans font-bold text-[#4A1F58]">
                            {parent.name}
                          </span>
                          {children.length > 0 ? (
                            <ChevronRight
                              strokeWidth={2}
                              className={`w-4 h-4 text-[#4A1F58] transition-transform duration-300 ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          ) : (
                            <ChevronRight strokeWidth={2} className="w-4 h-4 text-zinc-300 opacity-50" />
                          )}
                        </div>

                        {isExpanded && children.length > 0 && (
                          <div className="pl-4 pb-4 flex flex-col gap-4 animate-in slide-in-from-top-1 fade-in duration-200">
                            <Link
                              to="/category/$slug"
                              params={{ slug: parent.slug }}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="text-xs font-sans font-bold text-[#C9A15B] uppercase tracking-widest"
                            >
                              All {parent.name}
                            </Link>
                            {children.map((sub) => (
                              <Link
                                key={sub.id}
                                to="/category/$slug"
                                params={{ slug: sub.slug }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-[13px] font-sans text-[#302832] hover:text-[#C9A15B]"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="px-4 py-4 shrink-0 mt-auto">
                <div
                  className="bg-white border border-[#C9A15B]/50 p-4 rounded-xl shadow-sm relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLocationMenuClick();
                  }}
                >
                  <div className="relative z-10">
                    <p className="text-xs font-sans font-bold text-[#4A1F58] mb-1">
                      Locate Nearest Showroom
                    </p>
                    <span className="text-[11px] font-sans font-bold text-[#C9A15B] uppercase tracking-widest flex items-center gap-1">
                      Find a Store <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                  <Store className="absolute -right-2 -bottom-2 w-12 h-12 text-[#F7F1E8] opacity-90 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="bg-[#4A1F58] p-6 flex flex-col gap-5 text-white shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
              {currentUser ? (
                <div className="flex flex-col gap-4 border-b border-white/10 pb-4 mb-1">
                  <span className="text-[12px] font-sans font-bold text-[#C9A15B] uppercase tracking-widest">
                    Welcome back, {currentUser.full_name?.split(" ")[0]}
                  </span>
                  <Link
                    to="/Account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[15px] font-sans font-medium hover:text-[#C9A15B] transition-colors"
                  >
                    My Profile & Orders
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left text-[15px] font-sans font-medium text-rose-300 hover:text-rose-200 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[15px] font-sans font-medium hover:text-[#C9A15B] transition-colors"
                >
                  Log In / Sign Up
                </Link>
              )}
              <Link
                to="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[15px] font-sans font-medium hover:text-[#C9A15B] transition-colors"
              >
                Wishlist
              </Link>
              <Link
                to="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[15px] font-sans font-medium hover:text-[#C9A15B] transition-colors"
              >
                Cart
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}