import React, { useEffect, useState, useRef } from "react";
import { createFileRoute, Link, useNavigate} from "@tanstack/react-router";

import { 
  ArrowRight, ShieldCheck, RefreshCw, Award, 
  MapPin, Gift, Wallet, Instagram, Facebook, 
  Mail, MessageCircle, Video, PhoneCall, 
  Truck,
  Navigation,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute('/')({
  component: Index,
});



// Mock Banner Data
const HERO_BANNERS = [
  {
    id: 1,
    image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/4.png",
    link: "/category/new-arrivals",
    duration_ms: 5000,
  },
  {
    id: 2,
    image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/5.png",
    link: "/category/bestsellers",
    duration_ms: 5000,
  },
  {
    id: 3,
    image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/6.png",
    link: "/category/collections",
    duration_ms: 5000,
  },
  {
    id: 4,
    image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/7.png",
    link: "/category/offers",
    duration_ms: 5000,
  },
  {
    id: 5,
    image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/8.png",
    link: "/category/solitaires",
    duration_ms: 5000,
  }
];

function Index() {
  const [categories, setCategories] = useState<any[]>([]);
  const [productsByCat, setProductsByCat] = useState<Record<string, any[]>>({}); 
  const [isLoading, setIsLoading] = useState(true);
  
  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false); 
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate({ from: '/' });
  const [storeQuery, setStoreQuery] = useState("");

  const [isLocating, setIsLocating] = useState(false);

  // Passes the typed Pincode/City to the stores page
  const handleStoreSearch = () => {
    if (storeQuery.trim()) {
      navigate({
        to: "/stores",
        search: { q: storeQuery.trim() } 
      });
    }
  };

  // Uses browser GPS to pass exact coordinates to the stores page
  const handleAutoDetect = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          navigate({
            to: "/stores",
            search: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          });
        },
        (error) => {
          setIsLocating(false);
          console.error("Location access denied or failed", error);
          // Optional: Add a toast notification here to tell the user to enable location
        }
      );
    } else {
      setIsLocating(false);
    }
  };


  

  // ✨ Splash Screen State (Only true if 'pavitram_has_seen_splash' is NOT in sessionStorage)
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('pavitram_has_seen_splash');
    }
    return true;
  });
  const [fadeSplash, setFadeSplash] = useState(false);

  // ✨ Splash Screen Timer Logic
  useEffect(() => {
    if (!showSplash) return; // Skip if they've already seen it this session

    // Mark as seen so it doesn't show again if they navigate away and come back
    sessionStorage.setItem('pavitram_has_seen_splash', 'true');

    // Show splash for 2.5 seconds, then trigger fade out
    const splashTimer = setTimeout(() => {
      setFadeSplash(true);
      
      // Completely remove from DOM after the fade transition (500ms) completes
      setTimeout(() => {
        setShowSplash(false);
      }, 500);
    }, 2500);

    return () => clearTimeout(splashTimer);
  }, [showSplash]);

  // Fetch Categories AND their corresponding products
  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const { data: allCats, error: catError } = await supabase
          .from("ecommerce_categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (catError) throw catError;

        const topLevel = allCats?.filter(c => !c.parent_id) || [];
        setCategories(topLevel);

        const { data: allProducts, error: prodError } = await supabase
          .from("ecommerce_products") 
          .select("*");

        if (!prodError && allProducts) {
          const groupedProducts: Record<string, any[]> = {};

          topLevel.forEach(parentCat => {
            const validCategoryIds = [
              parentCat.id,
              ...(allCats?.filter(c => c.parent_id === parentCat.id).map(c => c.id) || [])
            ];

            groupedProducts[parentCat.id] = allProducts.filter(p => 
              validCategoryIds.includes(p.category_id)
            );
          });

          setProductsByCat(groupedProducts);
        }
      } catch (err) {
        console.error("Failed to fetch catalog:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  // Auto-scrolling Slider Logic
  useEffect(() => {
    if (isPaused) return; 

    const startTimer = () => {
      const currentDuration = HERO_BANNERS[currentSlide].duration_ms;
      timerRef.current = setTimeout(() => {
        setCurrentSlide((prev) => (prev === HERO_BANNERS.length - 1 ? 0 : prev + 1));
      }, currentDuration);
    };

    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSlide, isPaused]); 

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 pb-20 relative">
      
      {/* ========================================================= */}
      {/* ✨ INITIAL SPLASH SCREEN (App Style) ✨ */}
      {/* ========================================================= */}
      {showSplash && (
        <div className={`fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${fadeSplash ? 'opacity-0' : 'opacity-100'}`}>
          
          {/* Injected custom animations for the splash screen */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes logoScale {
              0% { transform: scale(0.85); opacity: 0; }
              20% { opacity: 1; }
              100% { transform: scale(1.15); opacity: 1; }
            }
            @keyframes glowRise {
              0% { transform: translateY(40px) scale(0.9); opacity: 0; }
              100% { transform: translateY(0) scale(1.2); opacity: 0.85; }
            }
            .animate-splash-logo {
              animation: logoScale 3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            }
            .animate-splash-glow {
              animation: glowRise 2.5s ease-out forwards;
            }
          `}} />

          {/* Logo Container (Using imported Logo component) */}
            <div className="relative z-10 flex flex-col items-center justify-center animate-splash-logo pointer-events-none">
             <Logo className="w-40 md:w-56 h-auto object-contain" />
          </div>

          {/* Rising bottom purple glow */}
          <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-[#4A0B49]/40 via-purple-300/10 to-transparent blur-3xl pointer-events-none animate-splash-glow" />
        </div>
      )}


     {/* ========================================================= */}
      {/* 1. HERO SLIDER BANNER */}
      {/* ========================================================= */}
      <section className="relative w-full overflow-hidden bg-zinc-100">
        <div 
          className="relative w-full aspect-[7/2] overflow-hidden group bg-zinc-200"
          onMouseEnter={() => setIsPaused(true)} 
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}  
          onTouchEnd={() => setIsPaused(false)}   
        >
          {HERO_BANNERS.map((banner, index) => (
            <Link 
              key={banner.id} 
              to={banner.link}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img 
                src={banner.image} 
                alt={`Offer Banner ${index + 1}`} 
          
                className="w-full h-full object-cover object-center" 
              />
            </Link>
          ))}

          {/* Slider Indicators */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
            {HERO_BANNERS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 bg-white shadow-sm' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. CATEGORIES SECTION */}
      {/* ========================================================= */}
      <section className="max-w-[1400px] mx-auto pt-6 pb-8 md:pt-14 md:pb-16 bg-white relative overflow-hidden">
        
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-fuchsia-500/15 via-purple-500/5 to-transparent pointer-events-none z-0" />

        <div className="hidden md:flex px-8 mb-10 justify-between items-end relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-[2px] bg-[#4A0B49] rounded-full"></span>
              <span className="text-[#4A0B49] text-xs font-bold uppercase tracking-widest">Our Collections</span>
            </div>
            <h2 className="text-4xl font-black text-zinc-900 tracking-tight">
              Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A0B49] to-pink-600">Category</span>
            </h2>
            <p className="text-base text-zinc-500 mt-2 font-medium">Explore our masterfully crafted designs for every occasion.</p>
          </div>
        </div>

        <div className="px-4 md:px-8 flex overflow-x-auto gap-3 md:gap-8 snap-x snap-mandatory pb-4 hide-scrollbar relative z-10" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style dangerouslySetInnerHTML={{__html: `
            .hide-scrollbar::-webkit-scrollbar { display: none; }
          `}} />
          
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="shrink-0 snap-start flex flex-col items-center gap-2 md:gap-4 w-[82px] md:w-[180px] lg:w-[200px]">
                <div className="w-full aspect-square rounded-[18px] md:rounded-[32px] bg-white/50 backdrop-blur-sm animate-pulse border border-zinc-100 shadow-sm" />
                <div className="h-2 md:h-3 bg-zinc-200/60 rounded animate-pulse w-3/4 mt-1 md:mt-2" />
              </div>
            ))
          ) : (
            categories.map((cat) => (
              <Link 
                key={cat.id} 
                to="/category/$slug" 
                params={{ slug: cat.slug }}
                className="shrink-0 snap-start flex flex-col items-center gap-2 md:gap-4 w-[82px] md:w-[180px] lg:w-[200px] group"
              >
                <div className="w-full aspect-square rounded-[18px] md:rounded-[32px] bg-white overflow-hidden relative shadow-sm border border-zinc-100 transition-all duration-500 group-hover:shadow-[0_10px_30px_rgba(74,11,73,0.12)] group-hover:-translate-y-1.5 group-hover:border-purple-200">
                  {cat.image_url ? (
                    <img 
                      src={cat.image_url} 
                      alt={cat.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[9px] md:text-sm font-bold uppercase text-center p-2 leading-tight bg-[#F9F6F0]">
                      No Img
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <h3 className="text-[11px] md:text-[15px] font-bold text-center text-zinc-800 group-hover:text-[#4A0B49] transition-colors leading-tight line-clamp-2 px-1">
                  {cat.name}
                </h3>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. CATEGORY SHOWCASES (White Bg + Cutout Fade Overlay) */}
      {/* ========================================================= */}
      <section className="bg-white py-4 md:py-8 border-y border-zinc-100 overflow-hidden relative">
        
        <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-10 relative z-10">
          
          {isLoading ? (
            <div className="flex gap-2 md:gap-5 px-4 md:px-8 items-stretch relative">
               <div className="w-[145px] md:w-[280px] shrink-0 aspect-[4/5] bg-zinc-100 rounded-2xl animate-pulse z-10" />
               {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-[110px] md:w-[220px] h-auto bg-zinc-50 rounded-[14px] md:rounded-xl animate-pulse border border-zinc-100 shadow-sm z-10" />
               ))}
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="relative flex flex-col">
                
                <div className="px-4 md:px-8 mb-2 md:mb-5 flex items-center justify-between relative z-20 bg-white">
                  <div>
                    <h3 className="text-xl md:text-3xl font-black text-zinc-900 tracking-tight">{cat.name}</h3>
                    <p className="text-[10px] md:text-sm text-zinc-500 mt-0.5">Including Casual, Party, and Bridal designs.</p>
                  </div>
                  <Link to="/category/$slug" params={{ slug: cat.slug }} className="text-[10px] md:text-xs font-bold text-[#4A0B49] uppercase tracking-widest hover:underline flex items-center gap-1 bg-zinc-50 px-3 py-1.5 rounded-full shrink-0 shadow-sm border border-zinc-100">
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="relative w-full">
                  <div className="absolute top-[15%] bottom-[15%] left-0 w-[95%] lg:w-[85%] bg-gradient-to-r from-purple-100 via-fuchsia-50/50 to-transparent z-0 rounded-r-[3rem] pointer-events-none" />

                  <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-2 md:gap-5 pb-1 pt-1 items-stretch w-full pl-0 pr-4 md:pr-8 relative z-10">
                    <style dangerouslySetInnerHTML={{__html: `
                      .hide-scrollbar::-webkit-scrollbar { display: none; }
                    `}} />
                    
                    <div className="sticky left-0 z-20 shrink-0 snap-start w-[145px] sm:w-[160px] md:w-[280px] lg:w-[320px] group flex flex-col justify-end pl-4 md:pl-8 pointer-events-none relative">
                      
                      <div className="absolute inset-x-4 bottom-4 top-1/4 bg-white/40 blur-[15px] rounded-full -z-10" />

                      {cat.model_image_url ? (
                        <img 
                          src={cat.model_image_url} 
                          alt={`${cat.name} Campaign`} 
                          className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105 origin-bottom pointer-events-auto"
                        />
                      ) : cat.image_url ? (
                        <img 
                          src={cat.image_url} 
                          alt={`${cat.name} Campaign`} 
                          className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105 origin-bottom pointer-events-auto"
                        />
                      ) : (
                        <div className="w-full aspect-[4/5] flex items-center justify-center text-zinc-400 font-bold uppercase tracking-widest text-[8px] md:text-xs text-center p-2 bg-zinc-100 rounded-2xl pointer-events-auto">
                          No Model
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 h-6 md:h-12 bg-gradient-to-t from-white via-white/80 to-transparent z-30 pointer-events-none" />
                    </div>

                    {productsByCat[cat.id] && productsByCat[cat.id].length > 0 ? (
                      productsByCat[cat.id].slice(0, 8).map((product) => (
                        <Link 
                          key={product.id}
                          to="/product/$slug"
                          params={{ slug: product.slug || product.id }}
                          className="shrink-0 snap-start w-[110px] md:w-[220px] lg:w-[240px] h-auto bg-white/95 backdrop-blur-sm rounded-[12px] md:rounded-[20px] p-2 md:p-3 border border-zinc-100 shadow-sm flex flex-col gap-1.5 md:gap-3 group cursor-pointer hover:shadow-[0_10px_30px_rgba(74,11,73,0.08)] hover:-translate-y-1 transition-all duration-300 relative z-10"
                        >
                          <div className="aspect-square w-full bg-zinc-50 rounded-lg md:rounded-xl overflow-hidden relative border border-zinc-50 shrink-0">
                             {product.cover_image_url ? (
                               <img src={product.cover_image_url} alt={product.title || "Product"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                             ) : (
                               <div className="w-full h-full flex flex-col items-center justify-center text-[8px] md:text-[10px] text-zinc-400 font-bold uppercase bg-zinc-100/50">
                                 <span className="opacity-50">No Image</span>
                               </div>
                             )}
                          </div>
                          
                          <div className="mt-1 md:mt-2 px-0.5 w-full">
                            <h4 className="text-[10px] md:text-sm font-semibold text-zinc-800 line-clamp-2 leading-tight group-hover:text-[#4A0B49] transition-colors">
                              {product.title || "Unnamed Product"}
                            </h4>
                          </div>
                          
                          <div className="mt-auto pt-1.5 md:pt-3 border-t border-zinc-100/50 flex justify-between items-center px-0.5 w-full">
                            <span className="text-[11px] md:text-base font-black text-zinc-900">
                              {product.mrp != null ? `₹${Number(product.mrp).toLocaleString()}` : "TBA"}
                            </span>
                            <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-purple-50 text-[#4A0B49] flex items-center justify-center group-hover:bg-[#4A0B49] group-hover:text-white transition-colors shrink-0">
                              <ArrowRight className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <div key={`skeleton-${idx}`} className="shrink-0 snap-start w-[110px] md:w-[220px] lg:w-[240px] h-auto bg-white/50 backdrop-blur-sm rounded-[12px] md:rounded-[20px] p-2 md:p-3 border border-zinc-100 shadow-sm flex flex-col gap-1.5 md:gap-3 relative z-10">
                          <div className="aspect-square w-full bg-zinc-100 rounded-lg md:rounded-xl animate-pulse shrink-0" />
                          <div className="space-y-1 md:space-y-2 mt-1 md:mt-2">
                            <div className="h-2 md:h-3 bg-zinc-200/70 rounded w-full animate-pulse" />
                            <div className="h-2 md:h-3 bg-zinc-200/70 rounded w-2/3 animate-pulse" />
                          </div>
                        </div>
                      ))
                    )}
                    
                    <div className="shrink-0 snap-start w-[110px] md:w-[220px] lg:w-[240px] h-auto flex items-center justify-center py-0">
                      <Link 
                        to="/category/$slug" 
                        params={{ slug: cat.slug }}
                        className="w-full h-full min-h-[160px] md:min-h-[260px] bg-white/40 rounded-[12px] md:rounded-[20px] border-2 border-[#4A0B49]/10 border-dashed flex flex-col items-center justify-center gap-1.5 md:gap-3 hover:bg-white hover:border-[#4A0B49]/30 transition-all text-zinc-400 hover:text-[#4A0B49] group shadow-sm hover:shadow-md"
                      >
                        <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-zinc-100 group-hover:scale-110 transition-transform">
                          <ArrowRight className="w-2.5 h-2.5 md:w-4 md:h-4" />
                        </div>
                        <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-center px-2">
                          View All<br/>{cat.name}
                        </span>
                      </Link>
                    </div>

                    <div className="shrink-0 w-2 md:w-4" />

                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. STORE LOCATOR SECTION (Mobile Optimized Grid + Auto-Detect) */}
      {/* ========================================================= */}
      <section className="bg-white py-8 md:py-24 border-t border-zinc-100 relative overflow-hidden">
        
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50/40 via-transparent to-purple-50/40 pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
          <div className="bg-[#FFF9E6] rounded-[24px] md:rounded-[40px] shadow-[0_20px_50px_-15px_rgba(74,11,73,0.05)] border border-purple-900/5 relative group overflow-hidden grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] md:grid-cols-2 gap-x-3 gap-y-3 md:gap-x-0 md:gap-y-0 p-2.5 md:p-6">
            
            <div className="absolute top-0 bottom-0 right-0 w-full md:w-3/4 bg-gradient-to-l from-purple-200/40 via-fuchsia-100/20 to-transparent pointer-events-none z-0" />

            <div className="col-span-1 row-span-1 md:row-span-2 relative rounded-[16px] md:rounded-[32px] overflow-hidden h-[120px] sm:h-[140px] md:h-full md:min-h-[400px] shadow-sm z-10">
              <img 
                src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/store-images/store-front.png" 
                alt="Visit our boutique" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4A0B49]/40 via-black/5 to-transparent pointer-events-none" />
            </div>
            
            <div className="col-span-1 md:col-span-1 flex flex-col justify-center pt-1 md:pt-12 md:px-12 relative z-10">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-6">
                <span className="w-4 md:w-8 h-[2px] bg-[#4A0B49] rounded-full"></span>
                <span className="text-[#4A0B49] text-[8px] md:text-xs font-bold uppercase tracking-widest">Experience In-Person</span>
              </div>

              <h2 className="text-[17px] sm:text-xl md:text-5xl font-black text-zinc-900 mb-1.5 md:mb-4 leading-tight tracking-tight pr-2 md:pr-0">
                Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A0B49] to-fuchsia-600 font-serif font-bold italic">favorite designs</span> nearby
              </h2>
              
              <p className="text-[10px] md:text-base text-zinc-600 md:mb-6 font-medium leading-snug line-clamp-2 md:line-clamp-none pr-2 md:pr-0">
                Try it on before you buy it. With premium boutiques across the city, experiencing our brilliance is effortless.
              </p>
            </div>

            <div className="col-span-2 md:col-span-1 md:col-start-2 flex flex-col justify-end md:justify-center md:px-12 pb-1 md:pb-12 relative z-10">
              <div className="relative flex items-center bg-white/90 backdrop-blur-md rounded-[14px] md:rounded-[20px] border-2 border-white shadow-[0_8px_30px_rgba(74,11,73,0.08)] focus-within:border-purple-200 focus-within:shadow-[0_8px_30px_rgba(74,11,73,0.12)] p-1 md:p-1.5 transition-all duration-300">
                <MapPin className="absolute left-3 md:left-5 w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
                <input 
                  type="text" 
                  value={storeQuery}
                  onChange={(e) => setStoreQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStoreSearch()}
                  placeholder="Enter Pincode or City..." 
                  className="w-full h-10 md:h-14 pl-9 md:pl-14 pr-2 md:pr-4 text-xs md:text-base font-medium outline-none bg-transparent placeholder:text-zinc-400"
                />
                <button 
                  onClick={handleStoreSearch}
                  className="h-10 md:h-14 px-4 md:px-8 shrink-0 rounded-[10px] md:rounded-[16px] bg-zinc-900 text-white font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#4A0B49] transition-colors shadow-sm"
                >
                  Locate
                </button>
              </div>

              {/* Clean, professional bottom links */}
              <div className="flex items-center justify-between mt-4 md:mt-6 px-1">
                
                <button 
                  onClick={handleAutoDetect}
                  disabled={isLocating}
                  className="text-[10px] md:text-xs font-bold text-zinc-500 hover:text-[#4A0B49] flex items-center gap-1.5 transition-colors uppercase tracking-widest group/detect disabled:opacity-50"
                >
                  {isLocating ? (
                    <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-3 h-3 md:w-4 md:h-4 group-hover/detect:text-[#4A0B49]" />
                  )}
                  <span className="border-b border-transparent group-hover/detect:border-[#4A0B49] pb-0.5 transition-all">
                    {isLocating ? "Locating..." : "Use Current Location"}
                  </span>
                </button>

                <Link to="/stores" className="text-[10px] md:text-xs font-bold text-zinc-500 flex items-center gap-1.5 hover:text-[#4A0B49] transition-colors uppercase tracking-widest group/link">
                  <span className="border-b border-transparent group-hover/link:border-[#4A0B49] pb-0.5 transition-all">View All Stores</span> 
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
                
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. UTILITIES (Flush Bottom Models + High Contrast Backgrounds) */}
      {/* ========================================================= */}
      <section className="bg-white py-6 md:py-12 relative overflow-hidden border-t border-zinc-100">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
          
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            
            <Link 
              to="/ComingSoon"
              className="bg-[#FFF9E6] border border-[#4A0B49]/5 rounded-[16px] md:rounded-[24px] overflow-hidden group relative h-[130px] sm:h-[160px] md:h-[240px] shadow-sm hover:shadow-[0_10px_30px_rgba(74,11,73,0.08)] transition-all flex"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />

              <div className="w-[60%] md:w-[55%] p-3 md:p-8 flex flex-col justify-center relative z-20">
                <h3 className="text-[14px] sm:text-lg md:text-3xl font-serif font-bold text-zinc-900 leading-tight mb-1 md:mb-2">
                  Pavitram<br/>Vouchers
                </h3>
                <p className="text-[8px] md:text-xs text-zinc-600 mb-3 md:mb-6 font-medium">
                  See voucher details here.
                </p>
            
              </div>

              <div className="absolute right-0 bottom-0 w-[55%] md:w-[50%] h-[110%] z-10 pointer-events-none flex items-end justify-end">
                <img
                  src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/voucher-model.png" 
                  alt="Gift Vouchers" 
                  className="w-full h-auto max-h-full object-contain object-right group-hover:scale-105 transition-transform duration-700 origin-bottom translate-y-[8px]"
                />
              </div>
            </Link>

            <Link 
              to="/ComingSoon"
              className="bg-gradient-to-br from-[#FDF1E5] to-[#FCE7D2] border border-orange-900/5 rounded-[16px] md:rounded-[24px] overflow-hidden group relative h-[130px] sm:h-[160px] md:h-[240px] shadow-sm hover:shadow-[0_10px_30px_rgba(74,11,73,0.08)] transition-all flex"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/40 rounded-full blur-2xl pointer-events-none" />

              <div className="w-[60%] md:w-[55%] p-3 md:p-8 flex flex-col justify-center relative z-20">
                <h3 className="text-[14px] sm:text-lg md:text-3xl font-serif font-bold text-[#4A0B49] leading-tight mb-1 md:mb-2">
                  Pavitram<br/>Kitty
                </h3>
                <p className="text-[8px] md:text-xs text-[#4A0B49]/70 mb-3 md:mb-6 font-medium">
                  Plan your purchase smartly.
                </p>
              </div>

              <div className="absolute right-0 bottom-0 w-[55%] md:w-[50%] h-[110%] z-10 pointer-events-none flex items-end justify-end">
                <img 
                  src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/kitty-model.png" 
                  alt="Pavitram Kitty" 
                  className="w-full h-auto max-h-full object-contain object-right group-hover:scale-105 transition-transform duration-700 origin-bottom translate-y-[8px]"
                />
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. PAVITRAM FOR YOU (Premium VIP Card Layout) */}
      {/* ========================================================= */}
      <section className="bg-white py-8 md:py-16 relative overflow-hidden border-t border-zinc-100">
        
        <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-50/50 to-transparent pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10">
          
          <div className="bg-[#FFF9E6] rounded-[24px] md:rounded-[40px] border border-[#4A0B49]/10 p-6 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 shadow-[0_20px_50px_-15px_rgba(74,11,73,0.05)] relative overflow-hidden group">

            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3" />

            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left relative z-10">
              
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <span className="w-6 md:w-8 h-[2px] bg-[#4A0B49] rounded-full"></span>
                <span className="text-[#4A0B49] text-[10px] md:text-xs font-bold uppercase tracking-widest">Join The Club</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif font-black text-zinc-900 mb-3 md:mb-4 tracking-tight">
                Pavitram For You
              </h2>
              
              <p className="text-[11px] md:text-sm text-zinc-600 mb-6 md:mb-10 font-medium max-w-md leading-relaxed">
                Unlock exclusive early access to our newest collections, special seasonal offers, and insider jewellery tips.
              </p>

              <div className="w-full max-w-md relative flex items-center bg-white/90 backdrop-blur-md rounded-[16px] md:rounded-[20px] border-2 border-white shadow-[0_8px_30px_rgba(74,11,73,0.06)] focus-within:border-purple-200 p-1 md:p-1.5 transition-all duration-300">
                <Mail className="absolute left-4 md:left-5 w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
                <input 
                  type="email" 
                  placeholder="Enter your email address..." 
                  className="w-full h-12 md:h-14 pl-12 md:pl-14 pr-4 text-xs md:text-sm font-medium outline-none bg-transparent placeholder:text-zinc-400"
                />
                <button className="h-10 md:h-12 px-5 md:px-8 shrink-0 rounded-[12px] md:rounded-[16px] bg-[#4A0B49] text-white font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#340733] transition-colors shadow-sm">
                  Subscribe
                </button>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col items-center md:items-start relative z-10 shrink-0">
               
               <div className="w-full max-w-[200px] h-px md:hidden bg-[#4A0B49]/10 mb-8 mt-2" />

               <p className="text-[10px] md:text-xs font-bold text-[#4A0B49]/50 uppercase tracking-widest mb-4 md:mb-5">
                 Connect Directly
               </p>

               <a 
  href="https://wa.me/918356834764?text=Hi!%20I%20am%20reaching%20out%20from%20your%20website."
  target="_blank"
  rel="noopener noreferrer"
  className="w-full md:w-auto flex items-center justify-center gap-3 bg-zinc-900 hover:bg-[#075E54] text-white px-8 md:px-10 py-4 md:py-4 rounded-[16px] md:rounded-[20px] text-[11px] md:text-xs font-bold uppercase tracking-widest shadow-lg shadow-zinc-900/20 transition-all duration-300 mb-6 md:mb-8 group cursor-pointer"
>
  <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" /> 
  Join on WhatsApp
</a>

               <div className="flex items-center gap-4">
                  <a href="#" className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-[14px] md:rounded-[16px] border border-zinc-100 flex items-center justify-center text-zinc-600 hover:text-[#E1306C] hover:border-pink-200 hover:shadow-[0_8px_20px_rgba(225,48,108,0.15)] transition-all duration-300 shadow-sm group">
                    <Instagram className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                  </a>
                  <a href="#" className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-[14px] md:rounded-[16px] border border-zinc-100 flex items-center justify-center text-zinc-600 hover:text-[#1877F2] hover:border-blue-200 hover:shadow-[0_8px_20px_rgba(24,119,242,0.15)] transition-all duration-300 shadow-sm group">
                    <Facebook className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                  </a>
               </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}