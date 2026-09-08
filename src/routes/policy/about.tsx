import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Award, Diamond, ShieldCheck, ArrowRight, Star } from "lucide-react";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute('/policy/about')({
  component: AboutPage,
});
function AboutPage() {
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

      <main className="max-w-[1200px] mx-auto px-4 pt-10 md:pt-16 pb-16 relative z-10">
        
        {/* PAGE HEADER */}
        <div className="text-center mb-12 md:mb-20">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-medium text-[#4A1F58] mb-4 md:mb-6">
            Our Heritage
          </h1>
          <p className="text-[10px] md:text-xs font-sans font-bold text-[#C9A15B] uppercase tracking-[0.2em] max-w-lg mx-auto leading-relaxed">
            Providing rare & beautiful items sourced both locally & globally.
          </p>
        </div>

        {/* SECTION 1: THE BRAND STORY (Split Layout) */}
        <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-center mb-24 md:mb-32">
          
          {/* Left: Editorial Image */}
          <div className="w-full lg:w-1/2">
            <div className="aspect-[4/5] md:aspect-square w-full bg-white border border-[#E9D8C3] rounded-sm p-3 shadow-sm relative">
              <img 
                src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/vip-model.webp" 
                alt="Pavitram Diamond Jewellery Craftsmanship" 
                className="w-full h-full object-cover rounded-sm"
              />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#F7F1E8] border border-[#E9D8C3] rounded-full hidden md:flex items-center justify-center shadow-sm">
                <Diamond className="w-8 h-8 text-[#C9A15B]" />
              </div>
            </div>
          </div>

          {/* Right: Story Copy */}
          <div className="w-full lg:w-1/2 space-y-6">
            <h2 className="text-2xl md:text-4xl font-serif font-medium text-[#4A1F58] leading-tight">
              A Legacy of <span className="text-[#C9A15B] italic font-light">Elegance</span>
            </h2>
            
            <div className="space-y-4 text-sm md:text-base font-sans text-zinc-600 leading-relaxed">
              <p>
                <strong className="text-[#302832]">Pavitram Diamond Jewellery</strong>, by Ossam Jewels Pvt Ltd, supplies an extensive range of exclusive, handcrafted designer diamond jewellery across India. We have proudly emerged as a premier designer, manufacturer, and distributor with a nationwide reputation and a unique market niche.
              </p>
              <p>
                Our exquisite diamond-studded collections span Contemporary Classic, Ethnic, Western Victorian, Bridal, and Everyday Casual wear. Under the name “Pavitram,” we provide our customers with an authentic purity that is unmatched, along with an immaculate collection of sparkling designs to choose from.
              </p>
              <p>
                Today, a great part of our success is attributed to creations based on India’s ancient design legacies, finely blended with international style trends. We are passionately pursuing our mission to be India’s most respected jewellery company on all counts.
              </p>
            </div>
            
            <div className="pt-6 border-t border-[#E9D8C3]/50">
               <p className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#4A1F58]">
                 Come, let's join hands and share the awesome success with dazzling brilliance.
               </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: THE FOUNDER */}
        <div className="bg-white border border-[#E9D8C3] rounded-sm p-8 md:p-16 lg:p-20 shadow-[0_10px_40px_rgba(74,31,88,0.03)] relative overflow-hidden mb-24 md:mb-32">
          
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C9A15B]" />
          
          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            
            {/* Founder Abstract/Portrait placeholder */}
            <div className="w-32 md:w-48 shrink-0">
               <div className="aspect-[3/4] w-full bg-[#F7F1E8] border border-[#E9D8C3] rounded-sm overflow-hidden p-2">
                  <img 
                    src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/store-front.webp" 
                    alt="Paresh Maniar" 
                    className="w-full h-full object-cover rounded-sm grayscale opacity-80"
                  />
               </div>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#C9A15B] mb-2">
                  The Founder
                </h3>
                <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58]">
                  Paresh Maniar
                </h2>
              </div>
              
              <p className="text-sm font-sans text-zinc-600 leading-relaxed">
                Paresh Maniar, the founder and CEO of Pavitram Diamond Jewellery, is a first-generation entrepreneur and a visionary in diamond jewellery. Being a true lover of diamonds, he had a vision to create an opportunity for all to possess and experience the aspirational value of fine diamond jewellery.
              </p>
              
              <blockquote className="border-l-2 border-[#C9A15B] pl-5 py-2 my-6">
                <p className="text-lg md:text-xl font-serif italic text-[#302832] leading-relaxed">
                  "We being manufacturers, wholesalers, and retailers of diamond jewellery, provide our customers affluent designs with an authentic quality and the best prices."
                </p>
              </blockquote>

              <p className="text-sm font-sans text-zinc-600 leading-relaxed">
                He discovered the fresh, bold concept of <em>Diamond Kitty</em>, which serves as an inspiration for the entire jewellery industry. For his visionary efforts, he was felicitated with the award of <strong>'Fastest Rising Brand - Pavitram Diamond Jewellery'</strong> at the Achievers of the Year 2018 by the Lions Club.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: THE PAVITRAM PROMISE */}
        <div>
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-serif font-medium text-[#4A1F58] mb-4">
              The Pavitram Promise
            </h2>
            <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-zinc-400">
              Strategies of trust and commitment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white border border-[#E9D8C3] p-8 md:p-10 rounded-sm text-center shadow-sm hover:border-[#C9A15B] transition-colors">
              <div className="w-14 h-14 mx-auto bg-[#F7F1E8] rounded-full flex items-center justify-center mb-6 text-[#C9A15B]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-medium text-[#4A1F58] mb-3">Genuine Quality</h3>
              <p className="text-xs font-sans text-zinc-500 leading-relaxed">
                Every piece of Pavitram Diamond Jewellery carries a certificate of genuine quality and authentic purity.
              </p>
            </div>

            <div className="bg-white border border-[#E9D8C3] p-8 md:p-10 rounded-sm text-center shadow-sm hover:border-[#C9A15B] transition-colors">
              <div className="w-14 h-14 mx-auto bg-[#F7F1E8] rounded-full flex items-center justify-center mb-6 text-[#C9A15B]">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-medium text-[#4A1F58] mb-3">Lifetime Exchange</h3>
              <p className="text-xs font-sans text-zinc-500 leading-relaxed">
                We offer a lifetime buy-back and exchange guarantee, strengthening our competitive position among retailers.
              </p>
            </div>

            <div className="bg-white border border-[#E9D8C3] p-8 md:p-10 rounded-sm text-center shadow-sm hover:border-[#C9A15B] transition-colors">
              <div className="w-14 h-14 mx-auto bg-[#F7F1E8] rounded-full flex items-center justify-center mb-6 text-[#C9A15B]">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-medium text-[#4A1F58] mb-3">Direct from Maker</h3>
              <p className="text-xs font-sans text-zinc-500 leading-relaxed">
                As manufacturers and wholesalers, we guarantee affluent designs at the absolute best factory prices.
              </p>
            </div>

          </div>
        </div>

        {/* CTA SECTION */}
        <div className="mt-20 md:mt-32 text-center">
          <Link 
            to="/Shop" 
            className="inline-flex items-center gap-3 bg-[#4A1F58] hover:bg-[#302832] text-white font-sans font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] px-10 py-4 rounded-sm transition-colors shadow-sm"
          >
            Explore Our Collections <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
    </div>
  );
}