import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, MessageCircle, X, Sparkles } from "lucide-react";

export function DynamicIsland() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Trigger the pop-up 3 seconds after the page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Auto-expand for a moment to grab attention, then settle
      setTimeout(() => setIsExpanded(true), 500);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-500 ease-out px-4 w-full flex justify-center pointer-events-none">
      
      {/* ✨ FIXED: Changed to rounded-2xl (less rounded than full pill), larger padding */}
      <div 
        className="pointer-events-auto bg-white/85 backdrop-blur-xl border border-white/60 shadow-[0_20px_40px_rgba(74,31,88,0.12)] rounded-2xl p-2 flex flex-col items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Collapsed State */}
        {!isExpanded && (
          <div className="flex items-center gap-3 px-5 py-3 cursor-pointer">
            <Sparkles className="w-5 h-5 text-[#C9A15B] animate-pulse" />
            <span className="text-sm font-sans font-medium text-[#4A1F58]">Need help?</span>
          </div>
        )}

        {/* Expanded State */}
        {isExpanded && (
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 px-3 sm:px-5 py-3 animate-in fade-in duration-300 w-full sm:w-auto">
            
            <div className="flex items-center justify-between w-full sm:w-auto mb-2 sm:mb-0 sm:pr-5 sm:border-r border-[#E9D8C3]/50">
              
              {/* ✨ FIXED: Added an image and simplified the text */}
              <div className="flex items-center gap-3">
                <img 
                  src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/category-model/curated1.webp" 
                  alt="Stylist" 
                  className="w-10 h-10 rounded-md object-cover border border-[#E9D8C3]"
                />
                <div className="flex flex-col text-left">
                  <span className="text-[13px] font-serif font-bold text-[#4A1F58] leading-tight">
                    We are here
                  </span>
                  <span className="text-[10px] font-sans text-zinc-500 uppercase tracking-wider">
                    To assist you
                  </span>
                </div>
              </div>
              
              <button onClick={() => setIsVisible(false)} className="sm:hidden p-1 text-zinc-400 hover:text-[#4A1F58]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <a 
                href="https://wa.me/918356834764?text=Hi!%20I%20need%20help."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#4A1F58] hover:bg-[#302832] text-white text-xs font-sans font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
              
              <Link 
                to="/stores"
                onClick={() => setIsVisible(false)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#F7F1E8] hover:bg-[#E9D8C3] text-[#4A1F58] border border-[#E9D8C3]/50 text-xs font-sans font-medium transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Find a Store
              </Link>
            </div>

            <button onClick={() => setIsVisible(false)} className="hidden sm:block p-1.5 ml-2 rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-[#4A1F58] transition-colors">
              <X className="w-5 h-5" />
            </button>

          </div>
        )}
      </div>
    </div>
  );
}