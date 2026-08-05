import React, { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Gem, TrendingUp, PackageX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/Shop')({
  component: ShopPage,
});

// Helper function to truly shuffle an array (Fisher-Yates algorithm)
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function ShopPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Scrolled Sections State
  const [affordableProducts, setAffordableProducts] = useState<any[]>([]);
  const [premiumProducts, setPremiumProducts] = useState<any[]>([]);
  const [mixedTrendingProducts, setMixedTrendingProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchShopData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Categories
        const { data: allCats, error: catError } = await supabase
          .from("ecommerce_categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (catError) throw catError;
        setCategories(allCats?.filter(c => !c.parent_id) || []);

        // 2. Fetch All Live Products
        const { data: allProducts, error: prodError } = await supabase
          .from("ecommerce_products")
          .select("*, category:ecommerce_categories(name)")
          .eq("is_live", true);

        if (prodError) throw prodError;

        if (allProducts) {
          // --- SHUFFLE LOGIC 1: Affordable (Price <= 25,000) ---
          const affordable = allProducts.filter(p => Number(p.mrp) <= 35000);
          setAffordableProducts(shuffleArray(affordable).slice(0, 15)); // Limit to 15 items for performance

          // --- SHUFFLE LOGIC 2: Premium (Price > 25,000) ---
          const premium = allProducts.filter(p => Number(p.mrp) > 25000);
          setPremiumProducts(shuffleArray(premium).slice(0, 15));

          // --- SHUFFLE LOGIC 3: Category Mixed / Trending ---
          // Just a complete random shuffle of all products to simulate "Trending/Discover"
          setMixedTrendingProducts(shuffleArray(allProducts).slice(0, 15));
        }
      } catch (err) {
        console.error("Failed to fetch shop data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopData();
  }, []);

  // Reusable Product Card Component to keep the code DRY
  const ProductCard = ({ product }: { product: any }) => (
    <Link 
      to="/product/$slug"
      params={{ slug: product.slug || product.id }}
      className="shrink-0 snap-start w-[130px] md:w-[220px] lg:w-[240px] h-auto bg-white/95 backdrop-blur-sm rounded-[12px] md:rounded-[20px] p-2 md:p-3 border border-zinc-100 shadow-sm flex flex-col gap-1.5 md:gap-3 group cursor-pointer hover:shadow-[0_10px_30px_rgba(74,11,73,0.08)] hover:-translate-y-1 transition-all duration-300 relative z-10"
    >
      <div className="aspect-square w-full bg-zinc-50 rounded-lg md:rounded-xl overflow-hidden relative border border-zinc-50 shrink-0">
        {product.cover_image_url ? (
          <img 
            src={product.cover_image_url} 
            alt={product.title || "Product"} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[8px] md:text-[10px] text-zinc-400 font-bold uppercase bg-zinc-100/50">
            <PackageX className="w-6 h-6 mb-1 opacity-50" />
            <span className="opacity-50">No Image</span>
          </div>
        )}
      </div>
      
      <div className="mt-1 md:mt-2 px-0.5 w-full flex-1 flex flex-col">
        <span className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
          {product.category?.name || "Jewellery"}
        </span>
        <h4 className="text-[11px] md:text-sm font-semibold text-zinc-800 line-clamp-2 leading-tight group-hover:text-[#4A0B49] transition-colors">
          {product.title || "Unnamed Product"}
        </h4>
      </div>
      
      <div className="mt-auto pt-1.5 md:pt-3 border-t border-zinc-100/50 flex justify-between items-center px-0.5 w-full">
        <span className="text-[12px] md:text-base font-black text-zinc-900">
          {product.mrp != null ? `₹${Number(product.mrp).toLocaleString()}` : "TBA"}
        </span>
        <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-purple-50 text-[#4A0B49] flex items-center justify-center group-hover:bg-[#4A0B49] group-hover:text-white transition-colors shrink-0">
          <ArrowRight className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 pb-20 relative overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Global Background Gradient */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-br from-fuchsia-50/30 via-white to-purple-50/20" />

      {/* ========================================================= */}
      {/* 1. TOP CATEGORIES BUBBLE SCROLL */}
      {/* ========================================================= */}
      <section className="pt-6 pb-4 md:pt-10 md:pb-6 relative z-10 border-b border-zinc-100 bg-white/50 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-4">
          <h1 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight">
            Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A0B49] to-pink-600">Category</span>
          </h1>
        </div>

        <div className="px-4 md:px-8 flex overflow-x-auto gap-3 md:gap-5 snap-x snap-mandatory pb-4 hide-scrollbar">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="shrink-0 snap-start flex items-center gap-3 w-max px-4 py-2 rounded-full bg-zinc-100 animate-pulse border border-zinc-200">
                <div className="w-8 h-8 rounded-full bg-zinc-200" />
                <div className="w-20 h-3 bg-zinc-200 rounded" />
              </div>
            ))
          ) : (
            categories.map((cat) => (
              <Link 
                key={cat.id} 
                to="/category/$slug" 
                params={{ slug: cat.slug }}
                className="shrink-0 snap-start flex items-center gap-3 w-max px-2 py-1.5 md:px-3 md:py-2 rounded-full bg-white shadow-sm border border-zinc-100 hover:border-purple-200 hover:shadow-md transition-all group"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-zinc-50 shrink-0">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-full h-full bg-[#F9F6F0]" />
                  )}
                </div>
                <span className="text-xs md:text-sm font-bold text-zinc-700 group-hover:text-[#4A0B49] pr-3">
                  {cat.name}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-16 py-8 md:py-12 relative z-10">

        {/* ========================================================= */}
        {/* SCROLL 1: AFFORDABLE ELEGANCE (Price Based) */}
        {/* ========================================================= */}
        <section className="relative">
          <div className="px-4 md:px-8 mb-4 md:mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 md:w-5 md:h-5 text-pink-500" />
                <h2 className="text-lg md:text-2xl font-black text-zinc-900 tracking-tight">Everyday Brilliance</h2>
              </div>
              <p className="text-[10px] md:text-sm text-zinc-500 font-medium">Stunning designs under ₹25,000</p>
            </div>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 md:gap-5 pb-6 pt-2 items-stretch w-full px-4 md:px-8">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shrink-0 snap-start w-[130px] md:w-[220px] lg:w-[240px] aspect-[4/5] bg-zinc-50 rounded-[12px] md:rounded-[20px] animate-pulse border border-zinc-100" />
              ))
            ) : affordableProducts.length > 0 ? (
              affordableProducts.map(product => <ProductCard key={product.id} product={product} />)
            ) : (
              <div className="w-full py-8 text-center text-zinc-400 text-sm font-medium">No products found in this range.</div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SCROLL 2: PREMIUM MASTERPIECES (Price Based) */}
        {/* ========================================================= */}
        <section className="relative">
          {/* Injecting the signature purple gradient for this specific section background */}
          <div className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-purple-50/50 via-transparent to-fuchsia-50/50 pointer-events-none -z-10" />

          <div className="px-4 md:px-8 mb-4 md:mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Gem className="w-3.5 h-3.5 md:w-5 md:h-5 text-[#4A0B49]" />
                <h2 className="text-lg md:text-2xl font-black text-zinc-900 tracking-tight">Premium Masterpieces</h2>
              </div>
              <p className="text-[10px] md:text-sm text-zinc-500 font-medium">Exclusive luxury above ₹25,000</p>
            </div>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 md:gap-5 pb-6 pt-2 items-stretch w-full px-4 md:px-8">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shrink-0 snap-start w-[130px] md:w-[220px] lg:w-[240px] aspect-[4/5] bg-white rounded-[12px] md:rounded-[20px] animate-pulse border border-zinc-100" />
              ))
            ) : premiumProducts.length > 0 ? (
              premiumProducts.map(product => <ProductCard key={`prem-${product.id}`} product={product} />)
            ) : (
              <div className="w-full py-8 text-center text-zinc-400 text-sm font-medium">No products found in this range.</div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SCROLL 3: DISCOVER & TRENDING (Mixed Category Random) */}
        {/* ========================================================= */}
        <section className="relative">
          <div className="px-4 md:px-8 mb-4 md:mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 md:w-5 md:h-5 text-emerald-600" />
                <h2 className="text-lg md:text-2xl font-black text-zinc-900 tracking-tight">Trending Now</h2>
              </div>
              <p className="text-[10px] md:text-sm text-zinc-500 font-medium">A curated mix of our most loved styles</p>
            </div>
            <Link to="/category/bestsellers" className="text-[10px] md:text-xs font-bold text-[#4A0B49] uppercase tracking-widest hover:underline flex items-center gap-1 bg-zinc-50 px-3 py-1.5 rounded-full shrink-0 shadow-sm border border-zinc-100">
              Explore All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 md:gap-5 pb-6 pt-2 items-stretch w-full px-4 md:px-8">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shrink-0 snap-start w-[130px] md:w-[220px] lg:w-[240px] aspect-[4/5] bg-zinc-50 rounded-[12px] md:rounded-[20px] animate-pulse border border-zinc-100" />
              ))
            ) : mixedTrendingProducts.length > 0 ? (
              mixedTrendingProducts.map(product => <ProductCard key={`trend-${product.id}`} product={product} />)
            ) : (
              <div className="w-full py-8 text-center text-zinc-400 text-sm font-medium">No products found.</div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}