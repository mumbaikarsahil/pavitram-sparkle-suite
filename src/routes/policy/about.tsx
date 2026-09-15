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
          <button onClick={() => window.history.back()} className="text-zinc-500 hover:text-[#4A1F58] transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
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
            Our Story
          </h1>
          <p className="text-[10px] md:text-xs font-sans font-bold text-[#C9A15B] uppercase tracking-[0.2em] max-w-lg mx-auto leading-relaxed">
            Every journey begins with a belief. Ours began in 1990.[cite: 1]
          </p>
        </div>

        {/* SECTION 1: THE BRAND STORY (Split Layout) */}
        <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-center mb-24 md:mb-32">
          
          {/* Left: Editorial Image */}
          <div className="w-full lg:w-1/2">
            <div className="aspect-[4/5] md:aspect-square w-full bg-white border border-[#E9D8C3] rounded-xl md:rounded-sm p-3 shadow-sm relative">
              <img 
                src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/vip-model.webp" 
                alt="Pavitram Diamond Jewellery Craftsmanship" 
                className="w-full h-full object-cover rounded-lg md:rounded-sm"
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
                <strong className="text-[#302832]">Pavitram</strong> began with a simple vision: to create jewellery that would be cherished not only for its beauty, but for the emotions and memories it carries.[cite: 1] Over the years, we have grown alongside the families and communities we serve, becoming a part of countless celebrations, milestones, and traditions.[cite: 1] 
              </p>
              <p>
                For over three decades, we have been creating jewellery that blends traditional artistry with contemporary design, offering collections that resonate with both modern sensibilities and classic values.[cite: 1] Every piece is thoughtfully crafted to celebrate individuality while preserving the beauty and significance that make jewellery truly timeless.[cite: 1]
              </p>
              <p>
                While the world around us has evolved, the values that define Pavitram have remained constant: a commitment to craftsmanship, an uncompromising focus on quality, and an enduring respect for the trust our customers place in us.[cite: 1]
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: WHAT WE STAND FOR */}
        <div className="bg-white border border-[#E9D8C3] rounded-xl md:rounded-sm p-8 md:p-16 lg:p-20 shadow-[0_10px_40px_rgba(74,31,88,0.03)] relative overflow-hidden mb-24 md:mb-32">
          
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C9A15B]" />
          
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">
            
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#C9A15B] mb-2">
                  Our Philosophy
                </h3>
                <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58]">
                  What We Stand For
                </h2>
              </div>
              
              <blockquote className="border-l-2 border-[#C9A15B] pl-5 py-2 my-6">
                <p className="text-lg md:text-xl font-serif italic text-[#302832] leading-relaxed">
                  "At Pavitram, we believe jewellery is an expression of life's most meaningful emotions. It celebrates love, marks achievements, honours traditions, and preserves memories."[cite: 1]
                </p>
              </blockquote>

              <p className="text-sm font-sans text-zinc-600 leading-relaxed">
                The jewellery we wear often becomes a part of our personal story, carrying significance long after the moment has passed.[cite: 1] This philosophy inspires us to create designs that are not only beautiful but meaningful, ensuring every piece remains relevant, treasured, and cherished through generations.[cite: 1]
              </p>
            </div>

            {/* Abstract/Mood placeholder */}
            <div className="w-full md:w-[40%] shrink-0">
               <div className="aspect-[4/3] w-full bg-[#F7F1E8] border border-[#E9D8C3] rounded-xl md:rounded-sm overflow-hidden p-2">
                  <img 
                    src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/social4.webp" 
                    alt="Pavitram Craftsmanship" 
                    className="w-full h-full object-cover rounded-lg md:rounded-sm opacity-90 hover:scale-105 transition-transform duration-700"
                  />
               </div>
            </div>

          </div>
        </div>

        {/* SECTION 3: THE PAVITRAM PILLARS (Editorial Layout) */}
        <div className="mt-24 md:mt-32">
          <div className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#C9A15B] mb-3">
                Our Foundation
              </p>
              <h2 className="text-3xl md:text-5xl font-serif font-medium text-[#4A1F58]">
                Pillars of Pavitram
              </h2>
            </div>
            <div className="w-16 h-[1px] bg-[#C9A15B] hidden md:block mb-3" />
          </div>

          <div className="flex flex-col border-b border-[#E9D8C3]/60">
            
            {/* Pillar 01 */}
            <div className="flex flex-col md:flex-row items-start md:items-center py-10 md:py-16 border-t border-[#E9D8C3]/60 group hover:bg-white/40 transition-colors">
              <div className="w-full md:w-1/4 flex items-center gap-6 mb-6 md:mb-0">
                <span className="text-5xl md:text-7xl font-serif text-[#C9A15B] opacity-30 font-light group-hover:opacity-100 transition-opacity duration-500">
                  01
                </span>
                <div className="w-12 h-12 rounded-full border border-[#E9D8C3] bg-white flex items-center justify-center text-[#C9A15B] shadow-sm group-hover:bg-[#4A1F58] group-hover:border-[#4A1F58] group-hover:text-white transition-all duration-300">
                  <Star className="w-5 h-5" strokeWidth={1.5} />
                </div>
              </div>
              <div className="w-full md:w-1/3 mb-4 md:mb-0 md:pr-8">
                <h3 className="text-2xl md:text-3xl font-serif font-medium text-[#4A1F58] group-hover:text-[#C9A15B] transition-colors duration-300">
                  The Art of Creation
                </h3>
              </div>
              <div className="w-full md:w-5/12">
                <p className="text-sm md:text-base font-sans text-zinc-600 leading-relaxed">
                  Our artisans bring together years of expertise, precision, and attention to detail to transform precious materials into timeless works of art.[cite: 1]
                </p>
              </div>
            </div>

            {/* Pillar 02 */}
            <div className="flex flex-col md:flex-row items-start md:items-center py-10 md:py-16 border-t border-[#E9D8C3]/60 group hover:bg-white/40 transition-colors">
              <div className="w-full md:w-1/4 flex items-center gap-6 mb-6 md:mb-0">
                <span className="text-5xl md:text-7xl font-serif text-[#C9A15B] opacity-30 font-light group-hover:opacity-100 transition-opacity duration-500">
                  02
                </span>
                <div className="w-12 h-12 rounded-full border border-[#E9D8C3] bg-white flex items-center justify-center text-[#C9A15B] shadow-sm group-hover:bg-[#4A1F58] group-hover:border-[#4A1F58] group-hover:text-white transition-all duration-300">
                  <Diamond className="w-5 h-5" strokeWidth={1.5} />
                </div>
              </div>
              <div className="w-full md:w-1/3 mb-4 md:mb-0 md:pr-8">
                <h3 className="text-2xl md:text-3xl font-serif font-medium text-[#4A1F58] group-hover:text-[#C9A15B] transition-colors duration-300">
                  The Collection
                </h3>
              </div>
              <div className="w-full md:w-5/12">
                <p className="text-sm md:text-base font-sans text-zinc-600 leading-relaxed">
                  Every diamond is selected with care. We place great importance on quality, authenticity, and exceptional brilliance.[cite: 1]
                </p>
              </div>
            </div>

            {/* Pillar 03 */}
            <div className="flex flex-col md:flex-row items-start md:items-center py-10 md:py-16 border-t border-[#E9D8C3]/60 group hover:bg-white/40 transition-colors">
              <div className="w-full md:w-1/4 flex items-center gap-6 mb-6 md:mb-0">
                <span className="text-5xl md:text-7xl font-serif text-[#C9A15B] opacity-30 font-light group-hover:opacity-100 transition-opacity duration-500">
                  03
                </span>
                <div className="w-12 h-12 rounded-full border border-[#E9D8C3] bg-white flex items-center justify-center text-[#C9A15B] shadow-sm group-hover:bg-[#4A1F58] group-hover:border-[#4A1F58] group-hover:text-white transition-all duration-300">
                  <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
                </div>
              </div>
              <div className="w-full md:w-1/3 mb-4 md:mb-0 md:pr-8">
                <h3 className="text-2xl md:text-3xl font-serif font-medium text-[#4A1F58] group-hover:text-[#C9A15B] transition-colors duration-300">
                  Our Promise
                </h3>
              </div>
              <div className="w-full md:w-5/12">
                <p className="text-sm md:text-base font-sans text-zinc-600 leading-relaxed">
                  Trust has been our foundation since 1990. We are committed to delivering an experience defined by integrity, transparency, and care.[cite: 1]
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* CTA SECTION */}
        <div className="mt-20 md:mt-32 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-3 bg-[#4A1F58] hover:bg-[#302832] text-white font-sans font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] px-10 py-4 rounded-xl md:rounded-sm transition-colors shadow-sm"
          >
            Explore Our Collections <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
    </div>
  );
}