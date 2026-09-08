import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Truck, ShieldCheck, Package, Clock, 
  MapPin, ArrowLeft, Phone, Mail, FileText
} from "lucide-react";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute('/policy/shipping')({
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
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
          <button onClick={() => history.back()} className="text-zinc-500 hover:text-[#4A1F58] transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link to="/">
              <Logo className="h-8 md:h-10 w-auto" />
            </Link>
          </div>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-4 pt-10 md:pt-16 pb-16 relative z-10">
        
        {/* Page Title */}
        <div className="text-center mb-12 md:mb-16">
          <div className="w-16 h-16 mx-auto bg-white border border-[#E9D8C3] rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Truck className="w-6 h-6 text-[#C9A15B]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-medium text-[#4A1F58] mb-4">
            Shipping & Delivery
          </h1>
          <p className="text-xs font-sans text-zinc-500 uppercase tracking-[0.2em]">
            Secure, insured, and complimentary across India
          </p>
        </div>

        {/* Content Container */}
        <div className="bg-white border border-[#E9D8C3] rounded-sm shadow-[0_10px_40px_rgba(74,31,88,0.03)] overflow-hidden">
          
          {/* Top Gold Accent Bar */}
          <div className="h-1.5 w-full bg-[#C9A15B]" />

          <div className="p-6 md:p-12 space-y-12">

            {/* Policy Block 1 */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="w-12 h-12 shrink-0 bg-[#F7F1E8] rounded-sm border border-[#E9D8C3] flex items-center justify-center text-[#C9A15B]">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-3">1. Complimentary & Insured Transit</h2>
                <div className="text-sm font-sans text-zinc-600 leading-relaxed space-y-3">
                  <p>
                    Pavitram is proud to offer <strong>100% free and fully insured shipping</strong> on all orders within India. 
                  </p>
                  <p>
                    We understand that jewelry is a precious investment. From the moment your piece leaves our atelier to the exact second it is handed to you, it is fully covered by our transit insurance. You hold zero liability for the package while it is in transit.
                  </p>
                </div>
              </div>
            </div>

            {/* Policy Block 2 */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="w-12 h-12 shrink-0 bg-[#F7F1E8] rounded-sm border border-[#E9D8C3] flex items-center justify-center text-[#C9A15B]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-3">2. Processing & Dispatch Timelines</h2>
                <div className="text-sm font-sans text-zinc-600 leading-relaxed space-y-3">
                  <p>
                    The estimated dispatch time varies based on the piece you have selected. You can find the exact dispatch timeline listed on every product page.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><strong>Ready to Ship:</strong> Dispatched within 24 to 48 hours of order confirmation.</li>
                    <li><strong>Made to Order:</strong> Intricate pieces and custom ring sizes typically require 10 to 15 manufacturing days before dispatch.</li>
                  </ul>
                  <p>
                    Once dispatched, standard delivery takes <strong>3 to 5 business days</strong> depending on your pincode.
                  </p>
                </div>
              </div>
            </div>

            {/* Policy Block 3 */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="w-12 h-12 shrink-0 bg-[#F7F1E8] rounded-sm border border-[#E9D8C3] flex items-center justify-center text-[#C9A15B]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-3">3. Tamper-Proof Packaging & Secure Handover</h2>
                <div className="text-sm font-sans text-zinc-600 leading-relaxed space-y-3">
                  <p>
                    Your jewelry arrives in our signature Pavitram luxury box, securely sealed within a discreet, tamper-proof external package. This ensures the contents remain hidden and secure during transit.
                  </p>
                  <p className="text-[#4A1F58] font-bold bg-[#F7F1E8]/50 p-4 border border-[#E9D8C3] rounded-sm mt-4">
                    Important: Please do not accept the package if the external tamper-proof seal is broken, damaged, or appears to have been reconstructed.
                  </p>
                  <p>
                    For your security, delivery handovers require an <strong>OTP (One-Time Password)</strong> and a valid government-issued ID to be shown to our logistics partner.
                  </p>
                </div>
              </div>
            </div>

            {/* Policy Block 4 */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="w-12 h-12 shrink-0 bg-[#F7F1E8] rounded-sm border border-[#E9D8C3] flex items-center justify-center text-[#C9A15B]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-3">4. Order Tracking</h2>
                <div className="text-sm font-sans text-zinc-600 leading-relaxed space-y-3">
                  <p>
                    As soon as your order is dispatched, you will receive a tracking link via Email and WhatsApp. You can monitor the exact location of your package in real-time.
                  </p>
                  <Link to="/track-order" className="inline-flex items-center gap-2 mt-2 text-[10px] font-bold text-[#4A1F58] uppercase tracking-[0.15em] border-b border-[#4A1F58] pb-0.5 hover:text-[#C9A15B] hover:border-[#C9A15B] transition-colors">
                    Track Your Order Here
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Contact Section inside the card */}
          <div className="bg-[#F7F1E8]/50 border-t border-[#E9D8C3] p-6 md:p-10 text-center">
            <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#302832] mb-6">
              Need assistance with your delivery?
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8">
              <a href="tel:+918356834764" className="flex items-center gap-2 text-sm font-sans font-bold text-[#4A1F58] hover:text-[#C9A15B] transition-colors">
                <Phone className="w-4 h-4" /> +91 83568 34764
              </a>
              <div className="hidden sm:block w-px h-4 bg-[#E9D8C3]" />
              <a href="mailto:support@pavitram.com" className="flex items-center gap-2 text-sm font-sans font-bold text-[#4A1F58] hover:text-[#C9A15B] transition-colors">
                <Mail className="w-4 h-4" /> support@pavitram.com
              </a>
            </div>
          </div>

        </div>
        
        {/* Additional Links */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <Link to="/policy/returns" className="flex items-center gap-2 text-[10px] font-sans font-bold text-zinc-500 hover:text-[#4A1F58] uppercase tracking-[0.15em] transition-colors">
            <FileText className="w-3.5 h-3.5" /> Return Policy
          </Link>
          <span className="text-zinc-300">•</span>
          <Link to="/policy/terms" className="flex items-center gap-2 text-[10px] font-sans font-bold text-zinc-500 hover:text-[#4A1F58] uppercase tracking-[0.15em] transition-colors">
            <FileText className="w-3.5 h-3.5" /> Terms of Service
          </Link>
        </div>

      </main>
    </div>
  );
}