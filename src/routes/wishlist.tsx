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

  // 1. Load Wishlist IDs from Local Storage
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
    e.preventDefault(); 
    e.stopPropagation();

    const updatedIds = wishlistIds.filter(id => id !== productId);
    setWishlistIds(updatedIds);
    setProducts(products.filter(p => p.id !== productId));
    localStorage.setItem("pavitram_wishlist", JSON.stringify(updatedIds));
  };

  // Reusable Luxury Wishlist Product Card
  const WishlistCard = ({ product }: { product: any }) => {
    const displayImage = product.cover_image_url || (product.gallery_images && product.gallery_images.length > 0 ? product.gallery_images[0] : null);

    return (
      <Link 
        to="/product/$slug"
        params={{ slug: product.slug || product.id }}
        className="group flex flex-col bg-white border border-[#E9D8C3] rounded-sm hover:border-[#C9A15B] hover:shadow-sm transition-all duration-300 overflow-hidden relative"
      >
        {/* Image Area */}
        <div className="aspect-[4/5] w-full bg-[#F7F1E8]/30 overflow-hidden relative shrink-0">
          
          {/* Remove Button */}
          <button 
            onClick={(e) => removeFromWishlist(product.id, e)}
            className="absolute top-2 right-2 md:top-3 md:right-3 z-20 w-8 h-8 rounded-sm bg-white/80 backdrop-blur-sm border border-[#E9D8C3] flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 transition-colors"
            aria-label="Remove from wishlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {displayImage ? (
            <img 
              src={displayImage} 
              alt={product.title} 
              className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-zinc-300 font-bold uppercase">
              <PackageX className="w-8 h-8 opacity-50 mb-1" />
              No Image
            </div>
          )}
          <div className="absolute inset-0 bg-[#4A1F58]/0 group-hover:bg-[#4A1F58]/5 transition-colors duration-500 pointer-events-none" />
        </div>
        
        {/* Content Area */}
        <div className="flex flex-col text-center px-4 pt-4 pb-4 flex-1">
          <span className="text-[9px] md:text-[10px] font-sans font-medium text-zinc-500 uppercase tracking-[0.15em] mb-1 line-clamp-1">
            {product.category?.name || "Jewellery"}
          </span>
          <h3 className="font-serif font-medium text-[#302832] text-[13px] md:text-[15px] line-clamp-1 group-hover:text-[#C9A15B] transition-colors mb-2">
            {product.title}
          </h3>
          
          <div className="font-sans font-bold text-[#4A1F58] text-[14px] md:text-[16px] mb-4">
            {product.mrp != null ? `₹${Number(product.mrp).toLocaleString('en-IN')}` : "TBA"}
          </div>

          {/* Quick Add to Cart Action */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Implement Add to Cart logic here
              alert("Added to cart!");
            }}
            className="mt-auto w-full flex items-center justify-center gap-2 py-3 bg-white border border-[#4A1F58] text-[#4A1F58] hover:bg-[#4A1F58] hover:text-white rounded-sm text-[10px] font-sans font-bold uppercase tracking-[0.15em] transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
          </button>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#302832] pb-24 relative overflow-hidden">
      
      {/* --- PAGE HEADER --- */}
      <div className="bg-[#F7F1E8] border-b border-[#E9D8C3] relative overflow-hidden">
        {/* Subtle Background Watermark */}
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply"
        />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="text-[9px] md:text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4 md:mb-6">
            <Link to="/" className="hover:text-[#C9A15B] transition-colors">Home</Link>
            <span className="mx-3 opacity-50">/</span>
            <span className="text-[#302832]">Wishlist</span>
          </div>
          
          <div className="flex items-end justify-between">
            <h1 className="text-3xl md:text-5xl font-serif font-medium text-[#4A1F58]">
              My Wishlist 
            </h1>
            <span className="text-[10px] md:text-[11px] font-sans font-bold text-[#C9A15B] uppercase tracking-[0.2em] mb-1 md:mb-2">
              {wishlistIds.length} {wishlistIds.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 md:pt-12">
        
        {isLoading ? (
          // Loading Skeleton
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="w-full bg-[#F7F1E8]/30 border border-[#E9D8C3] rounded-sm animate-pulse flex flex-col">
                <div className="aspect-[4/5] bg-zinc-200/50 mb-3" />
                <div className="p-4 flex flex-col items-center gap-2">
                  <div className="h-2 w-1/3 bg-zinc-200/50 rounded" />
                  <div className="h-3 w-3/4 bg-zinc-200/50 rounded" />
                  <div className="h-4 w-1/2 bg-zinc-200/50 rounded mb-2" />
                  <div className="h-10 w-full bg-zinc-200/50 rounded-sm mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          // Empty State
          <div className="relative flex flex-col items-center justify-center py-24 md:py-32 bg-[#F7F1E8]/30 border border-[#E9D8C3] rounded-sm text-center px-4 overflow-hidden">
            <img 
              src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
              alt="Decorative Floral" 
              className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply z-0"
            />
            
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center border border-[#E9D8C3] mb-6 relative z-10 shadow-sm">
              <Heart className="w-8 h-8 md:w-10 md:h-10 text-[#C9A15B]" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#4A1F58] mb-3 relative z-10">
              Your wishlist is empty
            </h2>
            <p className="text-sm font-sans text-zinc-500 max-w-md mx-auto mb-8 relative z-10 leading-relaxed">
              Save your favorite Pavitram pieces here so you can easily find them later and build your dream collection.
            </p>
            
            {/* ✨ FIX: Correctly capitalized TanStack routing string */}
            <Link 
              to="/Shop" 
              className="px-10 py-3.5 bg-[#4A1F58] text-white text-[10px] font-sans font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#302832] transition-colors shadow-sm flex items-center gap-2 relative z-10"
            >
              Start Exploring <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          // Populated Wishlist Grid
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => (
              <WishlistCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}