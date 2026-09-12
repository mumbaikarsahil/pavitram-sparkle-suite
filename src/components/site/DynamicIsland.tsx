import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, MessageCircle, X } from "lucide-react";

export function DynamicIsland() {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger the pop-up 4 seconds after the page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-4 md:left-8 z-[90] w-[calc(100vw-2rem)] md:w-[320px] animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out">
      
      {/* Luxury Concierge Card */}
      <div className="bg-white rounded-sm shadow-[0_20px_40px_rgba(74,31,88,0.15)] border border-[#E9D8C3] flex flex-col overflow-hidden relative group">
        
        {/* Close Button (Overlaps Image) */}
        <button 
          onClick={() => setIsVisible(false)} 
          className="absolute top-3 right-3 z-10 w-7 h-7 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Large Feature Image */}
        <div className="relative w-full h-36 md:h-40 bg-[#F7F1E8] overflow-hidden">
          <img 
            src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/section2.webp" 
            alt="Pavitram Stylist" 
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Subtle gradient overlay to make the image blend smoothly into the white card */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90" />
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col">
          
          <div className="mb-4">
            <span className="text-[9px] font-sans font-bold text-[#C9A15B] uppercase tracking-[0.2em] block mb-1">
              Pavitram Concierge
            </span>
            <h3 className="text-xl font-serif font-medium text-[#4A1F58] leading-tight mb-1.5">
              Need help finding the perfect piece?
            </h3>
            <p className="text-xs font-sans text-zinc-500 leading-relaxed">
              Connect with our stylists or visit a boutique near you to experience our craftsmanship in person.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            <a 
              href="https://wa.me/918356834764?text=Hi!%20I%20would%20like%20to%20speak%20with%20a%20jewellery%20stylist."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#4A1F58] hover:bg-[#302832] text-white rounded-sm text-xs font-sans font-bold uppercase tracking-widest transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
            
            <Link 
              to="/stores"
              onClick={() => setIsVisible(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-white hover:bg-[#F7F1E8] text-[#4A1F58] border border-[#E9D8C3] rounded-sm text-xs font-sans font-bold uppercase tracking-widest transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Locate a Store
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}