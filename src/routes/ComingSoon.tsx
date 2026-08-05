import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Mail, Instagram, Facebook, MessageCircle, Gem, Ruler } from "lucide-react";

export const Route = createFileRoute('/ComingSoon')({
  component: ComingSoonPage,
});

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Here you can hook up Supabase to save the email
      setIsSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* ========================================================= */}
      {/* SUBTLE BACKGROUND BLUEPRINT GRID */}
      {/* ========================================================= */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

      {/* ========================================================= */}
      {/* MAIN CONTENT */}
      {/* ========================================================= */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-12 flex flex-col items-center text-center">
        
        {/* Metaphor Icon: The Jeweler's Workbench */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-[#F9F6F0] rounded-full animate-pulse" />
          <div className="w-16 h-16 bg-white border border-zinc-100 shadow-sm rounded-full flex items-center justify-center relative z-10 text-[#4A0B49]">
            <Ruler className="w-6 h-6 absolute -ml-4 -mb-4 -rotate-45 text-zinc-300" />
            <Gem className="w-8 h-8" />
          </div>
        </div>

        {/* Hero Typography */}
        <div className="space-y-4 mb-10">
          <h2 className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#4A0B49]">
            Under Construction
          </h2>
          <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight leading-[1.15]">
            We are polishing <br className="md:hidden" />
            this section.
          </h1>
          <p className="text-sm md:text-base text-zinc-500 max-w-md mx-auto font-medium leading-relaxed">
            Just like crafting a fine piece of jewellery, building a beautiful digital experience takes time. This section is currently on our workbench and will be ready to shine soon.
          </p>
        </div>

        {/* Clean Form Card */}
        <div className="w-full max-w-md bg-[#FDFBF7] border border-zinc-100 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
          
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-4 text-center animate-in zoom-in-95 duration-300">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">You're on the list!</h3>
              <p className="text-xs text-zinc-500">We'll notify you the moment this section goes live.</p>
            </div>
          ) : (
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-zinc-200" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Get Notified</span>
                <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-zinc-200" />
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] transition-all shadow-sm"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full h-12 bg-[#4A0B49] hover:bg-[#340733] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  Notify Me
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer Links & Contact */}
        <div className="mt-16 flex flex-col items-center">
          <a 
            href="https://wa.me/918356834764?text=Hi!%20I%20am%20waiting%20for%20the%20website%20launch.%20Can%20you%20help%20me%20with%20some%20designs?"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-[#E8F5E9] hover:border-emerald-200 hover:text-emerald-700 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all mb-8 shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-emerald-500" /> 
            Reach us on WhatsApp
          </a>

          <div className="flex items-center gap-6 text-zinc-400 mb-6">
            <a href="#" className="hover:text-[#4A0B49] transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-[#4A0B49] transition-colors"><Facebook className="w-5 h-5" /></a>
          </div>
          
          <p className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase">
            © {new Date().getFullYear()} Pavitram Diamond Jewellery. All Rights Reserved.
          </p>
        </div>

      </div>
    </div>
  );
}