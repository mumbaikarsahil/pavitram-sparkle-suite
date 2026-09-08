import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  Trash2, MapPin, Store, Ticket, ChevronRight, 
  ShieldCheck, RefreshCw, Award, ArrowLeft, MessageCircle, Phone, ShoppingBag,
  PackageX
} from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { useCart } from "@/context/CartContext";

export const Route = createFileRoute('/cart')({
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeItem } = useCart();
  const [pincode, setPincode] = useState("400089");
  
  // Totals Calculation
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = 0; 
  const shipping = 0; 
  const total = subtotal - discount + shipping;

  const handlePlaceOrder = () => {
    navigate({ to: "/checkout" });
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8] font-sans pb-24 relative overflow-hidden">
      
      {/* Subtle Floral Background overlay */}
      <img 
        src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
        alt="Decorative Floral" 
        className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply z-0"
      />

      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#E9D8C3] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => history.back()} className="text-zinc-500 hover:text-[#4A1F58] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="shrink-0">
              <Logo className="h-8 md:h-10 w-auto" />
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832]">
            <span>Need Assistance?</span>
            <a href="https://wa.me/918356834764" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-sm bg-[#F7F1E8] border border-[#E9D8C3] text-[#C9A15B] flex items-center justify-center hover:bg-[#C9A15B] hover:text-white transition-colors">
              <MessageCircle className="w-4 h-4" />
            </a>
            <button className="w-8 h-8 rounded-sm bg-[#F7F1E8] border border-[#E9D8C3] text-[#C9A15B] flex items-center justify-center hover:bg-[#C9A15B] hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 pt-8 md:pt-12 pb-16 relative z-10">
        
        <div className="flex items-end justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58]">
            Shopping Bag
          </h1>
          <span className="text-[10px] md:text-[11px] font-sans font-bold text-[#C9A15B] uppercase tracking-[0.2em] mb-1 md:mb-1.5">
            {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-sm border border-[#E9D8C3] shadow-[0_10px_40px_rgba(74,31,88,0.03)]">
            <div className="w-20 h-20 bg-[#F7F1E8] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#E9D8C3]">
              <ShoppingBag className="w-8 h-8 text-[#C9A15B]" />
            </div>
            <h2 className="text-2xl font-serif font-medium text-[#4A1F58] mb-3">Your shopping bag is empty</h2>
            <p className="text-sm font-sans text-zinc-500 mb-8 leading-relaxed max-w-sm mx-auto">
              Explore our collections and find a beautiful piece to add to your bag.
            </p>
            <Link to="/" className="inline-block bg-[#4A1F58] text-white font-sans font-bold text-[10px] uppercase tracking-[0.2em] px-10 py-3.5 rounded-sm hover:bg-[#302832] transition-colors shadow-sm">
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: CART ITEMS */}
            <div className="w-full lg:w-[60%] xl:w-[65%] space-y-4">
              
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white border border-[#E9D8C3] rounded-sm p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative">
                  
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 bg-white border border-transparent hover:border-red-200 hover:bg-red-50 rounded-sm transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex gap-4 sm:gap-6">
                    <div className="w-28 h-32 sm:w-36 sm:h-44 shrink-0 bg-[#F7F1E8]/30 rounded-sm border border-[#E9D8C3] p-2 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                        <div className="w-full h-full bg-zinc-50 flex items-center justify-center text-zinc-300">
                           <PackageX className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1 pr-8 md:pr-10">
                      <div>
                        <Link to="/product/$slug" params={{ slug: item.slug }} className="text-sm sm:text-base font-serif font-medium text-[#302832] leading-tight hover:text-[#C9A15B] transition-colors line-clamp-2">
                          {item.title}
                        </Link>
                        <p className="text-[9px] sm:text-[10px] font-sans font-bold text-zinc-400 mt-2 uppercase tracking-[0.15em]">
                          SKU: {item.sku}
                        </p>
                        <div className="text-lg sm:text-xl font-sans font-bold text-[#4A1F58] mt-3">
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mt-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-500">Qty:</span>
                          <select 
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                            className="text-xs font-sans font-bold border border-[#E9D8C3] rounded-sm px-3 py-1.5 outline-none focus:border-[#C9A15B] bg-white text-[#302832]"
                          >
                            {[1,2,3,4,5].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C9A15B]">
                          Dispatched in {item.manufacturing_buffer_days} Days
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E9D8C3]/50 flex items-center justify-between">
                    <button disabled className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-400 bg-zinc-50 px-4 py-2.5 rounded-sm border border-zinc-200 cursor-not-allowed w-full md:w-auto justify-center">
                      <Store className="w-3.5 h-3.5" />
                      Store Pickup Currently Unavailable
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY */}
            <div className="w-full lg:w-[40%] xl:w-[35%] space-y-4">

              {/* Coupon Code Trigger */}
              <button className="w-full bg-white border border-[#E9D8C3] hover:border-[#C9A15B] rounded-sm p-4 flex items-center justify-between group transition-colors shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F7F1E8] text-[#C9A15B] flex items-center justify-center border border-[#E9D8C3]">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#302832] group-hover:text-[#4A1F58]">Apply Coupon</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform group-hover:text-[#C9A15B]" />
              </button>

              {/* Delivery Pincode */}
              <div className="bg-white border border-[#E9D8C3] rounded-sm p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#C9A15B]" />
                  <span className="text-xs font-sans text-zinc-500">Delivering to <strong className="text-[#302832]">{pincode}</strong></span>
                </div>
                <button className="text-[10px] font-sans font-bold text-[#4A1F58] uppercase tracking-[0.15em] hover:text-[#C9A15B] transition-colors">
                  Change
                </button>
              </div>

              {/* Final Summary Card */}
              <div className="bg-white border border-[#E9D8C3] rounded-sm p-6 md:p-8 shadow-sm">
                <h3 className="text-base font-serif font-medium text-[#4A1F58] mb-6">Order Summary</h3>
                
                <div className="space-y-4 text-sm font-sans border-b border-[#E9D8C3]/50 pb-6 mb-6">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#302832]">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Coupon Discount</span>
                    {discount > 0 ? (
                      <span className="font-medium text-emerald-600">- ₹{discount.toLocaleString('en-IN')}</span>
                    ) : (
                      <button className="text-[10px] font-bold text-[#C9A15B] uppercase tracking-widest hover:text-[#4A1F58] transition-colors">Add Coupon</button>
                    )}
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Shipping (Standard)</span>
                    <span className="font-medium text-[#C9A15B] uppercase tracking-widest text-[10px]">Free</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                  <span className="text-sm font-sans font-bold uppercase tracking-widest text-[#302832]">Total Cost</span>
                  <span className="text-2xl font-sans font-bold text-[#4A1F58] tracking-tight">₹{total.toLocaleString('en-IN')}</span>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  className="w-full bg-[#4A1F58] hover:bg-[#302832] text-white font-sans font-bold text-[11px] tracking-[0.2em] uppercase py-4 rounded-sm shadow-sm transition-colors flex items-center justify-center"
                >
                  Proceed to Checkout
                </button>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* FOOTER GUARANTEES */}
      <div className="bg-white border-t border-[#E9D8C3] mt-auto relative z-10">
        <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-12 w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F7F1E8] text-[#C9A15B] flex items-center justify-center shrink-0 border border-[#E9D8C3]">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#302832]">15 Day exchange</h4>
                <p className="text-[9px] font-sans text-zinc-500 uppercase tracking-widest mt-0.5">On Online Orders</p>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-8 bg-[#E9D8C3]" />
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F7F1E8] text-[#C9A15B] flex items-center justify-center shrink-0 border border-[#E9D8C3]">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#302832]">100% Certified</h4>
                <p className="text-[9px] font-sans text-zinc-500 uppercase tracking-widest mt-0.5">Authentic Jewellery</p>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-8 bg-[#E9D8C3]" />
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F7F1E8] text-[#C9A15B] flex items-center justify-center shrink-0 border border-[#E9D8C3]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#302832]">Lifetime Exchange</h4>
                <p className="text-[9px] font-sans text-zinc-500 uppercase tracking-widest mt-0.5">Zero Deductions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}