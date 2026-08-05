import React, { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Trash2, ShoppingBag, PackageX, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/wishlist')({
  component: WishlistPage,
});

function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Load Wishlist IDs from Local Storage (or replace with Supabase auth fetch)
  useEffect(() => {
    const loadWishlist = () => {
      try {
        const stored = localStorage.getItem("pavitram_wishlist");
        if (stored) {
          setWishlistIds(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Failed to parse wishlist from local storage", err);
      }
    };
    loadWishlist();
  }, []);

  // 2. Fetch full product details from Supabase based on those IDs
  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("ecommerce_products")
          .select("*, category:ecommerce_categories(name)")
          .in("id", wishlistIds)
          .eq("is_live", true);

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching wishlist products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistIds]);

  // 3. Remove Item Handler
  const removeFromWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent triggering the Link navigation
    e.stopPropagation();

    const updatedIds = wishlistIds.filter(id => id !== productId);
    setWishlistIds(updatedIds);
    setProducts(products.filter(p => p.id !== productId));
    localStorage.setItem("pavitram_wishlist", JSON.stringify(updatedIds));
  };

  // Reusable Wishlist Product Card
  const WishlistCard = ({ product }: { product: any }) => (
    <Link 
      to="/product/$slug"
      params={{ slug: product.slug || product.id }}
      className="group flex flex-col bg-white rounded-xl md:rounded-[20px] border border-zinc-100 hover:border-purple-200 hover:shadow-[0_10px_30px_rgba(74,11,73,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden relative pb-3 md:pb-4"
    >
      {/* Image Area */}
      <div className="relative aspect-square overflow-hidden bg-zinc-50 p-4 md:p-6 shrink-0">
        
        {/* Remove Button */}
        <button 
          onClick={(e) => removeFromWishlist(product.id, e)}
          className="absolute top-2 right-2 md:top-3 md:right-3 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="Remove from wishlist"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {product.cover_image_url ? (
          <img 
            src={product.cover_image_url} 
            alt={product.title} 
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-sm"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-zinc-300 font-bold uppercase">
            <PackageX className="w-8 h-8 opacity-50 mb-1" />
            No Image
          </div>
        )}
      </div>
      
      {/* Content Area */}
      <div className="flex flex-col space-y-1 md:space-y-1.5 px-3 md:px-4 pt-3 md:pt-4 flex-1">
        <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          {product.category?.name || "Jewellery"}
        </span>
        <h3 className="font-medium text-xs md:text-sm text-zinc-600 line-clamp-2 group-hover:text-[#4A0B49] transition-colors leading-tight">
          {product.title}
        </h3>
        
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="font-black text-sm md:text-base text-zinc-900 tracking-tight">
            {product.mrp != null ? `₹${Number(product.mrp).toLocaleString('en-IN')}` : "TBA"}
          </div>
        </div>

        {/* Quick Add to Cart Action */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Implement your Add to Cart logic here
            alert("Added to cart!");
          }}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold uppercase tracking-widest text-zinc-700 hover:bg-[#4A0B49] hover:border-[#4A0B49] hover:text-white transition-all shadow-sm"
        >
          <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
        </button>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 pb-24 relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuchsia-50/50 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header Area */}
      <div className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-[56px] md:top-[72px] z-30">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 md:py-6 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-1">
              <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-zinc-900">Wishlist</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
              My Wishlist 
              <span className="text-sm font-medium text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full ml-2">
                {wishlistIds.length} {wishlistIds.length === 1 ? 'Item' : 'Items'}
              </span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-8 md:pt-10">
        
        {isLoading ? (
          // Loading Skeleton
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="w-full bg-zinc-50 border border-zinc-100 rounded-xl md:rounded-[20px] p-3 animate-pulse">
                <div className="aspect-square bg-zinc-200/60 rounded-lg mb-3" />
                <div className="h-3 w-1/3 bg-zinc-200/60 rounded mb-2" />
                <div className="h-4 w-3/4 bg-zinc-200/60 rounded mb-4" />
                <div className="h-5 w-1/2 bg-zinc-200/60 rounded mb-4" />
                <div className="h-10 w-full bg-zinc-200/60 rounded-lg" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 md:py-32 bg-[#FFF9E6]/50 rounded-[24px] md:rounded-[40px] border border-amber-900/5 shadow-sm text-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-50/40 via-transparent to-transparent pointer-events-none" />
            
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(74,11,73,0.1)] mb-6 relative z-10">
              <Heart className="w-10 h-10 md:w-12 md:h-12 text-zinc-300" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-xl md:text-3xl font-black text-zinc-900 tracking-tight mb-2 md:mb-3 relative z-10">
              Your wishlist is empty
            </h2>
            <p className="text-sm md:text-base text-zinc-500 max-w-md mx-auto mb-8 relative z-10">
              Save your favorite Pavitram pieces here so you can easily find them later and build your dream collection.
            </p>
            
            <Link 
              to="/shop" 
              className="px-8 py-3.5 bg-zinc-900 text-white text-xs md:text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-[#4A0B49] transition-colors shadow-lg shadow-zinc-900/20 flex items-center gap-2 relative z-10"
            >
              Start Exploring <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          // Populated Wishlist Grid
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {products.map((product) => (
              <WishlistCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}