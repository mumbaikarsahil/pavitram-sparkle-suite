import { createFileRoute } from '@tanstack/react-router'

import React from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, MessageCircle, Ticket, Phone } from "lucide-react";
import { Logo } from "@/components/site/Logo"; // Adjust path if needed


export const Route = createFileRoute('/Soon')({
    component: ComingSoon,  
  });

  export function ComingSoon() {
    return (
      
      <div className="fixed inset-0 z-[9999] min-h-[100dvh] w-screen overflow-y-auto bg-[#FCF9F5] flex flex-col font-sans selection:bg-[#4A1F58] selection:text-white">
        
        {/* Subtle Background Texture */}
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply"
        />
  
        {/* Standalone Roadblock Header */}
        <header className="relative z-20 w-full p-6 md:p-8 flex items-center justify-center sm:justify-start">
          <Logo className="h-10 sm:h-12 w-auto object-contain" />
        </header>
  
        {/* Main Content Centered */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-[1000px] mx-auto text-center mt-[-5vh]">
          <h1 className="text-[12vw] sm:text-6xl md:text-7xl lg:text-8xl font-serif text-[#302832] tracking-tight leading-[1.05] mb-6">
            Great things <br />
            <span className="text-[#C9A15B] italic font-light">coming soon.</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-xl text-zinc-500 max-w-[600px] mx-auto font-medium leading-relaxed mb-12 px-4">
            Just like our diamonds, our website is currently under pressure to be brilliant. We are meticulously setting the final stones and will be launching soon.
          </p>
  
          {/* Quick Links */}
          <div className="flex flex-col items-center w-full">
            <h3 className="text-xl md:text-2xl font-serif font-medium text-[#302832] mb-6">
              Quick Links
            </h3>
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-2">
              <QuickLink 
                href="https://wa.me/918356834764?text=Hi!%20I%20need%20jewellery%20assistance."
                icon={<MessageCircle className="w-4 h-4" />} 
                text="Get Jewellery Assistance" 
              />
              <QuickLink 
                href="https://www.biillojewel.co.in/storelocations" 
                icon={<MapPin className="w-4 h-4" />} 
                text="Store Locator" 
              />
              <QuickLink 
                href="https://wa.me/918356834764?text=Hi!%20I%20want%20to%20claim%20my%20voucher."
                icon={<Ticket className="w-4 h-4" />} 
                text="Claim Voucher Code" 
              />
              <QuickLink 
                href="tel:+918356834764"
                icon={<Phone className="w-4 h-4" />} 
                text="Contact Us" 
              />
            </div>
          </div>
        </main>
  
        {/* Minimal Footer */}
        <footer className="relative z-10 w-full p-6 text-center">
          <p className="text-xs font-sans text-zinc-400 tracking-wider uppercase font-bold">
            © {new Date().getFullYear()} Pavitram Diamond Jewellery.
          </p>
        </footer>
      </div>
    );
  }
// Reusable component matching Apple's pill-shaped buttons
function QuickLink({ to, href, icon, text }: { to?: string, href?: string, icon: React.ReactNode, text: string }) {
  const baseClasses = "flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#E9D8C3] bg-white/40 backdrop-blur-md text-[#4A1F58] hover:bg-white hover:border-[#C9A15B] transition-all duration-300 text-sm font-sans font-medium shadow-sm hover:shadow-md";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={baseClasses}>
        <span className="text-[#C9A15B]">{icon}</span>
        {text}
      </a>
    );
  }

  return (
    <Link to={to || "/"} className={baseClasses}>
      <span className="text-[#C9A15B]">{icon}</span>
      {text}
    </Link>
  );
}