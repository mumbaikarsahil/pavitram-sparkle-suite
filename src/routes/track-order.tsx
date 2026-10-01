"use client";

import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  Package, Lock, ArrowRight, Loader2, UserCircle2
} from "lucide-react";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute('/track-order')({
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the user is already authenticated
    const user = localStorage.getItem("pavitram_user");
    if (user) {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F1E8] flex flex-col font-sans pb-24 relative overflow-hidden">
      
      <img 
        src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/bg_pattern2.webp" 
        alt="Decorative Floral" 
        className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply z-0"
      />

      <header className="bg-white/80 backdrop-blur-md border-b border-[#E9D8C3] relative z-10">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-[9px] font-sans font-bold uppercase tracking-widest text-zinc-400 hover:text-[#C9A15B] transition-colors">
            ← Back to Home
          </Link>
          <Logo className="h-7 md:h-8 w-auto absolute left-1/2 -translate-x-1/2" />
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-[480px] bg-white rounded-sm shadow-[0_10px_40px_rgba(74,31,88,0.05)] border border-[#E9D8C3] overflow-hidden text-center animate-in fade-in zoom-in-95 duration-500">
          
          <div className="h-1.5 w-full bg-[#C9A15B]" />

          <div className="p-8 md:p-12">
            
            <div className="relative mx-auto w-20 h-20 bg-[#F7F1E8] rounded-full flex items-center justify-center mb-6 border border-[#E9D8C3] shadow-sm">
              <Package className="w-8 h-8 text-[#C9A15B]" strokeWidth={1.5} />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-[#E9D8C3]">
                <Lock className="w-4 h-4 text-[#4A1F58]" />
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-medium text-[#4A1F58] mb-4 leading-tight">
              Secure Order Tracking
            </h1>
            
            <p className="text-sm font-sans text-zinc-500 leading-relaxed mb-8">
              To protect your privacy and delivery details, order tracking is exclusively available through your secure Pavitram account.
            </p>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-[#C9A15B]" />
              </div>
            ) : isLoggedIn ? (
              <div className="space-y-4 border-t border-[#E9D8C3] pt-8">
                <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-2.5 rounded-sm border border-emerald-100 uppercase tracking-widest inline-flex items-center gap-2 mb-2">
                  <UserCircle2 className="w-4 h-4" /> You are securely logged in
                </div>
                <button 
                  onClick={() => navigate({ to: "/Account" })}
                  className="w-full bg-[#4A1F58] hover:bg-[#302832] text-white font-sans font-bold text-[11px] tracking-[0.2em] uppercase h-12 rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  Go To My Orders <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4 border-t border-[#E9D8C3] pt-8">
                <button 
                  onClick={() => navigate({ to: "/login" })}
                  className="w-full bg-[#4A1F58] hover:bg-[#302832] text-white font-sans font-bold text-[11px] tracking-[0.2em] uppercase h-12 rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  Log In To Track Order <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Don't have an account? You can easily create one using the phone number from your order.
                </p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}