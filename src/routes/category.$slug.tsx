import React, { useEffect, useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, PackageX, SlidersHorizontal, ChevronDown, Sparkles } from "lucide-react";
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
  const [parentCategory, setParentCategory] = useState<any>(null); // ✨ NEW: State for Parent Category
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
        // 1. Fetch the requested Category
        const { data: catData, error: catError } = await supabase
          .from("ecommerce_categories")
          .select("id, name, slug, parent_id")
          .ilike("slug", slug) 
          .eq("is_active", true)
          .maybeSingle(); 

        if (catError) throw catError;
        setCategory(catData);

        if (catData) {
          // ✨ NEW: Fetch the Parent Category if this is a subcategory
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

          // 2. Fetch all active subcategories of this category
          const { data: subCatsData } = await supabase
            .from("ecommerce_categories")
            .select("id, name, slug")
            .eq("parent_id", catData.id)
            .eq("is_active", true);

          setSubCategories(subCatsData || []);

          // 3. Build an array of IDs: [Parent ID, Child ID 1, Child ID 2, ...]
          const categoryIdsToFetch = [catData.id];
          if (subCatsData && subCatsData.length > 0) {
            subCatsData.forEach(sub => categoryIdsToFetch.push(sub.id));
          }

          // 4. Fetch Products matching ANY of those IDs using .in()
          const { data: prodData, error: prodError } = await supabase
            .from("ecommerce_products")
            .select("id, title, slug, mrp, cover_image_url, gallery_images, metal_type, purity_karat, category_id, created_at")
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

  // --- Dynamic Filter Extraction ---
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

  // --- Apply Filters & Sorting ---
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Quick Filters
    if (quickFilter === "latest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // 2. Sidebar Filters
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

    // 3. Sorting
    if (sortBy === "price_asc") result.sort((a, b) => Number(a.mrp) - Number(b.mrp));
    if (sortBy === "price_desc") result.sort((a, b) => Number(b.mrp) - Number(a.mrp));
    if (sortBy === "newest") result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result;
  }, [products, selectedPrices, selectedMetals, selectedPurities, selectedSubCats, sortBy, quickFilter]);

  // --- Toggles ---
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white text-center px-4">
        <PackageX className="w-12 h-12 text-zinc-300 mb-4" />
        <h1 className="text-2xl font-bold text-zinc-900">Category not found</h1>
        <p className="text-zinc-500 mt-2">The collection you are looking for does not exist or has been removed.</p>
        <Link to="/" className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-700">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans pb-24">
      
      {/* Category Header Area */}
      <div className="border-b border-zinc-200">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
          <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-2">
            <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            
            {/* ✨ NEW: Dynamic Parent Breadcrumb rendering */}
            {parentCategory && (
              <>
                <Link 
                  to="/category/$slug" 
                  params={{ slug: parentCategory.slug }} 
                  className="hover:text-zinc-900 transition-colors"
                >
                  {parentCategory.name}
                </Link>
                <span className="mx-2">/</span>
              </>
            )}
            
            <span className="text-zinc-900">{category.name}</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">{category.name}</h1>
            <span className="text-sm font-medium text-zinc-500">{products.length} Designs</span>
          </div>
        </div>
      </div>

      {/* Quick Filter Row */}
      <div className="border-b border-zinc-100 bg-zinc-50/50 sticky top-[72px] z-30 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setQuickFilter("all")}
            className={`shrink-0 px-5 py-2 rounded-full text-xs font-semibold transition-all border ${quickFilter === 'all' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'}`}
          >
            All
          </button>
          <button 
            onClick={() => setQuickFilter("fast_delivery")}
            className={`shrink-0 px-5 py-2 rounded-full text-xs font-semibold transition-all border ${quickFilter === 'fast_delivery' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'}`}
          >
            Fast Delivery
          </button>
          <button 
            onClick={() => setQuickFilter("latest")}
            className={`shrink-0 px-5 py-2 rounded-full text-xs font-semibold transition-all border ${quickFilter === 'latest' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'}`}
          >
            Latest Designs
          </button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* --- LEFT SIDEBAR (FILTERS) --- */}
          <aside className="hidden lg:block w-[260px] shrink-0">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200">
              <span className="text-xs font-bold tracking-widest uppercase text-zinc-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </span>
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase hover:text-indigo-800 transition-colors">
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-8">

              {/* Filter Block: Product Types (Subcategories) */}
              {subCategories.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center justify-between">
                    Style / Category <ChevronDown className="w-4 h-4 text-zinc-400" />
                  </h3>
                  <div className="space-y-3">
                    {subCategories.map((sub) => {
                      const count = products.filter(p => p.category_id === sub.id).length;
                      if (count === 0) return null;
                      return (
                        <label key={sub.id} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedSubCats.has(sub.id) ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-300 group-hover:border-zinc-400 bg-white'}`}>
                            {selectedSubCats.has(sub.id) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <input type="checkbox" className="hidden" onChange={() => toggleSet(selectedSubCats, sub.id, setSelectedSubCats)} />
                          <span className="text-sm text-zinc-600 group-hover:text-zinc-900 transition-colors flex-1">{sub.name}</span>
                          <span className="text-[10px] font-medium text-zinc-400">({count})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Filter Block: Price */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center justify-between">
                  Price <ChevronDown className="w-4 h-4 text-zinc-400" />
                </h3>
                <div className="space-y-3">
                  {PRICE_RANGES.map((range) => {
                    const count = products.filter(p => Number(p.mrp) >= range.min && Number(p.mrp) <= range.max).length;
                    if (count === 0) return null;
                    return (
                      <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedPrices.has(range.id) ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-300 group-hover:border-zinc-400 bg-white'}`}>
                          {selectedPrices.has(range.id) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" className="hidden" onChange={() => toggleSet(selectedPrices, range.id, setSelectedPrices)} />
                        <span className="text-sm text-zinc-600 group-hover:text-zinc-900 transition-colors flex-1">{range.label}</span>
                        <span className="text-[10px] font-medium text-zinc-400">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Filter Block: Metal Type */}
              {availableMetals.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center justify-between">
                    Metal Type <ChevronDown className="w-4 h-4 text-zinc-400" />
                  </h3>
                  <div className="space-y-3">
                    {availableMetals.map((metal) => (
                      <label key={metal.name} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedMetals.has(metal.name) ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-300 group-hover:border-zinc-400 bg-white'}`}>
                          {selectedMetals.has(metal.name) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" className="hidden" onChange={() => toggleSet(selectedMetals, metal.name, setSelectedMetals)} />
                        <span className="text-sm text-zinc-600 group-hover:text-zinc-900 transition-colors flex-1">{metal.name}</span>
                        <span className="text-[10px] font-medium text-zinc-400">({metal.count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter Block: Purity */}
              {availablePurities.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center justify-between">
                    Gold Purity <ChevronDown className="w-4 h-4 text-zinc-400" />
                  </h3>
                  <div className="space-y-3">
                    {availablePurities.map((purity) => (
                      <label key={purity.name} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedPurities.has(purity.name) ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-300 group-hover:border-zinc-400 bg-white'}`}>
                          {selectedPurities.has(purity.name) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" className="hidden" onChange={() => toggleSet(selectedPurities, purity.name, setSelectedPurities)} />
                        <span className="text-sm text-zinc-600 group-hover:text-zinc-900 transition-colors flex-1">{purity.name}</span>
                        <span className="text-[10px] font-medium text-zinc-400">({purity.count})</span>
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
            <div className="flex items-center justify-between lg:justify-end mb-6">
              <button className="lg:hidden flex items-center gap-2 text-sm font-semibold text-zinc-900 border border-zinc-200 px-4 py-2 rounded-lg">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-500">Sort By:</span>
                <select 
                  className="text-sm font-semibold text-zinc-900 bg-transparent outline-none cursor-pointer hover:text-indigo-600 transition-colors"
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
              <div className="py-24 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50 flex flex-col items-center">
                <PackageX className="w-10 h-10 text-zinc-300 mb-4" />
                <p className="text-sm font-bold text-zinc-500">No products match your current filters.</p>
                <button onClick={clearAllFilters} className="mt-4 text-xs font-bold text-indigo-600 hover:underline">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => {
                  const isNew = new Date().getTime() - new Date(product.created_at).getTime() < 14 * 24 * 60 * 60 * 1000;
                  const displayImage = product.cover_image_url || (product.gallery_images && product.gallery_images.length > 0 ? product.gallery_images[0] : null);

                  return (
                    <Link 
                      key={product.id} 
                      to="/product/$slug"
                      params={{ slug: product.slug }}
                      className="group flex flex-col bg-white rounded-xl border border-zinc-100 hover:border-zinc-200 hover:shadow-lg transition-all duration-300 overflow-hidden relative pb-4"
                    >
                      {/* Image Area */}
                      <div className="relative aspect-square overflow-hidden bg-zinc-50 p-6">
                        {isNew && (
                          <div className="absolute top-3 left-3 z-10 bg-amber-400 text-amber-950 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm">
                            Latest
                          </div>
                        )}
                        {displayImage ? (
                          <img 
                            src={displayImage} 
                            alt={product.title} 
                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-sm"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            <PackageX className="w-8 h-8 opacity-50" />
                          </div>
                        )}
                        {/* Hover Overlay Action */}
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                           <div className="bg-white p-2 rounded-full shadow-md text-zinc-600 hover:text-indigo-600">
                             <Sparkles className="w-4 h-4" />
                           </div>
                        </div>
                      </div>
                      
                      {/* Content Area */}
                      <div className="flex flex-col space-y-1.5 px-4 pt-4">
                        <div className="font-black text-[15px] text-zinc-900 tracking-tight">
                          ₹{Number(product.mrp).toLocaleString('en-IN')}
                        </div>
                        <h3 className="font-medium text-xs text-zinc-600 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {product.title}
                        </h3>
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