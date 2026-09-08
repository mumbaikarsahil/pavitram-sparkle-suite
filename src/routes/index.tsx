import React, { useEffect, useState, useRef } from "react";
import { createFileRoute, Link, useNavigate} from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";

import { 
  ArrowRight, ShieldCheck, RefreshCw, 
  MapPin, Instagram, Mail, MessageCircle, 
  Navigation, Loader2, PackageX,
  Diamond, CheckCircle2, Heart,
  Sparkles, Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/')({
  component: Index,
});

// Mock Banner Data
const HERO_BANNERS = [
  {
    id: 1,
    desktop_image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/4.webp",
    mobile_image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/4-mobile.webp", 
    link: "/category/new-arrivals",
    duration_ms: 5000,
  },
  {
    id: 2,
    desktop_image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/5.webp",
    mobile_image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/5-mobile.webp", 
    link: "/category/bestsellers",
    duration_ms: 5000,
  }
];

const CURATED_COLLECTIONS = [
  { title: "A present for the modern bride", image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/curated1.webp", link: "/category/bridal" },
  { title: "Elevate your uniform edge", image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/curated2.webp", link: "/category/workwear" },
  { title: "Drop a diamond on success sign", image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/curated3.webp", link: "/category/diamonds" },
  { title: "A Pendant for the occasion", image: "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/curated4.webp", link: "/category/pendants" },
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
  const [categoryPage, setCategoryPage] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);
  const [premiumProducts, setPremiumProducts] = useState<any[]>([]);
  
  // Slider States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false); 
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const navigate = useNavigate({ from: '/' });
  const [storeQuery, setStoreQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  // ✨ Swipe Touch Tracking References
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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

  // Pagination Logic for Categories
  const categoriesPerPage = 4;
  const totalCategoryPages = Math.ceil(categories.length / categoriesPerPage);
  const currentCategories = categories.slice(categoryPage * categoriesPerPage, (categoryPage + 1) * categoriesPerPage);

  // ✨ Swipe Handlers for the Category Grid
  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40; // minimum distance to trigger swipe

    if (distance > minSwipeDistance && categoryPage < totalCategoryPages - 1) {
      // Swiped left -> Next page
      setCategoryPage(prev => prev + 1);
    }
    if (distance < -minSwipeDistance && categoryPage > 0) {
      // Swiped right -> Previous page
      setCategoryPage(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8] font-sans text-[#302832] pb-0 relative overflow-hidden">
      
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
          className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-[21/9] lg:aspect-[7/2] overflow-hidden group bg-[#E9D8C3]"
          onMouseEnter={() => setIsPaused(true)} 
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex w-full h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {HERO_BANNERS.map((banner, index) => (
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

      {/* 2. CATEGORY 2x2 GRID (Swipeable & Dynamic) */}
      <section className="relative px-4 md:px-8 pt-8 pb-12 md:pt-16 md:pb-24 z-20 overflow-hidden bg-white/60">
        
        {/* Decorative Floral Background */}
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12] pointer-events-none mix-blend-multiply"
        />

        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-6 md:gap-12 lg:gap-20 relative z-10">
          <div className="w-full lg:w-2/5 text-center lg:text-left mt-2 md:mt-0">
            <h2 className="text-[28px] sm:text-3xl md:text-4xl lg:text-5xl font-serif text-[#302832] leading-tight mb-2 md:mb-6">
              Discover Your <br/>
              <span className="text-[#C9A15B] italic font-light">Signature Style</span>
            </h2>
            <p className="text-[11px] md:text-sm font-sans text-zinc-600 max-w-[280px] md:max-w-md mx-auto lg:mx-0 leading-relaxed px-2 md:px-0">
              From timeless essentials to bold statement pieces, explore over 32,000+ designs each intricately crafted to elevate your everyday elegance.
            </p>
          </div>
          
          <div className="w-full lg:w-3/5 flex flex-col gap-5 md:gap-6">
            {isLoading ? (
              <div className="flex w-full justify-center opacity-50 py-10"><Loader2 className="animate-spin text-[#C9A15B] w-8 h-8"/></div>
            ) : categories.length === 0 ? (
              <div className="text-center py-10 text-sm text-zinc-400">No categories found.</div>
            ) : (
              <>
                {/* ✨ SWIPE HANDLERS APPLIED HERE */}
                <div 
                  className="grid grid-cols-2 gap-3 md:gap-5 animate-in fade-in duration-500"
                  key={categoryPage} 
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {currentCategories.map((cat) => (
                     <Link key={cat.id} to="/category/$slug" params={{ slug: cat.slug }} className="group relative aspect-[4/3] sm:aspect-[3/2] rounded-sm overflow-hidden bg-[#4A1F58] shadow-sm">
                       {cat.image_url ? (
                         <img 
                           src={cat.image_url} 
                           className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none" 
                           alt={cat.name} 
                         />
                       ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center text-[#C9A15B]/50 bg-[#302832]">
                           <Diamond className="w-8 h-8 mb-2 opacity-50" />
                         </div>
                       )}

                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                       
                       <div className="absolute bottom-3 left-4 right-3 md:bottom-4 md:right-4 flex items-end justify-between z-10 pointer-events-none">
                          <h3 className="text-white font-sans font-bold text-[13px] md:text-lg tracking-wide drop-shadow-sm leading-none">
                            {cat.name}
                          </h3>
                          <div className="w-7 h-7 md:w-9 md:h-9 rounded-full border border-white/40 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-[#4A1F58] text-white transition-colors backdrop-blur-sm bg-black/20">
                             <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </div>
                       </div>
                     </Link>
                  ))}
                </div>

                {totalCategoryPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-1 md:mt-2">
                    {Array.from({ length: totalCategoryPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCategoryPage(idx)}
                        aria-label={`Go to category page ${idx + 1}`}
                        className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
                          idx === categoryPage 
                            ? 'bg-[#E15A32] scale-110' 
                            : 'border-[1.5px] border-[#E15A32] bg-transparent hover:bg-[#E15A32]/20'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* 3. USPs + BRAND PROMISE BANNER */}
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

      {/* CSS TICKER */}
      <div className="w-full overflow-hidden whitespace-nowrap py-2.5 border-y border-[#E9D8C3] bg-white flex items-center">
        <div className="inline-block animate-marquee flex-nowrap flex items-center">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="text-[10px] md:text-xs font-sans font-bold text-[#4A1F58] uppercase tracking-[0.2em] mx-6">
              PAVITRAM DIAMOND JEWELLERY • A OSSAM JEWELLS COMPANY •
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto flex flex-col gap-16 md:gap-32 pt-12 md:pt-24 pb-12">
        
        {/* 
        <section className="relative px-4 md:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-[#4A1F58]">
              Curated with Love
            </h2>
            <div className="w-12 h-0.5 bg-[#C9A15B] mx-auto mt-6" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {CURATED_COLLECTIONS.map((collection, idx) => (
              <Link key={idx} to={collection.link} className="flex flex-col group cursor-pointer">
                <div className="w-full aspect-[4/5] rounded-sm overflow-hidden mb-4 relative bg-[#E9D8C3]">
                  <img src={collection.image} alt={collection.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
                <h3 className="text-xs md:text-sm font-sans font-medium text-[#302832] text-center leading-relaxed tracking-wider uppercase group-hover:text-[#713B78] transition-colors">
                  {collection.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
        */}

        {/* 5. BESTSELLERS */}
        <section className="relative px-4 md:px-8 py-8 md:py-12 overflow-hidden rounded-xl">
          {/* ✨ Section-Specific Background */}
          <img 
            src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
            alt="Decorative Floral" 
            className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none mix-blend-multiply z-0"
          />
          <div className="relative z-10">
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
        <section className="relative px-4 md:px-8 py-8 md:py-12 overflow-hidden rounded-xl">
          {/* ✨ Section-Specific Background */}
          <img 
            src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
            alt="Decorative Floral" 
            className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none mix-blend-multiply z-0"
          />
          <div className="relative z-10">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58]">Shop By Price</h2>
              <p className="text-xs font-sans text-zinc-500 mt-2 tracking-wide">Explore our diverse selections. Find your style.</p>
            </div>
            
            <div className="flex flex-col gap-3 md:gap-6 max-w-[1200px] mx-auto">
              
              {/* Item 1: Full-width top banner */}
              {/* ✨ DESKTOP FIX: Changed md:aspect-[3/1] to md:aspect-[4/1] for a sleeker banner */}
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

              {/* Items 2 & 3: Side-by-side middle row */}
              <div className="grid grid-cols-2 gap-3 md:gap-6">
                {[PRICE_COLLECTIONS[1], PRICE_COLLECTIONS[2]].map((item, idx) => item && (
                  /* ✨ DESKTOP FIX: Changed md:aspect-[4/3] to md:aspect-[2/1] to perfectly match the height of top/bottom banners */
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

              {/* Item 4: Full-width bottom banner */}
              {/* ✨ DESKTOP FIX: Changed md:aspect-[3/1] to md:aspect-[4/1] */}
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

        {/* 7. THE ART OF GIFTING */}
        <section className="relative px-4 md:px-8 py-8 md:py-12 overflow-hidden rounded-xl">
          {/* ✨ Section-Specific Background */}
          <img 
            src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
            alt="Decorative Floral" 
            className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none mix-blend-multiply z-0"
          />
          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <Link to="/category/gifts-for-her" className="group relative overflow-hidden bg-[#4A1F58] rounded-sm aspect-[4/3] md:aspect-[16/9]">
                 <img src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/gifting1.webp" alt="Gifts for Her" className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />
                 <div className="absolute inset-y-0 left-0 p-8 md:p-12 flex flex-col justify-center w-3/4">
                   <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-3">The Art of Gifting</h2>
                   <p className="text-xs font-sans text-[#E9D8C3] uppercase tracking-widest mb-6">For Her</p>
                   <span className="inline-flex items-center text-xs font-sans font-bold text-white uppercase tracking-widest group-hover:text-[#C9A15B] transition-colors">
                     Shop Gifts <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                   </span>
                 </div>
              </Link>
              <Link to="/category/anniversary" className="group relative overflow-hidden bg-[#E9D8C3] rounded-sm aspect-[4/3] md:aspect-[16/9]">
                 <img src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/gifting2.webp" alt="Anniversary Specials" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                 <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full text-center">
                   <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-3">Milestone Moments</h2>
                   <span className="inline-flex items-center text-xs font-sans font-bold text-white uppercase tracking-widest group-hover:text-[#C9A15B] transition-colors">
                     Explore Anniversary <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                   </span>
                 </div>
              </Link>
            </div>
          </div>
        </section>

      </div>

      <div className="max-w-[1400px] mx-auto space-y-20 md:space-y-32 pt-16 md:pt-24 pb-16">

        {/* ========================================================= */}
      {/* ✨ NEW: THE PAVITRAM PROMISES (Elegant Trust Stack) */}
      {/* ========================================================= */}
      <section className="bg-[#F7F1E8] py-16 md:py-24 border-t border-[#E9D8C3] relative overflow-hidden">
        
        {/* Subtle Background Watermark */}
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.04] pointer-events-none mix-blend-multiply"
        />

        <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
          
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-[42px] font-serif text-[#302832] leading-tight">
              The Pavitram <span className="text-[#C9A15B] italic font-light">Promises</span>
            </h2>
          </div>

          {/* Desktop: Horizontal Flow | Mobile: Vertical Stack */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
            
            {/* Promise 1 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 md:gap-6 group">
              <div className="w-16 h-16 shrink-0 rounded-full bg-white border border-[#C9A15B]/30 flex items-center justify-center group-hover:border-[#C9A15B] group-hover:shadow-sm transition-all">
                <Award className="w-7 h-7 text-[#C9A15B] stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-base font-serif font-medium text-[#4A1F58] mb-2">Trusted & Certified Jewellery</h3>
                <p className="text-[13px] font-sans text-zinc-600 leading-relaxed">
                  Crafted with the trust and reliability of the Ossam Jewels legacy, we use 100% BIS Hallmark gold and certified natural diamonds for all our products.
                </p>
              </div>
            </div>

            {/* Promise 3 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 md:gap-6 group">
              <div className="w-16 h-16 shrink-0 rounded-full bg-white border border-[#C9A15B]/30 flex items-center justify-center group-hover:border-[#C9A15B] group-hover:shadow-sm transition-all">
                <RefreshCw className="w-7 h-7 text-[#C9A15B] stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-base font-serif font-medium text-[#4A1F58] mb-2">Hassle-free Exchanges</h3>
                <p className="text-[13px] font-sans text-zinc-600 leading-relaxed">
                  Enjoy absolute peace of mind with our transparent 15-day return policy, and a guaranteed lifetime exchange & depreciated buyback program.
                </p>
              </div>
            </div>

            {/* Promise 4 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 md:gap-6 group">
              <div className="w-16 h-16 shrink-0 rounded-full bg-white border border-[#C9A15B]/30 flex items-center justify-center group-hover:border-[#C9A15B] group-hover:shadow-sm transition-all">
                <ShieldCheck className="w-7 h-7 text-[#C9A15B] stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-base font-serif font-medium text-[#4A1F58] mb-2">Fully Insured Shipping</h3>
                <p className="text-[13px] font-sans text-zinc-600 leading-relaxed">
                  Your investment is secure. Every piece is dispatched in tamper-proof packaging and is 100% insured until the moment it is safely handed to you.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

        {/* ✨ NEW: 9. SOCIAL PROOF (Spotted in Pavitram) */}
        <section className="relative px-4 md:px-8">
          <div className="flex flex-col items-center text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58] mb-3">Spotted in Pavitram</h2>
            <p className="text-xs font-sans text-zinc-500 uppercase tracking-widest mb-6">Tag @PavitramJewellery to be featured</p>
            <div className="w-12 h-0.5 bg-[#C9A15B]" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {/* Hardcoded mock social images for now - replace URLs with real customer photos */}
            {[1, 2, 3, 4].map((item) => (
              <a href="https://instagram.com" target="_blank" rel="noreferrer" key={item} className="group relative aspect-square bg-[#E9D8C3] overflow-hidden cursor-pointer">
                <img 
                  src={`https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/social${item}.webp`} 
                  alt="Customer wearing Pavitram" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-[#4A1F58]/0 group-hover:bg-[#4A1F58]/40 transition-colors duration-300 flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ✨ UPGRADED: 10. NEWSLETTER CAPTURE (Minimalist Centered with Original Content) */}
        <section className="relative px-4 md:px-8 py-20 md:py-32 overflow-hidden border-t border-[#E9D8C3] mt-12">
          {/* ✨ Section-Specific Background (Beige + Floral Overlay) */}
          <div className="absolute inset-0 bg-[#F7F1E8] z-0" />
          <img 
            src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
            alt="Decorative Floral" 
            className="absolute inset-0 w-full h-full object-cover opacity-[0.15] pointer-events-none mix-blend-multiply z-0"
          />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center">
            
            <h2 className="text-3xl md:text-[42px] font-serif text-[#4A1F58] mb-4 tracking-wide leading-tight">
              Join the Inner Circle
            </h2>
            
            <p className="text-sm md:text-base font-sans text-zinc-600 mb-10 md:mb-12 max-w-lg leading-relaxed">
              Unlock exclusive early access to our newest collections, private sales, and insider jewelry styling tips.
            </p>
            
            {/* Clean, Editorial Email Input */}
            <div className="flex w-full max-w-md mx-auto items-stretch h-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] group mb-12">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 px-5 font-sans text-sm outline-none border border-r-0 border-[#E9D8C3] focus:border-[#C9A15B] bg-white text-[#302832] placeholder:text-zinc-400 transition-colors"
              />
              <button className="px-8 md:px-10 bg-[#4A1F58] hover:bg-[#302832] text-white font-sans text-[11px] font-bold uppercase tracking-widest transition-colors flex-shrink-0">
                Subscribe
              </button>
            </div>
            
            {/* WhatsApp Integration (Airy Theme) */}
            <div className="pt-8 border-t border-[#E9D8C3] w-full max-w-xs mx-auto flex flex-col items-center justify-center gap-5">
               <div>
                  <h3 className="text-sm font-serif font-medium text-[#4A1F58] mb-1">Prefer to chat?</h3>
                  <p className="text-[10px] font-sans text-zinc-500 uppercase tracking-widest">Connect with our stylists</p>
               </div>
               <a 
                 href="https://wa.me/918356834764?text=Hi!%20I%20want%20to%20know%20more%20about%20Pavitram%20Jewelry."
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center justify-center gap-2 w-full py-3 border border-[#4A1F58] text-[#4A1F58] hover:bg-[#4A1F58] hover:text-white font-sans text-[10px] font-bold uppercase tracking-[0.15em] transition-colors rounded-sm"
               >
                 <MessageCircle className="w-4 h-4" />
                 WhatsApp Us
               </a>
            </div>

          </div>
        </section>
      </div>

      {/* ✨ UPGRADED: 11. ELEGANT STORE LOCATOR (Responsive, Fixed Heights, Clear Buttons) */}
      <section className="relative w-full bg-[#F7F1E8] py-16 md:py-24 border-t border-[#E9D8C3] overflow-hidden mt-12">
        {/* ✨ Section-Specific Background (Beige + Floral Overlay) */}
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.15] pointer-events-none mix-blend-multiply z-0"
        />
        
        <div className="relative z-10 max-w-[1100px] mx-auto px-4 md:px-8">
          {/* Elegant Frosted Card Container */}
          <div className="bg-white/80 backdrop-blur-xl border border-[#E9D8C3] rounded-sm p-6 md:p-16 lg:p-20 text-center shadow-[0_10px_40px_rgba(74,31,88,0.03)]">
            
            <h2 className="text-3xl md:text-[42px] font-serif font-medium text-[#4A1F58] mb-3 md:mb-6 leading-tight">
              Experience Pavitram <span className="text-[#C9A15B] italic font-light">In-Person</span>
            </h2>
            
            <p className="text-sm md:text-base font-sans text-zinc-600 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-2 md:px-0">
              Try it on before you buy. With premium boutiques across the city, experiencing our brilliance is effortless. Enter your pincode to find a store near you.
            </p>

            {/* ✨ FIXED: Responsive Search Bar Layout with Forced Heights */}
            <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-stretch gap-4 md:gap-0">
              
              {/* Input & Detect Location Wrapper */}
              <div className="flex-1 flex items-center bg-white border border-[#E9D8C3] focus-within:border-[#C9A15B] transition-colors h-14 rounded-sm md:rounded-r-none md:border-r-0 shadow-sm overflow-hidden group">
                
                {/* Left Pin Icon */}
                <div className="pl-4 pr-3 text-zinc-400 group-focus-within:text-[#C9A15B] transition-colors flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                
                {/* Text Input */}
                <input 
                  type="text" 
                  value={storeQuery}
                  onChange={(e) => setStoreQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStoreSearch()}
                  placeholder="Pin code / City / State" 
                  className="flex-1 h-full py-2 font-sans text-sm outline-none bg-transparent placeholder:text-zinc-400 text-[#302832] w-full"
                />
                
                {/* Distinct Auto-Detect Button */}
                <button 
                  onClick={handleAutoDetect} 
                  disabled={isLocating}
                  title="Detect Current Location"
                  className="h-full px-4 border-l border-[#E9D8C3] text-[#C9A15B] bg-zinc-50/50 hover:bg-[#F7F1E8] hover:text-[#4A1F58] transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                >
                  {isLocating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Navigation className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleStoreSearch} 
                className="w-full md:w-auto h-14 px-8 md:px-12 bg-[#4A1F58] hover:bg-[#302832] text-white font-sans text-xs font-bold uppercase tracking-widest transition-colors shrink-0 rounded-sm md:rounded-l-none shadow-sm flex items-center justify-center"
              >
                Locate Store
              </button>
              
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}