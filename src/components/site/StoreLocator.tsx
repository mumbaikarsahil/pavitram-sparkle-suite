import React, { useState, useMemo, useEffect } from "react";
import { Store, MapPin, Phone, Clock, Search, Navigation, ArrowRight, Loader2 } from "lucide-react";

export const STORES_DATA = [
  { name: "Chhatrapati Sambhajinagar", address: "Veer Marg, Keli Bazar, Chhatrapati Sambhajinagar (Aurangabad), Maharashtra 431001", phone: null, working_hours: null, lat: 19.8762, lng: 75.3433 },
  { name: "Parbhani", address: "Near Gandhi Park Main Gate, Gandhi Park, Parbhani 431401, Maharashtra", phone: null, working_hours: null, lat: 19.2668, lng: 76.7748 },
  { name: "Chakan", address: "Wafgaonkar Rajlaxmi Jewellers, Main Road, Manik Chowk, Chakan, Maharashtra 410501", phone: null, working_hours: null, lat: 18.7505, lng: 73.8567 },
  { name: "Dombivli", address: "Inside M/s ShreeShri Devi Jewels India Pvt. Ltd., Shop No. 1, Ground Floor, Rakhi Apartment, Near Sarvesh H. Tilak Road, Dombivli, Thane - 421201", phone: "8657003848", working_hours: "11:00 AM to 8:00 PM (All days open)", lat: 19.2183, lng: 73.0867 },
  { name: "Sangamner", address: "Bus Stand Complex, Sangamner - 422605", phone: null, working_hours: null, lat: 19.5761, lng: 74.2053 },
  { name: "Parel", address: "Inside Navaratna Jewellers, Shop No. 1, Saraf Building, Near Maharani Sarees, Dr. B. Ambedkar Road, Parel (E), Mumbai - 400012", phone: "8657003835", working_hours: "11:00 AM to 8:00 PM (Monday closed)", lat: 18.9953, lng: 72.8397 },
  { name: "Badlapur", address: "Inside Bhagirathi Jewellers, Shop No. 4, Deepmani Apartment, Opp. Railway Gate, Badlapur, Thane, Maharashtra - 421503", phone: "8657000961", working_hours: "11:00 AM to 8:00 PM (Monday closed)", lat: 19.1551, lng: 73.2372 },
  { name: "Thane", address: "Inside Mahavir Jewellers, Pathare Bldg CHS, Near Canara Bank, Gokhale Road, Naupada, Thane (W) - 400602", phone: "8657003834", working_hours: "11:00 AM to 8:00 PM (All days open)", lat: 19.1973, lng: 72.9644 },
  { name: "Kurla", address: "Inside Ratnadeep Jewellers, 318, Yashodabai Shivkumar Chawl, Shop No. 1 & 2, Opp. New Mill Road, Kurla West, Mumbai - 400070", phone: "8657003830", working_hours: "11:00 AM to 8:00 PM (Thursday closed)", lat: 19.0726, lng: 72.8795 },
  { name: "Kamothe", address: "Inside Kalash Jewellers, Shop No. 15, Uma Shiv Corner CHS, Plot No. 22A, Sector 19, Kamothe, Navi Mumbai - 410209", phone: "8657000965", working_hours: "11:00 AM to 8:00 PM (Friday closed)", lat: 19.0251, lng: 73.0939 },
  { name: "Navi Mumbai Vashi", address: "Shop No. 3, A Wing, Gagangiri CHS, Opp. Peshwai Sarees, Abhyudaya Bank Marg, Plot No. 47, Sector 17, Vashi, Navi Mumbai - 400703", phone: "8657003817", working_hours: "11:00 AM to 8:00 PM (All days open)", lat: 19.0745, lng: 72.9978 },
  { name: "Borivali (W)", address: "Shop No. 16, Sundar Vichar, Opp. Amar Jyoti Building & Bank of Baroda, Shimpoli Road, Kastur Park, Borivali (W), Mumbai - 400092", phone: "8657003816", working_hours: "11:00 AM to 8:00 PM (All days open)", lat: 19.2343, lng: 72.8427 },
  { name: "Virar (W)", address: "Siddhi Manora, Near Desai Hospital, Beside Kamal Medical, Virar West, Maharashtra 401303", phone: "8657003819", working_hours: "11:00 AM to 8:00 PM (All days open)", lat: 19.4580, lng: 72.7938 },
  { name: "Andheri (W)", address: "Viral Apartment, A Wing, 3rd Floor (No Lift), S.V. Road, Opp. Andheri Shoppers Stop, Above Hotel Radha Krishna, Andheri West, Mumbai - 400058", phone: "+91 8657003815", working_hours: "11:00 AM to 8:00 PM (All days open)", lat: 19.1136, lng: 72.8411 },
  { name: "Breach Candy", address: "43, Bhulabhai Desai Marg, Breach Candy, Cumballa Hill, Mumbai, Maharashtra - 400026", phone: "8657003833", working_hours: "11:30 AM to 8:00 PM (All days open)", lat: 18.9722, lng: 72.8055 },
  { name: "Ghatkopar (E)", address: "Shop No. 2, Madhav Apt., Jawahar Road, Next to Samrat Hotel, Ghatkopar East, Mumbai - 400077", phone: "+91 8657003849", working_hours: "11:00 AM to 8:00 PM (All days open)", lat: 19.0790, lng: 72.9080 }
];

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
  title = "Find a Boutique near you", 
  subtitle = "Experience our brilliance in person. Search by city or pincode.",
  initialQuery = "",
  initialLocation = null
}: StoreLocatorProps) {
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(initialLocation);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Sync state if URL props change
  useEffect(() => {
    if (initialQuery) setSearchQuery(initialQuery);
    if (initialLocation) setUserLocation(initialLocation);
  }, [initialQuery, initialLocation]);

  // GPS Locate Me Feature
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

  // ✨ UPGRADED: Smart Geocoding Search
  const handleTextSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setUserLocation(null);
      return;
    }

    setIsSearching(true);
    try {
      // Free OpenStreetMap Geocoding API converts Pincode/City to Lat/Lng
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', India')}&format=json&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        // Success! We found coordinates for what they typed.
        setUserLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });
      } else {
        // Fallback: If map API fails (e.g. they typed a specific shop name), revert to text matching
        setUserLocation(null); 
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      setUserLocation(null);
    } finally {
      setIsSearching(false);
    }
  };

  // The logic that displays and sorts the stores
  const displayStores = useMemo(() => {
    let result = [...STORES_DATA].map(store => ({ ...store, distance: null as number | null }));

    if (userLocation) {
      // Sort by absolute nearest KM distance
      result = result.map(store => ({
        ...store,
        distance: getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, store.lat, store.lng)
      }));
      result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } 
    else if (searchQuery.trim().length > 0) {
      // Fallback: Smart Text Multi-keyword matching
      const query = searchQuery.toLowerCase().trim();
      const keywords = query.split(/\s+/);
      
      result = result.filter(store => {
        const storeSearchableText = `${store.name} ${store.address} ${store.phone || ""}`.toLowerCase();
        return keywords.every(keyword => storeSearchableText.includes(keyword));
      });
    }

    return limit ? result.slice(0, limit) : result;
  }, [searchQuery, userLocation, limit]);

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
              {/* Added dedicated search button inside input for mobile UX */}
              <button 
                onClick={handleTextSearch} 
                disabled={isSearching}
                className="absolute right-1 w-8 h-8 flex items-center justify-center rounded-full bg-[#4A0B49]/5 hover:bg-[#4A0B49]/10 text-[#4A0B49] transition-colors"
                title="Search Location"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Mobile Divider */}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-left">
        {displayStores.map((store, i) => (
          <div key={i} className="border border-zinc-200 rounded-2xl p-4 md:p-5 bg-white shadow-sm flex flex-col justify-between hover:border-[#4A0B49] transition-all group relative overflow-hidden">
            <div>
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-sm md:text-base text-zinc-900 flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#4A0B49] shrink-0" /> 
                  <span className="line-clamp-1">{store.name}</span>
                </h4>
                
                {store.distance !== null && (
                  <span className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 whitespace-nowrap ${i === 0 ? 'bg-[#4A0B49]/10 text-[#4A0B49]' : 'bg-zinc-100 text-zinc-500'}`}>
                    {store.distance.toFixed(1)} km
                  </span>
                )}
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
            <button className="w-full border border-zinc-200 text-zinc-700 font-bold text-[11px] md:text-xs py-2.5 md:py-3 rounded-lg group-hover:bg-[#4A0B49] group-hover:border-[#4A0B49] group-hover:text-white transition-all uppercase tracking-widest mt-auto">
              Book a Visit
            </button>
          </div>
        ))}
      </div>
      
      {displayStores.length === 0 && (
        <div className="text-center py-12 text-zinc-500 text-sm">
          No stores found matching your search. Try another location.
        </div>
      )}
    </div>
  );
}