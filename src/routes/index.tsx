import React, { useEffect, useState, useRef } from "react";
import { createFileRoute, Link, useNavigate} from "@tanstack/react-router";

import { 
  ArrowRight, ShieldCheck, RefreshCw, Award, 
  MapPin, Gift, Wallet, Instagram, Facebook, 
  Mail, MessageCircle, Video, PhoneCall, 
  Truck, Navigation, Loader2,
  Sparkles, Gem, TrendingUp, PackageX
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute('/')({
  component: Index,
});

// Helper function to truly shuffle an array
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

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
  }
];

// Curated Collections Grid Data
const CURATED_COLLECTIONS = [
  {
    title: "A present for the modern bride",
    image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/curated1.webp",
    link: "/category/bridal"
  },
  {
    title: "Elevate your uniform edge",
    image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/curated2.webp",
    link: "/category/workwear"
  },
  {
    title: "Drop a diamond on success sign",
    image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/curated3.webp",
    link: "/category/diamonds"
  },
  {
    title: "A Pendant for the occasion",
    image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/curated4.webp",
    link: "/category/pendants"
  },
  {
    title: "Sway elegantly at every occasion",
    image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/curated5.webp",
    link: "/category/earrings"
  },
  {
    title: "A present on her anniversary",
    image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/curated6.webp",
    link: "/category/anniversary"
  }
];

// ✨ NEW: Price Sensitivity Grid Data
const PRICE_COLLECTIONS = [
  {
    title: "Under ₹15,000",
    subtitle: "Affordable Elegance",
    image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/price1.webp",
    link: "/category/under-15k"
  },
  {
    title: "₹15k - ₹30k",
    subtitle: "Everyday Luxury",
    image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/price2.webp",
    link: "/category/15k-to-30k"
  },
  {
    title: "₹30k - ₹50k",
    subtitle: "Premium Finds",
    image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/price3.webp",
    link: "/category/30k-to-50k"
  },
  {
    title: "Above ₹50,000",
    subtitle: "Masterpiece Collection",
    image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/price4.webp",
    link: "/category/above-50k"
  }
];

// Reusable Standard Product Card Component
const ProductCard = ({ product }: { product: any }) => (
  <Link 
    to="/product/$slug"
    params={{ slug: product.slug || product.id }}
    className="shrink-0 snap-start w-[130px] md:w-[220px] lg:w-[240px] h-auto bg-white backdrop-blur-sm rounded-sm md:rounded-md p-2 md:p-3 border border-zinc-100 shadow-sm flex flex-col gap-1.5 md:gap-3 group cursor-pointer hover:shadow-[0_10px_30px_rgba(74,11,73,0.08)] hover:-translate-y-1 transition-all duration-300 relative z-10"
  >
    <div className="aspect-square w-full bg-[#FAF9F6] rounded-sm md:rounded-md overflow-hidden relative shrink-0">
      {product.cover_image_url ? (
        <img 
          src={product.cover_image_url} 
          alt={product.title || "Product"} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-[8px] md:text-[10px] text-zinc-400 font-bold uppercase">
          <PackageX className="w-6 h-6 mb-1 opacity-50" />
          <span className="opacity-50">No Image</span>
        </div>
      )}
    </div>
    
    <div className="mt-1 md:mt-2 px-0.5 w-full flex-1 flex flex-col">
      <span className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
        {product.category?.name || "Jewellery"}
      </span>
      <h4 className="text-[11px] md:text-sm font-serif font-medium text-zinc-800 line-clamp-2 leading-snug group-hover:text-[#4A0B49] transition-colors">
        {product.title || "Unnamed Product"}
      </h4>
    </div>
    
    <div className="mt-auto pt-1.5 md:pt-3 border-t border-zinc-100/70 flex justify-between items-center px-0.5 w-full">
      <span className="text-[12px] md:text-base font-black text-zinc-900">
        {product.mrp != null ? `₹${Number(product.mrp).toLocaleString()}` : "TBA"}
      </span>
      <div className="w-5 h-5 md:w-7 md:h-7 rounded-sm md:rounded-md bg-purple-50 text-[#4A0B49] flex items-center justify-center group-hover:bg-[#4A0B49] group-hover:text-white transition-colors shrink-0">
        <ArrowRight className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
      </div>
    </div>
  </Link>
);

