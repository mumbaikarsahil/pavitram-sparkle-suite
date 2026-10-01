"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, PackageX, Diamond, Heart, Loader2, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// 1. Define URL Search Parameters to catch filters coming from the Homepage
const shopSearchSchema = z.object({
  category: z.string().optional(),
  price: z.string().optional(),
  collection: z.string().optional(), // For Occasions
});

export const Route = createFileRoute('/Shop')({
  validateSearch: shopSearchSchema,
  component: ShopPage,
});

const PRICE_RANGES = [
  { id: "under-10k", label: "Under ₹10,000", min: 0, max: 10000 },
  { id: "10k-20k", label: "₹10k - ₹20k", min: 10001, max: 20000 },
  { id: "20k-40k", label: "₹20k - ₹40k", min: 20001, max: 40000 },
  { id: "above-40k", label: "Above ₹40,000", min: 40001, max: Infinity },
];

function ShopPage() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: '/Shop' });

  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [occasionProductIds, setOccasionProductIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Active Filter States
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activePrice, setActivePrice] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

  // Sync URL parameters to UI state on mount
  useEffect(() => {
    if (searchParams.category) setActiveCategory(searchParams.category);
    if (searchParams.price) setActivePrice(searchParams.price);
  }, [searchParams]);

  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const fetchShopData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Categories for the Pills
        const { data: catData } = await supabase
          .from("ecommerce_categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (catData) setCategories(catData.filter(c => !c.parent_id));

        // 2. Resolve 'collection' (Occasions) if present in URL
        if (searchParams.collection) {
          const { data: occData } = await supabase
            .from("ecommerce_occasions")
            .select("id")
            .eq("slug", searchParams.collection)
            .maybeSingle();

          if (occData) {
            const { data: junctionData } = await supabase
              .from("ecommerce_product_occasions")
              .select("product_id")
              .eq("occasion_id", occData.id);
            if (junctionData) {
              setOccasionProductIds(new Set(junctionData.map(j => j.product_id)));
            }
          }
        }

        // 3. Fetch All Live Products
        const { data: prodData, error: prodError } = await supabase
          .from("ecommerce_products")
          .select("*, category:ecommerce_categories(name, slug)")
          .eq("is_live", true)
          .order("created_at", { ascending: false });

        if (prodError) throw prodError;
        setAllProducts(prodData || []);

      } catch (err) {
        console.error("Failed to fetch shop data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopData();
  }, [searchParams.collection]); // Re-fetch if occasion changes

  // Update URL when a pill is clicked
  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    navigate({ search: { ...searchParams, category: slug === 'all' ? undefined : slug } });
  };

  const handlePriceChange = (id: string) => {
    setActivePrice(id);
    navigate({ search: { ...searchParams, price: id === 'all' ? undefined : id } });
  };

  // Filter & Sort Engine
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Filter by Category Pill
    if (activeCategory !== "all") {
      result = result.filter(p => p.category?.slug === activeCategory);
    }

    // Filter by Price Pill
    if (activePrice !== "all") {
      const range = PRICE_RANGES.find(r => r.id === activePrice);
      if (range) {
        result = result.filter(p => Number(p.mrp) >= range.min && Number(p.mrp) <= range.max);
      }
    }

    // Filter by Occasion (URL collection parameter)
    if (searchParams.collection && occasionProductIds.size > 0) {
      result = result.filter(p => occasionProductIds.has(p.id));
    } else if (searchParams.collection && occasionProductIds.size === 0) {
      // Occasion passed but no products mapped
      result = [];
    }

    // Sorting
    if (sortBy === "price_asc") result.sort((a, b) => Number(a.mrp) - Number(b.mrp));
    if (sortBy === "price_desc") result.sort((a, b) => Number(b.mrp) - Number(a.mrp));
    if (sortBy === "newest") result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result;
  }, [allProducts, activeCategory, activePrice, sortBy, searchParams.collection, occasionProductIds]);


  const ProductCard = ({ product }: { product: any }) => {
    const displayImage = product.cover_image_url || (product.gallery_images && product.gallery_images.length > 0 ? product.gallery_images[0] : null);

    return (
      <Link 
        to="/product/$slug"
        params={{ slug: product.slug || product.id }}
        className="w-full shrink-0 snap-start group flex flex-col cursor-pointer"
      >
        <div className="aspect-[4/5] w-full bg-[#F7F1E8]/50 rounded-sm overflow-hidden relative shrink-0 mb-2.5 md:mb-3 border border-[#E9D8C3] group-hover:border-[#C9A15B] transition-colors">
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
    <div className="min-h-screen bg-white font-sans text-[#302832] pb-24 relative">
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* HEADER */}
      <div className="bg-[#F7F1E8] border-b border-[#E9D8C3] py-10 md:py-16 text-center relative overflow-hidden">
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/bg_pattern2.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none mix-blend-multiply"
        />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-serif font-medium text-[#4A1F58] mb-3">
            {searchParams.collection ? "Curated Collection" : "The Jewellery Shop"}
          </h1>
          <p className="text-xs md:text-sm font-sans font-medium uppercase tracking-[0.15em] text-zinc-500">
            Showing {filteredProducts.length} breathtaking designs
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FILTER PILLS (Sticky Navigation) */}
      {/* ========================================================= */}
      <div className="sticky top-[56px] md:top-[72px] z-40 bg-white/95 backdrop-blur-md border-b border-[#E9D8C3] shadow-[0_4px_15px_rgba(0,0,0,0.03)]">
        
        {/* ROW 1: CATEGORIES */}
        <div className="border-b border-zinc-100">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 flex overflow-x-auto gap-3 snap-x snap-mandatory hide-scrollbar">
            <button 
              onClick={() => handleCategoryChange('all')}
              className={`shrink-0 snap-start px-5 py-2 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest transition-all border ${activeCategory === 'all' ? 'bg-[#4A1F58] border-[#4A1F58] text-white shadow-sm' : 'bg-zinc-50 border-[#E9D8C3] text-zinc-600 hover:border-[#C9A15B]'}`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => handleCategoryChange(cat.slug)}
                className={`shrink-0 snap-start flex items-center gap-2 w-max pr-4 pl-1.5 py-1.5 rounded-full shadow-sm border transition-all group ${activeCategory === cat.slug ? 'bg-[#4A1F58] border-[#4A1F58] text-white' : 'bg-white border-[#E9D8C3] hover:border-[#C9A15B]'}`}
              >
                <div className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center shrink-0 border ${activeCategory === cat.slug ? 'border-white/20 bg-white/10' : 'border-[#E9D8C3]/50 bg-[#F7F1E8]'}`}>
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <Diamond className="w-3 h-3 opacity-50" />
                  )}
                </div>
                <span className={`text-[10px] font-sans font-bold uppercase tracking-[0.1em] ${activeCategory === cat.slug ? 'text-white' : 'text-[#302832]'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ROW 2: PRICES & SORT */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between overflow-x-auto hide-scrollbar gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 mr-1 shrink-0" />
            <button 
              onClick={() => handlePriceChange('all')}
              className={`shrink-0 px-4 py-1.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-widest transition-all border ${activePrice === 'all' ? 'bg-[#C9A15B] border-[#C9A15B] text-white' : 'bg-transparent border-[#E9D8C3] text-zinc-500 hover:border-[#C9A15B]'}`}
            >
              Any Price
            </button>
            {PRICE_RANGES.map((range) => (
              <button 
                key={range.id}
                onClick={() => handlePriceChange(range.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-widest transition-all border ${activePrice === range.id ? 'bg-[#C9A15B] border-[#C9A15B] text-white' : 'bg-transparent border-[#E9D8C3] text-zinc-500 hover:border-[#C9A15B]'}`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 shrink-0 pl-4 border-l border-zinc-200">
            <span className="hidden md:inline text-[9px] font-sans font-bold uppercase tracking-widest text-zinc-400">Sort:</span>
            <select 
              className="text-[10px] font-sans font-bold text-[#4A1F58] bg-transparent outline-none cursor-pointer uppercase tracking-widest"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="newest">New Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN PRODUCT GRID */}
      {/* ========================================================= */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 md:pt-12">
        {isLoading ? (
          <div className="w-full flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#C9A15B]" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-[#E9D8C3] rounded-sm bg-[#F7F1E8]/50 flex flex-col items-center">
            <PackageX className="w-10 h-10 text-zinc-300 mb-4" />
            <p className="text-sm font-sans text-zinc-500">No products match your selected filters.</p>
            <button 
              onClick={() => { setActiveCategory('all'); setActivePrice('all'); navigate({ search: {} }); }} 
              className="mt-4 text-[10px] font-sans font-bold uppercase tracking-widest text-[#C9A15B] hover:text-[#4A1F58] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
            {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>

    </div>
  );
}