import React, { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, MapPin, User, Heart, ShoppingBag, ChevronDown, Navigation, Store, ChevronRight, Edit2 } from "lucide-react";
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

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

const extractPincode = (address: string): number | null => {
  const match = address.match(/\b\d{6}\b/);
  return match ? parseInt(match[0], 10) : null;
};

export function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeParent, setActiveParent] = useState<Category | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- Location Pop-up State ---
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");
  const [activePincode, setActivePincode] = useState<string | null>(null);
  const [nearestStore, setNearestStore] = useState<any | null>(null);
  const [nearestDistance, setNearestDistance] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
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
          setActivePincode("Found via GPS");
          setPincodeInput("");
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Please allow location access to find the nearest store.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handlePincodeSubmit = () => {
    const pin = parseInt(pincodeInput.trim(), 10);
    if (!pin || pincodeInput.trim().length !== 6) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    let closest = null;
    let minDiff = Infinity;

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

    setNearestStore(closest);
    setNearestDistance(null); 
    setActivePincode(pincodeInput.trim());
  };

  return (
    // Replaced hard border with translucent blur and soft ambient shadow
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(74,11,73,0.04)] transition-all">
      
      {/* Promo strip - Updated to explicitly use brand colors */}
      <div className="bg-[#4A0B49] text-white">
        <div className="mx-auto max-w-7xl px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-center leading-tight font-medium tracking-wide">
          <span className="text-amber-400">★</span>
          <span className="truncate sm:overflow-visible text-white/90">Pavitram Diamond Jewellery in a all new experience. </span>
        </div>
      </div>

      {/* Main bar - Perfectly spaced for mobile */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div className="shrink-0 flex items-center">
          <Logo className="h-8 md:h-12 w-auto object-contain" />
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl items-center rounded-full border border-zinc-200 bg-zinc-50/50 px-5 py-2.5 shadow-inner focus-within:bg-white focus-within:border-[#4A0B49]/30 transition-all ml-8">
          <Search strokeWidth={1.5} className="h-4 w-4 text-zinc-400" />
          <input
            type="search"
            placeholder="Search for rings, earrings, pendants…"
            className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-zinc-400 text-zinc-800"
          />
        </div>

        {/* Action Icons - Elegant stroke weights and spacing */}
        <nav className="flex items-center gap-3 md:gap-6 text-zinc-700">
          
          {/* ========================================================= */}
          {/* INTERACTIVE LOCATION FINDER (Desktop Only) */}
          {/* ========================================================= */}
          <div 
            className="relative hidden lg:block"
            onMouseEnter={() => setIsLocationMenuOpen(true)}
            onMouseLeave={() => setIsLocationMenuOpen(false)}
          >
            <div className="flex flex-col items-start cursor-pointer hover:bg-purple-50/50 p-2 rounded-lg transition-colors -ml-2 -mt-2">
              <span className="text-[10px] text-zinc-500 font-medium">
                 {nearestStore ? `Store: ${nearestStore.name.split(' ')[0]}` : 'Find a Store'}
              </span>
              <span className="text-xs font-bold text-[#4A0B49] flex items-center gap-1 tracking-tight">
                 {activePincode ? `Delivering to ${activePincode}` : 'Select Location'} <Edit2 strokeWidth={2} className="w-2.5 h-2.5 opacity-70" />
              </span>
            </div>

            {isLocationMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-[350px] bg-white rounded-2xl shadow-[0_20px_40px_rgba(74,11,73,0.08)] border border-purple-100 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="text-center mb-5">
                  <h4 className="text-[#4A0B49] font-bold text-[15px] mb-1.5 tracking-tight">Your PIN Code unlocks</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed px-2">Fastest delivery date, Try-at-Home availability, Nearest store and In-store design!</p>
                </div>
                
                <div className="flex justify-center mb-5">
                   <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center shadow-sm">
                      <Store strokeWidth={1.5} className="w-7 h-7 text-amber-500 drop-shadow-sm" />
                   </div>
                </div>

                <div className="flex items-center border border-zinc-200 focus-within:border-[#4A0B49] rounded-xl overflow-hidden mb-5 p-1 transition-colors bg-zinc-50 focus-within:bg-white shadow-inner">
                   <button 
                     onClick={handleLocateMe} 
                     className="p-2.5 text-zinc-400 hover:text-[#4A0B49] transition-colors bg-white rounded-lg border border-zinc-200 shadow-sm mr-2" 
                     title="Use exact GPS location"
                   >
                      <Navigation strokeWidth={1.5} className={`w-4 h-4 ${isLocating ? 'animate-pulse text-[#4A0B49]' : ''}`} />
                   </button>
                   <input
                      type="text"
                      placeholder="Enter Pincode"
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                      className="flex-1 outline-none text-sm font-bold text-zinc-800 bg-transparent placeholder:font-normal placeholder:text-zinc-400"
                      maxLength={6}
                   />
                   <button 
                     onClick={handlePincodeSubmit} 
                     className="text-[10px] font-bold text-[#4A0B49] uppercase tracking-widest px-4 hover:underline"
                   >
                      {activePincode ? 'Change' : 'Submit'}
                   </button>
                </div>

                {nearestStore && (
                   <Link to="/stores" className="flex items-center gap-4 bg-[#FFF9E6] border border-amber-100/60 rounded-xl p-3 hover:border-amber-200 hover:shadow-md transition-all mb-4 group cursor-pointer">
                      <div className="bg-gradient-to-br from-[#FF8A65] to-[#F4511E] text-white rounded-lg w-12 h-12 flex flex-col items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                         <span className="text-sm font-black leading-none">{nearestDistance ? nearestDistance.toFixed(1) : '-'}</span>
                         <span className="text-[8px] font-bold uppercase mt-0.5 opacity-90">{nearestDistance ? 'KM' : 'Near'}</span>
                      </div>
                      <div className="flex-1">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-0.5">Nearest Store</span>
                         <span className="text-sm font-bold text-zinc-900 flex items-center justify-between">
                            <span className="truncate max-w-[160px]">{nearestStore.name}</span> 
                            <ChevronRight strokeWidth={2} className="w-4 h-4 text-zinc-400 group-hover:text-[#4A0B49] transition-colors shrink-0" />
                         </span>
                      </div>
                   </Link>
                )}

                <div className="text-center mt-2 border-t border-zinc-100 pt-4">
                   <Link to="/stores" className="text-xs font-bold text-[#4A0B49] hover:text-[#340733] uppercase tracking-widest flex items-center justify-center gap-1 group">
                      View All Stores <ChevronRight strokeWidth={2} className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                   </Link>
                </div>
              </div>
            )}
          </div>

          {/* Refined Icons with strokeWidth={1.5} for a luxury feel */}
          <button aria-label="Search" className="md:hidden p-1.5 text-zinc-700 hover:text-[#4A0B49] transition-colors">
            <Search strokeWidth={1.5} className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <a href="/account" aria-label="Account" className="p-1.5 text-zinc-700 hover:text-[#4A0B49] transition-colors">
            <User strokeWidth={1.5} className="h-5 w-5 md:h-6 md:w-6" />
          </a>
          
          <a href="/wishlist" aria-label="Wishlist" className="p-1.5 text-zinc-700 hover:text-[#4A0B49] transition-colors">
            <Heart strokeWidth={1.5} className="h-5 w-5 md:h-6 md:w-6" />
          </a>
          
          <a href="/cart" aria-label="Cart" className="relative p-1.5 text-zinc-700 hover:text-[#4A0B49] transition-colors">
            <ShoppingBag strokeWidth={1.5} className="h-5 w-5 md:h-6 md:w-6" />
            {/* Optional: Add a subtle notification dot for the cart later */}
            {/* <span className="absolute top-1.5 right-1 w-2 h-2 bg-pink-500 rounded-full border border-white" /> */}
          </a>
        </nav>
      </div>

      {/* Dynamic Category Navigation Bar - Border replaced with soft gray shadow */}
      <div
        className="hidden md:block relative bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.03)]"
        onMouseLeave={() => {
          setIsMenuOpen(false);
          setActiveParent(null);
        }}
      >
        <nav className="mx-auto max-w-7xl px-4">
          <ul className="flex items-center gap-8 overflow-x-auto py-2.5 text-[13px] font-medium tracking-wide text-zinc-600">
            {topCategories.map((parent) => {
              const hasChildren = categories.some((c) => c.parent_id === parent.id);
              const isSelected = activeParent?.id === parent.id && isMenuOpen;

              return (
                <li
                  key={parent.id}
                  className="shrink-0 py-1"
                  onMouseEnter={() => {
                    setActiveParent(parent);
                    setIsMenuOpen(true);
                    setIsLocationMenuOpen(false);
                  }}
                >
                  <Link
                    to="/category/$slug"
                    params={{ slug: parent.slug }}
                    className={`flex items-center gap-1.5 transition-colors ${
                      isSelected ? "text-[#4A0B49] font-bold" : "hover:text-[#4A0B49]"
                    }`}
                  >
                    {parent.name}
                    {hasChildren && <ChevronDown strokeWidth={2} className={`h-3 w-3 transition-transform ${isSelected ? 'rotate-180' : 'opacity-50'}`} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mega-Menu Dropdown Panel */}
        {isMenuOpen && activeParent && (
          <div 
            className="absolute left-0 top-full w-full bg-white shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 border-t border-purple-50"
            onMouseEnter={() => setIsMenuOpen(true)}
          >
            <div className="mx-auto max-w-7xl px-8 py-8 grid grid-cols-12 gap-8">
              
              {/* Column 1: Featured & Quick Links */}
              <div className="col-span-2 space-y-3 border-r border-zinc-100 pr-4">
                <h4 className="text-xs font-bold text-[#4A0B49] uppercase tracking-widest mb-4">
                  Featured
                </h4>
                <ul className="space-y-2.5 text-sm text-zinc-600">
                  <li>
                    <Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A0B49] font-semibold block transition-colors">
                      All {activeParent.name}
                    </Link>
                  </li>
                  <li>
                    <Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A0B49] block transition-colors">
                      Latest Designs
                    </Link>
                  </li>
                  <li>
                    <Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A0B49] block transition-colors">
                      Bestsellers
                    </Link>
                  </li>
                  <li>
                    <Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A0B49] block transition-colors">
                      Fast Delivery
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: Live Subcategories (By Style) */}
              <div className="col-span-3 space-y-3 border-r border-zinc-100 pr-4">
                <h4 className="text-xs font-bold text-[#4A0B49] uppercase tracking-widest mb-4">
                  By Style
                </h4>
                {subCategories.length === 0 ? (
                  <p className="text-xs text-zinc-400">No subcategories listed.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {subCategories.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          to="/category/$slug"
                          params={{ slug: sub.slug }}
                          className="text-sm text-zinc-600 hover:text-[#4A0B49] hover:font-semibold transition-all block"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Column 3: By Price */}
              <div className="col-span-2 space-y-3 border-r border-zinc-100 pr-4">
                <h4 className="text-xs font-bold text-[#4A0B49] uppercase tracking-widest mb-4">
                  By Price
                </h4>
                <ul className="space-y-2.5 text-sm text-zinc-600">
                  <li><Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A0B49] block transition-colors">Under ₹ 10k</Link></li>
                  <li><Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A0B49] block transition-colors">₹ 10k - ₹ 20k</Link></li>
                  <li><Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A0B49] block transition-colors">₹ 20k - ₹ 30k</Link></li>
                  <li><Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A0B49] block transition-colors">₹ 30k - ₹ 50k</Link></li>
                  <li><Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A0B49] block transition-colors">₹ 50k & Above</Link></li>
                </ul>
              </div>

              {/* Column 4 & 5: Visual Promo Cards */}
              <div className="col-span-5 grid grid-cols-2 gap-4 pl-2">
                
                <Link
                  to="/category/$slug"
                  params={{ slug: activeParent.slug }}
                  onClick={() => setIsMenuOpen(false)}
                  className="group relative rounded-[20px] overflow-hidden bg-[#FFF9E6] border border-purple-900/5 flex flex-col justify-between aspect-[4/5] shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-full h-3/4 overflow-hidden bg-white/50">
                    {activeParent.image_url ? (
                      <img
                        src={activeParent.image_url}
                        alt={activeParent.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs font-bold uppercase">
                        {activeParent.name}
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-white text-center border-t border-purple-900/5">
                    <span className="text-xs font-bold text-zinc-800 group-hover:text-[#4A0B49] transition-colors">
                      Explore {activeParent.name}
                    </span>
                  </div>
                </Link>

                <Link
                  to="/category/$slug"
                  params={{ slug: activeParent.slug }}
                  onClick={() => setIsMenuOpen(false)}
                  className="group relative rounded-[20px] overflow-hidden bg-zinc-100 flex flex-col justify-end aspect-[4/5] shadow-sm hover:shadow-md transition-all border border-zinc-200"
                >
                  <div className="absolute inset-0 z-0">
                    {activeParent.model_image_url ? (
                      <img
                        src={activeParent.model_image_url}
                        alt={`${activeParent.name} Model`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 origin-bottom"
                      />
                    ) : activeParent.image_url ? (
                      <img
                        src={activeParent.image_url}
                        alt={activeParent.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 origin-bottom"
                      />
                    ) : null}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#4A0B49] via-[#4A0B49]/50 to-transparent opacity-90 z-10 pointer-events-none transition-opacity group-hover:opacity-100" />

                  <div className="relative z-20 p-5 text-left w-full">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-300 block mb-1">
                      Shop Collection
                    </span>
                    <h5 className="text-xl font-serif font-black text-white leading-tight mb-2 drop-shadow-md">
                      {activeParent.name}
                    </h5>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                      Shop Now <ChevronRight strokeWidth={2} className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </div>

            </div>

            {/* Bottom Strip */}
            <div className="bg-zinc-50 border-t border-zinc-100 px-8 py-3">
              <div className="mx-auto max-w-7xl flex items-center gap-8 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                <Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A0B49] transition-colors">
                  For Women
                </Link>
                <span className="text-zinc-300">|</span>
                <Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A0B49] transition-colors">
                  For Men
                </Link>
                <span className="text-zinc-300">|</span>
                <Link to="/category/$slug" params={{ slug: activeParent.slug }} className="hover:text-[#4A0B49] transition-colors">
                  For Kids
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}