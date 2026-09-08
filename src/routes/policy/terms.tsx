import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  ArrowLeft, ShieldCheck, Scale, FileText, 
  Lock, AlertCircle, Phone, Mail
} from "lucide-react";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute('/policy/terms')({
  component: TermsPage,
});

function TermsPage() {
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
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-4 pt-10 md:pt-16 pb-16 relative z-10">
        
        <div className="text-center mb-12 md:mb-16">
          <div className="w-16 h-16 mx-auto bg-white border border-[#E9D8C3] rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Scale className="w-6 h-6 text-[#C9A15B]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-medium text-[#4A1F58] mb-4">
            Terms of Service
          </h1>
          <p className="text-xs font-sans text-zinc-500 uppercase tracking-[0.2em]">
            Last Updated: September 8, 2026
          </p>
        </div>

        <div className="bg-white border border-[#E9D8C3] rounded-sm shadow-[0_10px_40px_rgba(74,31,88,0.03)] overflow-hidden">
          <div className="h-1.5 w-full bg-[#C9A15B]" />

          <div className="p-6 md:p-12 space-y-12">

            {/* Introduction */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="w-12 h-12 shrink-0 bg-[#F7F1E8] rounded-sm border border-[#E9D8C3] flex items-center justify-center text-[#C9A15B]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-3">1. Agreement to Terms</h2>
                <div className="text-sm font-sans text-zinc-600 leading-relaxed space-y-3">
                  <p>
                    These Terms of Service constitute a legally binding agreement made between you and Ossam Jewels Pvt Ltd (operating as "Pavitram" or "Pavitram Diamond Jewellery"), concerning your access to and use of the Pavitram website.
                  </p>
                  <p>
                    By accessing the site, you agree that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree, you are expressly prohibited from using the site.
                  </p>
                </div>
              </div>
            </div>

            {/* DPDP Act Compliance */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="w-12 h-12 shrink-0 bg-[#F7F1E8] rounded-sm border border-[#E9D8C3] flex items-center justify-center text-[#C9A15B]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-3">2. Data Privacy & DPDP Act (2023) Compliance</h2>
                <div className="text-sm font-sans text-zinc-600 leading-relaxed space-y-3">
                  <p>
                    Pavitram is strictly compliant with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> of India. We process your personal data (including name, contact details, and transaction history) solely for fulfilling your orders, regulatory compliance (such as PAN/Aadhaar requirements for high-value transactions), and improving your experience.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><strong>Consent:</strong> Explicit consent is acquired prior to processing your data. You may withdraw consent at any time by contacting our Data Protection Officer.</li>
                    <li><strong>Data Fiduciary:</strong> Ossam Jewels Pvt Ltd acts as the Data Fiduciary and ensures enterprise-grade 256-bit encryption for all stored data.</li>
                    <li><strong>No Third-Party Sale:</strong> We strictly prohibit the unauthorized sale or transfer of your personal data to external marketing agencies.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Product Accuracy */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="w-12 h-12 shrink-0 bg-[#F7F1E8] rounded-sm border border-[#E9D8C3] flex items-center justify-center text-[#C9A15B]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-3">3. Product Specifications & Pricing</h2>
                <div className="text-sm font-sans text-zinc-600 leading-relaxed space-y-3">
                  <p>
                    While we strive for extreme precision, diamond and metal weights may vary slightly due to the handcrafted nature of our products. The final weight and specifications will be accurately detailed in your IGI/SGL and BIS Hallmark certifications.
                  </p>
                  <p>
                    Prices for our products are subject to change without notice based on prevailing market rates for precious metals and stones. We reserve the right to modify or discontinue any product.
                  </p>
                </div>
              </div>
            </div>

            {/* Grievance Officer */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="w-12 h-12 shrink-0 bg-[#F7F1E8] rounded-sm border border-[#E9D8C3] flex items-center justify-center text-[#C9A15B]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-3">4. Grievance Redressal</h2>
                <div className="text-sm font-sans text-zinc-600 leading-relaxed space-y-3">
                  <p>
                    In compliance with the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, Pavitram has appointed a Grievance Officer to address any discrepancies or grievances you may have within 30 days of receipt.
                  </p>
                  <div className="bg-[#F7F1E8]/50 p-4 border border-[#E9D8C3] rounded-sm mt-2">
                    <p className="font-bold text-[#302832]">Grievance Officer</p>
                    <p>Email: grievance@pavitram.com</p>
                    <p>Phone: +91 83568 34764</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-[#F7F1E8]/50 border-t border-[#E9D8C3] p-6 md:p-10 text-center">
            <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#302832] mb-6">
              Legal Support Inquiries
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8">
              <a href="tel:+918356834764" className="flex items-center gap-2 text-sm font-sans font-bold text-[#4A1F58] hover:text-[#C9A15B] transition-colors">
                <Phone className="w-4 h-4" /> +91 83568 34764
              </a>
              <div className="hidden sm:block w-px h-4 bg-[#E9D8C3]" />
              <a href="mailto:legal@pavitram.com" className="flex items-center gap-2 text-sm font-sans font-bold text-[#4A1F58] hover:text-[#C9A15B] transition-colors">
                <Mail className="w-4 h-4" /> legal@pavitram.com
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}