import React, { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Gem, TrendingUp, PackageX, Diamond, Clock, Heart, Loader2 } from "lucide-react";
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
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [affordableProducts, setAffordableProducts] = useState<any[]>([]);
  const [premiumProducts, setPremiumProducts] = useState<any[]>([]);
  const [diamondProducts, setDiamondProducts] = useState<any[]>([]);
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
          // --- CONSTRAINT 1: New Arrivals (Latest Dates) ---
          const sortedByDate = [...allProducts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setNewArrivals(sortedByDate.slice(0, 15));

          // --- CONSTRAINT 2: Affordable (Price <= 30,000) ---
          const affordable = allProducts.filter(p => Number(p.mrp) <= 30000);
          setAffordableProducts(shuffleArray(affordable).slice(0, 15));

          // --- CONSTRAINT 3: Premium (Price > 50,000) ---
          const premium = allProducts.filter(p => Number(p.mrp) > 50000);
          setPremiumProducts(shuffleArray(premium).slice(0, 15));

          // --- CONSTRAINT 4: The Diamond Edit (Has Stones/Diamonds) ---
          const diamonds = allProducts.filter(p => p.stone_weight_cts > 0 || p.diamond_shape !== null);
          setDiamondProducts(shuffleArray(diamonds).slice(0, 15));

          // --- CONSTRAINT 5: Discover / Trending (Random Shuffle) ---
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

  // ✨ COMPACT & DENSE PRODUCT CARD (Conversion Optimized)
  const ProductCard = ({ product }: { product: any }) => {
    const displayImage = product.cover_image_url || (product.gallery_images && product.gallery_images.length > 0 ? product.gallery_images[0] : null);

    return (
      <Link 
        to="/product/$slug"
        params={{ slug: product.slug || product.id }}
        className="w-[140px] md:w-[180px] lg:w-[220px] shrink-0 snap-start group flex flex-col cursor-pointer"
      >
        <div className="aspect-[4/5] w-full bg-[#F7F1E8]/50 rounded-sm overflow-hidden relative shrink-0 mb-2.5 md:mb-3">
          {displayImage ? (
            <img 
              src={displayImage} 
              alt={product.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300">
              <PackageX className="w-5 h-5 opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-[#4A1F58]/0 group-hover:bg-[#4A1F58]/5 transition-colors duration-300" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="w-4 h-4 text-zinc-400 hover:text-[#C9A15B]" />
          </div>
        </div>
        
        <div className="flex flex-col text-left px-1">
          <span className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-[0.15em] mb-0.5 line-clamp-1">
            {product.category?.name || "Jewellery"}
          </span>
          <h4 className="text-[11px] md:text-[13px] font-serif font-medium text-[#302832] line-clamp-1 mb-1 group-hover:text-[#C9A15B] transition-colors leading-snug">
            {product.title}
          </h4>
          <span className="text-[12px] md:text-[14px] font-sans font-bold text-[#4A1F58]">
            {product.mrp != null ? `₹${Number(product.mrp).toLocaleString('en-IN')}` : "TBA"}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#302832] pb-20 relative">
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* ========================================================= */}
      {/* 1. STICKY TOP CATEGORIES (High Utility Navigation) */}
      {/* ========================================================= */}
      <section className="sticky top-[56px] md:top-[72px] z-40 bg-white/95 backdrop-blur-md border-b border-[#E9D8C3] shadow-[0_2px_10px_rgba(0,0,0,0.02)] pt-4 pb-4">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex overflow-x-auto gap-3 md:gap-4 snap-x snap-mandatory hide-scrollbar">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="shrink-0 snap-start flex items-center gap-2 w-max pr-4 pl-1.5 py-1.5 rounded-full bg-zinc-50 animate-pulse border border-[#E9D8C3]">
                <div className="w-8 h-8 rounded-full bg-zinc-200" />
                <div className="w-16 h-2.5 bg-zinc-200 rounded" />
              </div>
            ))
          ) : (
            categories.map((cat) => (
              <Link 
                key={cat.id} 
                to="/category/$slug" 
                params={{ slug: cat.slug }}
                className="shrink-0 snap-start flex items-center gap-2.5 w-max pr-4 pl-1.5 py-1.5 rounded-full bg-white shadow-sm border border-[#E9D8C3] hover:border-[#C9A15B] hover:shadow-md transition-all group"
              >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden bg-[#F7F1E8] shrink-0 border border-[#E9D8C3]/50">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Diamond className="w-3.5 h-3.5 text-[#C9A15B]/50" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] md:text-[11px] font-sans font-bold uppercase tracking-[0.1em] text-[#302832] group-hover:text-[#4A1F58]">
                  {cat.name}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto space-y-12 md:space-y-16 py-10 md:py-14 relative z-10">

        {/* ========================================================= */}
        {/* SCROLL 1: NEW ARRIVALS */}
        {/* ========================================================= */}
        <section className="relative">
          <div className="px-4 md:px-8 mb-5 md:mb-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-[#C9A15B]" />
                <h2 className="text-xl md:text-2xl font-serif font-medium text-[#4A1F58] tracking-wide leading-none">New Arrivals</h2>
              </div>
              <p className="text-[9px] md:text-[10px] font-sans text-zinc-500 uppercase tracking-widest">Fresh from the atelier</p>
            </div>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 md:gap-5 pb-4 pt-1 items-stretch w-full px-4 md:px-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0 snap-start w-[140px] md:w-[220px] aspect-[4/5] bg-zinc-50 rounded-sm animate-pulse border border-[#E9D8C3]" />
              ))
            ) : newArrivals.length > 0 ? (
              newArrivals.map(product => <ProductCard key={`new-${product.id}`} product={product} />)
            ) : (
              <div className="w-full py-8 text-center text-zinc-400 font-sans text-sm">No new arrivals found.</div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SCROLL 2: AFFORDABLE ELEGANCE */}
        {/* ========================================================= */}
        <section className="relative">
          <div className="px-4 md:px-8 mb-5 md:mb-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#C9A15B]" />
                <h2 className="text-xl md:text-2xl font-serif font-medium text-[#4A1F58] tracking-wide leading-none">Everyday Brilliance</h2>
              </div>
              <p className="text-[9px] md:text-[10px] font-sans text-zinc-500 uppercase tracking-widest">Stunning designs under ₹30,000</p>
            </div>
            <Link to="/category/daily-wear" className="hidden md:flex text-[10px] font-sans font-bold text-[#4A1F58] hover:text-[#C9A15B] uppercase tracking-[0.2em] transition-colors items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 md:gap-5 pb-4 pt-1 items-stretch w-full px-4 md:px-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0 snap-start w-[140px] md:w-[220px] aspect-[4/5] bg-zinc-50 rounded-sm animate-pulse border border-[#E9D8C3]" />
              ))
            ) : affordableProducts.length > 0 ? (
              affordableProducts.map(product => <ProductCard key={`aff-${product.id}`} product={product} />)
            ) : (
              <div className="w-full py-8 text-center text-zinc-400 font-sans text-sm">No products found in this range.</div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SCROLL 3: THE DIAMOND EDIT */}
        {/* ========================================================= */}
        <section className="relative bg-[#F7F1E8]/30 border-y border-[#E9D8C3] py-10 md:py-12 my-8">
          <div className="px-4 md:px-8 mb-5 md:mb-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Diamond className="w-4 h-4 text-[#C9A15B]" />
                <h2 className="text-xl md:text-2xl font-serif font-medium text-[#4A1F58] tracking-wide leading-none">The Diamond Edit</h2>
              </div>
              <p className="text-[9px] md:text-[10px] font-sans text-zinc-500 uppercase tracking-widest">Brilliance in every facet</p>
            </div>
            <Link to="/category/diamond" className="hidden md:flex text-[10px] font-sans font-bold text-[#4A1F58] hover:text-[#C9A15B] uppercase tracking-[0.2em] transition-colors items-center gap-1">
              View Collection <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 md:gap-5 pb-2 pt-1 items-stretch w-full px-4 md:px-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0 snap-start w-[140px] md:w-[220px] aspect-[4/5] bg-white rounded-sm animate-pulse border border-[#E9D8C3]" />
              ))
            ) : diamondProducts.length > 0 ? (
              diamondProducts.map(product => <ProductCard key={`dia-${product.id}`} product={product} />)
            ) : (
              <div className="w-full py-8 text-center text-zinc-400 font-sans text-sm">No diamonds found.</div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SCROLL 4: PREMIUM MASTERPIECES */}
        {/* ========================================================= */}
        <section className="relative">
          <div className="px-4 md:px-8 mb-5 md:mb-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Gem className="w-4 h-4 text-[#C9A15B]" />
                <h2 className="text-xl md:text-2xl font-serif font-medium text-[#4A1F58] tracking-wide leading-none">Premium Masterpieces</h2>
              </div>
              <p className="text-[9px] md:text-[10px] font-sans text-zinc-500 uppercase tracking-widest">Exclusive luxury above ₹50,000</p>
            </div>
            <Link to="/category/masterpieces" className="hidden md:flex text-[10px] font-sans font-bold text-[#4A1F58] hover:text-[#C9A15B] uppercase tracking-[0.2em] transition-colors items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 md:gap-5 pb-4 pt-1 items-stretch w-full px-4 md:px-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0 snap-start w-[140px] md:w-[220px] aspect-[4/5] bg-zinc-50 rounded-sm animate-pulse border border-[#E9D8C3]" />
              ))
            ) : premiumProducts.length > 0 ? (
              premiumProducts.map(product => <ProductCard key={`prem-${product.id}`} product={product} />)
            ) : (
              <div className="w-full py-8 text-center text-zinc-400 font-sans text-sm">No products found in this range.</div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SCROLL 5: TRENDING NOW */}
        {/* ========================================================= */}
        <section className="relative">
          <div className="px-4 md:px-8 mb-5 md:mb-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[#C9A15B]" />
                <h2 className="text-xl md:text-2xl font-serif font-medium text-[#4A1F58] tracking-wide leading-none">Trending Now</h2>
              </div>
              <p className="text-[9px] md:text-[10px] font-sans text-zinc-500 uppercase tracking-widest">A curated mix of our most loved styles</p>
            </div>
            <Link to="/category/bestsellers" className="hidden md:flex text-[10px] font-sans font-bold text-[#4A1F58] hover:text-[#C9A15B] uppercase tracking-[0.2em] transition-colors items-center gap-1">
              Explore All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 md:gap-5 pb-4 pt-1 items-stretch w-full px-4 md:px-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0 snap-start w-[140px] md:w-[220px] aspect-[4/5] bg-zinc-50 rounded-sm animate-pulse border border-[#E9D8C3]" />
              ))
            ) : mixedTrendingProducts.length > 0 ? (
              mixedTrendingProducts.map(product => <ProductCard key={`trend-${product.id}`} product={product} />)
            ) : (
              <div className="w-full py-8 text-center text-zinc-400 font-sans text-sm">No products found.</div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}