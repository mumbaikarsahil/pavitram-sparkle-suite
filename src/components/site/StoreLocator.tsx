import React, { useState, useMemo, useEffect } from "react";
import { Store, MapPin, Phone, Clock, Search, Navigation, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

interface StoreLocatorProps {
  limit?: number; 
  showSearch?: boolean; 
  title?: string;
  subtitle?: string;
  initialQuery?: string;
  initialLocation?: { lat: number; lng: number } | null;
}

export function StoreLocator({ 
  limit, 
  showSearch = true, 
  title = "Find a Showroom near you", 
  subtitle = "Experience our brilliance in person. Search by city or pincode.",
  initialQuery = "",
  initialLocation = null
}: StoreLocatorProps) {
  
  const [stores, setStores] = useState<any[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(initialLocation);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // 1. Fetch Stores from Supabase on Component Mount
  useEffect(() => {
    async function fetchStores() {
      try {
        const { data, error } = await supabase
          .from('store_locations')
          .select('*')
          .order('created_at', { ascending: true }); // Maintains your intended order

        if (error) throw error;

        if (data) {
          // Map DB columns to match the existing component logic
          const formattedStores = data.map(store => ({
            ...store,
            lat: Number(store.latitude),
            lng: Number(store.longitude),
            image: store.image_url,
            isComingSoon: store.is_coming_soon
          }));
          setStores(formattedStores);
        }
      } catch (error) {
        console.error("Failed to fetch store locations:", error);
      } finally {
        setIsLoadingStores(false);
      }
    }

    fetchStores();
  }, []);

  useEffect(() => {
    if (initialQuery) setSearchQuery(initialQuery);
    if (initialLocation) setUserLocation(initialLocation);
  }, [initialQuery, initialLocation]);

  const handleLocateMe = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setSearchQuery(""); 
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

  const handleTextSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setUserLocation(null);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', India')}&format=json&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        setUserLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });
      } else {
        setUserLocation(null); 
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      setUserLocation(null);
    } finally {
      setIsSearching(false);
    }
  };

  // 2. Updated useMemo to rely on dynamic 'stores' state instead of hardcoded array
  const displayStores = useMemo(() => {
    let result = [...stores].map(store => ({ ...store, distance: null as number | null }));

    if (userLocation) {
      result = result.map(store => ({
        ...store,
        distance: getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, store.lat, store.lng)
      }));
      result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } 
    else if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      const keywords = query.split(/\s+/);
      
      result = result.filter(store => {
        const storeSearchableText = `${store.name} ${store.address} ${store.phone || ""}`.toLowerCase();
        return keywords.every(keyword => storeSearchableText.includes(keyword));
      });
    }

    return limit ? result.slice(0, limit) : result;
  }, [searchQuery, userLocation, limit, stores]);

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col px-4 md:px-0">
      <div className="text-center mb-6 md:mb-8">
        {title && <h2 className="text-xl md:text-2xl font-bold text-zinc-900 mb-2 font-serif">{title}</h2>}
        {subtitle && <p className="text-xs md:text-sm text-zinc-500 mb-6">{subtitle}</p>}
        
        {showSearch && (
          <div className="max-w-xl mx-auto w-full relative flex flex-col sm:flex-row items-center gap-2 bg-white rounded-2xl sm:rounded-full border border-zinc-200 shadow-sm focus-within:border-[#4A0B49] focus-within:ring-1 focus-within:ring-[#4A0B49]/20 transition-all p-1.5">
            
            <div className="relative w-full flex-1 flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Enter Pincode or City..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value === '') setUserLocation(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSearch()}
                className="w-full h-10 pl-9 pr-12 text-sm focus:outline-none bg-transparent"
              />
              <button 
                onClick={handleTextSearch} 
                disabled={isSearching}
                className="absolute right-1 w-8 h-8 flex items-center justify-center rounded-full bg-[#4A0B49]/5 hover:bg-[#4A0B49]/10 text-[#4A0B49] transition-colors"
                title="Search Location"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="w-full h-[1px] bg-zinc-100 sm:hidden" />
            
            <button 
              onClick={handleLocateMe}
              disabled={isLocating}
              className="w-full sm:w-auto h-10 px-6 shrink-0 rounded-xl sm:rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-pulse text-[#4A0B49]' : ''}`} />
              {isLocating ? 'Locating...' : 'Locate Me'}
            </button>
          </div>
        )}
      </div>

      {isLoadingStores ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#4A0B49]/40" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-left">
            {displayStores.map((store, i) => (
              <div key={i} className="border border-zinc-200 rounded-2xl bg-white shadow-sm flex flex-col hover:border-[#4A0B49] transition-all group relative overflow-hidden h-full">
                
                <div className="w-full aspect-[16/9] md:h-44 shrink-0 overflow-hidden bg-zinc-100 relative">
                  <img 
                    src={store.image} 
                    alt={`${store.name} Showroom`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                </div>

                <div className="p-4 md:p-5 flex flex-col flex-1 justify-between bg-white relative z-10 -mt-2">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-sm md:text-base text-zinc-900 flex items-center gap-2">
                        <Store className="w-4 h-4 text-[#4A0B49] shrink-0" /> 
                        <span className="line-clamp-1">{store.name}</span>
                      </h4>
                      
                      {store.isComingSoon ? (
                        <span className="text-[10px] font-bold px-2 py-1 rounded shrink-0 whitespace-nowrap bg-[#C9A15B]/10 text-[#C9A15B]">
                          Coming Soon
                        </span>
                      ) : store.distance !== null ? (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 whitespace-nowrap ${i === 0 ? 'bg-[#4A0B49]/10 text-[#4A0B49]' : 'bg-zinc-100 text-zinc-500'}`}>
                          {store.distance.toFixed(1)} km
                        </span>
                      ) : null}
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <p className="text-[11px] md:text-xs text-zinc-600 flex items-start gap-2 leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400 mt-0.5" /> 
                        <span className="line-clamp-2 md:line-clamp-3">{store.address}</span>
                      </p>
                      {store.phone && (
                        <p className="text-[11px] md:text-xs text-zinc-600 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 shrink-0 text-zinc-400" /> 
                          <span>{store.phone}</span>
                        </p>
                      )}
                      {store.working_hours && (
                        <p className="text-[11px] md:text-xs text-zinc-600 flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 shrink-0 text-zinc-400 mt-0.5" /> 
                          <span>{store.working_hours}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    {store.isComingSoon ? (
                      <div className="w-full bg-zinc-50 text-zinc-400 font-bold text-[11px] md:text-xs py-2.5 md:py-3 rounded-lg text-center uppercase tracking-widest cursor-not-allowed border border-zinc-100">
                        Opening Soon
                      </div>
                    ) : (
                      <a 
                        href={`https://wa.me/918356834764?text=${encodeURIComponent(`Hi! I would like to book a visit to the Pavitram ${store.name} Showroom.\n\nLocation:${store.address}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full border border-[#E9D8C3] text-zinc-700 font-bold text-[11px] md:text-xs py-2.5 md:py-3 rounded-lg group-hover:bg-[#4A0B49] group-hover:border-[#4A0B49] group-hover:text-white transition-all uppercase tracking-widest block text-center shadow-sm"
                      >
                        Book a Visit
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {displayStores.length === 0 && (
            <div className="text-center py-12 text-zinc-500 text-sm bg-white rounded-2xl border border-zinc-100 mt-4">
              No stores found matching your search. Try another location.
            </div>
          )}
        </>
      )}
    </div>
  );
}