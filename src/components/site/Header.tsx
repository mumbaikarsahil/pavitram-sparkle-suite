import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, User, Heart, ShoppingBag, ChevronDown, Navigation, Store, ChevronRight, Edit2, Menu, X, ArrowRight, Diamond, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "./Logo";
import { STORES_DATA } from "@/components/site/StoreLocator";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url?: string;
  model_image_url?: string;
}

// Reusable logic from Store Locator
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

const extractPincode = (address: string): number | null => {
  const match = address.match(/\b\d{6}\b/);
  return match ? parseInt(match[0], 10) : null;
};

export function Header() {
  const navigate = useNavigate({ from: '/' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [activeParent, setActiveParent] = useState<Category | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ✨ Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);

  // --- Location Pop-up State ---
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [activeLocationLabel, setActiveLocationLabel] = useState<string | null>(null);
  const [nearestStore, setNearestStore] = useState<any | null>(null);
  const [nearestDistance, setNearestDistance] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [hasPromptedLocation, setHasPromptedLocation] = useState(false);
  
  const locationMenuRef = useRef<HTMLDivElement>(null);

  // ✨ FIXED: Handle clicking outside the location dropdown securely for both mobile and desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If clicking inside the dropdown itself, do nothing
      if (locationMenuRef.current && locationMenuRef.current.contains(event.target as Node)) {
        return;
      }
      // If clicking a toggle button, let the onClick handler deal with it
      if ((event.target as Element).closest('.location-toggle-btn')) {
        return;
      }
      setIsLocationMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

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

          STORES_DATA.forEach(store => {
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

  const handleLocationSearch = () => {
    const query = locationQuery.trim().toLowerCase();
    if (!query) return;

    let closest = null;

    if (/^\d{6}$/.test(query)) {
      let minDiff = Infinity;
      const pin = parseInt(query, 10);
      
      STORES_DATA.forEach(store => {
        const storePin = extractPincode(store.address);
        if (storePin) {
          const diff = Math.abs(storePin - pin);
          if (diff < minDiff) {
            minDiff = diff;
            closest = store;
          }
        }
      });
    } else {
      closest = STORES_DATA.find(store => 
        store.name.toLowerCase().includes(query) || 
        store.address.toLowerCase().includes(query)
      ) || null;
    }

    setNearestStore(closest);
    setNearestDistance(null); 
    setActiveLocationLabel(query.toUpperCase());
  };

  return (
    <header className="sticky top-0 z-50 bg-[#4A1F58] md:bg-[#FCF9F5]/95 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-colors duration-300 font-sans md:border-b md:border-[#E9D8C3]/50">
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* ✨ 1. MOBILE NAVIGATION BAR (Matches Desktop functionality + Brand Guidelines) */}
      <div className="md:hidden h-[60px] w-full flex items-center justify-between px-3 sm:px-4 relative">
        
        {/* LEFT: Menu & Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Menu" 
            className="text-white hover:text-[#C9A15B] transition-colors p-1 -ml-1"
          >
            <Menu strokeWidth={1.5} className="w-[22px] h-[22px]" />
          </button>
          
          <Link 
            to="/" 
            className="flex flex-col justify-center pt-0.5"
          >
            <span 
              className="font-serif text-[17px] tracking-[0.18em] text-white uppercase leading-none"
              style={{ fontFamily: "'Cinzel', 'Trajan Pro', 'Baskerville', 'Cormorant Garamond', serif" }}
            >
              Pavitram
            </span>
            <span className="font-sans text-[6px] font-bold tracking-[0.25em] text-white/90 uppercase leading-none mt-1 ml-0.5">
              Diamond Jewellery
            </span>
          </Link>
        </div>

        {/* RIGHT: Quick Action Icons */}
        <div className="flex items-center gap-4 sm:gap-5">
          <button 
            onClick={handleLocationMenuClick}
            className="text-white hover:text-[#C9A15B] transition-colors location-toggle-btn"
            aria-label="Find Store"
          >
            <Store strokeWidth={1.5} className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] pointer-events-none" />
          </button>
          <Link to="/Search" className="text-white hover:text-[#C9A15B] transition-colors" aria-label="Search">
            <Search strokeWidth={1.5} className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
          </Link>
          <Link to="/wishlist" className="text-white hover:text-[#C9A15B] transition-colors" aria-label="Wishlist">
            <Heart strokeWidth={1.5} className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
          </Link>
          <Link to="/cart" className="text-white hover:text-[#C9A15B] transition-colors relative" aria-label="Cart">
            <ShoppingBag strokeWidth={1.5} className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#C9A15B] rounded-full shadow-[0_0_0_2px_#4A1F58]" />
          </Link>
        </div>

      </div>

      {/* ✨ 2. DESKTOP NAVIGATION BAR */}
      <div className="hidden md:flex mx-auto max-w-[1400px] px-4 md:px-8 py-1.5 items-center justify-between gap-8">
        
        <div className="shrink-0 flex items-center">
          <Link to="/">
            <Logo className="h-[60px] w-auto object-contain" />
          </Link>
        </div>

        {/* Luxury Search Bar */}
        <div className="flex-1 max-w-[500px] h-10 flex items-center rounded-sm border border-[#E9D8C3] bg-[#F7F1E8]/50 px-4 hover:border-[#C9A15B] focus-within:border-[#C9A15B] focus-within:bg-white focus-within:shadow-sm transition-all group">
          <Search strokeWidth={1.5} className="h-4 w-4 text-zinc-400 group-focus-within:text-[#C9A15B] transition-colors" />
          <input
            type="search"
            placeholder="Search for rings, earrings, pendants…"
            className="ml-3 w-full h-full bg-transparent text-[13px] font-sans outline-none placeholder:text-zinc-400 text-[#302832]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate({ to: '/Search', search: { q: e.currentTarget.value } as any });
              }
            }}
          />
        </div>

        <div className="flex items-center gap-6 h-full">
          {/* Luxury Find a Store Selector */}
          <div className="relative flex h-full items-center">
            <div 
              onClick={handleLocationMenuClick}
              className="flex h-10 items-center gap-3 cursor-pointer bg-white border border-[#E9D8C3] hover:border-[#C9A15B] hover:shadow-sm px-4 rounded-sm transition-all group location-toggle-btn"
            >
              <Store strokeWidth={1.5} className="w-4 h-4 text-[#C9A15B] group-hover:text-[#4A1F58] transition-colors pointer-events-none" />
              <div className="flex flex-col items-start pr-1 justify-center pointer-events-none">
                <span className="text-[8px] text-zinc-400 font-sans font-bold uppercase tracking-[0.2em] leading-none mb-1">
                   {nearestStore ? `Store: ${nearestStore.name.split(' ')[0]}` : 'Find a Store'}
                </span>
                <span className="text-[10px] font-sans font-bold text-[#4A1F58] flex items-center gap-1.5 leading-none uppercase tracking-[0.15em] group-hover:text-[#C9A15B] transition-colors">
                   {activeLocationLabel ? activeLocationLabel : 'Select Location'} 
                   <Edit2 strokeWidth={2} className="w-2.5 h-2.5 opacity-60" />
                </span>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-5">
            <Link to="/login" aria-label="Account" className="text-[#302832] hover:text-[#C9A15B] transition-colors">
              <User strokeWidth={1.5} className="h-[22px] w-[22px]" />
            </Link>
            <Link to="/wishlist" aria-label="Wishlist" className="text-[#302832] hover:text-[#C9A15B] transition-colors">
              <Heart strokeWidth={1.5} className="h-[22px] w-[22px]" />
            </Link>
            <Link to="/cart" aria-label="Cart" className="text-[#302832] hover:text-[#C9A15B] transition-colors relative">
              <ShoppingBag strokeWidth={1.5} className="h-[22px] w-[22px]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#C9A15B] rounded-full shadow-[0_0_0_2px_white]" />
            </Link>
          </nav>
        </div>
      </div>

      {/* ✨ GLOBAL LOCATION DROPDOWN (Works for both Mobile & Desktop buttons) */}
      {isLocationMenuOpen && (
        <div 
          ref={locationMenuRef}
          className="absolute top-[60px] md:top-[68px] right-2 md:right-8 w-[calc(100vw-16px)] md:w-[340px] bg-white rounded-sm shadow-[0_20px_40px_rgba(74,31,88,0.08)] border border-[#E9D8C3] p-6 md:p-8 z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="text-center mb-6">
            <h4 className="text-[#4A1F58] font-serif font-medium text-xl mb-2">Find Your Nearest Boutique</h4>
            <p className="text-xs font-sans text-zinc-500 leading-relaxed">Unlock accurate delivery dates, Try-at-Home availability, and In-store exclusive designs.</p>
          </div>

          <div className="flex items-center border-b border-[#E9D8C3] focus-within:border-[#4A1F58] pb-2 mb-6 transition-colors">
             <button onClick={handleLocateMe} className="pr-3 text-zinc-400 hover:text-[#C9A15B] transition-colors" title="Use exact GPS location">
                <Navigation strokeWidth={1.5} className={`w-4 h-4 ${isLocating ? 'animate-pulse text-[#C9A15B]' : ''}`} />
             </button>
             <input
                type="text"
                placeholder="City or Pincode"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                className="flex-1 outline-none text-sm font-sans text-[#302832] bg-transparent placeholder:text-zinc-400"
             />
             <button onClick={handleLocationSearch} className="text-[10px] font-bold text-[#4A1F58] uppercase tracking-[0.15em] hover:text-[#C9A15B] transition-colors">
                {activeLocationLabel ? 'Change' : 'Search'}
             </button>
          </div>

          {nearestStore ? (
             <div 
               onClick={() => { setIsLocationMenuOpen(false); navigate({ to: "/stores", search: { q: nearestStore.name } }); }}
               className="flex items-center gap-4 bg-[#F7F1E8] border border-[#E9D8C3] rounded-sm p-4 hover:border-[#C9A15B] transition-all mb-4 group cursor-pointer"
             >
                <div className="bg-[#4A1F58] text-white rounded-sm w-12 h-12 flex flex-col items-center justify-center shrink-0">
                   {nearestDistance !== null ? (
                     <>
                       <span className="text-sm font-serif font-medium leading-none">{nearestDistance.toFixed(1)}</span>
                       <span className="text-[8px] font-sans font-medium tracking-widest mt-1 opacity-80 uppercase">KM</span>
                     </>
                   ) : (
                     <Store strokeWidth={1.5} className="w-5 h-5 opacity-90" />
                   )}
                </div>
                <div className="flex-1">
                   <span className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-zinc-500 block mb-1">Nearest Boutique</span>
                   <span className="text-sm font-serif font-medium text-[#302832] flex items-center justify-between group-hover:text-[#4A1F58] transition-colors">
                      <span className="truncate max-w-[150px]">{nearestStore.name}</span> 
                      <ChevronRight strokeWidth={1.5} className="w-4 h-4 text-[#C9A15B]" />
                   </span>
                </div>
             </div>
          ) : locationQuery && (
            <div className="text-center py-4 text-xs font-sans text-rose-500 bg-rose-50 rounded-sm mb-4">
              No stores found matching your search.
            </div>
          )}
          <div className="text-center mt-2 pt-2">
             <Link to="/stores" className="text-[10px] font-sans font-bold text-[#C9A15B] hover:text-[#4A1F58] uppercase tracking-[0.15em] inline-flex items-center justify-center gap-1 group transition-colors">
                View All Boutiques <ChevronRight strokeWidth={2} className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        </div>
      )}

      {/* ✨ 3. DESKTOP CATEGORY NAVIGATION BAR */}
      <div
        className="hidden md:block relative bg-[#4A1F58] border-t border-b border-[#4A1F58]"
        onMouseLeave={() => { setIsMenuOpen(false); setActiveParent(null); }}
      >
       <nav className="mx-auto max-w-[1400px] px-8 h-12 flex items-center justify-start lg:justify-center overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
         <ul className="flex items-center gap-10">
            {topCategories.map((parent) => {
              const hasChildren = categories.some((c) => c.parent_id === parent.id);
              const isSelected = activeParent?.id === parent.id && isMenuOpen;
              return (
                <li
                  key={parent.id}
                  className="h-full flex items-center shrink-0 group"
                  onMouseEnter={() => { setActiveParent(parent); setIsMenuOpen(true); setIsLocationMenuOpen(false); }}
                >
                  <Link
                    to="/category/$slug"
                    params={{ slug: parent.slug }}
                    className={`whitespace-nowrap flex items-center gap-1.5 text-[11px] font-sans font-bold tracking-[0.15em] uppercase transition-colors h-full pt-[2px] border-b-2 ${
                      isSelected ? "text-[#C9A15B] border-[#C9A15B]" : "text-white/90 border-transparent hover:text-[#C9A15B]"
                    }`}
                  >
                    {parent.name}
                    {hasChildren && <ChevronDown strokeWidth={2} className={`h-3 w-3 transition-transform ${isSelected ? 'rotate-180 text-[#C9A15B]' : 'text-white/60 group-hover:text-[#C9A15B]'}`} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {isMenuOpen && activeParent && (
          <div className="absolute left-0 top-full w-full bg-[#F7F1E8] shadow-[0_20px_40px_rgba(74,31,88,0.06)] z-50 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-[#E9D8C3]" onMouseEnter={() => setIsMenuOpen(true)}>
            <div className="mx-auto max-w-[1400px] px-12 py-10 grid grid-cols-12 gap-10">
              <div className="col-span-2 space-y-4 border-r border-[#E9D8C3] pr-6">
                <h4 className="text-[10px] font-sans font-bold text-[#C9A15B] uppercase tracking-[0.2em] mb-6">Featured</h4>
                <ul className="space-y-4 text-xs font-sans font-medium text-zinc-500 tracking-wide">
                  <li><Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A1F58] text-[#302832] font-bold block transition-colors">All {activeParent.name}</Link></li>
                  <li><Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A1F58] block transition-colors">Latest Designs</Link></li>
                  <li><Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A1F58] block transition-colors">Bestsellers</Link></li>
                  <li><Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A1F58] block transition-colors">Ready to Ship</Link></li>
                </ul>
              </div>
              <div className="col-span-3 space-y-4 border-r border-[#E9D8C3] pr-6">
                <h4 className="text-[10px] font-sans font-bold text-[#C9A15B] uppercase tracking-[0.2em] mb-6">Shop By Style</h4>
                {subCategories.length === 0 ? (
                  <p className="text-xs font-sans text-zinc-400 italic">No styles listed.</p>
                ) : (
                  <ul className="space-y-4">
                    {subCategories.map((sub) => (
                      <li key={sub.id}>
                        <Link to="/category/$slug" params={{ slug: sub.slug }} className="text-xs font-sans font-medium text-zinc-500 hover:text-[#4A1F58] transition-colors block tracking-wide" onClick={() => setIsMenuOpen(false)}>
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-span-2 space-y-4 border-r border-[#E9D8C3] pr-6">
                <h4 className="text-[10px] font-sans font-bold text-[#C9A15B] uppercase tracking-[0.2em] mb-6">Shop By Price</h4>
                <ul className="space-y-4 text-xs font-sans font-medium text-zinc-500 tracking-wide">
                  <li><Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A1F58] block transition-colors">Under ₹ 15,000</Link></li>
                  <li><Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A1F58] block transition-colors">₹ 15k - ₹ 30k</Link></li>
                  <li><Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A1F58] block transition-colors">₹ 30k - ₹ 50k</Link></li>
                  <li><Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A1F58] block transition-colors">Above ₹ 50,000</Link></li>
                </ul>
              </div>
              <div className="col-span-5 grid grid-cols-2 gap-6 pl-4">
                <Link to="/category/$slug" params={{ slug: activeParent.slug }} onClick={() => setIsMenuOpen(false)} className="group relative rounded-sm overflow-hidden bg-white border border-[#E9D8C3] flex flex-col justify-between aspect-[4/5] shadow-sm hover:shadow-lg transition-all">
                  <div className="w-full h-3/4 overflow-hidden bg-[#F7F1E8]">
                    {activeParent.image_url ? (
                      <img src={activeParent.image_url} alt={activeParent.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300 font-sans text-xs uppercase tracking-widest">{activeParent.name}</div>
                    )}
                  </div>
                  <div className="p-4 bg-white text-center border-t border-[#E9D8C3]">
                    <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#302832] group-hover:text-[#C9A15B] transition-colors">Explore {activeParent.name}</span>
                  </div>
                </Link>
                <Link to="/category/$slug" params={{ slug: activeParent.slug }} onClick={() => setIsMenuOpen(false)} className="group relative rounded-sm overflow-hidden bg-zinc-100 flex flex-col justify-end aspect-[4/5] shadow-sm hover:shadow-lg transition-all">
                  <div className="absolute inset-0 z-0 bg-[#E9D8C3]">
                    {(activeParent.model_image_url || activeParent.image_url) && (
                      <img src={activeParent.model_image_url || activeParent.image_url} alt={`${activeParent.name} Model`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 origin-center" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4A1F58]/90 via-[#4A1F58]/20 to-transparent opacity-80 z-10 pointer-events-none transition-opacity group-hover:opacity-100" />
                  <div className="relative z-20 p-6 text-left w-full">
                    <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-[#C9A15B] block mb-1">Curated Collection</span>
                    <h5 className="text-2xl font-serif font-medium text-white leading-tight mb-2">{activeParent.name}</h5>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✨ 4. MOBILE SLIDE-OUT DRAWER (Bulletproof 100dvh Layout) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Dark Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          
          {/* The Drawer - Uses h-[100dvh] to prevent address bar collapse */}
          <div className="absolute top-0 left-0 w-[85%] max-w-[340px] h-[100dvh] bg-[#F7F1E8] shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            
            {/* Drawer Header (Fixed at top) */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#E9D8C3] shrink-0 bg-white shadow-sm">
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2 text-[#4A1F58] hover:text-[#C9A15B] transition-colors -ml-2"
              >
                <X strokeWidth={2} className="w-6 h-6" />
              </button>
              <div className="flex-1 flex justify-center">
                <Logo className="h-10 w-auto object-contain" />
              </div>
              <div className="w-10 shrink-0"></div> {/* Spacer for perfect centering */}
            </div>

            {/* Scrollable Content Zone */}
            <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col">
              
              {/* Category List */}
              <div className="py-2 flex-1">
                {isLoadingCats ? (
                   <div className="flex justify-center py-10">
                     <Loader2 className="w-6 h-6 animate-spin text-[#C9A15B]" />
                   </div>
                ) : topCategories.length === 0 ? (
                   <div className="text-center py-8 text-sm text-zinc-500">No categories found.</div>
                ) : (
                  topCategories.map((parent) => {
                    const children = categories.filter(c => c.parent_id === parent.id);
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
                            <ChevronRight strokeWidth={2} className={`w-4 h-4 text-[#4A1F58] transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                          ) : (
                            <ChevronRight strokeWidth={2} className="w-4 h-4 text-zinc-300 opacity-50" />
                          )}
                        </div>
                        
                        {/* Subcategories Dropdown */}
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
                            {children.map(sub => (
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

              {/* Promo Cards (Pushed to bottom of scroll area) */}
              <div className="px-4 py-6 space-y-4 shrink-0 mt-auto">
                <div className="bg-white border border-[#E9D8C3] p-4 rounded-sm shadow-sm relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-xs font-sans text-[#4A1F58] mb-1">Own your dream jewellery</p>
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-[11px] font-sans font-bold text-[#C9A15B] uppercase tracking-widest flex items-center gap-1">
                      Golden Programs <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <Diamond className="absolute -right-4 -bottom-4 w-16 h-16 text-[#F7F1E8] opacity-50 pointer-events-none" />
                </div>

                <div className="bg-white border border-[#E9D8C3] p-4 rounded-sm shadow-sm relative overflow-hidden" onClick={() => { setIsMobileMenuOpen(false); handleLocationMenuClick(); }}>
                  <div className="relative z-10">
                    <p className="text-xs font-sans text-[#4A1F58] mb-1">Find the nearest store</p>
                    <button className="text-[11px] font-sans font-bold text-[#C9A15B] uppercase tracking-widest flex items-center gap-1">
                      Explore <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <Store className="absolute -right-2 -bottom-2 w-12 h-12 text-[#F7F1E8] opacity-80 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Dark Footer (Fixed at the absolute bottom) */}
            <div className="bg-[#4A1F58] p-6 flex flex-col gap-5 text-white shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] relative z-20">
               <Link to="/Account" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-sans font-medium hover:text-[#C9A15B] transition-colors">
                 Log In / Sign Up
               </Link>
               <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-sans font-medium hover:text-[#C9A15B] transition-colors">
                 Wishlist
               </Link>
               <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-sans font-medium hover:text-[#C9A15B] transition-colors">
                 Cart
               </Link>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}