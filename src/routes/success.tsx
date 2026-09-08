import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import { Logo } from "@/components/site/Logo"; 

export const Route = createFileRoute('/success')({
  component: SuccessPage,
});

function SuccessPage() {
  // In a real app, you would fetch this from route state or URL params
  const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="min-h-screen bg-[#F7F1E8] flex flex-col font-sans pb-24 relative overflow-hidden">
      
      {/* Subtle Floral Background overlay */}
      <img 
        src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
        alt="Decorative Floral" 
        className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply z-0"
      />

      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E9D8C3] relative z-10">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-center">
          <Logo className="h-8 md:h-10 w-auto" />
        </div>
      </header>

      {/* MAIN CONTENT - LUXURY CENTERED CARD */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-[480px] bg-white rounded-sm shadow-[0_10px_40px_rgba(74,31,88,0.05)] border border-[#E9D8C3] p-8 md:p-12 text-center relative overflow-hidden">
          
          {/* Top Gold Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C9A15B]" />
          
          {/* Elegant Success Icon */}
          <div className="mx-auto w-20 h-20 bg-[#F7F1E8] rounded-full flex items-center justify-center mb-6 border border-[#E9D8C3] shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-[#C9A15B]" strokeWidth={1.5} />
          </div>

          {/* Confirmation Text */}
          <div className="space-y-3 mb-8">
            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#4A1F58] leading-tight">
              Order Confirmed
            </h1>
            <p className="text-sm font-sans text-zinc-500 px-2 leading-relaxed">
              Thank you for your purchase. We have sent your receipt and confirmation details directly to your email and WhatsApp.
            </p>
          </div>

          {/* Order ID Display */}
          <div className="bg-[#F7F1E8]/50 rounded-sm p-5 border border-[#E9D8C3] flex flex-col sm:flex-row items-center justify-between gap-3 mb-10">
            <span className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-[0.2em]">
              Order Number
            </span>
            <span className="text-lg font-sans font-bold text-[#302832] tracking-wider">
              {orderId}
            </span>
          </div>

          {/* Call to Actions - Stacked for easy thumb-reach on mobile */}
          <div className="space-y-4">
            <button 
              onClick={() => alert("Tracking modal/page would open here")}
              className="w-full bg-[#4A1F58] hover:bg-[#302832] text-white font-sans font-bold text-[10px] tracking-[0.2em] uppercase h-12 rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" /> Track Your Order
            </button>
            
            <Link 
              to="/" 
              className="w-full bg-white border border-[#E9D8C3] hover:border-[#C9A15B] text-[#4A1F58] font-sans font-bold text-[10px] tracking-[0.2em] uppercase h-12 rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4 text-[#C9A15B]" /> Continue Shopping
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}