import React, { useEffect, useState, useRef } from "react";
import { createFileRoute, Link, useNavigate} from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";

import { 
  ArrowRight, ShieldCheck, RefreshCw, 
  MapPin, MessageCircle, Navigation, Loader2, PackageX,
  Diamond, Heart, CheckCircle2,
  ChevronRight, ChevronLeft, Star,
  Gift, Calendar, Gem, Infinity, Shield
} from "lucide-react";
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
    link: "/category/bestsellers",
    duration_ms: 5000,
  },
  {
    id: 2,
    desktop_image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/4.webp", 
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

const OCCASION_COLLECTIONS = [
  { title: "For Her", link: "gifts-for-her", image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/gifting1.webp" },
  { title: "Anniversary", link: "anniversary", image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/gifting2.webp" },
  { title: "Wedding", link: "wedding", image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/section2.webp" },
  { title: "Birthday", link: "birthday", image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/h1.webp" },
  { title: "Festive", link: "festive", image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/social4.webp" },
  { title: "Everyday", link: "everyday", image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/h3.webp" }
];

const GOOGLE_REVIEWS = [
  { id: 1, name: "Priya Sharma", time: "2 weeks ago", rating: 5, text: "Absolutely stunning collection! The craftsmanship of their diamond sets is unmatched in the city. The staff was incredibly patient and helped me find exactly what I needed." },
  { id: 2, name: "Rahul Deshmukh", time: "1 month ago", rating: 5, text: "Bought my wife's anniversary ring here. The transparency in pricing and the IGI diamond certification gave me complete peace of mind. Highly recommended." },
  { id: 3, name: "Anjali Gupta", time: "2 months ago", rating: 5, text: "Their custom design service is brilliant. They brought my design board to life perfectly, and the final finish is true luxury." },
  { id: 4, name: "Vikram Singh", time: "3 months ago", rating: 5, text: "The Pavitram Harvesting Plan helped us save for our daughter's wedding jewellery seamlessly. The entire team is very professional." },
];

const PROMISES = [
  { id: 1, icon: Gem, title: "Certified Diamonds", text: "Every diamond comes with trusted certification." },
  { id: 2, icon: Heart, title: "Lifetime Support", text: "We're here even after your purchase." },
  { id: 3, icon: RefreshCw, title: "Easy Exchange", text: "Shop confidently with transparent policies." },
  { id: 4, icon: Diamond, title: "Crafted With Care", text: "Designed and finished by skilled artisans." }
];

const BG_PATTERN = "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/bg_pattern2.webp";

// LUXURY PRODUCT CARD COMPONENT
const ProductCard = ({ product }: { product: any }) => (
  <Link 
    to="/product/$slug"
    params={{ slug: product.slug || product.id }}
    className="shrink-0 snap-start w-[140px] md:w-[240px] flex flex-col group cursor-pointer"
  >
    <div className="aspect-[4/5] w-full bg-[#F7F1E8] rounded-xl md:rounded-sm overflow-hidden relative shrink-0 mb-3 md:mb-4 border border-[#E9D8C3] shadow-sm group-hover:shadow-md group-hover:border-[#C9A15B] transition-all duration-300">
      {product.cover_image_url ? (
        <img 
          src={product.cover_image_url} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply" 
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-[#C9A15B]/40">
          <Diamond className="w-6 h-6 mb-1 opacity-50" />
        </div>
      )}
      <div className="absolute inset-0 bg-[#4A1F58]/0 group-hover:bg-[#4A1F58]/5 transition-colors duration-500" />
      <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Heart className="w-4 h-4 md:w-5 md:h-5 text-zinc-400 hover:text-[#4A1F58]" />
      </div>
    </div>
    
    <div className="flex flex-col text-center px-1">
      <span className="text-[9px] md:text-[10px] font-sans font-bold text-[#C9A15B] uppercase tracking-[0.15em] mb-1 md:mb-1.5">
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

export function Index() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [premiumProducts, setPremiumProducts] = useState<any[]>([]);
  
  // Slider States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false); 
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Dot Indicator States
  const [activePromiseIndex, setActivePromiseIndex] = useState(0);
  const [activeOccasionIndex, setActiveOccasionIndex] = useState(0);

  const navigate = useNavigate({ from: '/' });
  const [storeQuery, setStoreQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  // Mobile Auto-Scroll Refs
  const promiseScrollRef = useRef<HTMLDivElement>(null);
  const occasionScrollRef = useRef<HTMLDivElement>(null);
  const storyScrollRef = useRef<HTMLDivElement>(null);

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

  // Hero Banner Auto-Scroll
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

  // Multi-Carousel Auto-Scroll (Mobile Only)
  useEffect(() => {
    const autoScrollInterval = setInterval(() => {
      if (window.innerWidth < 768) {
        // Promise Auto-scroll
        if (promiseScrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = promiseScrollRef.current;
          const childWidth = promiseScrollRef.current.children[0]?.clientWidth || clientWidth * 0.85;
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            promiseScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            promiseScrollRef.current.scrollBy({ left: childWidth, behavior: 'smooth' });
          }
        }
        // Occasion Auto-scroll
        if (occasionScrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = occasionScrollRef.current;
          const childWidth = occasionScrollRef.current.children[0]?.clientWidth || clientWidth * 0.8;
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            occasionScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            occasionScrollRef.current.scrollBy({ left: childWidth, behavior: 'smooth' });
          }
        }
      }
    }, 3500);
    return () => clearInterval(autoScrollInterval);
  }, []);

  // Scroll Sync Handlers for Dots
  const handlePromiseScroll = () => {
    if (!promiseScrollRef.current) return;
    const childWidth = promiseScrollRef.current.children[0]?.clientWidth || 1;
    const index = Math.round(promiseScrollRef.current.scrollLeft / childWidth);
    setActivePromiseIndex(Math.min(index, PROMISES.length - 1));
  };

  const handleOccasionScroll = () => {
    if (!occasionScrollRef.current) return;
    const childWidth = occasionScrollRef.current.children[0]?.clientWidth || 1;
    const index = Math.round(occasionScrollRef.current.scrollLeft / childWidth);
    setActiveOccasionIndex(Math.min(index, OCCASION_COLLECTIONS.length - 1));
  };

  const scrollStories = (direction: 'left' | 'right') => {
    if (storyScrollRef.current) {
      const { current } = storyScrollRef;
      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.75 : 320;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // ✨ NEW: Scroll function specifically for Desktop Occasions
  const scrollOccasions = (direction: 'left' | 'right') => {
    if (occasionScrollRef.current) {
      const { current } = occasionScrollRef;
      // Scroll by roughly one card width + gap
      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.75 : 380;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF9F5] font-sans text-[#302832] pb-0 relative overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 25s linear infinite; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}} />

      {/* 1. HERO SLIDER BANNER */}
      <section className="relative w-full overflow-hidden bg-zinc-900">
        <div 
          className="relative w-full h-[75vh] md:h-[60vh] lg:h-[65vh] overflow-hidden group bg-[#E9D8C3]"
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
                  className="block md:hidden w-full h-full object-cover object-top" 
                />
              </Link>
            ))}
          </div>

          <div className="absolute bottom-6 md:bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
            {HERO_BANNERS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 md:h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 md:w-12 bg-white' : 'w-2 md:w-3 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 1.5 HIGHLIGHT TICKER */}
      <div className="w-full overflow-hidden bg-[#4A1F58] py-2 md:py-2.5 border-b border-[#302832] shadow-inner flex">
        <div className="animate-marquee flex items-center whitespace-nowrap w-max">
          {[...Array(12)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-[9px] md:text-[10px] font-sans font-bold text-[#E9D8C3] uppercase tracking-[0.25em] mx-4 md:mx-6 shrink-0">
                100% Lifetime Exchange
              </span>
              <Diamond className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#C9A15B] shrink-0" />
              <span className="text-[9px] md:text-[10px] font-sans font-bold text-[#E9D8C3] uppercase tracking-[0.25em] mx-4 md:mx-6 shrink-0">
                Certified Diamonds
              </span>
              <Diamond className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#C9A15B] shrink-0" />
              <span className="text-[9px] md:text-[10px] font-sans font-bold text-[#E9D8C3] uppercase tracking-[0.25em] mx-4 md:mx-6 shrink-0">
                Secure Shipping
              </span>
              <Diamond className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#C9A15B] shrink-0" />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 2. CATEGORY GRID */}
      <section className="relative w-full pt-10 pb-16 md:pt-20 md:pb-24 z-20 overflow-hidden bg-[#FCF9F5]">
        <img 
          src={BG_PATTERN} 
          alt="Decorative Pattern" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.2] pointer-events-none mix-blend-multiply z-0"
        />
        
        <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col gap-8 md:gap-14 px-4 md:px-8">
          <div className="text-center">
            <h2 className="text-[28px] sm:text-3xl md:text-4xl lg:text-5xl font-serif text-[#302832] leading-tight mb-2 md:mb-3">
              Shop by Category
            </h2>
            <p className="text-[11px] md:text-sm font-sans text-zinc-500 tracking-[0.15em] uppercase font-medium">
              Explore our most-loved jewellery collections
            </p>
          </div>
          
          <div className="w-full">
            {isLoading ? (
              <div className="columns-2 gap-3 w-full md:columns-1 md:grid md:grid-cols-4 md:auto-rows-[280px] md:gap-5 md:grid-flow-dense">
                {[...Array(6)].map((_, i) => {
                  const aspectRatios = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-square", "aspect-[2/3]"];
                  const mobileAspectClass = aspectRatios[i % aspectRatios.length];
                  let desktopGridClass = "";
                  const pattern = i % 7;
                  if (pattern === 0) desktopGridClass = "md:col-span-2 md:row-span-2";      
                  else if (pattern === 1) desktopGridClass = "md:col-span-1 md:row-span-1"; 
                  else if (pattern === 2) desktopGridClass = "md:col-span-1 md:row-span-2"; 
                  else if (pattern === 3) desktopGridClass = "md:col-span-1 md:row-span-1"; 
                  else if (pattern === 4) desktopGridClass = "md:col-span-1 md:row-span-1"; 
                  else if (pattern === 5) desktopGridClass = "md:col-span-2 md:row-span-1"; 
                  else if (pattern === 6) desktopGridClass = "md:col-span-1 md:row-span-1"; 

                  return (
                    <div key={i} className={`animate-pulse bg-[#E9D8C3]/50 rounded-xl md:rounded-sm block w-full mb-3 break-inside-avoid ${mobileAspectClass} md:mb-0 md:aspect-auto md:h-full ${desktopGridClass}`} />
                  );
                })}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-10 text-sm text-zinc-400">No categories found.</div>
            ) : (
              <div className="columns-2 gap-3 w-full md:columns-1 md:grid md:grid-cols-4 md:auto-rows-[280px] md:gap-5 md:grid-flow-dense">
                {categories.map((cat, idx) => {
                  const aspectRatios = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-square", "aspect-[2/3]"];
                  const mobileAspectClass = aspectRatios[idx % aspectRatios.length];

                  let desktopGridClass = "";
                  const pattern = idx % 7;
                  if (pattern === 0) desktopGridClass = "md:col-span-2 md:row-span-2";      
                  else if (pattern === 1) desktopGridClass = "md:col-span-1 md:row-span-1"; 
                  else if (pattern === 2) desktopGridClass = "md:col-span-1 md:row-span-2"; 
                  else if (pattern === 3) desktopGridClass = "md:col-span-1 md:row-span-1"; 
                  else if (pattern === 4) desktopGridClass = "md:col-span-1 md:row-span-1"; 
                  else if (pattern === 5) desktopGridClass = "md:col-span-2 md:row-span-1"; 
                  else if (pattern === 6) desktopGridClass = "md:col-span-1 md:row-span-1"; 

                  return (
                    <Link 
                      key={cat.id} 
                      to="/category/$slug" 
                      params={{ slug: cat.slug }} 
                      className={`group relative rounded-xl md:rounded-sm overflow-hidden bg-[#302832] shadow-sm hover:shadow-xl transition-all duration-500 block w-full mb-3 break-inside-avoid ${mobileAspectClass} md:mb-0 md:aspect-auto md:h-full ${desktopGridClass}`}
                    >
                      {cat.image_url ? (
                        <img 
                          src={cat.image_url} 
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.05] transition-all duration-1000 ease-out pointer-events-none" 
                          alt={cat.name} 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#C9A15B]/50 bg-[#302832]">
                          <Diamond className="w-8 h-8 mb-2 opacity-50" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                      
                      <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 flex flex-col items-center justify-end z-10 pointer-events-none text-center">
                        <div className="flex flex-col items-center transform transition-transform duration-500 ease-out group-hover:-translate-y-1">
                          <h3 className="text-white font-serif font-medium text-lg md:text-3xl tracking-wide drop-shadow-lg leading-tight">
                            {cat.name}
                          </h3>
                          <div className="hidden md:block w-0 h-[2px] bg-[#C9A15B] mt-2 group-hover:w-12 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. BESTSELLERS */}
      <section className="relative w-full pt-10 pb-12 md:pt-16 md:pb-16 overflow-hidden bg-white">
        <img 
          src={BG_PATTERN} 
          alt="Decorative Pattern" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.2] pointer-events-none mix-blend-multiply z-0"
        />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4 border-b border-[#E9D8C3]/60 pb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58]">Our Bestsellers</h2>
              <div className="w-16 h-[2px] bg-[#C9A15B] mt-3" />
              <p className="text-xs md:text-sm text-zinc-500 mt-3 font-sans tracking-wide">The most loved designs by our community.</p>
            </div>
            
            <Link to="/category/$slug" params={{ slug: "bestsellers" }} 
              className="text-[11px] md:text-xs font-sans font-bold text-[#4A1F58] uppercase tracking-widest hover:text-[#C9A15B] transition-colors flex items-center gap-2"
            >
              Explore All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar gap-4 md:gap-8 pb-4 items-stretch w-full">
            {isLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <div key={`skel-${i}`} className="shrink-0 snap-start w-[140px] md:w-[240px] flex flex-col">
                    <div className="aspect-[4/5] w-full bg-[#E9D8C3]/40 animate-pulse rounded-xl md:rounded-sm mb-3 md:mb-4 border border-[#E9D8C3]/30" />
                    <div className="h-2.5 md:h-3 bg-[#E9D8C3]/40 animate-pulse rounded w-1/3 mx-auto mb-2" />
                    <div className="h-4 md:h-5 bg-[#E9D8C3]/40 animate-pulse rounded w-3/4 mx-auto mb-2" />
                    <div className="h-4 md:h-5 bg-[#E9D8C3]/40 animate-pulse rounded w-1/2 mx-auto" />
                  </div>
                ))}
              </>
            ) : premiumProducts.length > 0 ? (
              premiumProducts.map(product => <ProductCard key={`bs-${product.id}`} product={product} />)
            ) : (
              <div className="w-full py-8 text-center font-sans text-zinc-400 text-sm">No products found.</div>
            )}
          </div>
        </div>
      </section>

      {/* 4. WHY PAVITRAM */}
      <section className="relative w-full bg-[#FCF9F5] py-10 md:py-16 overflow-hidden border-b border-[#E9D8C3]/50">
        <img 
          src={BG_PATTERN} 
          alt="Decorative Pattern" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.2] pointer-events-none mix-blend-multiply z-0"
        />

        <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-16">
            
            <div className="w-full lg:w-5/12 relative group px-2 md:px-0">
              <div className="absolute inset-0 translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4 border border-[#C9A15B]/40 rounded-sm z-0 transition-transform duration-500 group-hover:translate-x-4 group-hover:translate-y-4" />
              <div className="relative z-10 aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-sm shadow-lg">
                <img 
                  src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/section2.webp" 
                  alt="Why Pavitram" 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out" 
                />
              </div>
            </div>

            <div className="w-full lg:w-7/12 flex flex-col justify-center mt-4 lg:mt-0 overflow-hidden">
              
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <h3 className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-[0.25em] text-[#C9A15B]">
                  Why Pavitram
                </h3>
                <div className="h-[1px] w-12 md:w-24 bg-[#C9A15B]/50" />
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-[#4A1F58] mb-4 md:mb-8 leading-tight">
                Timeless Diamonds.<br />
                <span className="italic font-light text-[#C9A15B]">Made for Every Day.</span>
              </h2>

              <div className="relative w-full">
                <div 
                  ref={promiseScrollRef}
                  onScroll={handlePromiseScroll}
                  className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 md:gap-0 md:flex-col md:border-t border-[#E9D8C3]/60 py-2 md:py-0 w-full"
                >
                  {PROMISES.map((promise) => (
                    <div key={promise.id} className="shrink-0 w-[85%] sm:w-[60%] md:w-full snap-center flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 py-4 md:py-5 md:border-b border-[#E9D8C3]/60 group bg-white md:bg-transparent p-5 md:p-0 rounded-xl md:rounded-none shadow-sm md:shadow-none">
                      
                      <div className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 shrink-0">
                        <div className="absolute inset-0 border border-[#C9A15B]/50 rotate-45 rounded-sm transition-transform duration-500 group-hover:rotate-90" />
                        <div className="absolute inset-1 border border-[#4A1F58]/10 rounded-full" />
                        <promise.icon strokeWidth={1} className="w-5 h-5 md:w-6 md:h-6 text-[#4A1F58] group-hover:text-[#C9A15B] transition-colors" />
                      </div>

                      <div>
                        <h4 className="text-sm md:text-lg font-serif font-medium text-[#4A1F58] mb-1.5 md:mb-1 tracking-wide">{promise.title}</h4>
                        <p className="text-[11px] md:text-sm font-sans text-zinc-500 leading-relaxed max-w-sm">{promise.text}</p>
                      </div>

                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center gap-1.5 mt-4 md:hidden w-full">
                  {PROMISES.map((_, i) => (
                    <div key={`prom-dot-${i}`} className={`h-1.5 rounded-full transition-all duration-300 ${i === activePromiseIndex ? 'w-5 bg-[#4A1F58]' : 'w-1.5 bg-[#E9D8C3]'}`} />
                  ))}
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. SHOP BY PRICE */}
      {/* 5. SHOP BY PRICE (STANDARDIZED TO 1400px) */}
      <section className="relative w-full pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-[#FCF9F5]">
        <img 
          src={BG_PATTERN} 
          alt="Decorative Pattern" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.2] pointer-events-none mix-blend-multiply z-0"
        />
  
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58] mb-2">Shop By Price</h2>
            <p className="text-[11px] md:text-sm font-sans text-zinc-500 tracking-[0.15em] uppercase font-medium">Explore our diverse selections</p>
          </div>
          
          <div className="flex flex-col gap-3 md:gap-6">
            {PRICE_COLLECTIONS[0] && (
          
              <Link to={PRICE_COLLECTIONS[0].link} className="group relative rounded-xl md:rounded-sm overflow-hidden aspect-[2/1] md:aspect-[4/1] lg:aspect-[5/1] bg-[#E9D8C3] shadow-sm hover:shadow-lg transition-all duration-500">
                <img src={PRICE_COLLECTIONS[0].image} alt={PRICE_COLLECTIONS[0].title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-1000 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 p-4 md:p-8 z-10 text-left w-full flex flex-col justify-end">
                  <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-1">
                    <p className="text-[8px] md:text-[11px] font-sans font-bold text-[#E9D8C3] uppercase tracking-[0.2em] mb-1 md:mb-1.5 drop-shadow-md">
                      {PRICE_COLLECTIONS[0].subtitle}
                    </p>
                    <h3 className="text-xl md:text-4xl font-serif font-medium text-white tracking-wide drop-shadow-lg leading-tight">
                      {PRICE_COLLECTIONS[0].title}
                    </h3>
                  </div>
                </div>
              </Link>
            )}

            <div className="grid grid-cols-2 gap-3 md:gap-6">
              {[PRICE_COLLECTIONS[1], PRICE_COLLECTIONS[2]].map((item, idx) => item && (
        
                <Link key={idx} to={item.link} className="group relative rounded-xl md:rounded-sm overflow-hidden aspect-[4/5] md:aspect-[2/1] lg:aspect-[5/2] bg-[#E9D8C3] shadow-sm hover:shadow-lg transition-all duration-500">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-1000 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 p-4 md:p-8 z-10 text-left w-full flex flex-col justify-end">
                    <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-1">
                      <p className="text-[7px] md:text-[11px] font-sans font-bold text-[#E9D8C3] uppercase tracking-[0.2em] mb-1 md:mb-1.5 line-clamp-1 drop-shadow-md">
                        {item.subtitle}
                      </p>
                      <h3 className="text-base md:text-3xl font-serif font-medium text-white tracking-wide leading-tight drop-shadow-lg">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {PRICE_COLLECTIONS[3] && (
              <Link to={PRICE_COLLECTIONS[3].link} className="group relative rounded-xl md:rounded-sm overflow-hidden aspect-[2/1] md:aspect-[4/1] lg:aspect-[5/1] bg-[#E9D8C3] shadow-sm hover:shadow-lg transition-all duration-500">
                <img src={PRICE_COLLECTIONS[3].image} alt={PRICE_COLLECTIONS[3].title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-1000 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 p-4 md:p-8 z-10 text-left w-full flex flex-col justify-end">
                  <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-1">
                    <p className="text-[8px] md:text-[11px] font-sans font-bold text-[#E9D8C3] uppercase tracking-[0.2em] mb-1 md:mb-1.5 drop-shadow-md">
                      {PRICE_COLLECTIONS[3].subtitle}
                    </p>
                    <h3 className="text-xl md:text-4xl font-serif font-medium text-white tracking-wide drop-shadow-lg leading-tight">
                      {PRICE_COLLECTIONS[3].title}
                    </h3>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 6. PAVITRAM HARVESTING PLAN (DYNAMIC HEIGHT FIX) */}
      <section className="relative w-full bg-[#4A1F58] overflow-hidden">
        {/* ✨ FIXED: Removed strict height clamps. The grid will naturally take the height of the right content column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 relative">
          
          {/* Image Side */}
          <div className="w-full h-[35vh] md:h-[40vh] lg:h-auto relative">
            {/* ✨ FIXED: Using lg:absolute allows the image to perfectly cover the cell without stretching the grid's intrinsic height */}
            <div className="lg:absolute lg:inset-0 w-full h-full">
              <img 
                src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/5-mobile.png" 
                alt="Pavitram Harvesting Plan" 
                className="w-full h-full object-cover object-top opacity-80" 
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#4A1F58] via-transparent to-transparent opacity-90" />
            </div>
          </div>
          
          {/* Content Side */}
          <div className="px-6 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20 xl:px-24 flex flex-col justify-center relative">
            <Diamond className="absolute top-10 right-10 w-64 h-64 text-white opacity-[0.03] pointer-events-none" />

            <h2 className="text-3xl md:text-[40px] lg:text-[46px] font-serif font-medium text-white mb-3 md:mb-4 leading-tight relative z-10">
              The Pavitram <br className="hidden md:block"/>Harvesting Plan
            </h2>
            
            <p className="text-sm md:text-base font-sans text-white/70 leading-relaxed mb-8 md:mb-10 max-w-md relative z-10">
              Save monthly. Earn more. Bring home your dream jewellery.
            </p>
            
            {/* CONDENSED: Simplified 01/02/03 steps */}
            <div className="flex flex-col gap-5 md:gap-6 mb-10 relative z-10">
               <div className="flex items-start gap-4 md:gap-5 group">
                  <div className="text-2xl md:text-4xl font-serif font-light text-[#C9A15B] opacity-50 group-hover:opacity-100 transition-opacity leading-none mt-1">
                    01
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-serif font-medium text-white tracking-wide mb-1 flex items-center gap-2">
                      Invest Monthly
                    </h4>
                    <p className="text-xs font-sans text-white/60 leading-relaxed">Save a fixed amount every month.</p>
                  </div>
               </div>
               
               <div className="flex items-start gap-4 md:gap-5 group">
                  <div className="text-2xl md:text-4xl font-serif font-light text-[#C9A15B] opacity-50 group-hover:opacity-100 transition-opacity leading-none mt-1">
                    02
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-serif font-medium text-white tracking-wide mb-1 flex items-center gap-2">
                      Earn Benefits
                    </h4>
                    <p className="text-xs font-sans text-white/60 leading-relaxed">Receive your maturity benefit.</p>
                  </div>
               </div>

               <div className="flex items-start gap-4 md:gap-5 group">
                  <div className="text-2xl md:text-4xl font-serif font-light text-[#C9A15B] opacity-50 group-hover:opacity-100 transition-opacity leading-none mt-1">
                    03
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-serif font-medium text-white tracking-wide mb-1 flex items-center gap-2">
                      Redeem Your Dream
                    </h4>
                    <p className="text-xs font-sans text-white/60 leading-relaxed">Use your savings towards jewellery.</p>
                  </div>
               </div>
            </div>
            
            <div className="relative z-10">
              <Link to="/" className="inline-flex items-center text-[#C9A15B] hover:text-white text-[11px] md:text-xs font-sans font-bold uppercase tracking-[0.2em] transition-colors group">
                Start Your Plan <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </section>
      {/* 7. SHOP BY OCCASION (WITH DESKTOP SCROLL NAV) */}
      <section className="relative w-full pt-16 md:pt-24 pb-16 md:pb-24 overflow-hidden bg-[#FCF9F5]">
        <img 
          src={BG_PATTERN} 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.2] pointer-events-none mix-blend-multiply z-0"
        />
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58]">Shop By Occasion</h2>
            <p className="text-[11px] md:text-sm font-sans text-zinc-500 mt-2 tracking-[0.15em] uppercase font-medium">Explore collections curated for you</p>
            <div className="w-12 h-[1px] bg-[#C9A15B] mx-auto mt-6" />
          </div>
          
          <div className="relative group w-full">
            {/* ✨ NEW: Desktop Scroll Navigation Buttons */}
            <button 
              onClick={() => scrollOccasions('left')}
              className="hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border border-[#E9D8C3] rounded-full items-center justify-center text-[#4A1F58] hover:text-white hover:bg-[#4A1F58] hover:border-[#4A1F58] shadow-sm z-10 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => scrollOccasions('right')}
              className="hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border border-[#E9D8C3] rounded-full items-center justify-center text-[#4A1F58] hover:text-white hover:bg-[#4A1F58] hover:border-[#4A1F58] shadow-sm z-10 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" strokeWidth={1.5} />
            </button>

            <div 
              ref={occasionScrollRef}
              onScroll={handleOccasionScroll}
              className="flex overflow-x-auto hide-scrollbar gap-4 md:gap-6 pb-2 md:pb-6 px-0 snap-x snap-mandatory items-stretch w-full"
            >
              {OCCASION_COLLECTIONS.map((occasion, idx) => (
                <Link 
                  key={idx}
                  to="/Search" 
                  search={{ collection: occasion.link }} 
                  className="shrink-0 snap-center w-[280px] md:w-[350px] group relative overflow-hidden bg-[#302832] rounded-xl md:rounded-sm aspect-[4/3] md:aspect-[5/4] shadow-md hover:shadow-xl transition-all duration-500"
                >
                   <img src={occasion.image} alt={occasion.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-1000 ease-out" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                   <div className="absolute bottom-0 left-0 p-8 w-full text-center">
                     <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-1">
                       <h2 className="text-2xl md:text-3xl font-serif font-medium text-white mb-2 md:mb-3 drop-shadow-md leading-tight">{occasion.title}</h2>
                       <span className="inline-flex items-center text-[10px] font-sans font-bold text-white uppercase tracking-widest group-hover:text-[#C9A15B] transition-colors">
                         Explore <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                       </span>
                     </div>
                   </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-center gap-1.5 mt-4 md:hidden w-full">
              {OCCASION_COLLECTIONS.map((_, i) => (
                <div key={`occ-dot-${i}`} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeOccasionIndex ? 'w-5 bg-[#C9A15B]' : 'w-1.5 bg-[#E9D8C3]'}`} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 8. ELEGANT STORE LOCATOR */}
      <section className="relative w-full py-16 md:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/store-front.webp"
            alt="Pavitram Showroom" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="relative z-10 max-w-[1100px] mx-auto px-4 md:px-8">
          <div className="bg-white/85 backdrop-blur-xl border border-white/50 rounded-xl md:rounded-sm p-6 md:p-16 lg:p-20 text-center shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
            <h2 className="text-3xl md:text-[42px] font-serif font-medium text-[#4A1F58] mb-3 md:mb-6 leading-tight">
              Experience Pavitram <span className="text-[#C9A15B] italic font-light">In-Person</span>
            </h2>
            <p className="text-sm md:text-base font-sans text-zinc-600 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-2 md:px-0">
              See it. Try it. Fall in love with it. Find your nearest Pavitram showroom and experience our diamonds in person.
            </p>

            <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-stretch gap-4 md:gap-0">
              <div className="flex-1 flex items-center bg-white border border-[#E9D8C3] focus-within:border-[#C9A15B] transition-colors h-14 rounded-xl md:rounded-r-none md:rounded-l-sm md:border-r-0 shadow-sm overflow-hidden group">
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
                className="w-full md:w-auto h-14 px-8 md:px-10 bg-[#4A1F58] hover:bg-[#302832] disabled:opacity-80 disabled:cursor-not-allowed text-white font-sans text-xs font-bold uppercase tracking-widest transition-colors shrink-0 rounded-xl md:rounded-l-none md:rounded-r-sm shadow-sm flex items-center justify-center gap-2"
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

      {/* 9. THE PAVITRAM EXPERIENCE */}
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
                  className="shrink-0 w-[75vw] md:w-[320px] aspect-[9/16] relative snap-center rounded-xl md:rounded-sm overflow-hidden bg-[#302832] shadow-md border border-[#E9D8C3]/20"
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

      {/* 10. CLIENT STORIES */}
      <section className="relative w-full py-16 md:py-24 bg-white overflow-hidden border-t border-[#E9D8C3]/30">
        <div className="max-w-[1400px] mx-auto px-0 md:px-8">
          <div className="flex flex-col items-center text-center mb-10 md:mb-14 px-4">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#F2B01E] text-[#F2B01E]" />
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#302832] mb-3">
              Client Stories
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm font-sans text-zinc-600">
               <span className="font-bold text-black">4.9/5</span> rating on 
               <svg className="w-14 h-auto ml-1" viewBox="0 0 92 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 23.3C5.2 23.3 0 18.1 0 11.6C0 5.1 5.2 0 11.5 0C14.9 0 17.5 1.3 19.4 3L17.2 5.1C15.9 3.9 14.1 3 11.5 3C7 3 3.4 6.6 3.4 11.6C3.4 16.6 7 20.3 11.5 20.3C14.6 20.3 16.3 19 17.4 18C18.3 17.1 18.9 15.8 19.1 13.9H11.5V11H22.1C22.2 11.6 22.3 13C22.3 15.5 21.6 18.5 19.5 20.7C17.5 22.8 14.9 23.3 11.5 23.3Z" fill="#4285F4"/>
                  <path d="M34.5 15.8C34.5 20.2 31 23.3 26.9 23.3C22.8 23.3 19.3 20.2 19.3 15.8C19.3 11.4 22.8 8.3 26.9 8.3C31 8.3 34.5 11.4 34.5 15.8ZM31.3 15.8C31.3 12.5 29.2 10.3 26.9 10.3C24.6 10.3 22.5 12.5 22.5 15.8C22.5 19.1 24.6 21.3 26.9 21.3C29.2 21.3 31.3 19.1 31.3 15.8Z" fill="#EA4335"/>
                  <path d="M50.3 15.8C50.3 20.2 46.8 23.3 42.7 23.3C38.6 23.3 35.1 20.2 35.1 15.8C35.1 11.4 38.6 8.3 42.7 8.3C46.8 8.3 50.3 11.4 50.3 15.8ZM47.1 15.8C47.1 12.5 45 10.3 42.7 10.3C40.4 10.3 38.3 12.5 38.3 15.8C38.3 19.1 40.4 21.3 42.7 21.3C45 21.3 47.1 19.1 47.1 15.8Z" fill="#FBBC05"/>
                  <path d="M65.4 9.1V22.2C65.4 25.4 62.3 26.7 58.6 26.7C55.2 26.7 53.1 24.4 52.3 22.6L55 21.5C55.5 22.6 56.7 23.8 58.6 23.8C61.1 23.8 62.6 22.3 62.6 19.5V18.6H62.5C61.8 19.5 60.4 20.3 58.5 20.3C54.8 20.3 51.4 17.1 51.4 12.8C51.4 8.5 54.8 5.3 58.5 5.3C60.4 5.3 61.8 6.1 62.5 7H62.6V5.9H65.4V9.1ZM62.9 12.8C62.9 9.8 61.1 7.4 58.8 7.4C56.5 7.4 54.6 9.8 54.6 12.8C54.6 15.8 56.5 18.2 58.8 18.2C61.1 18.2 62.9 15.8 62.9 12.8Z" fill="#4285F4"/>
                  <path d="M69.7 0.8H73V22.9H69.7V0.8Z" fill="#34A853"/>
                  <path d="M82.8 17.9L85.2 19.5C84.4 20.7 82.3 23.3 78.5 23.3C74 23.3 70.8 19.8 70.8 15.8C70.8 11.2 74 8.3 78 8.3C82.1 8.3 84.4 11.3 85.1 12.8L85.4 13.6L74.8 18C75.6 19.6 76.8 20.4 78.5 20.4C80.2 20.4 81.6 19.5 82.8 17.9ZM74 15.5L81.3 12.5C80.9 11.4 79.7 10.6 78.2 10.6C76.4 10.6 74 12.3 74 15.5Z" fill="#EA4335"/>
               </svg>
            </div>
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-4 md:gap-6 pb-6 px-4 md:px-0 snap-x snap-mandatory">
            {GOOGLE_REVIEWS.map((review) => (
              <div 
                key={review.id} 
                className="shrink-0 w-[280px] md:w-[350px] bg-white border border-zinc-200 rounded-xl p-6 snap-center shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F7F1E8] text-[#4A1F58] flex items-center justify-center font-serif font-bold text-lg">
                        {review.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-sans font-bold text-sm text-[#302832]">{review.name}</span>
                        <span className="font-sans text-xs text-zinc-500">{review.time}</span>
                      </div>
                    </div>
                    {/* Small Google G Icon */}
                    <svg className="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#F2B01E] text-[#F2B01E]" />
                    ))}
                  </div>
                  <p className="font-sans text-sm text-zinc-600 leading-relaxed italic">
                    "{review.text}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. NEWSLETTER CAPTURE */}
      <section className="relative w-full pt-12 pb-16 md:py-24 overflow-hidden bg-[#F7F1E8] border-t border-[#E9D8C3]/50">
        <img 
          src={BG_PATTERN} 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.15] pointer-events-none mix-blend-multiply z-0"
        />

        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center flex flex-col items-center">
          <h2 className="text-3xl md:text-[42px] font-serif text-[#4A1F58] mb-4 tracking-wide leading-tight">
            Join the Pavitram Circle
          </h2>
          <p className="text-sm md:text-base font-sans text-zinc-600 mb-8 md:mb-12 max-w-sm leading-relaxed">
            Be the first to discover new collections, exclusive offers and jewellery stories.
          </p>
          
          <div className="flex w-full max-w-md mx-auto items-stretch h-12 md:h-14 shadow-[0_4px_20px_rgba(0,0,0,0.03)] group mb-10 md:mb-12">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 px-5 font-sans text-sm outline-none border border-r-0 border-[#E9D8C3] focus:border-[#C9A15B] rounded-l-xl md:rounded-l-sm bg-white text-[#302832] placeholder:text-zinc-400 transition-colors"
            />
            <button className="px-8 md:px-10 bg-[#4A1F58] hover:bg-[#302832] text-white font-sans text-[11px] font-bold uppercase tracking-widest transition-colors flex-shrink-0 rounded-r-xl md:rounded-r-sm">
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
               className="flex items-center justify-center gap-2 w-full py-3.5 border border-[#4A1F58] text-[#4A1F58] hover:bg-[#4A1F58] hover:text-white font-sans text-[10px] font-bold uppercase tracking-[0.15em] transition-colors rounded-xl md:rounded-sm bg-white md:bg-transparent"
             >
               <MessageCircle className="w-4 h-4" />
               WhatsApp Us
             </a>
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