function Index() {
  const [categories, setCategories] = useState<any[]>([]);
  const [productsByCat, setProductsByCat] = useState<Record<string, any[]>>({}); 
  const [isLoading, setIsLoading] = useState(true);
  
  // Scrolled Sections State
  const [premiumProducts, setPremiumProducts] = useState<any[]>([]);
  const [mixedTrendingProducts, setMixedTrendingProducts] = useState<any[]>([]);

  // Event Special State
  const [eventSpecial, setEventSpecial] = useState<any>(null);
  const [eventProducts, setEventProducts] = useState<any[]>([]);

  // Slider & System States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false); 
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate({ from: '/' });
  const [storeQuery, setStoreQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const handleStoreSearch = () => {
    if (storeQuery.trim()) {
      navigate({
        to: "/stores",
        search: { q: storeQuery.trim() } 
      });
    }
  };

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
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('pavitram_has_seen_splash')) {
      setShowSplash(false);
    } else {
      sessionStorage.setItem('pavitram_has_seen_splash', 'true');
      const splashTimer = setTimeout(() => {
        setFadeSplash(true);
        setTimeout(() => {
          setShowSplash(false);
        }, 500);
      }, 2500);
      return () => clearTimeout(splashTimer);
    }
  }, []);

  // Main Data Fetching
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
          .select("*, category:ecommerce_categories(name)")
          .eq("is_live", true);

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

          const premium = allProducts.filter(p => Number(p.mrp) > 25000);
          setPremiumProducts(shuffleArray(premium).slice(0, 15));

          setMixedTrendingProducts(shuffleArray(allProducts).slice(0, 15));

          // Fetch Event Special
          const { data: eventData } = await supabase
            .from("ecommerce_event_specials")
            .select("*")
            .eq("is_active", true)
            .limit(1)
            .maybeSingle();

          if (eventData && eventData.product_ids) {
            setEventSpecial(eventData);
            const matchedProducts = allProducts.filter(p => eventData.product_ids.includes(p.id));
            matchedProducts.sort((a, b) => eventData.product_ids.indexOf(a.id) - eventData.product_ids.indexOf(b.id));
            setEventProducts(matchedProducts);
          }
        }
      } catch (err) {
        console.error("Failed to fetch catalog:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, []);

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
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-zinc-900 pb-20 relative overflow-hidden">
      
      {/* Global Injected CSS for Animations */}
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
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-splash-logo {
          animation: logoScale 3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-splash-glow {
          animation: glowRise 2.5s ease-out forwards;
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {showSplash && (
        <div className={`fixed inset-0 z-[100] bg-[#FAF9F6] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${fadeSplash ? 'opacity-0' : 'opacity-100'}`}>
          <div className="relative z-10 flex flex-col items-center justify-center animate-splash-logo pointer-events-none">
            <Logo className="w-40 md:w-56 h-auto object-contain" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-[#4A0B49]/30 via-purple-300/5 to-transparent blur-3xl pointer-events-none animate-splash-glow" />
        </div>
      )}

      {/* 1. HERO SLIDER BANNER */}
      <section className="relative w-full overflow-hidden bg-[#FAF9F6]">
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
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
            {HERO_BANNERS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-sm transition-all duration-300 ${index === currentSlide ? 'w-6 bg-white shadow-sm' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      {/* ✨ FIX: Removed beige, changed to crisp white, massively reduced vertical padding */}
      <section className="w-full bg-white relative z-10 border-b border-[#4A0B49]/5 py-4 md:py-8">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex overflow-x-auto gap-3 md:gap-8 lg:gap-10 snap-x snap-mandatory hide-scrollbar items-start">
          {isLoading ? (
            Array.from({ length: 7 }).map((_, idx) => (
              <div key={idx} className="shrink-0 snap-start flex flex-col items-center gap-2 w-[85px] md:w-[140px] lg:w-[170px]">
                <div className="w-full aspect-square bg-zinc-100 rounded-xl animate-pulse" />
                <div className="h-3 bg-zinc-100 rounded animate-pulse w-3/4 mt-1" />
              </div>
            ))
          ) : (
            categories.map((cat) => (
              <Link 
                key={cat.id} 
                to="/category/$slug" 
                params={{ slug: cat.slug }}
                className="shrink-0 snap-start flex flex-col items-center gap-2 md:gap-3 w-[85px] md:w-[140px] lg:w-[170px] group"
              >
                {/* ✨ FIX: Removed the thick inner padding. Images now go edge-to-edge for a premium look with a soft luxury shadow */}
                <div className="w-full aspect-square bg-zinc-50 shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-2xl md:rounded-[1.5rem] overflow-hidden group-hover:shadow-[0_8px_20px_rgba(74,11,73,0.12)] group-hover:-translate-y-1 transition-all duration-300 border border-zinc-100/50">
                  {cat.image_url ? (
                    <img 
                      src={cat.image_url} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full bg-[#FAF9F6] flex items-center justify-center text-zinc-300 text-[10px] font-bold">Img</div>
                  )}
                </div>
                
                {/* ✨ FIX: Kept text close to the image to unify them as a single button */}
                <span className="text-[11px] md:text-sm lg:text-base font-serif font-medium text-zinc-800 text-center leading-tight group-hover:text-[#4A0B49] transition-colors tracking-wide">
                  {cat.name}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

     {/* --- CSS TICKER --- */}
      {/* ✨ CHANGED: Removed mb-6 md:mb-10 so the ticker touches the next section */}
      <div className="w-full overflow-hidden whitespace-nowrap py-3 md:py-4 border-y border-[#4A0B49]/10 bg-transparent flex items-center">
        <div className="inline-block animate-marquee flex-nowrap flex items-center">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-[10px] md:text-xs font-serif font-medium text-zinc-500 uppercase tracking-[0.2em] mx-6">
              Pavitram Diamond jewellery, A Ossam Jewells company •
            </span>
          ))}
        </div>
      </div>

      {/* --- DYNAMIC EVENT SPECIAL --- */}
      {/* ✨ CHANGED: Moved this completely OUTSIDE the padded container so it sits flush with the ticker */}
      {eventSpecial && (
        <section 
          className="w-full relative overflow-hidden pb-6 md:pb-10" 
          style={{ backgroundColor: eventSpecial.bg_color || '#E5D9F2' }}
        >
          {/* Top Banner Image */}
          <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] relative">
            <img
              src={eventSpecial.banner_image_url}
              alt={eventSpecial.title}
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Overlapping Products container */}
          <div className="relative -mt-12 md:-mt-20 z-10 w-full flex flex-col items-center">
            
            {/* Product Scrolling Strip */}
            <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 md:gap-5 px-4 md:px-8 w-full pb-6">
              {eventProducts.map((product) => (
                <Link
                  key={product.id}
                  to="/product/$slug"
                  params={{ slug: product.slug || product.id }}
                  className="shrink-0 snap-start flex flex-col items-center gap-1.5 md:gap-2 w-[100px] md:w-[150px] group"
                >
                  {/* Centered Image Square Card */}
                  <div className="w-full aspect-square bg-white rounded-xl md:rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden flex items-center justify-center p-2 group-hover:-translate-y-1 transition-transform duration-300">
                    {product.cover_image_url ? (
                      <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <PackageX className="w-6 h-6 text-zinc-300" />
                    )}
                  </div>
                  {/* Centered Text Container */}
                  <div className="text-center px-1 w-full">
                    <span className="text-[13px] md:text-base font-black text-zinc-900 block tracking-tight" style={{ color: eventSpecial.button_color }}>
                      {product.mrp != null ? `₹${Number(product.mrp).toLocaleString()}` : "TBA"}
                    </span>
                    <span className="text-[10px] md:text-xs text-[#4A2D60]/80 font-medium line-clamp-1 mt-0.5">
                      {product.title}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Full Width Bottom Button Setup */}
            <div className="w-full px-4 md:px-8 mt-2 max-w-[250px] md:max-w-xs mx-auto">
              <Link to={eventSpecial.button_link || "/"}>
                <button
                  className="w-full py-3.5 md:py-4 rounded-xl text-white font-bold text-[13px] md:text-[15px] transition-transform active:scale-95 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 tracking-wide"
                  style={{ backgroundColor: eventSpecial.button_color || '#4A2D60' }}
                >
                  {eventSpecial.button_text || "Shop Now"}
                </button>
              </Link>
            </div>

          </div>
        </section>
      )}

      {/* 3. INTEGRATED SHOP SECTIONS */}
      {/* ✨ CHANGED: Adjusted top padding (pt-8 md:pt-12) to keep spacing nice for the lists below */}
      <div className="max-w-[1400px] mx-auto space-y-10 md:space-y-16 pt-8 md:pt-12 pb-4 md:pb-8 relative z-10 bg-[#FAF9F6]">

       {/* --- SCROLL 1: CURATED COLLECTIONS GRID --- */}
        {/* Background kept as the soft gradient */}
        <section className="relative w-full bg-gradient-to-b from-[#FAF9F6] to-[#F3EAF4]/60 py-10 md:py-16 mb-12 md:mb-20 border-y border-[#4A0B49]/5">
          <div className="px-4 md:px-8 max-w-[1200px] mx-auto relative z-10">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-serif font-medium text-[#4A0B49] tracking-tight">
                Curated with love
              </h2>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-0">
              {CURATED_COLLECTIONS.map((collection, idx) => (
                <Link key={idx} to={collection.link} className="flex flex-col items-center group cursor-pointer">
                  <div className="w-full aspect-square rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500 relative bg-zinc-100">
                    <img 
                      src={collection.image} 
                      alt={collection.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-[#4A0B49]/0 group-hover:bg-[#4A0B49]/10 transition-colors duration-500" />
                  </div>
                  {/* ✨ CHANGED: Bolder, normal casing, standard tracking, slightly larger text */}
                  <div className="h-10 md:h-12 flex items-start justify-center w-full px-1">
                    <h3 className="text-[11px] md:text-sm font-bold text-[#4A0B49] text-center leading-snug line-clamp-3 group-hover:text-[#340733] transition-colors">
                      {collection.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>


        {/* --- SCROLL 3: OUR BESTSELLERS --- */}
        <section className="relative px-4 md:px-8 mb-12 md:mb-20 max-w-[1400px] mx-auto">
          {/* ✨ CHANGED: Unified Centered Heading Style */}
          <div className="text-center mb-8 md:mb-12 relative flex flex-col items-center">
            <h2 className="text-2xl md:text-4xl font-serif font-medium text-[#4A0B49] tracking-tight flex items-center justify-center gap-2 md:gap-3">
              
              Our Bestsellers
            </h2>
            <p className="text-[11px] md:text-sm text-zinc-500 mt-2 font-medium tracking-wide">
              The most loved designs by our community.
            </p>
            
            {/* ✨ CHANGED: Centered on mobile, Absolute Right on Desktop */}
            <Link 
              to="/category/bestsellers" 
              className="mt-4 md:mt-0 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 text-[10px] md:text-xs font-bold text-[#4A0B49] uppercase tracking-widest hover:bg-white bg-zinc-50 px-4 py-2.5 rounded-lg md:rounded-xl shrink-0 shadow-sm border border-[#4A0B49]/10 transition-all flex items-center gap-1.5"
            >
              Explore All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 md:gap-5 pb-6 pt-2 items-stretch w-full">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shrink-0 snap-start w-[130px] md:w-[220px] lg:w-[240px] aspect-[4/5] bg-white rounded-xl md:rounded-2xl animate-pulse border border-zinc-100 shadow-sm" />
              ))
            ) : premiumProducts.length > 0 ? (
              premiumProducts.map(product => <ProductCard key={`bs-${product.id}`} product={product} />)
            ) : (
              <div className="w-full py-8 text-center text-zinc-400 text-sm font-medium">No products found in this range.</div>
            )}
          </div>
        </section>

        {/* --- SCROLL 4: SHOP BY PRICE GRID --- */}
        <section className="relative px-4 md:px-8 mb-12 md:mb-20 max-w-[1000px] mx-auto">
          {/* Maintains the exact same centered luxury heading style */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-serif font-medium text-[#4A0B49] tracking-tight">
              Shop By Price
            </h2>
            <p className="text-[11px] md:text-sm text-zinc-500 mt-2 font-medium tracking-wide">
              Explore our diverse selections. Find your style.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {PRICE_COLLECTIONS.map((item, idx) => {
               const isFullWidthMobile = idx === 0 || idx === 3;
               return (
                 <Link 
                   key={idx} 
                   to={item.link} 
                   className={`group relative rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-zinc-100 ${
                     isFullWidthMobile 
                        ? 'col-span-2 md:col-span-1 aspect-[21/10] sm:aspect-[24/9] md:aspect-[4/5]' 
                        : 'col-span-1 md:col-span-1 aspect-square sm:aspect-[4/3] md:aspect-[4/5]'
                   }`}
                 >
                   <img 
                     src={item.image} 
                     alt={item.title}
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none transition-opacity group-hover:opacity-90" />
                   
                   <div className="absolute bottom-3 left-4 md:bottom-6 md:left-6 z-10 text-white">
                      <p className="text-[9px] md:text-[11px] font-bold opacity-90 uppercase tracking-widest mb-0.5">
                        {item.subtitle}
                      </p>
                      <h3 className="text-sm sm:text-lg md:text-2xl font-serif font-black tracking-wide">
                        {item.title}
                      </h3>
                   </div>
                 </Link>
               )
            })}
          </div>
        </section>

        {/* --- SCROLL 5: TRENDING NOW --- */}
        <section className="relative px-4 md:px-8 mb-12 md:mb-20 max-w-[1400px] mx-auto">
          {/* ✨ CHANGED: Unified Centered Heading Style */}
          <div className="text-center mb-8 md:mb-12 relative flex flex-col items-center">
            <h2 className="text-2xl md:text-4xl font-serif font-medium text-[#4A0B49] tracking-tight flex items-center justify-center gap-2 md:gap-3">
             Trending Now
            </h2>
            <p className="text-[11px] md:text-sm text-zinc-500 mt-2 font-medium tracking-wide">
              A curated mix of our most loved styles.
            </p>
            
            {/* ✨ CHANGED: Centered on mobile, Absolute Right on Desktop */}
            <Link 
              to="/category/trending" 
              className="mt-4 md:mt-0 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 text-[10px] md:text-xs font-bold text-[#4A0B49] uppercase tracking-widest hover:bg-white bg-zinc-50 px-4 py-2.5 rounded-lg md:rounded-xl shrink-0 shadow-sm border border-[#4A0B49]/10 transition-all flex items-center gap-1.5"
            >
              Explore All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 md:gap-5 pb-6 pt-2 items-stretch w-full">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shrink-0 snap-start w-[130px] md:w-[220px] lg:w-[240px] aspect-[4/5] bg-white rounded-xl md:rounded-2xl animate-pulse border border-zinc-100 shadow-sm" />
              ))
            ) : mixedTrendingProducts.length > 0 ? (
              mixedTrendingProducts.map(product => <ProductCard key={`trend-${product.id}`} product={product} />)
            ) : (
              <div className="w-full py-8 text-center text-zinc-400 text-sm font-medium">No products found.</div>
            )}
          </div>
        </section>
      </div>

     {/* 5. STORE LOCATOR SECTION */}
      {/* ✨ CHANGED: Reverted back to the clean off-white bg-[#FAF9F6] */}
      <section className="bg-[#FAF9F6] py-8 md:py-16 border-t border-zinc-200/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50/30 via-transparent to-purple-50/30 pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
          <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-purple-900/5 relative group overflow-hidden grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] md:grid-cols-2 gap-x-3 gap-y-3 md:gap-x-0 md:gap-y-0 p-3 md:p-6">
            <div className="absolute top-0 bottom-0 right-0 w-full md:w-3/4 bg-gradient-to-l from-purple-100/30 via-fuchsia-50/20 to-transparent pointer-events-none z-0" />
            
            <div className="col-span-1 row-span-1 md:row-span-2 relative rounded-xl md:rounded-2xl overflow-hidden h-[120px] sm:h-[140px] md:h-full md:min-h-[400px] shadow-sm z-10">
              <img 
                src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/store-images/store-front.png" 
                alt="Visit our boutique" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4A0B49]/40 via-black/5 to-transparent pointer-events-none" />
            </div>
            
            <div className="col-span-1 md:col-span-1 flex flex-col justify-center pt-1 md:pt-12 md:px-12 relative z-10">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-4">
                <span className="w-4 md:w-8 h-[2px] bg-[#4A0B49] rounded-sm"></span>
                <span className="text-[#4A0B49] text-[8px] md:text-xs font-bold uppercase tracking-widest">Experience In-Person</span>
              </div>
              <h2 className="text-[17px] sm:text-xl md:text-4xl font-serif font-black text-zinc-900 mb-1.5 md:mb-4 leading-tight tracking-tight pr-2 md:pr-0">
                Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A0B49] to-fuchsia-600 italic">favorite designs</span> nearby
              </h2>
              <p className="text-[10px] md:text-sm text-zinc-500 md:mb-6 font-medium leading-relaxed line-clamp-2 md:line-clamp-none pr-2 md:pr-0 tracking-wide">
                Try it on before you buy it. With premium boutiques across the city, experiencing our brilliance is effortless.
              </p>
            </div>

            <div className="col-span-2 md:col-span-1 md:col-start-2 flex flex-col justify-end md:justify-center md:px-12 pb-1 md:pb-12 relative z-10">
              <div className="relative flex items-center bg-zinc-50 border border-zinc-200 focus-within:border-purple-300 p-1.5 transition-all duration-300 rounded-xl shadow-sm">
                <MapPin className="absolute left-4 md:left-5 w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
                <input 
                  type="text" 
                  value={storeQuery}
                  onChange={(e) => setStoreQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStoreSearch()}
                  placeholder="Enter Pincode or City..." 
                  className="w-full h-10 md:h-12 pl-10 md:pl-12 pr-2 md:pr-4 text-xs md:text-sm font-medium outline-none bg-transparent placeholder:text-zinc-400"
                />
                <button 
                  onClick={handleStoreSearch}
                  className="h-10 md:h-12 px-5 md:px-8 shrink-0 rounded-lg md:rounded-xl bg-zinc-900 text-white font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#4A0B49] transition-colors shadow-sm"
                >
                  Locate
                </button>
              </div>

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

      {/* 6. UTILITIES */}
      {/* ✨ CHANGED: Reverted back to the clean off-white bg-[#FAF9F6] */}
      <section className="bg-[#FAF9F6] py-6 md:py-16 relative overflow-hidden border-t border-zinc-200/50">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-2 gap-3 md:gap-8 lg:gap-10">
            
            {/* ✨ CHANGED: Optimized for wide desktop layout like reference image */}
            <Link 
              to="/ComingSoon"
              className="bg-white border border-[#4A0B49]/10 rounded-2xl md:rounded-[2rem] overflow-hidden group relative h-[130px] sm:h-[160px] md:h-[220px] lg:h-[260px] shadow-sm hover:shadow-xl transition-all flex items-center"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />
              
              <div className="w-[60%] md:w-[50%] p-4 md:p-10 lg:p-16 flex flex-col justify-center relative z-20">
                <h3 className="text-[14px] sm:text-lg md:text-3xl lg:text-4xl font-serif font-black text-zinc-900 leading-tight mb-1 md:mb-3">
                  Pavitram<br/>Vouchers
                </h3>
                <p className="text-[8px] md:text-xs lg:text-sm text-zinc-500 mb-0 font-medium tracking-wide">
                  See voucher details here.
                </p>
              </div>
              
              <div className="absolute right-0 bottom-0 w-[55%] md:w-[50%] lg:w-[45%] h-[115%] md:h-[125%] z-10 pointer-events-none flex items-end justify-end">
                <img
                  src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/voucher-model.png" 
                  alt="Gift Vouchers" 
                  className="w-full h-full object-contain object-right-bottom group-hover:scale-105 transition-transform duration-700 origin-bottom"
                />
              </div>
            </Link>

            {/* ✨ CHANGED: Optimized for wide desktop layout like reference image */}
            <Link 
              to="/ComingSoon"
              className="bg-white border border-orange-900/10 rounded-2xl md:rounded-[2rem] overflow-hidden group relative h-[130px] sm:h-[160px] md:h-[220px] lg:h-[260px] shadow-sm hover:shadow-xl transition-all flex items-center"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-50/50 rounded-full blur-2xl pointer-events-none" />
              
              <div className="w-[60%] md:w-[50%] p-4 md:p-10 lg:p-16 flex flex-col justify-center relative z-20">
                <h3 className="text-[14px] sm:text-lg md:text-3xl lg:text-4xl font-serif font-black text-[#4A0B49] leading-tight mb-1 md:mb-3">
                  Pavitram<br/>Kitty
                </h3>
                <p className="text-[8px] md:text-xs lg:text-sm text-[#4A0B49]/70 mb-0 font-medium tracking-wide">
                  Plan your purchase smartly.
                </p>
              </div>
              
              <div className="absolute right-0 bottom-0 w-[55%] md:w-[50%] lg:w-[45%] h-[115%] md:h-[125%] z-10 pointer-events-none flex items-end justify-end">
                <img 
                  src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/kitty-model.png" 
                  alt="Pavitram Kitty" 
                  className="w-full h-full object-contain object-right-bottom group-hover:scale-105 transition-transform duration-700 origin-bottom"
                />
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* 7. PAVITRAM FOR YOU */}
      {/* ✨ CHANGED: Reverted back to the clean off-white bg-[#FAF9F6] */}
      <section className="bg-[#FAF9F6] py-8 md:py-16 relative overflow-hidden border-t border-zinc-200/50">
        <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-50/30 to-transparent pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10">
          <div className="bg-white rounded-2xl md:rounded-[2rem] border border-[#4A0B49]/10 p-6 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/40 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3" />

            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left relative z-10">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <span className="w-6 md:w-8 h-[2px] bg-[#4A0B49] rounded-sm"></span>
                <span className="text-[#4A0B49] text-[10px] md:text-xs font-bold uppercase tracking-widest">Join The Club</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-zinc-900 mb-3 md:mb-4 tracking-tight">
                Pavitram For You
              </h2>
              <p className="text-[11px] md:text-sm text-zinc-500 mb-6 md:mb-10 font-medium max-w-md leading-relaxed tracking-wide">
                Unlock exclusive early access to our newest collections, special seasonal offers, and insider jewellery tips.
              </p>

              <div className="w-full max-w-md relative flex items-center bg-zinc-50 border border-zinc-200 focus-within:border-purple-300 p-1.5 transition-all duration-300 rounded-xl shadow-sm">
                <Mail className="absolute left-4 md:left-5 w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
                <input 
                  type="email" 
                  placeholder="Enter your email address..." 
                  className="w-full h-10 md:h-12 pl-12 md:pl-14 pr-4 text-xs md:text-sm font-medium outline-none bg-transparent placeholder:text-zinc-400"
                />
                <button className="h-10 md:h-12 px-5 md:px-8 shrink-0 rounded-lg md:rounded-xl bg-[#4A0B49] text-white font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#340733] transition-colors shadow-sm">
                  Subscribe
                </button>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col items-center md:items-start relative z-10 shrink-0">
               <div className="w-full max-w-[200px] h-px md:hidden bg-[#4A0B49]/10 mb-8 mt-2" />
               <p className="text-[10px] md:text-xs font-bold text-[#4A0B49]/70 uppercase tracking-widest mb-4 md:mb-5">
                 Connect Directly
               </p>
               <a 
                href="https://wa.me/918356834764?text=Hi!%20I%20am%20reaching%20out%20from%20your%20website."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#4A0B49] hover:bg-[#075E54] text-white px-8 md:px-10 py-4 md:py-4 rounded-xl text-[11px] md:text-xs font-bold uppercase tracking-widest shadow-sm transition-all duration-300 mb-6 md:mb-8 group cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 text-[#FAF9F6] group-hover:text-white transition-colors" /> 
                Join on WhatsApp
              </a>

               <div className="flex items-center gap-4">
                  <a href="#" className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#E1306C] hover:border-pink-200 transition-all duration-300 shadow-sm group">
                    <Instagram className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                  </a>
                  <a href="#" className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#1877F2] hover:border-blue-200 transition-all duration-300 shadow-sm group">
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