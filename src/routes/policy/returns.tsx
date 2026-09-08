import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  ArrowLeft, RefreshCw, Diamond, 
  Coins, Info, Phone, Mail, FileText,
  Truck
} from "lucide-react";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute('/policy/returns')({
  component: ReturnsPolicyPage,
});

function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F7F1E8] font-sans pb-24 relative overflow-hidden">
      
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
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-4 pt-10 md:pt-16 pb-16 relative z-10">
        
        <div className="text-center mb-12 md:mb-16">
          <div className="w-16 h-16 mx-auto bg-white border border-[#E9D8C3] rounded-full flex items-center justify-center mb-6 shadow-sm">
            <RefreshCw className="w-6 h-6 text-[#C9A15B]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-medium text-[#4A1F58] mb-4">
            Exchange & Buy-Back Policy
          </h1>
          <p className="text-xs font-sans text-zinc-500 uppercase tracking-[0.2em]">
            Transparent, fair, and lifelong value
          </p>
        </div>

        <div className="bg-white border border-[#E9D8C3] rounded-sm shadow-[0_10px_40px_rgba(74,31,88,0.03)] overflow-hidden">
          <div className="h-1.5 w-full bg-[#C9A15B]" />

          <div className="p-6 md:p-12 space-y-12">

            {/* No Full Returns Notice */}
            <div className="bg-[#F7F1E8]/50 border border-[#E9D8C3] p-6 rounded-sm flex items-start gap-4">
              <Info className="w-6 h-6 text-[#4A1F58] shrink-0 mt-1" />
              <div>
                <h3 className="text-base font-serif font-medium text-[#4A1F58] mb-2">Notice Regarding Returns</h3>
                <p className="text-sm font-sans text-zinc-600 leading-relaxed">
                  Due to the high-value, bespoke nature of fine diamond jewelry, <strong>Pavitram does not offer direct cash refunds or full-value returns.</strong> Instead, we secure your investment through our industry-leading 100% Exchange and Lifetime Buy-Back policies detailed below.
                </p>
              </div>
            </div>

            {/* 100% Exchange Policy */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="w-12 h-12 shrink-0 bg-[#F7F1E8] rounded-sm border border-[#E9D8C3] flex items-center justify-center text-[#C9A15B]">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-3">1. 15-Day 100% Exchange Guarantee</h2>
                <div className="text-sm font-sans text-zinc-600 leading-relaxed space-y-3">
                  <p>
                    If you wish to change your design, you may exchange your jewelry for any other piece of equal or higher value within <strong>15 days of delivery</strong> at 100% of your invoice value.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>The jewelry must be completely unused, unaltered, and without scratches or damage.</li>
                    <li>Original packaging, BIS Hallmark, and IGI/SGL certificates must be provided intact.</li>
                    <li>Customized items (e.g., engraved pieces or custom ring sizes outside standard dimensions) are not eligible for the 15-day 100% exchange.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Lifetime Buy-Back (Depreciated Returns) */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="w-12 h-12 shrink-0 bg-[#F7F1E8] rounded-sm border border-[#E9D8C3] flex items-center justify-center text-[#C9A15B]">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-3">2. Lifetime Buy-Back (Depreciated Returns)</h2>
                <div className="text-sm font-sans text-zinc-600 leading-relaxed space-y-3">
                  <p>
                    If you wish to return your jewelry for monetary value after 15 days, or at any point in your lifetime, Pavitram offers a transparent depreciated Buy-Back policy based on prevailing market rates:
                  </p>
                  <div className="bg-[#F7F1E8]/50 p-5 border border-[#E9D8C3] rounded-sm mt-3 space-y-2">
                    <div className="flex justify-between border-b border-[#E9D8C3] pb-2">
                      <span className="font-bold text-[#302832]">Gold Value</span>
                      <span className="text-[#4A1F58]">100% of current market value</span>
                    </div>
                    <div className="flex justify-between border-b border-[#E9D8C3] pb-2 pt-2">
                      <span className="font-bold text-[#302832]">Diamond Value</span>
                      <span className="text-[#4A1F58]">90% of current market value</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="font-bold text-[#302832]">Making Charges & Taxes</span>
                      <span className="text-zinc-500 italic">Excluded (0% return value)</span>
                    </div>
                  </div>
                  <p className="mt-3">
                    Buy-back valuations require physical inspection by our quality assurance team. The final buy-back value will be processed to the original payment source or via bank transfer to the registered customer's account.
                  </p>
                </div>
              </div>
            </div>

            {/* DPDP Identity Compliance */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="w-12 h-12 shrink-0 bg-[#F7F1E8] rounded-sm border border-[#E9D8C3] flex items-center justify-center text-[#C9A15B]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-3">3. KYC & Data Privacy for Transactions</h2>
                <div className="text-sm font-sans text-zinc-600 leading-relaxed space-y-3">
                  <p>
                    As mandated by Indian governmental regulations regarding precious metals, valid KYC documents (PAN Card / Aadhaar Card) may be required when processing high-value exchanges or lifetime buy-backs.
                  </p>
                  <p>
                    In strict accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>, any identity documentation collected during the exchange or buy-back process is processed securely, used exclusively for regulatory verification, and protected via 256-bit encryption.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-[#F7F1E8]/50 border-t border-[#E9D8C3] p-6 md:p-10 text-center">
            <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#302832] mb-6">
              Initiate an Exchange or Buy-Back
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
          <Link to="/policy/shipping" className="flex items-center gap-2 text-[10px] font-sans font-bold text-zinc-500 hover:text-[#4A1F58] uppercase tracking-[0.15em] transition-colors">
            <Truck className="w-3.5 h-3.5" /> Shipping Policy
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