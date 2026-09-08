import React, { useEffect, useState, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon, PackageX, Loader2, TrendingUp, Heart, ArrowRight, Diamond } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/Search')({
  component: SearchPage,
});

const POPULAR_SEARCHES = ["Solitaire", "Bridal Set", "Gold Pendant", "Daily Wear", "Mens Ring", "Diamond Earrings"];

function SearchPage() {
  const navigate = useNavigate({ from: '/Search' });
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ✨ NEW: Live Suggestions State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ✨ NEW: Dynamic Category State
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoryPage, setCategoryPage] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search bar
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Fetch Initial Categories for the Grid
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("ecommerce_categories")
          .select("*")
          .eq("is_active", true)
          .is("parent_id", null) // Fetch top-level categories
          .order("name");
        
        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setIsCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Live Suggestions Fetching (Triggers immediately on typing)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length > 1) {
        const { data } = await supabase
          .from("ecommerce_products")
          .select("id, title, slug")
          .ilike("title", `%${query}%`)
          .eq("is_live", true)
          .limit(5);
        
        setSuggestions(data || []);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [query]);

  // Debounce Logic for Main Search Grid
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch Main Results
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);
      
      try {
        const { data, error } = await supabase
          .from("ecommerce_products")
          .select("*, category:ecommerce_categories(name)")
          .eq("is_live", true)
          .or(`title.ilike.%${debouncedQuery}%,sku_reference.ilike.%${debouncedQuery}%,legacy_item_no.ilike.%${debouncedQuery}%`)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedQuery]);

  const handlePopularSearchClick = (tag: string) => {
    setQuery(tag);
    setShowSuggestions(false);
  };

  // Pagination Logic for Categories Grid
  const ITEMS_PER_PAGE = 4;
  const totalCategoryPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const currentCategories = categories.slice(
    categoryPage * ITEMS_PER_PAGE,
    (categoryPage + 1) * ITEMS_PER_PAGE
  );

  // Swipe Handlers for Categories
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && categoryPage < totalCategoryPages - 1) setCategoryPage(p => p + 1);
    if (isRightSwipe && categoryPage > 0) setCategoryPage(p => p - 1);
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Reusable Product Card
  const ProductCard = ({ product }: { product: any }) => {
    const displayImage = product.cover_image_url || (product.gallery_images && product.gallery_images.length > 0 ? product.gallery_images[0] : null);

    return (
      <Link 
        to="/product/$slug"
        params={{ slug: product.slug || product.id }}
        className="group flex flex-col cursor-pointer"
      >
        <div className="aspect-[4/5] w-full bg-white border border-[#E9D8C3] rounded-sm overflow-hidden relative shrink-0 mb-3 md:mb-4">
          {displayImage ? (
            <img 
              src={displayImage} 
              alt={product.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300">
              <PackageX className="w-6 h-6 opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-[#4A1F58]/0 group-hover:bg-[#4A1F58]/5 transition-colors duration-500" />
          <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="w-4 h-4 md:w-5 md:h-5 text-zinc-400 hover:text-[#C9A15B]" />
          </div>
        </div>
        
        <div className="flex flex-col text-center px-1">
          <span className="text-[9px] md:text-[10px] font-sans font-medium text-zinc-500 uppercase tracking-[0.15em] mb-1 line-clamp-1">
            {product.category?.name || "Jewellery"}
          </span>
          <h4 className="text-[12px] md:text-[14px] font-serif font-medium text-[#302832] line-clamp-1 mb-1.5 group-hover:text-[#C9A15B] transition-colors">
            {product.title}
          </h4>
          <span className="text-[13px] md:text-[16px] font-sans font-bold text-[#4A1F58]">
            {product.mrp != null ? `₹${Number(product.mrp).toLocaleString('en-IN')}` : "TBA"}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#302832] pb-24">
      
      {/* 1. Search Header Area */}
      <div className="sticky top-[56px] md:top-[72px] z-40 bg-white/95 backdrop-blur-xl border-b border-[#E9D8C3] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 relative">
          
          <div className="relative flex items-center w-full bg-[#F7F1E8]/50 border border-[#E9D8C3] rounded-sm focus-within:border-[#C9A15B] focus-within:bg-white focus-within:shadow-sm transition-all overflow-hidden h-12 md:h-16">
            <SearchIcon className="absolute left-4 md:left-6 w-5 h-5 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for rings, necklaces, collections..."
              className="w-full h-full pl-12 md:pl-16 pr-20 text-sm md:text-base font-sans outline-none bg-transparent placeholder:text-zinc-400 text-[#302832]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (query.trim().length > 1) setShowSuggestions(true);
              }}
              onBlur={() => {
                // Delay hiding slightly so clicks on suggestions register first
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />
            {query && (
              <button 
                onClick={() => {
                  setQuery("");
                  setShowSuggestions(false);
                }}
                className="absolute right-4 md:right-6 text-zinc-400 hover:text-[#4A1F58] font-sans font-bold text-[10px] uppercase tracking-widest transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* ✨ LIVE SUGGESTIONS DROPDOWN */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-[105%] left-4 right-4 md:left-8 md:right-8 bg-white border border-[#E9D8C3] shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-sm z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <ul className="py-2">
                {suggestions.map((suggestion) => (
                  <li key={suggestion.id}>
                    <button
                      className="w-full text-left px-6 py-3.5 font-sans text-sm text-zinc-600 hover:bg-[#F7F1E8] hover:text-[#4A1F58] transition-colors flex items-center gap-4 group"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevents input blur from firing before click
                        setQuery(suggestion.title);
                        setShowSuggestions(false);
                      }}
                    >
                      <SearchIcon className="w-4 h-4 text-zinc-300 group-hover:text-[#C9A15B] transition-colors" />
                      {suggestion.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 md:pt-12">
        
        {/* 2. Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#C9A15B] mb-4" />
            <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#4A1F58]">Searching Collection...</p>
          </div>
        )}

        {/* 3. Empty / Initial State */}
        {!hasSearched && !isLoading && (
          <div className="animate-in fade-in duration-700">
            
            {/* Popular Searches */}
            <div className="max-w-[900px] mx-auto mt-4 md:mt-8 text-center">
              <h2 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6">Trending Now</h2>
              
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-4 md:gap-x-8">
                {POPULAR_SEARCHES.map((tag, idx) => (
                  <React.Fragment key={tag}>
                    <button
                      onClick={() => handlePopularSearchClick(tag)}
                      className="text-sm md:text-lg font-serif italic text-[#4A1F58] hover:text-[#C9A15B] transition-colors"
                    >
                      {tag}
                    </button>
                    {idx < POPULAR_SEARCHES.length - 1 && (
                      <span className="w-1 h-1 rounded-full bg-[#C9A15B]/40 hidden md:block" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* ✨ DYNAMIC CATEGORY GRID SECTION */}
            <section className="relative mt-16 md:mt-24 pt-12 md:pt-16 pb-12 md:pb-24 border-t border-[#E9D8C3] z-20 overflow-hidden bg-[#F7F1E8]/30 rounded-sm">
              <img 
                src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
                alt="Decorative Background" 
                className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply"
              />

              <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-20 relative z-10 px-4 md:px-8">
                
                <div className="w-full lg:w-2/5 text-center lg:text-left">
                  <h2 className="text-[28px] sm:text-3xl md:text-4xl lg:text-5xl font-serif text-[#302832] leading-tight mb-4 md:mb-6">
                    Discover Your <br/>
                    <span className="text-[#C9A15B] italic font-light">Signature Style</span>
                  </h2>
                  <p className="text-[11px] md:text-sm font-sans text-zinc-600 max-w-[280px] md:max-w-md mx-auto lg:mx-0 leading-relaxed px-2 md:px-0">
                    From timeless essentials to bold statement pieces, explore our meticulously crafted collections designed to elevate your everyday elegance.
                  </p>
                </div>
                
                <div className="w-full lg:w-3/5 flex flex-col gap-5 md:gap-6">
                  {isCategoriesLoading ? (
                    <div className="flex w-full justify-center opacity-50 py-10"><Loader2 className="animate-spin text-[#C9A15B] w-8 h-8"/></div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-10 text-sm text-zinc-400 font-sans">No categories found.</div>
                  ) : (
                    <>
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
                                <h3 className="text-white font-serif font-medium text-[15px] md:text-xl tracking-wide drop-shadow-sm leading-none">
                                  {cat.name}
                                </h3>
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-full border border-[#C9A15B]/40 flex items-center justify-center shrink-0 group-hover:bg-[#C9A15B] group-hover:border-[#C9A15B] text-white transition-colors backdrop-blur-sm bg-black/20">
                                   <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </div>
                             </div>
                           </Link>
                        ))}
                      </div>

                      {totalCategoryPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-2 md:mt-4">
                          {Array.from({ length: totalCategoryPages }).map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCategoryPage(idx)}
                              aria-label={`Go to category page ${idx + 1}`}
                              className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
                                idx === categoryPage 
                                  ? 'bg-[#C9A15B] scale-110' 
                                  : 'border-[1.5px] border-[#C9A15B] bg-transparent hover:bg-[#C9A15B]/30'
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

          </div>
        )}

        {/* 4. Results State */}
        {hasSearched && !isLoading && (
          <div>
            <div className="mb-8 flex items-center justify-between border-b border-[#E9D8C3] pb-4">
              <h2 className="text-[11px] md:text-xs font-sans text-zinc-500 uppercase tracking-widest">
                Found <span className="font-bold text-[#4A1F58]">{results.length}</span> results for <span className="text-[#4A1F58] font-bold">"{debouncedQuery}"</span>
              </h2>
            </div>

            {results.length === 0 ? (
              <div className="relative flex flex-col items-center justify-center py-24 md:py-32 bg-[#F7F1E8]/30 rounded-sm border border-[#E9D8C3] overflow-hidden">
                <img 
                  src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
                  alt="Decorative Floral" 
                  className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply z-0"
                />
                <div className="relative z-10 flex flex-col items-center">
                  <PackageX className="w-12 h-12 text-[#C9A15B] mb-4 opacity-50" />
                  <h3 className="text-2xl font-serif font-medium text-[#4A1F58] mb-3">No designs found</h3>
                  <p className="text-sm font-sans text-zinc-500 text-center max-w-sm mb-8 leading-relaxed">
                    We couldn't find anything matching "{debouncedQuery}". Try checking your spelling or using more general terms.
                  </p>
                  <button 
                    onClick={() => setQuery("")}
                    className="px-8 py-3 bg-[#4A1F58] text-white text-[10px] font-sans font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#302832] transition-colors shadow-sm"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}