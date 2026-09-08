import React, { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "@tanstack/react-router";
import { StoreLocator } from "@/components/site/StoreLocator";
import { 
  Loader2, PackageX, ChevronRight, Ruler, Gem, ShieldCheck, 
  Truck, MessageCircle, Heart, ShoppingBag, Play, MapPin, 
  ArrowRight, Star, Award, X, Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/product/$slug')({
  component: ProductPage,
});

export default function ProductPage() {
  const { slug } = Route.useParams();
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Media Gallery State
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mediaItems, setMediaItems] = useState<{ type: 'image' | 'video', url: string }[]>([]);

  // Image Zoom State
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

  // Mobile Fullscreen Modal State
  const [isMobileZoomOpen, setIsMobileZoomOpen] = useState(false);
  const [mobileZoomIndex, setMobileZoomIndex] = useState(0);

  // Real Reviews Form State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, text: '', consent: false });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitMessage, setReviewSubmitMessage] = useState("");

  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1);
    navigate({ to: "/cart" });
  };

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setIsLoading(true);
      try {
        const { data: prodData, error: prodError } = await supabase
          .from("ecommerce_products")
          .select(`*, category:ecommerce_categories(id, name, slug)`)
          .eq("slug", slug)
          .eq("is_live", true)
          .maybeSingle();

        if (prodError) throw prodError;
        setProduct(prodData);

        if (prodData) {
          const items: { type: 'image' | 'video', url: string }[] = [];
          if (prodData.video_url) items.push({ type: 'video', url: prodData.video_url });
          if (prodData.gallery_images && Array.isArray(prodData.gallery_images)) {
            prodData.gallery_images.forEach((img: string) => items.push({ type: 'image', url: img }));
          } else if (prodData.cover_image_url) {
            items.push({ type: 'image', url: prodData.cover_image_url });
          }
          setMediaItems(items);

          // Fetch Related Products
          if (prodData.category?.id) {
            const { data: relatedData } = await supabase
              .from("ecommerce_products")
              .select("id, title, slug, mrp, cover_image_url, gallery_images, metal_type, purity_karat, created_at")
              .eq("category_id", prodData.category.id)
              .eq("is_live", true)
              .neq("id", prodData.id)
              .order("created_at", { ascending: false })
              .limit(6);
            setRelatedProducts(relatedData || []);
          }

          // Fetch Real Reviews for this product
          try {
            const { data: reviewData } = await supabase
              .from("ecommerce_reviews")
              .select("*")
              .eq("product_id", prodData.id)
              .order("created_at", { ascending: false });
            setReviews(reviewData || []);
          } catch (e) {
            console.log("Review table might not exist yet, skipping reviews fetch.");
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchProductAndRelated();
  }, [slug]);

  // Handle Image Hover Zoom (Desktop only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeMedia.type !== 'image') return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.2)'
    });
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.consent) {
      alert("Please consent to the DPDP Act guidelines to submit a review.");
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      const { error } = await supabase.from("ecommerce_reviews").insert({
        product_id: product.id,
        user_name: reviewForm.name,
        rating: reviewForm.rating,
        review_text: reviewForm.text,
        is_verified: false // Requires moderation before showing "Verified"
      });

      if (error) throw error;

      setReviewSubmitMessage("Thank you! Your review has been submitted for moderation.");
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSubmitMessage("");
        setReviewForm({ name: '', rating: 5, text: '', consent: false });
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while submitting your review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F1E8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A15B]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#F7F1E8] text-center px-4">
        <PackageX className="w-12 h-12 text-[#C9A15B] mb-4 opacity-50" />
        <h1 className="text-2xl font-serif text-[#4A1F58]">Product Not Found</h1>
        <p className="text-sm font-sans text-zinc-500 mt-2">The design you are looking for might have been removed or is currently out of stock.</p>
        <Link to="/" className="mt-6 text-[10px] font-sans font-bold uppercase tracking-widest text-[#C9A15B] hover:text-[#4A1F58] transition-colors">← Back to Home</Link>
      </div>
    );
  }

  const activeMedia = mediaItems[activeMediaIndex] || { type: 'image', url: '' };
  
  // Calculate average rating dynamically
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : "5.0";

  return (
    <div className="min-h-screen bg-white font-sans pb-32 lg:pb-24">
      
      {/* --- BREADCRUMBS --- */}
      <div className="hidden md:block border-b border-[#E9D8C3] bg-[#F7F1E8]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-zinc-400 overflow-x-auto hide-scrollbar whitespace-nowrap">
          <Link to="/" className="hover:text-[#C9A15B] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 mx-2 opacity-50 shrink-0" />
          {product.category && (
            <>
              <Link to="/category/$slug" params={{ slug: product.category.slug }} className="hover:text-[#C9A15B] transition-colors">
                {product.category.name}
              </Link>
              <ChevronRight className="w-3 h-3 mx-2 opacity-50 shrink-0" />
            </>
          )}
          <span className="text-[#4A1F58] truncate">{product.title}</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-0 md:px-8 pt-0 md:pt-10">
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-12">
          
          {/* ========================================================= */}
          {/* LEFT: MEDIA GALLERY */}
          {/* ========================================================= */}
          <div className="w-full lg:w-[58%] shrink-0">
            
            {/* Mobile Horizontal Swipe Gallery */}
            <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory hide-scrollbar bg-white border-b border-[#E9D8C3]">
              {mediaItems.length === 0 ? (
                <div className="w-full aspect-square flex items-center justify-center snap-center shrink-0">
                  <PackageX className="w-12 h-12 text-zinc-300" />
                </div>
              ) : (
                mediaItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="w-full aspect-square flex items-center justify-center snap-center shrink-0 p-8 relative cursor-pointer"
                    onClick={() => {
                      setMobileZoomIndex(idx);
                      setIsMobileZoomOpen(true);
                    }}
                  >
                    {item.type === 'video' ? (
                      <video src={item.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} alt={`${product.title} view ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply pointer-events-none" />
                    )}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                      {mediaItems.map((_, dotIdx) => (
                        <div key={dotIdx} className={`h-1.5 rounded-full transition-all ${idx === dotIdx ? 'w-4 bg-[#C9A15B]' : 'w-1.5 bg-[#E9D8C3]'}`} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* MOBILE FULLSCREEN IMAGE MODAL */}
            {isMobileZoomOpen && mediaItems.length > 0 && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md lg:hidden">
                <button
                  onClick={() => setIsMobileZoomOpen(false)}
                  className="absolute top-6 right-6 text-white z-[101] p-3 bg-white/10 hover:bg-white/20 rounded-sm backdrop-blur-md transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="w-full h-full flex items-center justify-center p-4">
                  {mediaItems[mobileZoomIndex]?.type === 'video' ? (
                    <video src={mediaItems[mobileZoomIndex].url} controls autoPlay loop playsInline className="w-full h-auto max-h-[85vh] object-contain" />
                  ) : (
                    <img src={mediaItems[mobileZoomIndex]?.url} alt={`${product.title} zoomed`} className="w-full h-auto max-h-[85vh] object-contain" />
                  )}
                </div>
                {mediaItems.length > 1 && (
                  <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-8 z-[101]">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileZoomIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1);
                      }}
                      className="p-4 rounded-sm bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all"
                    >
                      <ChevronRight className="w-7 h-7 rotate-180" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileZoomIndex(prev => prev === mediaItems.length - 1 ? 0 : prev + 1);
                      }}
                      className="p-4 rounded-sm bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all"
                    >
                      <ChevronRight className="w-7 h-7" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Desktop Layout: Left Thumbnails + Right Zoom Viewer */}
            <div className="hidden lg:flex gap-4 h-[650px] sticky top-28">
              {/* Vertical Thumbnails */}
              {mediaItems.length > 1 && (
                <div className="w-20 shrink-0 flex flex-col gap-3 overflow-y-auto hide-scrollbar py-1">
                  {mediaItems.map((item, idx) => (
                    <button
                      key={idx}
                      onMouseEnter={() => setActiveMediaIndex(idx)}
                      className={`relative w-20 h-24 shrink-0 rounded-sm overflow-hidden border transition-all bg-[#F7F1E8] ${
                        activeMediaIndex === idx ? 'border-[#C9A15B] shadow-sm' : 'border-transparent hover:border-[#E9D8C3] opacity-70 hover:opacity-100'
                      }`}
                    >
                      {item.type === 'video' ? (
                        <>
                          <video src={item.url} className="w-full h-full object-cover pointer-events-none" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Play className="w-6 h-6 text-white fill-white" />
                          </div>
                        </>
                      ) : (
                        <img src={item.url} className="w-full h-full object-contain mix-blend-multiply p-2" alt={`Thumbnail ${idx}`} />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Main Hover-Zoom Viewer */}
              <div 
                className="flex-1 relative bg-white border border-[#E9D8C3] rounded-sm overflow-hidden flex items-center justify-center cursor-crosshair group"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => { setIsZoomed(false); setZoomStyle({}); }}
              >
                {mediaItems.length === 0 ? (
                  <PackageX className="w-12 h-12 text-[#E9D8C3]" />
                ) : activeMedia.type === 'video' ? (
                  <video src={activeMedia.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full p-12 overflow-hidden relative bg-[#F7F1E8]/30">
                    <img 
                      src={activeMedia.url} 
                      alt={product.title} 
                      className={`w-full h-full object-contain mix-blend-multiply transition-transform duration-200 ease-out ${isZoomed ? 'opacity-0' : 'opacity-100'}`} 
                    />
                    {/* Zoomed Image Overlay */}
                    <img 
                      src={activeMedia.url} 
                      alt={product.title} 
                      className={`absolute inset-0 w-full h-full object-contain mix-blend-multiply transition-opacity duration-200 pointer-events-none ${isZoomed ? 'opacity-100' : 'opacity-0'}`}
                      style={isZoomed ? zoomStyle : {}}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: PRODUCT DETAILS */}
          {/* ========================================================= */}
          <div className="w-full lg:w-[42%] flex flex-col px-4 md:px-0 pt-6">
            
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h1 className="text-3xl md:text-[38px] font-medium text-[#302832] leading-tight font-serif mb-2">
                  {product.title}
                </h1>
                <p className="text-[10px] font-sans font-bold text-zinc-400 mt-1 tracking-[0.2em] uppercase">
                  {product.sku_reference ? `SKU: ${product.sku_reference}` : 'Exclusive Design'}
                </p>
              </div>
              <button className="w-10 h-10 shrink-0 rounded-sm border border-[#E9D8C3] flex items-center justify-center text-zinc-400 hover:text-[#C9A15B] hover:border-[#C9A15B] transition-all bg-white">
                <Heart className="w-4 h-4" />
              </button>
            </div>

            {/* Reviews Quick Link */}
            <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}>
              <div className="flex text-[#C9A15B]">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className={`w-3.5 h-3.5 ${Number(avgRating) >= 4.8 ? 'fill-current' : 'fill-transparent stroke-current'}`} />
              </div>
              <span className="text-xs font-sans text-zinc-500 hover:text-[#4A1F58] transition-colors">{avgRating} ({reviews.length} reviews)</span>
            </div>

            <div className="flex items-end gap-3 mb-8 mt-2">
              <span className="text-2xl md:text-3xl font-sans font-bold text-[#302832]">
                ₹{Number(product.mrp).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-sans font-medium text-zinc-500 mb-1.5 uppercase tracking-widest">(MRP Inclusive of all taxes)</span>
            </div>

            {/* Quick Specs Highlight Box */}
            <div className="flex border border-[#E9D8C3] rounded-sm overflow-hidden mb-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] bg-[#F7F1E8]/30">
              <div className="flex-1 p-3.5 text-center border-r border-[#E9D8C3]">
                <span className="text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-zinc-400 block mb-1">Metal</span>
                <span className="text-sm font-sans font-medium text-[#302832]">{product.purity_karat || '18K'} {product.metal_color || ''} {product.metal_type || 'Gold'}</span>
              </div>
              <div className="flex-1 p-3.5 text-center">
                <span className="text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-zinc-400 block mb-1">Diamond</span>
                <span className="text-sm font-sans font-medium text-[#302832]">
                  {product.diamond_color && product.diamond_clarity 
                    ? `${product.diamond_color}-${product.diamond_clarity}` 
                    : (product.stone_weight_cts > 0 ? `${product.stone_weight_cts} Cts` : 'N/A')}
                </span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:grid grid-cols-2 gap-3 mb-10">
              <button 
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 bg-[#4A1F58] hover:bg-[#302832] text-white h-12 rounded-sm text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-colors shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Bag
              </button>
              <a 
                href={`https://wa.me/918356834764?text=${encodeURIComponent(
                  `Hi! I am interested in this product: ${product?.title || 'Jewellery'}.\n\n` +
                  (product?.sku_reference ? `SKU: ${product.sku_reference}\n` : '') +
                  `Please share more details.\nLink: ${typeof window !== 'undefined' ? window.location.href : ''}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white border border-[#4A1F58] hover:bg-[#4A1F58] text-[#4A1F58] hover:text-white h-12 rounded-sm text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>

            {/* Delivery & Pincode Checker */}
            <div className="space-y-4 mb-10">
              <div className="border border-[#E9D8C3] rounded-sm p-1 pl-4 flex items-center justify-between bg-white focus-within:border-[#C9A15B] transition-colors">
                 <div className="flex items-center gap-3 w-full">
                   <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                   <input type="text" placeholder="Enter Pincode for Delivery Date" className="w-full h-10 text-sm font-sans outline-none bg-transparent placeholder:text-zinc-400" />
                 </div>
                 <button className="text-[10px] font-sans font-bold tracking-[0.15em] text-[#4A1F58] uppercase px-4 h-full shrink-0 hover:text-[#C9A15B] transition-colors">CHECK</button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-4 p-4 rounded-sm bg-[#F7F1E8]/50 border border-[#E9D8C3]">
                  <Truck className="w-5 h-5 text-[#C9A15B] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-sans font-bold text-[#302832]">Free Express Delivery</h4>
                    <p className="text-xs font-sans text-zinc-500 mt-1 leading-relaxed">Ready to dispatch in {product.manufacturing_buffer_days} Days. Fully insured transit via trusted logistics partners.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* --- DETAILED SPECIFICATIONS --- */}
            <div className="space-y-6">
              <h3 className="text-lg font-serif font-medium text-[#4A1F58] border-b border-[#E9D8C3] pb-4">Product Details</h3>
              
              {product.description && (
                <div className="text-sm font-sans text-zinc-600 leading-relaxed mb-6 space-y-3">
                  {product.description
                    .split(/\\n|\n/) 
                    .filter((line: string) => line.trim() !== '') 
                    .map((line: string, i: number) => (
                      <p key={i}>{line.trim()}</p>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-8">
                {/* Metal Details */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#C9A15B] flex items-center gap-2">
                    <Ruler className="w-3.5 h-3.5" /> Metal Information
                  </h4>
                  <dl className="space-y-2 text-sm font-sans">
                    <div className="flex justify-between border-b border-[#E9D8C3]/50 pb-2">
                      <dt className="text-zinc-500">Metal Type</dt>
                      <dd className="font-medium text-[#302832] text-right">{product.purity_karat} {product.metal_color} {product.metal_type}</dd>
                    </div>
                    {product.gross_weight_g > 0 && (
                      <div className="flex justify-between pt-2 border-b border-[#E9D8C3]/50 pb-2">
                        <dt className="text-zinc-500">Gross Weight</dt>
                        <dd className="font-medium text-[#302832]">{product.gross_weight_g} g</dd>
                      </div>
                    )}
                    {product.net_weight_g > 0 && (
                      <div className="flex justify-between pt-2 border-b border-[#E9D8C3]/50 pb-2">
                        <dt className="text-zinc-500">Net Weight</dt>
                        <dd className="font-medium text-[#302832]">{product.net_weight_g} g</dd>
                      </div>
                    )}
                    {product.item_size && (
                      <div className="flex justify-between pt-2 border-b border-[#E9D8C3]/50 pb-2">
                        <dt className="text-zinc-500">Dimensions/Size</dt>
                        <dd className="font-medium text-[#302832]">{product.item_size}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Stone Details */}
                {(product.stone_weight_cts > 0 || product.diamond_shape) && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#C9A15B] flex items-center gap-2">
                      <Gem className="w-3.5 h-3.5" /> Diamond & Stones
                    </h4>
                    <dl className="space-y-2 text-sm font-sans">
                      {product.diamond_shape && (
                        <div className="flex justify-between border-b border-[#E9D8C3]/50 pb-2">
                          <dt className="text-zinc-500">Shape</dt>
                          <dd className="font-medium text-[#302832] text-right">{product.diamond_shape}</dd>
                        </div>
                      )}
                      {(product.diamond_color || product.diamond_clarity) && (
                        <div className="flex justify-between pt-2 border-b border-[#E9D8C3]/50 pb-2">
                          <dt className="text-zinc-500">Color & Clarity</dt>
                          <dd className="font-medium text-[#302832] text-right">{product.diamond_color} / {product.diamond_clarity}</dd>
                        </div>
                      )}
                      {product.stone_weight_cts > 0 && (
                        <div className="flex justify-between pt-2 border-b border-[#E9D8C3]/50 pb-2">
                          <dt className="text-zinc-500">Total Stone Wt</dt>
                          <dd className="font-medium text-[#302832]">{product.stone_weight_cts} cts</dd>
                        </div>
                      )}
                      {product.solitaire_weight_cts > 0 && (
                        <div className="flex justify-between pt-2 border-b border-[#E9D8C3]/50 pb-2">
                          <dt className="text-zinc-500">Solitaire Details</dt>
                          <dd className="font-medium text-[#302832]">{product.solitaire_pieces} pcs / {product.solitaire_weight_cts} cts</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
              </div>

              {/* SHIPPING & e POLICY ACCORDION/BLOCK */}
              <div className="bg-[#F7F1E8]/30 border border-[#E9D8C3] p-5 rounded-sm">
                 <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#4A1F58] flex items-center gap-2 mb-3">
                    <Info className="w-3.5 h-3.5" /> Shipping & Exchange Policy
                 </h4>
                 <ul className="text-xs font-sans text-zinc-600 space-y-2 list-disc pl-4">
                   <li>Complimentary insured shipping across India.</li>
                   <li>Hassle-free exchange policy.</li>
                   <li>Product must remain unused with original tags and certification intact.</li>
                 </ul>
              </div>

            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM SECTIONS WITH FLORAL WATERMARK */}
        {/* ========================================================= */}
        <div className="relative mt-12 overflow-hidden border-t border-[#E9D8C3]">
          {/* Subtle Background Watermark */}
          <img 
            src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
            alt="Decorative Floral" 
            className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply z-0"
          />

          <div className="relative z-10 pt-16">
            
            {/* REDUCED RETURN, EXCHANGE & POLICIES BLOCKS */}
            <div className="mb-20 px-4 md:px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-4 md:gap-6">
                
                <div className="flex items-start gap-4 p-5 bg-white border border-[#E9D8C3] rounded-sm shadow-sm transition-transform hover:-translate-y-1 duration-300">
                  <div className="w-10 h-10 bg-[#F7F1E8] rounded-full flex items-center justify-center shrink-0 text-[#C9A15B]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-serif font-medium text-base text-[#4A1F58] mb-1">Lifetime Exchange</h4>
                    <p className="text-xs font-sans text-zinc-500 leading-relaxed">Exchange old designs anytime with zero deductions on prevailing gold rates.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-white border border-[#E9D8C3] rounded-sm shadow-sm transition-transform hover:-translate-y-1 duration-300">
                  <div className="w-10 h-10 bg-[#F7F1E8] rounded-full flex items-center justify-center shrink-0 text-[#C9A15B]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-serif font-medium text-base text-[#4A1F58] mb-1">100% Certified</h4>
                    <p className="text-xs font-sans text-zinc-500 leading-relaxed">BIS Hallmarked gold and IGI/SGL certified diamond jewellery.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* "YOU MAY ALSO LIKE" SECTION */}
            {relatedProducts.length > 0 && (
              <div className="mb-20 px-4 md:px-0 border-t border-[#E9D8C3] pt-16">
                <div className="flex items-center justify-between mb-8 max-w-[1400px] mx-auto">
                  <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#4A1F58]">You may also like</h2>
                  {product.category && (
                    <Link to="/category/$slug" params={{ slug: product.category.slug }} className="text-[10px] font-sans font-bold text-[#4A1F58] hover:text-[#C9A15B] transition-colors flex items-center gap-1 uppercase tracking-[0.2em]">
                      View All <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                <div className="flex overflow-x-auto hide-scrollbar gap-4 md:gap-6 pb-6 items-stretch max-w-[1400px] mx-auto">
                  {relatedProducts.map((related) => {
                    const displayImage = related.cover_image_url || (related.gallery_images && related.gallery_images.length > 0 ? related.gallery_images[0] : null);
                    
                    return (
                      <Link 
                        key={related.id} 
                        to="/product/$slug"
                        params={{ slug: related.slug }}
                        className="w-[160px] md:w-[240px] shrink-0 snap-start group flex flex-col cursor-pointer"
                      >
                        <div className="aspect-[4/5] w-full bg-white border border-[#E9D8C3] rounded-sm overflow-hidden relative shrink-0 mb-3 md:mb-4">
                          {displayImage ? (
                            <img 
                              src={displayImage} 
                              alt={related.title} 
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
                            {related.title}
                          </h4>
                          <span className="text-[13px] md:text-[16px] font-sans font-bold text-[#4A1F58]">
                            ₹{Number(related.mrp).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* REAL CUSTOMER REVIEWS (DATABASE DRIVEN & DPDP COMPLIANT) */}
            <div id="reviews-section" className="mb-20 px-4 md:px-0 max-w-[1200px] mx-auto border-t border-[#E9D8C3] pt-16">
              <div className="flex flex-col md:flex-row gap-12 bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-sm border border-[#E9D8C3] shadow-sm">
                
                {/* Overview */}
                <div className="w-full md:w-1/3">
                  <h3 className="text-2xl font-serif font-medium text-[#4A1F58] mb-4">Customer Reviews</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex text-[#C9A15B]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(avgRating)) ? 'fill-current' : 'fill-transparent stroke-current opacity-40'}`} />
                      ))}
                    </div>
                    <span className="text-2xl font-sans font-bold text-[#302832]">{avgRating}/5</span>
                  </div>
                  <p className="text-xs font-sans text-zinc-500 mb-8">Based on {reviews.length} submitted ratings.</p>
                  <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className="bg-[#4A1F58] hover:bg-[#302832] transition-colors text-white font-sans font-bold text-[10px] uppercase tracking-[0.2em] px-8 py-3 rounded-sm shadow-sm"
                  >
                    Write a Review
                  </button>
                </div>

                {/* Review List */}
                <div className="w-full md:w-2/3">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#302832] mb-6">Recent Reviews</h4>
                  
                  {reviews.length === 0 ? (
                    <div className="text-sm font-sans text-zinc-500 bg-[#F7F1E8]/50 p-6 rounded-sm border border-[#E9D8C3] text-center italic">
                      Be the first to review this elegant design.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto hide-scrollbar pr-2">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-[#F7F1E8]/50 p-6 rounded-sm border border-[#E9D8C3]">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-white border border-[#E9D8C3] flex items-center justify-center font-serif font-medium text-[#4A1F58] text-lg">
                                {review.user_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h5 className="text-sm font-sans font-bold text-[#302832] flex items-center gap-1.5">
                                  {review.user_name} 
                                  {/* ✨ TypeScript Error Fix: Wrapped Icon in a standard span for the title attribute */}
                                  {review.is_verified && (
                                    <span title="Verified Buyer" className="inline-flex items-center">
                                      <ShieldCheck className="w-3.5 h-3.5 text-[#C9A15B]" />
                                    </span>
                                  )}
                                </h5>
                                <span className="text-[10px] font-sans text-zinc-400 uppercase tracking-widest">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex text-[#C9A15B]">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'fill-transparent stroke-current'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm font-sans text-zinc-600 leading-relaxed">"{review.review_text}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* STORE LOCATOR SECTION */}
            <div className="mb-16 px-4 md:px-0 border-t border-[#E9D8C3] pt-16">
              <StoreLocator 
                limit={3} 
                showSearch={true} 
                title="Find a Boutique Near You" 
                subtitle="Try it on before you buy it. Search or use GPS to find your nearest Pavitram experience center." 
              />
              
              <div className="text-center mt-10">
                <Link 
                  to="/stores" 
                  className="inline-block border border-[#4A1F58] text-[#4A1F58] font-sans font-bold text-[10px] uppercase tracking-[0.2em] px-10 py-3.5 rounded-sm hover:bg-[#4A1F58] hover:text-white transition-colors shadow-sm"
                >
                  View All Stores
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* REVIEW SUBMISSION MODAL (DPDP COMPLIANT) */}
      {/* ========================================================= */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-white rounded-sm shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-[#4A1F58] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <h2 className="text-2xl font-serif font-medium text-[#4A1F58] mb-2">Write a Review</h2>
              <p className="text-xs font-sans text-zinc-500 mb-6">Share your experience with the {product.title}.</p>
              
              {reviewSubmitMessage ? (
                <div className="bg-[#F7F1E8] text-[#4A1F58] border border-[#C9A15B] p-4 text-sm font-sans rounded-sm text-center">
                  {reviewSubmitMessage}
                </div>
              ) : (
                <form onSubmit={submitReview} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-[#302832] mb-2">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                      className="w-full border border-[#E9D8C3] bg-zinc-50 px-4 py-2.5 outline-none focus:border-[#C9A15B] transition-colors font-sans text-sm rounded-sm"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-[#302832] mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({...reviewForm, rating: star})}
                          className={`w-8 h-8 flex items-center justify-center ${star <= reviewForm.rating ? 'text-[#C9A15B]' : 'text-zinc-300'}`}
                        >
                          <Star className={`w-6 h-6 ${star <= reviewForm.rating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-[#302832] mb-2">Your Review</label>
                    <textarea 
                      required
                      value={reviewForm.text}
                      onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})}
                      rows={4}
                      className="w-full border border-[#E9D8C3] bg-zinc-50 px-4 py-3 outline-none focus:border-[#C9A15B] transition-colors font-sans text-sm rounded-sm resize-none"
                      placeholder="Tell us what you loved about this design..."
                    ></textarea>
                  </div>

                  {/* DPDP Act Compliance Consent */}
                  <div className="flex items-start gap-3 bg-[#F7F1E8]/50 p-4 border border-[#E9D8C3] rounded-sm">
                    <input 
                      type="checkbox" 
                      id="dpdp-consent"
                      required
                      checked={reviewForm.consent}
                      onChange={(e) => setReviewForm({...reviewForm, consent: e.target.checked})}
                      className="mt-0.5 shrink-0 accent-[#4A1F58] cursor-pointer"
                    />
                    <label htmlFor="dpdp-consent" className="text-[10px] font-sans text-zinc-600 leading-relaxed cursor-pointer select-none">
                      I consent to the collection and processing of my personal data (name and review) to be displayed on this platform, compliant with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> of India. Pavitram ensures data privacy and will not sell personal information to third parties.
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmittingReview || !reviewForm.consent}
                    className="w-full bg-[#4A1F58] hover:bg-[#302832] disabled:opacity-50 text-white py-3.5 text-[11px] font-sans font-bold uppercase tracking-[0.2em] rounded-sm transition-colors flex justify-center items-center gap-2 shadow-sm"
                  >
                    {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MOBILE STICKY BOTTOM BAR */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E9D8C3] px-4 py-3 flex gap-3 z-50 lg:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <a 
          href={`https://wa.me/918356834764?text=${encodeURIComponent(
            `Hi! I am interested in this product: ${product?.title || 'Jewellery'}.\n\n` +
            (product?.sku_reference ? `SKU: ${product.sku_reference}\n` : '') +
            `Please share more details.\nLink: ${typeof window !== 'undefined' ? window.location.href : ''}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#4A1F58] text-[#4A1F58] h-12 rounded-sm text-[11px] font-sans font-bold uppercase tracking-widest shadow-sm active:bg-[#F7F1E8] transition-colors group"
        >
          <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" /> WhatsApp
        </a>
        <button 
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-2 bg-[#4A1F58] text-white h-12 rounded-sm text-[11px] font-sans font-bold uppercase tracking-widest shadow-sm active:bg-[#302832]"
        >
          <ShoppingBag className="w-4 h-4" /> Add to Bag
        </button>
      </div>

    </div>
  );
}