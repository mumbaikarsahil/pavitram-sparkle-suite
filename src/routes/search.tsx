import React, { useEffect, useState, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon, PackageX, Loader2, ArrowRight, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Define the route (uses ?q= URL parameter if you want shareable search links)
export const Route = createFileRoute('/Search')({
  component: SearchPage,
});

// Popular default searches to show when the input is empty
const POPULAR_SEARCHES = ["Solitaire", "Bridal Set", "Gold Pendant", "Daily Wear", "Mens Ring", "Diamond Earrings"];

function SearchPage() {
  const navigate = useNavigate({ from: '/search' });
  // If you want to sync with URL, you can extract it here. Defaulting to local state for speed.
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the search bar when the page loads
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Debounce Logic: Wait 500ms after the user stops typing before setting the actual search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch Results from Supabase when the debounced query changes
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
        // Search across title, sku_reference, and legacy_item_no
        const { data, error } = await supabase
          .from("ecommerce_products")
          .select("*, category:ecommerce_categories(name)")
          .eq("is_live", true)
          .or(`title.ilike.%${debouncedQuery}%,sku_reference.ilike.%${debouncedQuery}%,legacy_item_no.ilike.%${debouncedQuery}%`)
          .order("created_at", { ascending: false })
          .limit(50); // Limit to top 50 results to keep it fast

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

  // Handle clicking a popular search tag
  const handlePopularSearchClick = (tag: string) => {
    setQuery(tag);
  };

  // Reusable Product Card (Matches your Shop & Category Pages exactly)
  const ProductCard = ({ product }: { product: any }) => (
    <Link 
      to="/product/$slug"
      params={{ slug: product.slug || product.id }}
      className="group flex flex-col bg-white rounded-xl border border-zinc-100 hover:border-zinc-200 hover:shadow-lg transition-all duration-300 overflow-hidden relative pb-4"
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-50 p-4 md:p-6">
        {product.cover_image_url ? (
          <img 
            src={product.cover_image_url} 
            alt={product.title} 
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-sm"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300">
            <PackageX className="w-8 h-8 opacity-50" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col space-y-1.5 px-4 pt-4 flex-1">
        <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          {product.category?.name || "Jewellery"}
        </span>
        <h3 className="font-medium text-xs md:text-sm text-zinc-600 line-clamp-2 group-hover:text-[#4A0B49] transition-colors leading-tight">
          {product.title}
        </h3>
        
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="font-black text-[14px] md:text-[16px] text-zinc-900 tracking-tight">
            {product.mrp != null ? `₹${Number(product.mrp).toLocaleString('en-IN')}` : "TBA"}
          </div>
          <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-[#4A0B49] group-hover:bg-[#4A0B49] group-hover:text-white transition-colors">
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 pb-24">
      
      {/* 1. Search Header Area */}
      <div className="sticky top-[56px] md:top-[72px] z-40 bg-white/90 backdrop-blur-xl border-b border-zinc-200 shadow-sm">
        <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="relative flex items-center w-full bg-zinc-50 border-2 border-zinc-200 rounded-full focus-within:border-[#4A0B49] focus-within:bg-white focus-within:shadow-[0_8px_30px_rgba(74,11,73,0.08)] transition-all overflow-hidden h-12 md:h-16">
            <SearchIcon className="absolute left-4 md:left-6 w-5 h-5 md:w-6 md:h-6 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for rings, necklaces, collections..."
              className="w-full h-full pl-12 md:pl-16 pr-12 text-sm md:text-lg font-medium outline-none bg-transparent placeholder:text-zinc-400 text-zinc-900"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button 
                onClick={() => setQuery("")}
                className="absolute right-4 md:right-6 text-zinc-400 hover:text-zinc-800 font-bold text-xs uppercase tracking-widest"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-8">
        
        {/* 2. Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#4A0B49] mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">Searching Collection...</p>
          </div>
        )}

        {/* 3. Empty / Initial State (Trending Searches) */}
        {!hasSearched && !isLoading && (
          <div className="max-w-[800px] mx-auto mt-4 md:mt-10">
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-fuchsia-500" />
              <h2 className="text-lg md:text-xl font-black text-zinc-900 tracking-tight">Popular Searches</h2>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {POPULAR_SEARCHES.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handlePopularSearchClick(tag)}
                  className="px-4 py-2 bg-zinc-50 border border-zinc-200 hover:border-purple-300 hover:bg-purple-50 text-zinc-700 hover:text-[#4A0B49] rounded-full text-xs md:text-sm font-bold transition-all shadow-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Results State */}
        {hasSearched && !isLoading && (
          <div>
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4">
              <h2 className="text-sm md:text-base font-medium text-zinc-500">
                Found <span className="font-bold text-zinc-900">{results.length}</span> results for <span className="text-zinc-900 font-bold">"{debouncedQuery}"</span>
              </h2>
            </div>

            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
                <PackageX className="w-12 h-12 text-zinc-300 mb-4" />
                <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-2">No products found</h3>
                <p className="text-sm text-zinc-500 text-center max-w-sm mb-6">
                  We couldn't find anything matching "{debouncedQuery}". Try checking your spelling or using more general terms.
                </p>
                <button 
                  onClick={() => setQuery("")}
                  className="px-6 py-2.5 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
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