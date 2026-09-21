import React, { useEffect, useState } from "react";
import { createFileRoute, Link, useParams, useRouter } from "@tanstack/react-router";
import { 
  ArrowLeft, RefreshCw, Diamond, Coins, Info, Phone, Mail, FileText,
  Truck, Scale, ShieldCheck, AlertCircle, Package, Clock, Gift
} from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/policy/$slug')({
  component: DynamicPolicyPage,
});

// Map string names from DB to actual Lucide Icons
const ICON_MAP: Record<string, React.ElementType> = {
  Truck, Scale, FileText, AlertCircle, ShieldCheck, 
  Package, Clock, RefreshCw, Coins, Info, Diamond, Gift
};

function DynamicPolicyPage() {
  const { slug } = Route.useParams();
  const router = useRouter();
  const [policyData, setPolicyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("ecommerce_policies")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();
        
      if (error || !data) {
        router.history.push("/"); // Redirect home if policy not found
      } else {
        setPolicyData(data);
      }
      setIsLoading(false);
    };
    fetchPolicy();
  }, [slug]);

  if (isLoading || !policyData) return <div className="min-h-screen bg-[#F7F1E8]" />;

  const HeroIcon = ICON_MAP[policyData.hero_icon] || FileText;

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
          <button onClick={() => window.history.back()} className="text-zinc-500 hover:text-[#4A1F58] transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => router.history.push("/")}>
            <Logo className="h-8 md:h-10 w-auto" />
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-4 pt-10 md:pt-16 pb-16 relative z-10 animate-in fade-in duration-500">
        
        {/* HERO TITLE */}
        <div className="text-center mb-12 md:mb-16">
          <div className="w-16 h-16 mx-auto bg-white border border-[#E9D8C3] rounded-full flex items-center justify-center mb-6 shadow-sm">
            <HeroIcon className="w-6 h-6 text-[#C9A15B]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-medium text-[#4A1F58] mb-4">
            {policyData.page_title}
          </h1>
          {policyData.subtitle && (
            <p className="text-xs font-sans text-zinc-500 uppercase tracking-[0.2em]">
              {policyData.subtitle}
            </p>
          )}
        </div>

        {/* CONTENT BLOCKS */}
        <div className="bg-white border border-[#E9D8C3] rounded-sm shadow-[0_10px_40px_rgba(74,31,88,0.03)] overflow-hidden">
          <div className="h-1.5 w-full bg-[#C9A15B]" />
          <div className="p-6 md:p-12 space-y-12">
            
            {(policyData.blocks || []).map((block: any, idx: number) => {
              const BlockIcon = ICON_MAP[block.icon] || Info;
              return (
                <div key={idx} className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                  <div className="w-12 h-12 shrink-0 bg-[#F7F1E8] rounded-sm border border-[#E9D8C3] flex items-center justify-center text-[#C9A15B]">
                    <BlockIcon className="w-5 h-5" />
                  </div>
                  <div className="w-full">
                    <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-3">{block.title}</h2>
                    <div 
                      className="text-sm font-sans text-zinc-600 leading-relaxed space-y-3 prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5"
                      dangerouslySetInnerHTML={{ __html: block.content }} 
                    />
                  </div>
                </div>
              );
            })}

          </div>

          {/* FOOTER CONTACT */}
          <div className="bg-[#F7F1E8]/50 border-t border-[#E9D8C3] p-6 md:p-10 text-center">
            <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#302832] mb-6">
              Need Assistance?
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8">
              <a href={`tel:${policyData.support_phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm font-sans font-bold text-[#4A1F58] hover:text-[#C9A15B] transition-colors">
                <Phone className="w-4 h-4" /> {policyData.support_phone}
              </a>
              <div className="hidden sm:block w-px h-4 bg-[#E9D8C3]" />
              <a href={`mailto:${policyData.support_email}`} className="flex items-center gap-2 text-sm font-sans font-bold text-[#4A1F58] hover:text-[#C9A15B] transition-colors">
                <Mail className="w-4 h-4" /> {policyData.support_email}
              </a>
            </div>
          </div>
        </div>
        
        {/* QUICK NAVIGATION */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <Link 
            to="/policy/$slug" 
            params={{ slug: "exchange-buyback" }} 
            className="flex items-center gap-2 text-[10px] font-sans font-bold text-zinc-500 hover:text-[#4A1F58] uppercase tracking-[0.15em] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Exchange & Buyback
          </Link>
          
          <span className="text-zinc-300 hidden md:block">•</span>
          
          <Link 
            to="/policy/$slug" 
            params={{ slug: "shipping" }} 
            className="flex items-center gap-2 text-[10px] font-sans font-bold text-zinc-500 hover:text-[#4A1F58] uppercase tracking-[0.15em] transition-colors"
          >
            <Truck className="w-3.5 h-3.5" /> Shipping Policy
          </Link>
          
          <span className="text-zinc-300 hidden md:block">•</span>
          
          <Link 
            to="/policy/$slug" 
            params={{ slug: "gift-voucher" }} 
            className="flex items-center gap-2 text-[10px] font-sans font-bold text-zinc-500 hover:text-[#4A1F58] uppercase tracking-[0.15em] transition-colors"
          >
            <Gift className="w-3.5 h-3.5" /> Gift Vouchers
          </Link>

          <span className="text-zinc-300 hidden md:block">•</span>
          
          <Link 
            to="/policy/$slug" 
            params={{ slug: "terms" }} 
            className="flex items-center gap-2 text-[10px] font-sans font-bold text-zinc-500 hover:text-[#4A1F58] uppercase tracking-[0.15em] transition-colors"
          >
            <Scale className="w-3.5 h-3.5" /> Terms of Service
          </Link>
        </div>

      </main>
    </div>
  );
}

