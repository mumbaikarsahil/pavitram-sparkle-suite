import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  Trash2, MapPin, Store, Video, Ticket, ChevronRight, 
  ShieldCheck, RefreshCw, Award, ArrowLeft, MessageCircle, Phone, ShoppingBag
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
    <div className="min-h-screen bg-zinc-50 font-sans pb-24">
      
      {/* HEADER */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => history.back()} className="text-zinc-500 hover:text-zinc-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="shrink-0">
              <Logo className="h-10 w-auto" />
            </div>
          </div>
          
          <div className="flex bg-zinc-100 p-1 rounded-lg">
            <div className="bg-white text-zinc-900 text-xs font-bold px-4 py-1.5 rounded-md shadow-sm">
              Shopping Bag ({cartItems.length})
            </div>
            <div className="text-zinc-500 text-xs font-medium px-4 py-1.5 cursor-not-allowed">
              Home Trial (0)
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-bold text-zinc-600">
            <span>Need Assistance?</span>
            <button className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors">
              <MessageCircle className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center hover:bg-zinc-200 transition-colors">
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 pt-8 pb-16">
        
        {cartItems.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl border border-zinc-200 shadow-sm">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Your shopping bag is empty</h2>
            <p className="text-zinc-500 mb-8 font-medium">Let's find some beautiful jewelry for you.</p>
            <Link to="/" className="bg-[#4A0B49] text-white font-bold tracking-widest uppercase px-8 py-3.5 rounded-xl hover:bg-[#340733] transition-all shadow-md">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT COLUMN: CART ITEMS */}
            <div className="w-full lg:w-[60%] xl:w-[65%] space-y-6">
              
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-teal-900">See it Before You Buy It</h3>
                    <p className="text-xs text-teal-700 mt-0.5">Experience our designs in detail via video call</p>
                  </div>
                </div>
                <button className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-lg shadow-sm transition-colors">
                  See It Live
                </button>
              </div>

              {/* Real Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-6 shadow-sm relative">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex gap-4 sm:gap-6">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-[#F9F6F0] rounded-xl border border-zinc-100 p-2 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                        ) : (
                          <div className="w-full h-full bg-zinc-100 rounded-lg"></div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <Link to="/product/$slug" params={{ slug: item.slug }} className="text-sm sm:text-base font-bold text-zinc-900 pr-6 leading-tight hover:text-[#4A0B49] transition-colors">
                            {item.title}
                          </Link>
                          <div className="text-lg sm:text-xl font-black text-zinc-900 mt-1 tracking-tight">
                            ₹{item.price.toLocaleString('en-IN')}
                          </div>
                          <p className="text-[10px] sm:text-xs font-mono text-zinc-400 mt-1 uppercase">
                            SKU: {item.sku}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mt-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-zinc-600">Quantity:</span>
                            <select 
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                              className="text-sm font-bold border border-zinc-200 rounded-md px-2 py-1 outline-none focus:border-[#4A0B49]"
                            >
                              {[1,2,3,4,5].map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="text-xs text-indigo-600 font-medium">
                            Dispatched in {item.manufacturing_buffer_days} Days
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <button className="flex items-center gap-2 text-xs font-bold text-zinc-700 hover:text-[#4A0B49] transition-colors group bg-zinc-50 px-4 py-2 rounded-lg border border-zinc-200">
                        <Store className="w-4 h-4 text-[#4A0B49]" />
                        Pickup Available from Stores Nearby
                        <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY */}
            <div className="w-full lg:w-[40%] xl:w-[35%] space-y-6">
              
              <div className="bg-[#4A0B49] rounded-2xl p-5 text-white flex items-center justify-between shadow-md relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-1">Pavitram Exclusives</h4>
                  <p className="text-sm font-medium mb-3">Get <span className="font-black text-white">₹500 OFF</span> by completing<br/>your profile.</p>
                  <Link to="/account" className="inline-block bg-white text-[#4A0B49] text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg shadow-sm">
                    Complete Profile <ChevronRight className="w-3 h-3 inline pb-0.5" />
                  </Link>
                </div>
              </div>

              <button className="w-full bg-purple-50 border border-purple-100 hover:border-purple-300 rounded-2xl p-4 flex items-center justify-between group transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-purple-900">Apply Coupon</span>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-bold text-zinc-700">Delivering to <span className="text-zinc-900">{pincode}</span></span>
                </div>
                <button className="text-[10px] font-bold text-[#4A0B49] uppercase tracking-widest hover:underline">
                  Change
                </button>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 text-sm border-b border-zinc-100 pb-4 mb-4">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-zinc-900">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Coupon Discount</span>
                    {discount > 0 ? (
                      <span className="font-medium text-green-600">- ₹{discount.toLocaleString('en-IN')}</span>
                    ) : (
                      <button className="text-[10px] font-bold text-[#4A0B49] uppercase tracking-widest">Apply Coupon</button>
                    )}
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Shipping (Standard)</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-6">
                  <span className="text-base font-bold text-zinc-900">Total Cost</span>
                  <span className="text-2xl font-black text-zinc-900 tracking-tight">₹{total.toLocaleString('en-IN')}</span>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  className="w-full bg-[#4A0B49] hover:bg-[#340733] text-white font-bold text-sm tracking-widest uppercase py-4 rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  Place Order
                </button>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* FOOTER */}
      <div className="bg-white border-t border-zinc-200 mt-auto">
        <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#4A0B49]" />
              <div>
                <h4 className="text-[11px] font-bold text-zinc-900">15 Day Exchange</h4>
                <p className="text-[9px] text-zinc-500">On Online Orders</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#4A0B49]" />
              <div>
                <h4 className="text-[11px] font-bold text-zinc-900">100% Certified</h4>
                <p className="text-[9px] text-zinc-500">Authentic Jewellery</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#4A0B49]" />
              <div>
                <h4 className="text-[11px] font-bold text-zinc-900">Lifetime Exchange</h4>
                <p className="text-[9px] text-zinc-500">Zero Deductions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}