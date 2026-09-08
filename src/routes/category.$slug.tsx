import React, { useEffect, useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, PackageX, SlidersHorizontal, ChevronDown, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/category/$slug')({
  component: CategoryPage,
});

// --- Constants for Database-Driven Filters ---
const PRICE_RANGES = [
  { id: "under-10k", label: "Under ₹10,000", min: 0, max: 10000 },
  { id: "10k-20k", label: "₹10,001 - ₹20,000", min: 10001, max: 20000 },
  { id: "20k-40k", label: "₹20,001 - ₹40,000", min: 20001, max: 40000 },
  { id: "above-40k", label: "₹40,001 & Above", min: 40001, max: Infinity },
];

function CategoryPage() {
  const { slug } = Route.useParams();
  
  const [category, setCategory] = useState<any>(null);
  const [parentCategory, setParentCategory] = useState<any>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Filter & Sort State ---
  const [selectedPrices, setSelectedPrices] = useState<Set<string>>(new Set());
  const [selectedMetals, setSelectedMetals] = useState<Set<string>>(new Set());
  const [selectedPurities, setSelectedPurities] = useState<Set<string>>(new Set());
  const [selectedSubCats, setSelectedSubCats] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>("featured");
  const [quickFilter, setQuickFilter] = useState<string>("all");

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      setIsLoading(true);
      try {
        // --- 1. CHECK FOR SPECIAL SLUGS FIRST ---
        if (slug === "trending" || slug === "bestsellers") {
          setCategory({
            name: slug === "trending" ? "Trending Now" : "Our Bestsellers",
            slug: slug
          });
          setParentCategory(null);
          setSubCategories([]);

          const { data: specialProdData, error: specialProdError } = await supabase
            .from("ecommerce_products")
            .select("id, title, slug, mrp, cover_image_url, gallery_images, metal_type, purity_karat, category_id, created_at, category:ecommerce_categories(name)")
            .eq("is_live", true)
            .eq(slug === "trending" ? "is_trending" : "is_bestseller", true)
            .order("created_at", { ascending: false });

          if (specialProdError) throw specialProdError;
          setProducts(specialProdData || []);
          setIsLoading(false);
          return;
        }

        // --- 2. STANDARD CATEGORY FETCHING ---
        const { data: catData, error: catError } = await supabase
          .from("ecommerce_categories")
          .select("id, name, slug, parent_id")
          .ilike("slug", slug) 
          .eq("is_active", true)
          .maybeSingle(); 

        if (catError) throw catError;
        setCategory(catData);

        if (catData) {
          if (catData.parent_id) {
            const { data: pData } = await supabase
              .from("ecommerce_categories")
              .select("id, name, slug")
              .eq("id", catData.parent_id)
              .maybeSingle();
            setParentCategory(pData);
          } else {
            setParentCategory(null);
          }

          const { data: subCatsData } = await supabase
            .from("ecommerce_categories")
            .select("id, name, slug")
            .eq("parent_id", catData.id)
            .eq("is_active", true);

          setSubCategories(subCatsData || []);

          const categoryIdsToFetch = [catData.id];
          if (subCatsData && subCatsData.length > 0) {
            subCatsData.forEach(sub => categoryIdsToFetch.push(sub.id));
          }

          const { data: prodData, error: prodError } = await supabase
            .from("ecommerce_products")
            .select("id, title, slug, mrp, cover_image_url, gallery_images, metal_type, purity_karat, category_id, created_at, category:ecommerce_categories(name)")
            .in("category_id", categoryIdsToFetch) 
            .eq("is_live", true)
            .order("created_at", { ascending: false });

          if (prodError) throw prodError;
          setProducts(prodData || []);
        }
      } catch (err) {
        console.error("Error fetching category data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchCategoryAndProducts();
  }, [slug]);

  const { availableMetals, availablePurities } = useMemo(() => {
    const metals = new Map<string, number>();
    const purities = new Map<string, number>();

    products.forEach(p => {
      if (p.metal_type) metals.set(p.metal_type, (metals.get(p.metal_type) || 0) + 1);
      if (p.purity_karat) purities.set(p.purity_karat, (purities.get(p.purity_karat) || 0) + 1);
    });

    return {
      availableMetals: Array.from(metals.entries()).map(([name, count]) => ({ name, count })),
      availablePurities: Array.from(purities.entries()).map(([name, count]) => ({ name, count }))
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (quickFilter === "latest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    if (selectedSubCats.size > 0) {
      result = result.filter(p => selectedSubCats.has(p.category_id));
    }

    if (selectedPrices.size > 0) {
      result = result.filter(p => {
        const mrp = Number(p.mrp);
        return Array.from(selectedPrices).some(priceId => {
          const range = PRICE_RANGES.find(r => r.id === priceId);
          return range && mrp >= range.min && mrp <= range.max;
        });
      });
    }

    if (selectedMetals.size > 0) {
      result = result.filter(p => p.metal_type && selectedMetals.has(p.metal_type));
    }

    if (selectedPurities.size > 0) {
      result = result.filter(p => p.purity_karat && selectedPurities.has(p.purity_karat));
    }

    if (sortBy === "price_asc") result.sort((a, b) => Number(a.mrp) - Number(b.mrp));
    if (sortBy === "price_desc") result.sort((a, b) => Number(b.mrp) - Number(a.mrp));
    if (sortBy === "newest") result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result;
  }, [products, selectedPrices, selectedMetals, selectedPurities, selectedSubCats, sortBy, quickFilter]);

  const toggleSet = (set: Set<string>, value: string, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    const newSet = new Set(set);
    if (newSet.has(value)) newSet.delete(value);
    else newSet.add(value);
    setter(newSet);
  };

  const clearAllFilters = () => {
    setSelectedPrices(new Set());
    setSelectedMetals(new Set());
    setSelectedPurities(new Set());
    setSelectedSubCats(new Set());
    setQuickFilter("all");
  };

  const activeFilterCount = selectedPrices.size + selectedMetals.size + selectedPurities.size + selectedSubCats.size;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F1E8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A15B]" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#F7F1E8] text-center px-4">
        <PackageX className="w-12 h-12 text-zinc-300 mb-4" />
        <h1 className="text-2xl font-serif text-[#4A1F58]">Category not found</h1>
        <p className="text-sm font-sans text-zinc-500 mt-2">The collection you are looking for does not exist or has been removed.</p>
        <Link to="/" className="mt-6 text-[10px] font-sans font-bold uppercase tracking-widest text-[#C9A15B] hover:text-[#4A1F58] transition-colors">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans pb-24">
      
      {/* ✨ LUXURY CATEGORY HEADER */}
      <div className="bg-[#F7F1E8] border-b border-[#E9D8C3] relative overflow-hidden">
        {/* Subtle Background Watermark */}
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none mix-blend-multiply"
        />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16 text-center flex flex-col items-center justify-center">
          
          {/* Breadcrumbs */}
          <div className="text-[9px] md:text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4 md:mb-6">
            <Link to="/" className="hover:text-[#C9A15B] transition-colors">Home</Link>
            <span className="mx-3 opacity-50">/</span>
            {parentCategory && (
              <>
                <Link to="/category/$slug" params={{ slug: parentCategory.slug }} className="hover:text-[#C9A15B] transition-colors">
                  {parentCategory.name}
                </Link>
                <span className="mx-3 opacity-50">/</span>
              </>
            )}
            <span className="text-[#302832]">{category.name}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#4A1F58] mb-4">
            {category.name}
          </h1>
          <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#C9A15B]">
            {products.length} Designs
          </span>
        </div>
      </div>

      {/* QUICK FILTER ROW */}
      <div className="border-b border-[#E9D8C3] bg-white sticky top-[65px] md:top-[85px] z-30">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center gap-3 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setQuickFilter("all")}
            className={`shrink-0 px-6 py-2 rounded-sm text-[10px] font-sans font-bold uppercase tracking-widest transition-all border ${quickFilter === 'all' ? 'bg-[#4A1F58] border-[#4A1F58] text-white' : 'bg-transparent border-[#E9D8C3] text-[#302832] hover:border-[#C9A15B]'}`}
          >
            All
          </button>
          <button 
            onClick={() => setQuickFilter("fast_delivery")}
            className={`shrink-0 px-6 py-2 rounded-sm text-[10px] font-sans font-bold uppercase tracking-widest transition-all border ${quickFilter === 'fast_delivery' ? 'bg-[#4A1F58] border-[#4A1F58] text-white' : 'bg-transparent border-[#E9D8C3] text-[#302832] hover:border-[#C9A15B]'}`}
          >
            Fast Delivery
          </button>
          <button 
            onClick={() => setQuickFilter("latest")}
            className={`shrink-0 px-6 py-2 rounded-sm text-[10px] font-sans font-bold uppercase tracking-widest transition-all border ${quickFilter === 'latest' ? 'bg-[#4A1F58] border-[#4A1F58] text-white' : 'bg-transparent border-[#E9D8C3] text-[#302832] hover:border-[#C9A15B]'}`}
          >
            Latest Designs
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
          
          {/* --- LEFT SIDEBAR (FILTERS) --- */}
          <aside className="hidden lg:block w-[240px] shrink-0">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E9D8C3]">
              <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#302832] flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#C9A15B]" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </span>
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="text-[9px] font-sans font-bold tracking-widest text-[#C9A15B] hover:text-[#4A1F58] uppercase transition-colors">
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-8">
              {/* Filter Block: Product Types (Subcategories) */}
              {subCategories.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-sans font-bold tracking-[0.15em] uppercase text-[#302832] mb-5 flex items-center justify-between">
                    Style <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </h3>
                  <div className="space-y-4">
                    {subCategories.map((sub) => {
                      const count = products.filter(p => p.category_id === sub.id).length;
                      if (count === 0) return null;
                      return (
                        <label key={sub.id} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${selectedSubCats.has(sub.id) ? 'bg-[#4A1F58] border-[#4A1F58]' : 'bg-white border-[#E9D8C3] group-hover:border-[#C9A15B]'}`}>
                            {selectedSubCats.has(sub.id) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <input type="checkbox" className="hidden" onChange={() => toggleSet(selectedSubCats, sub.id, setSelectedSubCats)} />
                          <span className="text-[13px] font-sans text-zinc-600 group-hover:text-[#4A1F58] transition-colors flex-1">{sub.name}</span>
                          <span className="text-[10px] font-sans font-medium text-zinc-400">({count})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Filter Block: Price */}
              <div>
                <h3 className="text-[11px] font-sans font-bold tracking-[0.15em] uppercase text-[#302832] mb-5 flex items-center justify-between">
                  Price <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </h3>
                <div className="space-y-4">
                  {PRICE_RANGES.map((range) => {
                    const count = products.filter(p => Number(p.mrp) >= range.min && Number(p.mrp) <= range.max).length;
                    if (count === 0) return null;
                    return (
                      <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${selectedPrices.has(range.id) ? 'bg-[#4A1F58] border-[#4A1F58]' : 'bg-white border-[#E9D8C3] group-hover:border-[#C9A15B]'}`}>
                          {selectedPrices.has(range.id) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" className="hidden" onChange={() => toggleSet(selectedPrices, range.id, setSelectedPrices)} />
                        <span className="text-[13px] font-sans text-zinc-600 group-hover:text-[#4A1F58] transition-colors flex-1">{range.label}</span>
                        <span className="text-[10px] font-sans font-medium text-zinc-400">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Filter Block: Metal Type */}
              {availableMetals.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-sans font-bold tracking-[0.15em] uppercase text-[#302832] mb-5 flex items-center justify-between">
                    Metal Type <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </h3>
                  <div className="space-y-4">
                    {availableMetals.map((metal) => (
                      <label key={metal.name} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${selectedMetals.has(metal.name) ? 'bg-[#4A1F58] border-[#4A1F58]' : 'bg-white border-[#E9D8C3] group-hover:border-[#C9A15B]'}`}>
                          {selectedMetals.has(metal.name) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" className="hidden" onChange={() => toggleSet(selectedMetals, metal.name, setSelectedMetals)} />
                        <span className="text-[13px] font-sans text-zinc-600 group-hover:text-[#4A1F58] transition-colors flex-1">{metal.name}</span>
                        <span className="text-[10px] font-sans font-medium text-zinc-400">({metal.count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter Block: Purity */}
              {availablePurities.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-sans font-bold tracking-[0.15em] uppercase text-[#302832] mb-5 flex items-center justify-between">
                    Gold Purity <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </h3>
                  <div className="space-y-4">
                    {availablePurities.map((purity) => (
                      <label key={purity.name} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${selectedPurities.has(purity.name) ? 'bg-[#4A1F58] border-[#4A1F58]' : 'bg-white border-[#E9D8C3] group-hover:border-[#C9A15B]'}`}>
                          {selectedPurities.has(purity.name) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" className="hidden" onChange={() => toggleSet(selectedPurities, purity.name, setSelectedPurities)} />
                        <span className="text-[13px] font-sans text-zinc-600 group-hover:text-[#4A1F58] transition-colors flex-1">{purity.name}</span>
                        <span className="text-[10px] font-sans font-medium text-zinc-400">({purity.count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* --- RIGHT CONTENT (PRODUCTS) --- */}
          <div className="flex-1">
            
            {/* Top Utility Bar */}
            <div className="flex items-center justify-between lg:justify-end mb-6 md:mb-8">
              <button className="lg:hidden flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-widest text-[#302832] border border-[#E9D8C3] px-5 py-2 rounded-sm bg-[#F7F1E8]">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-500">Sort By:</span>
                <select 
                  className="text-xs font-sans font-bold text-[#4A1F58] bg-transparent outline-none cursor-pointer hover:text-[#C9A15B] transition-colors"
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

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-[#E9D8C3] rounded-sm bg-[#F7F1E8]/50 flex flex-col items-center">
                <PackageX className="w-10 h-10 text-zinc-300 mb-4" />
                <p className="text-sm font-sans text-zinc-500">No products match your current filters.</p>
                <button onClick={clearAllFilters} className="mt-4 text-[10px] font-sans font-bold uppercase tracking-widest text-[#C9A15B] hover:text-[#4A1F58] transition-colors">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => {
                  const isNew = new Date().getTime() - new Date(product.created_at).getTime() < 14 * 24 * 60 * 60 * 1000;
                  const displayImage = product.cover_image_url || (product.gallery_images && product.gallery_images.length > 0 ? product.gallery_images[0] : null);

                  return (
                    <Link 
                      key={product.id}
                      to="/product/$slug"
                      params={{ slug: product.slug || product.id }}
                      className="group flex flex-col cursor-pointer"
                    >
                      {/* Image Area */}
                      <div className="aspect-[4/5] w-full bg-white rounded-sm overflow-hidden relative shrink-0 mb-3 md:mb-4 border border-[#E9D8C3]">
                        {displayImage ? (
                          <img 
                            src={displayImage} 
                            alt={product.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
                            <PackageX className="w-6 h-6 opacity-50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-[#4A1F58]/0 group-hover:bg-[#4A1F58]/5 transition-colors duration-500" />
                        
                        {/* Hover Action */}
                        <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Heart className="w-4 h-4 md:w-5 md:h-5 text-zinc-400 hover:text-[#C9A15B]" />
                        </div>

                        {/* Badges */}
                        {isNew && (
                          <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-[#C9A15B] text-white text-[8px] md:text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-1 rounded-sm shadow-sm">
                            New
                          </div>
                        )}
                      </div>
                      
                      {/* Content Area */}
                      <div className="flex flex-col text-center px-1">
                        <span className="text-[9px] md:text-[10px] font-sans font-medium text-zinc-500 uppercase tracking-[0.15em] mb-1 md:mb-1.5 line-clamp-1">
                          {product.category?.name || category.name || "Jewellery"}
                        </span>
                        <h4 className="text-[12px] md:text-[14px] font-serif font-medium text-[#302832] line-clamp-1 mb-1.5 md:mb-2 group-hover:text-[#C9A15B] transition-colors">
                          {product.title || "Unnamed Product"}
                        </h4>
                        <span className="text-[13px] md:text-[16px] font-serif font-semibold text-[#4A1F58]">
                          {product.mrp != null ? `₹${Number(product.mrp).toLocaleString('en-IN')}` : "TBA"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}