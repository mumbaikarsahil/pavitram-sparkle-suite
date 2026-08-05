import React, { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "@tanstack/react-router";
import { StoreLocator } from "@/components/site/StoreLocator";
import { 
  Loader2, PackageX, ChevronRight, Ruler, Gem, ShieldCheck, 
  Truck, MessageCircle, Heart, ShoppingBag, Play, MapPin, 
  ArrowRight, Star, RefreshCw, Award, Store, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/product/$slug')({
  component: ProductPage,
});

export default function ProductPage() {
  const { slug } = Route.useParams();
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Media Gallery State
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mediaItems, setMediaItems] = useState<{ type: 'image' | 'video', url: string }[]>([]);

  // Image Zoom State (Existing)
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

  // Mobile Fullscreen Modal State (NEW)
  const [isMobileZoomOpen, setIsMobileZoomOpen] = useState(false);
  const [mobileZoomIndex, setMobileZoomIndex] = useState(0);

  // 👇 ADD THIS BLOCK HERE 👇
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white text-center px-4">
        <PackageX className="w-12 h-12 text-zinc-300 mb-4" />
        <h1 className="text-2xl font-bold text-zinc-900">Product Not Found</h1>
        <p className="text-zinc-500 mt-2">The design you are looking for might have been removed or is currently out of stock.</p>
        <Link to="/" className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-700">← Back to Home</Link>
      </div>
    );
  }

  const activeMedia = mediaItems[activeMediaIndex] || { type: 'image', url: '' };

  return (
    <div className="min-h-screen bg-white font-sans pb-32 lg:pb-24">
      
      {/* --- BREADCRUMBS --- */}
      <div className="hidden md:block border-b border-zinc-100 bg-white">
        <div className="max-w-[1300px] mx-auto px-4 md:px-8 py-4 flex items-center text-[10px] font-bold tracking-widest uppercase text-zinc-400 overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 mx-2 opacity-50 shrink-0" />
          {product.category && (
            <>
              <Link to="/category/$slug" params={{ slug: product.category.slug }} className="hover:text-zinc-900 transition-colors">
                {product.category.name}
              </Link>
              <ChevronRight className="w-3 h-3 mx-2 opacity-50 shrink-0" />
            </>
          )}
          <span className="text-zinc-900 truncate">{product.title}</span>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-0 md:px-8 pt-0 md:pt-10">
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-12">
          
          {/* ========================================================= */}
          {/* LEFT: MEDIA GALLERY */}
          {/* ========================================================= */}
          <div className="w-full lg:w-[58%] shrink-0">
            
            {/* Mobile Horizontal Swipe Gallery */}
            <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory no-scrollbar bg-[#F9F6F0] border-b border-zinc-100">
              {mediaItems.length === 0 ? (
                <div className="w-full aspect-square flex items-center justify-center snap-center shrink-0">
                  <PackageX className="w-12 h-12 text-zinc-300" />
                </div>
              ) : (
                mediaItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="w-full aspect-square flex items-center justify-center snap-center shrink-0 p-8 relative cursor-pointer"
                    // 👇 ADD THIS ONCLICK 👇
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
                        <div key={dotIdx} className={`h-1.5 rounded-full transition-all ${idx === dotIdx ? 'w-4 bg-[#4A0B49]' : 'w-1.5 bg-zinc-300'}`} />
                      ))}
                    </div>
                  </div>
                ))
              )}
              {/* ========================================================= */}
      {/* MOBILE FULLSCREEN IMAGE MODAL */}
      {/* ========================================================= */}
      {isMobileZoomOpen && mediaItems.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md lg:hidden">
          
          {/* Close Button */}
          <button
            onClick={() => setIsMobileZoomOpen(false)}
            className="absolute top-6 right-6 text-white z-[101] p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Main Image Viewer */}
          <div className="w-full h-full flex items-center justify-center p-4">
            {mediaItems[mobileZoomIndex]?.type === 'video' ? (
              <video 
                src={mediaItems[mobileZoomIndex].url} 
                controls autoPlay loop playsInline 
                className="w-full h-auto max-h-[85vh] object-contain" 
              />
            ) : (
              <img 
                src={mediaItems[mobileZoomIndex]?.url} 
                alt={`${product.title} zoomed`} 
                className="w-full h-auto max-h-[85vh] object-contain" 
              />
            )}
          </div>

          {/* Navigation Arrows (Only show if there is more than 1 image) */}
          {mediaItems.length > 1 && (
            <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-8 z-[101]">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileZoomIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1);
                }}
                className="p-4 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all"
              >
                <ChevronRight className="w-7 h-7 rotate-180" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileZoomIndex(prev => prev === mediaItems.length - 1 ? 0 : prev + 1);
                }}
                className="p-4 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </div>
          )}
        </div>
      )}
            </div>

            {/* Desktop Layout: Left Thumbnails + Right Zoom Viewer */}
            <div className="hidden lg:flex gap-4 h-[650px] sticky top-24">
              
              {/* Vertical Thumbnails */}
              {mediaItems.length > 1 && (
                <div className="w-20 shrink-0 flex flex-col gap-3 overflow-y-auto no-scrollbar py-1">
                  {mediaItems.map((item, idx) => (
                    <button
                      key={idx}
                      onMouseEnter={() => setActiveMediaIndex(idx)} // Fast hover switching
                      className={`relative w-20 h-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all bg-[#F9F6F0] ${
                        activeMediaIndex === idx ? 'border-[#4A0B49] shadow-md' : 'border-transparent hover:border-zinc-300 opacity-70 hover:opacity-100'
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
                className="flex-1 relative bg-[#F9F6F0] rounded-2xl overflow-hidden flex items-center justify-center cursor-crosshair group"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => { setIsZoomed(false); setZoomStyle({}); }}
              >
                {mediaItems.length === 0 ? (
                  <PackageX className="w-12 h-12 text-zinc-300" />
                ) : activeMedia.type === 'video' ? (
                  <video src={activeMedia.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full p-12 overflow-hidden relative">
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
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-zinc-900 leading-[1.15] font-serif">
                  {product.title}
                </h1>
                <p className="text-[10px] font-bold text-zinc-400 mt-3 tracking-widest uppercase">
                  {product.sku_reference ? `SKU: ${product.sku_reference}` : 'Exclusive Design'}
                </p>
              </div>
              <button className="w-10 h-10 shrink-0 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-end gap-3 mb-6 pt-2">
              <span className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">
                ₹{Number(product.mrp).toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-semibold text-zinc-400 mb-2">(MRP Inclusive of all taxes)</span>
            </div>

            {/* Quick Specs Highlight Box */}
            <div className="flex border border-zinc-200 rounded-xl overflow-hidden mb-8 shadow-sm bg-white">
              <div className="flex-1 p-3.5 text-center border-r border-zinc-200">
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 block mb-1">Metal</span>
                <span className="text-sm font-semibold text-zinc-900">{product.purity_karat || '18K'} {product.metal_color || ''} {product.metal_type || 'Gold'}</span>
              </div>
              <div className="flex-1 p-3.5 text-center">
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 block mb-1">Diamond</span>
                <span className="text-sm font-semibold text-zinc-900">
                  {product.diamond_color && product.diamond_clarity 
                    ? `${product.diamond_color}-${product.diamond_clarity}` 
                    : (product.stone_weight_cts > 0 ? `${product.stone_weight_cts} Cts` : 'N/A')}
                </span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:grid grid-cols-2 gap-3 mb-10">
              <button 
                onClick={handleAddToCart} /* <-- ADD ONCLICK HERE */
                className="flex items-center justify-center gap-2 bg-[#4A0B49] hover:bg-[#340733] text-white h-14 rounded-xl text-sm font-bold transition-all shadow-md"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Bag
              </button>
              <button className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white h-14 rounded-xl text-sm font-bold transition-all shadow-md">
                <MessageCircle className="w-4 h-4" /> Enquire on WhatsApp
              </button>
            </div>

            {/* Delivery & Pincode Checker */}
            <div className="space-y-4 mb-10">
              <div className="border border-zinc-300 rounded-xl p-1 pl-4 flex items-center justify-between bg-white shadow-sm focus-within:border-[#4A0B49] transition-colors">
                 <div className="flex items-center gap-3 w-full">
                   <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                   <input type="text" placeholder="Enter Pincode for Delivery Date" className="w-full h-10 text-sm font-medium outline-none bg-transparent" />
                 </div>
                 <button className="text-xs font-bold text-[#4A0B49] px-4 h-full shrink-0">CHECK</button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-[#FDFBF7] border border-zinc-100">
                  <Truck className="w-5 h-5 text-[#4A0B49] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">Free Express Delivery</h4>
                    <p className="text-xs text-zinc-500 mt-1">Ready to dispatch in {product.manufacturing_buffer_days} Days. Fully insured.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* --- DETAILED SPECIFICATIONS --- */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 tracking-tight border-b border-zinc-100 pb-4">Product Details</h3>
              
              {product.description && (
                <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                  {product.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-8">
                {/* Metal Details */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <Ruler className="w-3.5 h-3.5" /> Metal Information
                  </h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-zinc-100 pb-2">
                      <dt className="text-zinc-500">Metal Type</dt>
                      <dd className="font-semibold text-zinc-900 text-right">{product.purity_karat} {product.metal_color} {product.metal_type}</dd>
                    </div>
                    {product.gross_weight_g > 0 && (
                      <div className="flex justify-between pt-2 border-b border-zinc-100 pb-2">
                        <dt className="text-zinc-500">Gross Weight</dt>
                        <dd className="font-semibold text-zinc-900">{product.gross_weight_g} g</dd>
                      </div>
                    )}
                    {product.net_weight_g > 0 && (
                      <div className="flex justify-between pt-2 border-b border-zinc-100 pb-2">
                        <dt className="text-zinc-500">Net Weight</dt>
                        <dd className="font-semibold text-zinc-900">{product.net_weight_g} g</dd>
                      </div>
                    )}
                    {product.item_size && (
                      <div className="flex justify-between pt-2 border-b border-zinc-100 pb-2">
                        <dt className="text-zinc-500">Dimensions/Size</dt>
                        <dd className="font-semibold text-zinc-900">{product.item_size}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Stone Details */}
                {(product.stone_weight_cts > 0 || product.diamond_shape) && (
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Gem className="w-3.5 h-3.5" /> Diamond & Stones
                    </h4>
                    <dl className="space-y-2 text-sm">
                      {product.diamond_shape && (
                        <div className="flex justify-between border-b border-zinc-100 pb-2">
                          <dt className="text-zinc-500">Shape</dt>
                          <dd className="font-semibold text-zinc-900 text-right">{product.diamond_shape}</dd>
                        </div>
                      )}
                      {(product.diamond_color || product.diamond_clarity) && (
                        <div className="flex justify-between pt-2 border-b border-zinc-100 pb-2">
                          <dt className="text-zinc-500">Color & Clarity</dt>
                          <dd className="font-semibold text-zinc-900 text-right">{product.diamond_color} / {product.diamond_clarity}</dd>
                        </div>
                      )}
                      {product.stone_weight_cts > 0 && (
                        <div className="flex justify-between pt-2 border-b border-zinc-100 pb-2">
                          <dt className="text-zinc-500">Total Stone Wt</dt>
                          <dd className="font-semibold text-zinc-900">{product.stone_weight_cts} cts</dd>
                        </div>
                      )}
                      {product.solitaire_weight_cts > 0 && (
                        <div className="flex justify-between pt-2 border-b border-zinc-100 pb-2">
                          <dt className="text-zinc-500">Solitaire Breakdown</dt>
                          <dd className="font-semibold text-zinc-900">{product.solitaire_pieces} pcs / {product.solitaire_weight_cts} cts</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <hr className="border-zinc-200 my-12" />

        {/* ========================================================= */}
        {/* NEW SECTION: RETURN, EXCHANGE & POLICIES */}
        {/* ========================================================= */}
        <div className="mb-16 px-4 md:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-6 bg-[#FDFBF7] border border-zinc-100 rounded-2xl">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-[#4A0B49]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-zinc-900 mb-2">Lifetime Exchange</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">Exchange your old designs anytime with zero deductions on the prevailing gold rate.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-[#FDFBF7] border border-zinc-100 rounded-2xl">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-[#4A0B49]">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-zinc-900 mb-2">100% Certified</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">Every piece is BIS Hallmarked and diamond jewellery is accompanied by IGI/SGL certification.</p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* "YOU MAY ALSO LIKE" SECTION */}
        {/* ========================================================= */}
        {relatedProducts.length > 0 && (
          <>
            <hr className="border-zinc-200 my-12" />
            <div className="mb-16 px-4 md:px-0">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-zinc-900 font-serif">You may also like</h2>
                {product.category && (
                  <Link to="/category/$slug" params={{ slug: product.category.slug }} className="text-xs font-bold text-[#4A0B49] hover:text-[#340733] flex items-center gap-1 uppercase tracking-widest">
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 no-scrollbar pb-6">
                {relatedProducts.map((related) => {
                  const displayImage = related.cover_image_url || (related.gallery_images && related.gallery_images.length > 0 ? related.gallery_images[0] : null);
                  
                  return (
                    <Link 
                      key={related.id} 
                      to="/product/$slug"
                      params={{ slug: related.slug }}
                      className="w-[180px] md:w-[240px] shrink-0 snap-start group flex flex-col bg-white rounded-xl border border-zinc-100 hover:border-zinc-300 hover:shadow-lg transition-all duration-300 overflow-hidden relative pb-4"
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#F9F6F0] p-4 md:p-6 border-b border-zinc-100">
                        {displayImage ? (
                          <img 
                            src={displayImage} 
                            alt={related.title} 
                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-sm mix-blend-multiply"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            <PackageX className="w-6 h-6 opacity-50" />
                          </div>
                        )}
                        <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 z-10" onClick={(e) => e.preventDefault()}>
                          <Heart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="flex flex-col space-y-1 px-4 pt-3">
                        <div className="font-black text-sm md:text-[15px] text-zinc-900 tracking-tight">
                          ₹{Number(related.mrp).toLocaleString('en-IN')}
                        </div>
                        <h3 className="font-medium text-[11px] md:text-xs text-zinc-600 line-clamp-1 group-hover:text-[#4A0B49] transition-colors">
                          {related.title}
                        </h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <hr className="border-zinc-200 my-12" />

        {/* ========================================================= */}
        {/* NEW SECTION: CUSTOMER REVIEWS (MOCK) */}
        {/* ========================================================= */}
        <div className="mb-16 px-4 md:px-0 max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row gap-12 bg-[#F9F6F0] p-8 md:p-10 rounded-3xl border border-zinc-100">
            
            {/* Overview */}
            <div className="w-full md:w-1/3">
              <h3 className="text-xl font-bold text-zinc-900 mb-4">Customer Reviews</h3>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex text-amber-500">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current opacity-50" />
                </div>
                <span className="text-2xl font-black text-zinc-900">4.8/5</span>
              </div>
              <p className="text-sm text-zinc-500 mb-6">Based on 124 verified ratings.</p>
              <button className="bg-[#4A0B49] text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-lg shadow-sm">
                Write a Review
              </button>
            </div>

            {/* Highlights */}
            <div className="w-full md:w-2/3">
              <h4 className="font-bold text-zinc-900 mb-4">Review Highlights</h4>
              <div className="flex flex-wrap gap-2 mb-8">
                {['Design (102)', 'Quality (88)', 'Packaging (64)', 'Delivery (45)', 'Size/Fit (30)'].map(tag => (
                  <span key={tag} className="bg-white border border-zinc-200 text-zinc-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Sample Review */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-500 text-xs">P</div>
                    <div>
                      <h5 className="text-sm font-bold text-zinc-900 flex items-center gap-1">Priya Sharma <ShieldCheck className="w-3 h-3 text-emerald-500" /></h5>
                      <span className="text-[10px] text-zinc-400">Verified Buyer • 2 weeks ago</span>
                    </div>
                  </div>
                  <div className="flex text-amber-500">
                    <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                  </div>
                </div>
                <p className="text-sm text-zinc-600">"Absolutely beautiful! The diamonds have incredible sparkle and the finishing is top-notch. Customer service was also very helpful with sizing."</p>
              </div>
            </div>

          </div>
        </div>

        <hr className="border-zinc-200 my-12" />
{/* ========================================================= */}
        {/* STORE LOCATOR SECTION (WITH GPS AUTO-FETCH) */}
        {/* ========================================================= */}
        <div className="mb-16 px-4 md:px-0">
          <StoreLocator 
            limit={3} 
            showSearch={true} 
            title="Find in Store near you!" 
            subtitle="Try it on before you buy it. Search or use GPS to find your nearest boutique." 
          />
          
          <div className="text-center mt-8">
            <Link 
              to="/stores" 
              className="inline-block border border-[#4A0B49] text-[#4A0B49] font-bold text-xs px-8 py-3 rounded-lg hover:bg-[#4A0B49] hover:text-white transition-colors uppercase tracking-widest shadow-sm"
            >
              View All Stores
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* MOBILE STICKY BOTTOM BAR */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-4 py-3 flex gap-3 z-50 lg:hidden shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
      <a 
  href={`https://wa.me/918356834764?text=${encodeURIComponent(
    `Hi! I am interested in this product: ${product?.title || 'Jewellery'}.\n\n` +
    (product?.sku_reference ? `SKU: ${product.sku_reference}\n` : '') +
    `Please share more details.\nLink: ${typeof window !== 'undefined' ? window.location.href : ''}`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="flex-1 flex items-center justify-center gap-2 bg-white border border-zinc-300 text-zinc-900 h-12 rounded-xl text-sm font-bold shadow-sm active:bg-zinc-50 hover:bg-[#E8F5E9] hover:border-emerald-200 transition-all group"
>
  <MessageCircle className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" /> WhatsApp
</a>
        <button 
          onClick={handleAddToCart} /* <-- ADD ONCLICK HERE */
          className="flex-1 flex items-center justify-center gap-2 bg-[#4A0B49] text-white h-12 rounded-xl text-sm font-bold shadow-sm active:bg-[#340733]"
        >
          <ShoppingBag className="w-4 h-4" /> Add to Bag
        </button>
      </div>

    </div>
  );
}