import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
// Added Download and Loader2 icons
import { MapPin, MessageCircle, Ticket, Phone, BookOpen, X, Sparkles, Download, Loader2 } from "lucide-react";
import { Logo } from "@/components/site/Logo"; 
import { StoreLocator } from "@/components/site/StoreLocator";

export const Route = createFileRoute('/Soon')({
  component: ComingSoon,  
});

export function ComingSoon() {
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [isStoreLocatorOpen, setIsStoreLocatorOpen] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(true); // Tracks iframe load state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const CATALOGUE_PDF_URL = "https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/18.07.2026%20New%20Catalogue%20NEW%20Price%20UPDATE.pdf";

  const handleOpenStoreLocator = () => {
    setIsStoreLocatorOpen(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => console.warn("Location access denied or failed:", error)
      );
    }
  };

  const handleOpenCatalogue = () => {
    setIsPdfLoading(true); // Reset loading state every time it opens
    setIsCatalogueOpen(true);
  };

  return (
    <>
      {/* --- MAIN ROADBLOCK PAGE --- */}
      <div className="fixed inset-0 z-[9999] min-h-[100dvh] w-screen overflow-y-auto bg-[#FCF9F5] flex flex-col font-sans selection:bg-[#4A1F58] selection:text-white">
        
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply"
        />
  
        <header className="relative z-20 w-full p-6 md:p-8 flex items-center justify-center sm:justify-start">
          <Logo className="h-16 sm:h-20 md:h-24 w-auto object-contain" />
        </header>
  
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-[1000px] mx-auto text-center mt-[-1vh]">
          <h1 className="text-[12vw] sm:text-6xl md:text-7xl lg:text-8xl font-serif text-[#302832] tracking-tight leading-[1.05] mb-6">
            Great things <br />
            <span className="text-[#C9A15B] italic font-light">coming soon.</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-xl text-zinc-500 max-w-[600px] mx-auto font-medium leading-relaxed mb-12 px-4">
            Just like our diamonds, our website is currently under pressure to be brilliant. We are meticulously setting the final stones and will be launching soon.
          </p>
  
          <div className="flex flex-col items-center w-full">
            <h3 className="text-xl md:text-2xl font-serif font-medium text-[#302832] mb-6">
              Quick Links
            </h3>
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-2">
              <QuickLink 
                onClick={handleOpenCatalogue} 
                icon={<BookOpen className="w-4 h-4" />} 
                text="View Our Jewellery Catalogue" 
              />
              <QuickLink 
                onClick={handleOpenStoreLocator} 
                icon={<MapPin className="w-4 h-4" />} 
                text="Store Locator" 
              />
              <QuickLink 
                href="https://wa.me/918356834764?text=Hi!%20I%20need%20jewellery%20assistance."
                icon={<MessageCircle className="w-4 h-4" />} 
                text="Get Jewellery Assistance" 
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
  
        <footer className="relative z-10 w-full p-6 text-center">
          <p className="text-xs font-sans text-zinc-400 tracking-wider uppercase font-bold">
            © {new Date().getFullYear()} Pavitram Diamond Jewellery.
          </p>
        </footer>
      </div>

      {/* --- IN-APP PDF VIEWER & WHATSAPP POPUP --- */}
      {isCatalogueOpen && (
        <div 
          className="fixed inset-0 z-[10000] bg-[#FCF9F5] flex flex-col animate-in fade-in zoom-in-[0.98] duration-300"
          data-lenis-prevent="true" // Allows normal scrolling inside the modal
        >
          
          <div className="h-14 bg-white/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 shadow-sm z-20 border-b border-[#E9D8C3]">
            <span className="font-serif font-medium text-[#4A1F58] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C9A15B]" />
              <span className="hidden sm:inline">Pavitram Collection</span>
              <span className="sm:hidden">Catalogue</span>
            </span>
            
            <div className="flex items-center gap-1">
              {/* Direct Download Button */}
              <a 
                href={CATALOGUE_PDF_URL}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[#4A1F58] hover:text-[#C9A15B] transition-colors rounded-full hover:bg-zinc-100 flex items-center gap-1.5"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
                <span className="text-xs font-medium hidden sm:inline mr-1">Download</span>
              </a>
              <div className="w-[1px] h-4 bg-[#E9D8C3] mx-1" />
              <button 
                onClick={() => setIsCatalogueOpen(false)}
                className="p-2 text-[#4A1F58] hover:text-[#C9A15B] transition-colors rounded-full hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative w-full h-full overflow-hidden bg-zinc-100">
            
            {/* Beautiful Loading State */}
            {isPdfLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FCF9F5] z-10">
                <Loader2 className="w-8 h-8 text-[#C9A15B] animate-spin mb-4" />
                <p className="text-[#4A1F58] font-medium font-sans animate-pulse text-sm">
                  Polishing the catalogue...
                </p>
              </div>
            )}

            <iframe 
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(CATALOGUE_PDF_URL)}&embedded=true`}
              className="w-full h-full border-none relative z-0"
              title="Pavitram Catalogue"
              onLoad={() => setIsPdfLoading(false)} // Hides the loader when Google finishes
            />

            {/* Floating WhatsApp Conversion Popup */}
            <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] bg-white/90 backdrop-blur-xl border border-[#E9D8C3] shadow-[0_20px_40px_rgba(0,0,0,0.15)] rounded-2xl p-4 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-500 z-20">
              <div className="flex items-center gap-2 mb-3 text-center">
                <Sparkles className="w-4 h-4 text-[#C9A15B]" />
                <span className="text-sm font-sans font-bold text-[#4A1F58]">Found a design you love?</span>
              </div>
              <a 
                href="https://wa.me/918356834764?text=Hi!%20I%20was%20looking%20at%20the%20catalogue%20and%20would%20like%20to%20know%20more."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#4A1F58] hover:bg-[#302832] text-white py-3 px-4 rounded-xl text-xs font-sans font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with a Stylist
              </a>
            </div>
          </div>
        </div>
      )}

      {/* --- STORE LOCATOR MODAL --- */}
      {isStoreLocatorOpen && (
        <div 
          className="fixed inset-0 z-[10000] bg-[#FCF9F5] flex flex-col animate-in slide-in-from-bottom-full duration-500 overflow-y-auto"
          data-lenis-prevent="true" // Allows normal scrolling inside the modal
        >
          <div className="sticky top-0 z-50 h-14 bg-white/80 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between border-b border-[#E9D8C3]">
            <span className="font-serif font-medium text-[#4A1F58] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C9A15B]" />
              Our Boutiques
            </span>
            <button 
              onClick={() => setIsStoreLocatorOpen(false)}
              className="p-1.5 -mr-1.5 text-[#4A1F58] hover:text-[#C9A15B] transition-colors rounded-full hover:bg-black/[0.05]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 py-10 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
            <StoreLocator 
              title="Find a Boutique near you" 
              subtitle="Experience our brilliance in person. Search by city or pincode." 
              initialLocation={userLocation}
            />
          </div>
        </div>
      )}
    </>
  );
}

function QuickLink({ to, href, onClick, icon, text }: { to?: string, href?: string, onClick?: () => void, icon: React.ReactNode, text: string }) {
  const baseClasses = "flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#E9D8C3] bg-white/40 backdrop-blur-md text-[#4A1F58] hover:bg-white hover:border-[#C9A15B] transition-all duration-300 text-sm font-sans font-medium shadow-sm hover:shadow-md cursor-pointer";

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClasses}>
        <span className="text-[#C9A15B]">{icon}</span>
        {text}
      </button>
    );
  }

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