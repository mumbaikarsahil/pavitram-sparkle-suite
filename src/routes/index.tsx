import React, { useEffect, useState, useRef } from "react";
import { createFileRoute, Link, useNavigate} from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";

import { 
  ArrowRight, ShieldCheck, RefreshCw, 
  MapPin, Instagram, Mail, MessageCircle, 
  Navigation, Loader2, PackageX,
  Diamond, CheckCircle2, Heart,
  Sparkles, Award,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { DynamicIsland } from "@/components/site/DynamicIsland";
import { FloatingHelp } from "@/components/site/FloatingHelp";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/')({
  component: Index,
});

// Mock Banner Data
const HERO_BANNERS = [
  {
    id: 1,
    desktop_image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/4.webp",
    mobile_image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/h1.webp", 
    link: "/category/new-arrivals",
    duration_ms: 5000,
  },
  {
    id: 2,
    desktop_image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/5.webp",
    mobile_image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/h2.webp", 
    link: "/category/bestsellers",
    duration_ms: 5000,
  },

  {
    id: 3,
    mobile_image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/h3.webp", 
    link: "/category/bestsellers",
    duration_ms: 5000,
  }
];

const PRICE_COLLECTIONS = [
  { title: "Under ₹15,000", subtitle: "Affordable Elegance", image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/price1.webp", link: "/category/under-15k" },
  { title: "₹15k - ₹30k", subtitle: "Everyday Luxury", image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/price2.webp", link: "/category/15k-to-30k" },
  { title: "₹30k - ₹50k", subtitle: "Premium Finds", image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/price3.webp", link: "/category/30k-to-50k" },
  { title: "Above ₹50,000", subtitle: "Masterpiece Collection", image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/price4.webp", link: "/category/above-50k" }
];

// LUXURY PRODUCT CARD COMPONENT
const ProductCard = ({ product }: { product: any }) => (
  <Link 
    to="/product/$slug"
    params={{ slug: product.slug || product.id }}
    className="shrink-0 snap-start w-[140px] md:w-[240px] flex flex-col group cursor-pointer"
  >
    <div className="aspect-[4/5] w-full bg-white rounded-sm overflow-hidden relative shrink-0 mb-3 md:mb-4 border border-[#E9D8C3]">
      {product.cover_image_url ? (
        <img 
          src={product.cover_image_url} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
          <PackageX className="w-6 h-6 mb-1 opacity-50" />
        </div>
      )}
      <div className="absolute inset-0 bg-[#4A1F58]/0 group-hover:bg-[#4A1F58]/5 transition-colors duration-500" />
      <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Heart className="w-4 h-4 md:w-5 md:h-5 text-zinc-400 hover:text-[#C9A15B]" />
      </div>
    </div>
    
    <div className="flex flex-col text-center px-1">
      <span className="text-[9px] md:text-[10px] font-sans font-medium text-zinc-500 uppercase tracking-[0.15em] mb-1 md:mb-1.5">
        {product.category?.name || "Jewellery"}
      </span>
      <h4 className="text-[12px] md:text-[15px] font-serif font-medium text-[#302832] line-clamp-1 mb-1.5 md:mb-2 group-hover:text-[#4A1F58] transition-colors">
        {product.title || "Unnamed Product"}
      </h4>
      <span className="text-[13px] md:text-[16px] font-serif font-semibold text-[#4A1F58]">
        {product.mrp != null ? `₹${Number(product.mrp).toLocaleString()}` : "TBA"}
      </span>
    </div>
  </Link>
);

function Index() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [premiumProducts, setPremiumProducts] = useState<any[]>([]);
  
  // Slider States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false); 
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const navigate = useNavigate({ from: '/' });
  const [storeQuery, setStoreQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const handleStoreSearch = () => {
    if (storeQuery.trim()) {
      navigate({ to: "/stores", search: { q: storeQuery.trim() } });
    }
  };

  const handleAutoDetect = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          navigate({ to: "/stores", search: { lat: position.coords.latitude, lng: position.coords.longitude } });
        },
        () => setIsLocating(false)
      );
    } else setIsLocating(false);
  };

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const { data: allCats } = await supabase.from("ecommerce_categories").select("*").eq("is_active", true).order("sort_order", { ascending: true });
        setCategories(allCats?.filter(c => !c.parent_id) || []);

        const { data: allProducts } = await supabase.from("ecommerce_products").select("*, category:ecommerce_categories(name)").eq("is_live", true);
        
        if (allProducts) {
          setPremiumProducts(allProducts.filter(p => p.is_bestseller).slice(0, 15));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (isPaused) return; 
    const startTimer = () => {
      timerRef.current = setTimeout(() => {
        setCurrentSlide((prev) => (prev === HERO_BANNERS.length - 1 ? 0 : prev + 1));
      }, HERO_BANNERS[currentSlide]?.duration_ms || 5000);
    };
    startTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentSlide, isPaused]); 

  // Story Navigation
  const storyScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = storyScrollRef.current;
    if (container && window.innerWidth < 768) {
      setTimeout(() => {
        const thirdItem = container.children[2] as HTMLElement;
        if (thirdItem) {
          const scrollPos = thirdItem.offsetLeft - (container.clientWidth / 2) + (thirdItem.clientWidth / 2);
          container.scrollTo({ left: scrollPos, behavior: 'smooth' });
        }
      }, 200);
    }
  }, []);

  const scrollStories = (direction: 'left' | 'right') => {
    if (storyScrollRef.current) {
      const { current } = storyScrollRef;
      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.75 : 320;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF9F5] font-sans text-[#302832] pb-0 relative overflow-hidden">
      
      {/* CSS Ticker & Global Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 20s linear infinite; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}} />

      {/* 1. HERO SLIDER BANNER */}
      <section className="relative w-full overflow-hidden bg-white">
        <div 
         
          className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[7/2] overflow-hidden group bg-[#E9D8C3]"
          onMouseEnter={() => setIsPaused(true)} 
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex w-full h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {HERO_BANNERS.map((banner) => (
              <Link 
                key={banner.id} 
                to={banner.link}
                className="w-full h-full shrink-0 relative block"
              >
                <img 
                  src={banner.desktop_image} 
                  alt="Hero Banner Desktop" 
                  className="hidden md:block w-full h-full object-cover object-center" 
                />
                <img 
                  src={banner.mobile_image} 
                  alt="Hero Banner Mobile" 
                  className="block md:hidden w-full h-full object-cover object-center" 
                />
              </Link>
            ))}
          </div>

          <div className="absolute bottom-4 md:bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
            {HERO_BANNERS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 md:w-12 bg-white' : 'w-2 md:w-3 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </div>
      </section>
{/* 2. CATEGORY BENTO GRID */}
      {/* ✨ FIXED: Reduced mobile top padding (pt-8) and inner gap (gap-6) for a tighter layout below the hero */}
      <section className="relative w-full pt-8 pb-16 md:pt-24 md:pb-24 z-20 overflow-hidden bg-[#FCF9F5]">
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none mix-blend-multiply"
        />

        {/* ✨ FIXED: Reduced mobile gap from gap-8 to gap-6 */}
        <div className="max-w-[1150px] mx-auto relative z-10 flex flex-col gap-6 md:gap-10 px-4 md:px-8">
          <div className="text-center">
            <h2 className="text-[28px] sm:text-3xl md:text-4xl lg:text-5xl font-serif text-[#302832] leading-tight mb-1 md:mb-2">
              Shop By <span className="text-[#C9A15B] italic font-light">Categories</span>
            </h2>
            <p className="text-[11px] md:text-sm font-sans text-zinc-500 tracking-wide uppercase font-medium">
              Find your perfect sparkle across every category
            </p>
          </div>
          
          <div className="w-full">
            {isLoading ? (
              <div className="flex w-full justify-center opacity-50 py-10"><Loader2 className="animate-spin text-[#C9A15B] w-8 h-8"/></div>
            ) : categories.length === 0 ? (
              <div className="text-center py-10 text-sm text-zinc-400">No categories found.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-in fade-in duration-500">
                {categories.map((cat, idx) => {
                  const patternIdx = idx % 5;
                  let layoutClass = "";
                  
                  if (patternIdx === 0 || patternIdx === 1) {
                    layoutClass = "col-span-1 aspect-square md:col-span-2 md:aspect-[2/1]";
                  } else if (patternIdx === 2) {
                    layoutClass = "col-span-2 aspect-[2/1] md:col-span-1 md:aspect-square";
                  } else if (patternIdx === 3) {
                    layoutClass = "col-span-1 aspect-square md:col-span-1 md:aspect-square";
                  } else if (patternIdx === 4) {
                    layoutClass = "col-span-1 aspect-square md:col-span-2 md:aspect-[2/1]";
                  }

                  return (
                    <Link 
                      key={cat.id} 
                      to="/category/$slug" 
                      params={{ slug: cat.slug }} 
                      className={`group relative rounded-sm overflow-hidden bg-[#F7F1E8] shadow-sm hover:shadow-md transition-shadow ${layoutClass}`}
                    >
                      {cat.image_url ? (
                        <img 
                          src={cat.image_url} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none" 
                          alt={cat.name} 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#C9A15B]/50 bg-[#302832]">
                          <Diamond className="w-8 h-8 mb-2 opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-tr from-black/70 via-black/10 to-transparent pointer-events-none opacity-80" />
                      <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 flex flex-col justify-end z-10 pointer-events-none">
                        <h3 className="text-white font-serif font-medium text-lg md:text-2xl tracking-wide drop-shadow-md leading-none mb-1 md:mb-1.5">
                          {cat.name}
                        </h3>
                        <span className="text-[8px] md:text-[10px] font-sans font-bold text-white/90 uppercase tracking-[0.2em] group-hover:text-[#C9A15B] transition-colors drop-shadow-sm flex items-center gap-1">
                          Explore <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
      {/* 3. USPs + BRAND PROMISE BANNER */}
      {/* ✨ SEAMLESS FIX: Already full width, no margins needed */}
      <section className="w-full bg-[#4A1F58] text-white flex flex-col md:flex-row items-center overflow-hidden">
        <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center">
          <h2 className="text-3xl md:text-5xl font-serif font-medium mb-6">Timeless Diamonds.<br/>Made for Every Day.</h2>
          <p className="text-sm md:text-base font-sans text-[#E7D5E8] mb-8 max-w-md leading-relaxed">
            Crafted with care, made for you. Discover our commitment to purity and excellence.
          </p>
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#C9A15B] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#C9A15B]" />
              </div>
              <span className="text-xs font-sans font-medium text-[#F7F1E8] uppercase tracking-widest">100% Certified<br/>Diamonds</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#C9A15B] flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 text-[#C9A15B]" />
              </div>
              <span className="text-xs font-sans font-medium text-[#F7F1E8] uppercase tracking-widest">Lifetime<br/>Exchange</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#C9A15B] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#C9A15B]" />
              </div>
              <span className="text-xs font-sans font-medium text-[#F7F1E8] uppercase tracking-widest">Secure & Trusted<br/>Shipping</span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 h-[300px] md:h-full min-h-[400px] bg-[#C9A5D0]">
          <img src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/section2.webp" alt="Model" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* 5. BESTSELLERS */}
      {/* ✨ FIXED: Reduced bottom padding (pb-8 md:pb-10) so it flows into the next section */}
      <section className="relative w-full pt-16 pb-8 md:pt-24 md:pb-10 overflow-hidden bg-[#FCF9F5]">
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none mix-blend-multiply z-0"
        />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4 border-b border-[#E9D8C3] pb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58]">Our Bestsellers</h2>
              <p className="text-xs md:text-sm text-zinc-500 mt-2 font-sans tracking-wide">The most loved designs by our community.</p>
            </div>
            <Link to="/category/$slug" params={{ slug: "bestsellers" }} 
              className="text-[11px] md:text-xs font-sans font-bold text-[#4A1F58] uppercase tracking-widest hover:text-[#C9A15B] transition-colors flex items-center gap-2"
            >
              Explore All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar gap-4 md:gap-8 pb-4 items-stretch w-full">
            {isLoading ? (
              <div className="flex gap-4 w-full opacity-50"><Loader2 className="animate-spin text-[#C9A15B] mx-auto"/></div>
            ) : premiumProducts.length > 0 ? (
              premiumProducts.map(product => <ProductCard key={`bs-${product.id}`} product={product} />)
            ) : (
              <div className="w-full py-8 text-center font-sans text-zinc-400 text-sm">No products found.</div>
            )}
          </div>
        </div>
      </section>

      {/* 6. SHOP BY PRICE */}
      {/* ✨ FIXED: Reduced top padding (pt-8 md:pt-10) to eliminate the massive double-gap */}
      <section className="relative w-full pt-8 pb-16 md:pt-10 md:pb-24 overflow-hidden bg-[#FCF9F5]">
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.05] pointer-events-none mix-blend-multiply z-0"
        />
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58]">Shop By Price</h2>
            <p className="text-xs font-sans text-zinc-500 mt-2 tracking-wide">Explore our diverse selections. Find your style.</p>
          </div>
          
          <div className="flex flex-col gap-3 md:gap-6">
            {PRICE_COLLECTIONS[0] && (
              <Link to={PRICE_COLLECTIONS[0].link} className="group relative rounded-sm overflow-hidden aspect-[2/1] md:aspect-[4/1] bg-[#E9D8C3] shadow-sm">
                <img src={PRICE_COLLECTIONS[0].image} alt={PRICE_COLLECTIONS[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-4 md:p-8 z-10 text-left w-full">
                  <p className="text-[8px] md:text-xs font-sans font-bold text-[#E9D8C3] uppercase tracking-[0.15em] mb-0.5 md:mb-1">
                    {PRICE_COLLECTIONS[0].subtitle}
                  </p>
                  <h3 className="text-lg md:text-3xl font-serif font-medium text-white tracking-wide">
                    {PRICE_COLLECTIONS[0].title}
                  </h3>
                </div>
              </Link>
            )}

            <div className="grid grid-cols-2 gap-3 md:gap-6">
              {[PRICE_COLLECTIONS[1], PRICE_COLLECTIONS[2]].map((item, idx) => item && (
                <Link key={idx} to={item.link} className="group relative rounded-sm overflow-hidden aspect-[4/5] md:aspect-[2/1] bg-[#E9D8C3] shadow-sm">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 p-3 md:p-8 z-10 text-left w-full">
                    <p className="text-[7px] md:text-[10px] font-sans font-bold text-[#E9D8C3] uppercase tracking-[0.15em] mb-0.5 md:mb-1 line-clamp-1">
                      {item.subtitle}
                    </p>
                    <h3 className="text-sm md:text-2xl font-serif font-medium text-white tracking-wide leading-tight">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
            
            {PRICE_COLLECTIONS[3] && (
              <Link to={PRICE_COLLECTIONS[3].link} className="group relative rounded-sm overflow-hidden aspect-[2/1] md:aspect-[4/1] bg-[#E9D8C3] shadow-sm">
                <img src={PRICE_COLLECTIONS[3].image} alt={PRICE_COLLECTIONS[3].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-4 md:p-8 z-10 text-left w-full">
                  <p className="text-[8px] md:text-xs font-sans font-bold text-[#E9D8C3] uppercase tracking-[0.15em] mb-0.5 md:mb-1">
                    {PRICE_COLLECTIONS[3].subtitle}
                  </p>
                  <h3 className="text-lg md:text-3xl font-serif font-medium text-white tracking-wide">
                    {PRICE_COLLECTIONS[3].title}
                  </h3>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ✨ NEW: PAVITRAM HARVESTING PLAN */}
      {/* ✨ SEAMLESS FIX: Full width, acts as a natural visual break */}
      <section className="relative w-full py-16 md:py-24 overflow-hidden group">
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/social4.webp" 
          alt="Pavitram Harvesting Plan" 
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-[#4A1F58]/90 pointer-events-none" />
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none mix-blend-overlay z-0"
        />

        <div className="relative z-10 max-w-[900px] mx-auto px-4 md:px-8 text-center flex flex-col items-center">
          <div className="flex items-center gap-3 mb-5 md:mb-6">
            <div className="h-[1px] w-8 md:w-12 bg-[#C9A15B]/50" />
            <p className="text-[10px] md:text-xs font-sans font-bold text-[#C9A15B] uppercase tracking-[0.25em] drop-shadow-sm">
              Invest | Celebrate | Earn
            </p>
            <div className="h-[1px] w-8 md:w-12 bg-[#C9A15B]/50" />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-medium text-white mb-4 md:mb-6 leading-tight drop-shadow-md">
            The Pavitram Harvesting Plan
          </h2>
          <p className="text-sm md:text-base font-sans text-[#E9D8C3] mb-8 md:mb-10 max-w-2xl leading-relaxed drop-shadow-sm px-2">
            A systematic gold and diamond savings scheme designed to help you seamlessly plan and save for your next timeless jewelry purchase.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center bg-transparent border border-[#C9A15B] text-[#C9A15B] hover:bg-[#C9A15B] hover:text-white px-8 md:px-10 py-3.5 md:py-4 text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all duration-300 rounded-sm shadow-sm"
          >
            Explore The Plan <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>

      {/* 7. THE ART OF GIFTING */}
      {/* ✨ SEAMLESS FIX: Continued background, consistent padding */}
      <section className="relative w-full py-16 md:py-24 overflow-hidden bg-[#FCF9F5]">
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.05] pointer-events-none mix-blend-multiply z-0"
        />
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58]">Shop By Occasions</h2>
            <p className="text-xs font-sans text-zinc-500 mt-3 tracking-widest uppercase font-medium">Explore our collections. Curated for you.</p>
            <div className="w-12 h-0.5 bg-[#C9A15B] mx-auto mt-6" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <Link 
              to="/Search" 
              search={{ collection: 'gifts-for-her' }} 
              className="group relative overflow-hidden bg-[#302832] rounded-sm aspect-[4/3] md:aspect-[16/9] shadow-md"
            >
               <img src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/gifting1.webp" alt="Gifts for Her" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-700" />
               <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />
               <div className="absolute inset-y-0 left-0 p-8 md:p-12 flex flex-col justify-center w-3/4">
                 <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-3 drop-shadow-md">The Art of Gifting</h2>
                 <p className="text-[10px] md:text-xs font-sans text-[#E9D8C3] font-bold uppercase tracking-widest mb-6 drop-shadow-sm">For Her</p>
                 <span className="inline-flex items-center text-xs font-sans font-bold text-white uppercase tracking-widest group-hover:text-[#C9A15B] transition-colors">
                   Shop Gifts <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                 </span>
               </div>
            </Link>

            <Link 
              to="/Search" 
              search={{ collection: 'anniversary' }} 
              className="group relative overflow-hidden bg-[#302832] rounded-sm aspect-[4/3] md:aspect-[16/9] shadow-md"
            >
               <img src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/gifting2.webp" alt="Anniversary Specials" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
               <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full text-center">
                 <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-3 drop-shadow-md">Milestone Moments</h2>
                 <span className="inline-flex items-center text-xs font-sans font-bold text-white uppercase tracking-widest group-hover:text-[#C9A15B] transition-colors">
                   Explore Anniversary <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                 </span>
               </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. THE PAVITRAM PROMISES */}
      {/* ✨ SEAMLESS FIX: Changed to transparent background to blend directly with the floral page wrapper */}
      <section className="relative w-full py-16 md:py-24 overflow-hidden bg-transparent">
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.05] pointer-events-none mix-blend-multiply"
        />

        <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-8 md:mb-20">
            <h2 className="text-3xl md:text-[42px] font-serif text-[#302832] leading-tight">
              The Pavitram <span className="text-[#C9A15B] italic font-light">Promises</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-10 lg:gap-16 bg-white md:bg-transparent p-6 md:p-0 rounded-2xl md:rounded-sm shadow-sm md:shadow-none border border-[#E9D8C3]/60 md:border-0 divide-y divide-[#E9D8C3]/50 md:divide-y-0 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 md:gap-6 group pb-6 md:pb-0 pt-2 md:pt-0">
              <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-full bg-[#FDFCFB] md:bg-white border border-[#C9A15B]/30 flex items-center justify-center group-hover:border-[#C9A15B] group-hover:shadow-sm transition-all">
                <Award className="w-6 h-6 md:w-7 md:h-7 text-[#C9A15B] stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-serif font-medium text-[#4A1F58] mb-1.5 md:mb-2">Trusted & Certified Jewellery</h3>
                <p className="text-[11px] md:text-[13px] font-sans text-zinc-600 leading-relaxed">
                  Crafted with the trust and reliability of the Ossam Jewels legacy, we use 100% BIS Hallmark gold and certified natural diamonds for all our products.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 md:gap-6 group py-6 md:py-0">
              <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-full bg-[#FDFCFB] md:bg-white border border-[#C9A15B]/30 flex items-center justify-center group-hover:border-[#C9A15B] group-hover:shadow-sm transition-all">
                <RefreshCw className="w-6 h-6 md:w-7 md:h-7 text-[#C9A15B] stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-serif font-medium text-[#4A1F58] mb-1.5 md:mb-2">Hassle-free Exchanges</h3>
                <p className="text-[11px] md:text-[13px] font-sans text-zinc-600 leading-relaxed">
                  Enjoy absolute peace of mind with our transparent 15-day return policy, and a guaranteed lifetime exchange & depreciated buyback program.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 md:gap-6 group pt-6 md:pt-0 pb-2 md:pb-0">
              <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-full bg-[#FDFCFB] md:bg-white border border-[#C9A15B]/30 flex items-center justify-center group-hover:border-[#C9A15B] group-hover:shadow-sm transition-all">
                <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-[#C9A15B] stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-serif font-medium text-[#4A1F58] mb-1.5 md:mb-2">Fully Insured Shipping</h3>
                <p className="text-[11px] md:text-[13px] font-sans text-zinc-600 leading-relaxed">
                  Your investment is secure. Every piece is dispatched in tamper-proof packaging and is 100% insured until the moment it is safely handed to you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. THE PAVITRAM EXPERIENCE */}
      {/* ✨ FIXED: Reduced mobile top padding (pt-8 pb-12) to pull it closer to the section above */}
      <section className="relative w-full pt-8 pb-12 md:py-24 overflow-hidden bg-transparent">
        <div className="max-w-[1400px] mx-auto px-0 md:px-8 relative z-10">
          <div className="flex flex-col items-center text-center mb-10 md:mb-16 px-4">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58] mb-3 uppercase tracking-wide">
              The Pavitram Experience
            </h2>
            <p className="text-[10px] md:text-xs font-sans font-bold text-[#C9A15B] uppercase tracking-[0.2em] mb-6">
              Adorned By You, Shared With Pride
            </p>
            <div className="w-12 h-0.5 bg-[#C9A15B]" />
          </div>

          <div className="relative group max-w-[1200px] mx-auto">
            <button 
              onClick={() => scrollStories('left')}
              className="hidden md:flex absolute -left-6 lg:-left-12 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border border-[#E9D8C3] rounded-full items-center justify-center text-[#4A1F58] hover:text-white hover:bg-[#4A1F58] hover:border-[#4A1F58] shadow-sm z-10 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => scrollStories('right')}
              className="hidden md:flex absolute -right-6 lg:-right-12 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border border-[#E9D8C3] rounded-full items-center justify-center text-[#4A1F58] hover:text-white hover:bg-[#4A1F58] hover:border-[#4A1F58] shadow-sm z-10 transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" strokeWidth={1.5} />
            </button>

            <div 
              ref={storyScrollRef}
              className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-6 px-[12.5vw] md:px-0"
            >
              {[
                { videoId: "3g3Gm6G0MDM" },
                { videoId: "kIr8aS7P6Ow" },
                { videoId: "A8kWks6Vj08" },
                { videoId: "ZaDO_B-DenY" },
                { videoId: "uJXARohAjIY" },
              ].map((story, index) => (
                <div 
                  key={index} 
                  className="shrink-0 w-[75vw] md:w-[320px] aspect-[9/16] relative snap-center rounded-sm overflow-hidden bg-[#302832] shadow-md border border-[#E9D8C3]/20"
                >
                  <iframe
                    className="absolute inset-0 w-full h-[105%] -top-[2.5%] pointer-events-none" 
                    src={`https://www.youtube.com/embed/${story.videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${story.videoId}&playsinline=1&rel=0&modestbranding=1`}
                    title={`Pavitram Experience ${index + 1}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col items-center text-center pointer-events-none">
                    <h4 className="font-serif text-white text-lg tracking-[0.15em] drop-shadow-md">PAVITRAM</h4>
                    <p className="text-[10px] md:text-[11px] font-sans text-white font-bold px-4 py-1">
                      Diamond Jewellery
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 flex justify-center md:hidden items-center gap-6">
            <button 
              onClick={() => scrollStories('left')}
              className="w-10 h-10 bg-white border border-[#E9D8C3] rounded-full flex items-center justify-center text-[#4A1F58] hover:bg-[#F7F1E8] shadow-sm transition-colors"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => scrollStories('right')}
              className="w-10 h-10 bg-white border border-[#E9D8C3] rounded-full flex items-center justify-center text-[#4A1F58] hover:bg-[#F7F1E8] shadow-sm transition-colors"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>

      {/* 10. NEWSLETTER CAPTURE */}
      {/* ✨ FIXED: Restored the #F7F1E8 background to differentiate the section, and reduced mobile top padding */}
      <section className="relative w-full pt-12 pb-16 md:py-24 overflow-hidden bg-[#F7F1E8] border-t border-[#E9D8C3]/50">
        
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.15] pointer-events-none mix-blend-multiply z-0"
        />

        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center flex flex-col items-center">
          <h2 className="text-3xl md:text-[42px] font-serif text-[#4A1F58] mb-4 tracking-wide leading-tight">
            Join the Inner Circle
          </h2>
          <p className="text-sm md:text-base font-sans text-zinc-600 mb-8 md:mb-12 max-w-lg leading-relaxed">
            Unlock exclusive early access to our newest collections, private sales, and insider jewelry styling tips.
          </p>
          
          <div className="flex w-full max-w-md mx-auto items-stretch h-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] group mb-10 md:mb-12">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 px-5 font-sans text-sm outline-none border border-r-0 border-[#E9D8C3] focus:border-[#C9A15B] bg-white text-[#302832] placeholder:text-zinc-400 transition-colors"
            />
            <button className="px-8 md:px-10 bg-[#4A1F58] hover:bg-[#302832] text-white font-sans text-[11px] font-bold uppercase tracking-widest transition-colors flex-shrink-0">
              Subscribe
            </button>
          </div>
          
          <div className="pt-8 border-t border-[#E9D8C3]/60 w-full max-w-xs mx-auto flex flex-col items-center justify-center gap-5">
             <div>
                <h3 className="text-sm font-serif font-medium text-[#4A1F58] mb-1">Prefer to chat?</h3>
                <p className="text-[10px] font-sans text-zinc-500 uppercase tracking-widest">Connect with our stylists</p>
             </div>
             <a 
               href="https://wa.me/918356834764?text=Hi!%20I%20want%20to%20know%20more%20about%20Pavitram%20Jewelry."
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 w-full py-3 border border-[#4A1F58] text-[#4A1F58] hover:bg-[#4A1F58] hover:text-white font-sans text-[10px] font-bold uppercase tracking-[0.15em] transition-colors rounded-sm bg-white md:bg-transparent"
             >
               <MessageCircle className="w-4 h-4" />
               WhatsApp Us
             </a>
          </div>
        </div>
      </section>

      {/* 11. ELEGANT STORE LOCATOR */}
      {/* ✨ SEAMLESS FIX: No top margin, sits perfectly at the bottom before footer */}
      <section className="relative w-full py-16 md:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/store-front.webp"
            alt="Pavitram Boutique" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="relative z-10 max-w-[1100px] mx-auto px-4 md:px-8">
          <div className="bg-white/85 backdrop-blur-xl border border-white/50 rounded-sm p-6 md:p-16 lg:p-20 text-center shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
            <h2 className="text-3xl md:text-[42px] font-serif font-medium text-[#4A1F58] mb-3 md:mb-6 leading-tight">
              Experience Pavitram <span className="text-[#C9A15B] italic font-light">In-Person</span>
            </h2>
            <p className="text-sm md:text-base font-sans text-zinc-600 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-2 md:px-0">
              Try it on before you buy. With premium boutiques across the city, experiencing our brilliance is effortless. Enter your pincode to find a store near you.
            </p>

            <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-stretch gap-4 md:gap-0">
              <div className="flex-1 flex items-center bg-white border border-[#E9D8C3] focus-within:border-[#C9A15B] transition-colors h-14 rounded-sm md:rounded-r-none md:border-r-0 shadow-sm overflow-hidden group">
                <div className="pl-4 pr-3 text-zinc-400 group-focus-within:text-[#C9A15B] transition-colors flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={storeQuery}
                  onChange={(e) => setStoreQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStoreSearch()}
                  placeholder="Pin code / City / State" 
                  className="flex-1 h-full py-2 font-sans text-sm outline-none bg-transparent placeholder:text-zinc-400 text-[#302832] w-full"
                />
                <button 
                  onClick={handleStoreSearch} 
                  title="Search Manually"
                  className="h-full px-4 border-l border-[#E9D8C3] text-[#C9A15B] bg-zinc-50/50 hover:bg-[#F7F1E8] hover:text-[#4A1F58] transition-colors flex items-center justify-center shrink-0"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <button 
                onClick={handleAutoDetect} 
                disabled={isLocating}
                className="w-full md:w-auto h-14 px-8 md:px-10 bg-[#4A1F58] hover:bg-[#302832] disabled:opacity-80 disabled:cursor-not-allowed text-white font-sans text-xs font-bold uppercase tracking-widest transition-colors shrink-0 rounded-sm md:rounded-l-none shadow-sm flex items-center justify-center gap-2"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Locating...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" /> Locate Store
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section> 
      
      {/* 12. CSS TICKER */}
      <div className="w-full overflow-hidden whitespace-nowrap py-2.5 border-t border-[#E9D8C3] bg-white flex items-center">
        <div className="inline-block animate-marquee flex-nowrap flex items-center">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="text-[10px] md:text-xs font-sans font-bold text-[#4A1F58] uppercase tracking-[0.2em] mx-6">
              PAVITRAM DIAMOND JEWELLERY • A OSSAM JEWELS COMPANY •
            </span>
          ))}
        </div>
      </div>
  
      <FloatingHelp />

    </div>
  );
}