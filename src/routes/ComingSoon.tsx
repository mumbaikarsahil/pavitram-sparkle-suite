import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Mail, Instagram, Facebook, MessageCircle, Gem } from "lucide-react";

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
    <div className="min-h-screen bg-[#0a000a] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-fuchsia-500/30">
      
      {/* ========================================================= */}
      {/* BACKGROUND EFFECTS & ANIMATIONS */}
      {/* ========================================================= */}
      
      {/* Deep purple ambient glow */}
      <div className="absolute top-1/4 -left-1/4 w-[50vw] h-[50vw] bg-[#4A0B49] rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 -right-1/4 w-[40vw] h-[40vw] bg-fuchsia-900 rounded-full blur-[150px] opacity-30 mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '10s' }} />
      
      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

      {/* ========================================================= */}
      {/* MAIN CONTENT */}
      {/* ========================================================= */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 md:px-8 py-12 flex flex-col items-center text-center">
        
        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-8 md:mb-12 animate-in slide-in-from-bottom-4 fade-in duration-1000">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(74,11,73,0.5)]">
            <Gem className="w-8 h-8 md:w-10 md:h-10 text-fuchsia-300" strokeWidth={1.5} />
          </div>
          <h2 className="text-[11px] md:text-sm font-bold tracking-[0.4em] uppercase text-fuchsia-200/80 mb-2">
            Pavitram Diamond Jewellery
          </h2>
        </div>

        {/* Hero Typography */}
        <div className="space-y-4 md:space-y-6 mb-10 md:mb-12 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200 fill-mode-both">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black tracking-tight leading-[1.1]">
            Crafting <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 italic pr-2">
              Brilliance.
            </span>
          </h1>
          <p className="text-sm md:text-lg text-zinc-400 max-w-lg mx-auto font-medium leading-relaxed">
            We are meticulously working behind the scenes to bring you an unparalleled luxury digital boutique. Something beautiful is coming very soon.
          </p>
        </div>

        {/* Interactive Glassmorphism Card */}
        <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-1000 delay-500 fill-mode-both relative overflow-hidden group">
          
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-6 text-center relative z-10">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">You're on the list!</h3>
              <p className="text-xs text-zinc-400">We'll notify you the moment we launch.</p>
            </div>
          ) : (
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-zinc-500" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Get Early Access</span>
                <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-zinc-500" />
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 md:h-14 pl-11 pr-4 bg-black/40 border border-white/10 rounded-xl md:rounded-2xl text-xs md:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full h-12 md:h-14 bg-white text-black hover:bg-zinc-200 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  Notify Me
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer Links & Contact */}
        <div className="mt-16 md:mt-24 flex flex-col items-center animate-in fade-in duration-1000 delay-700 fill-mode-both">
          
          <a 
            href="https://wa.me/918356834764?text=Hi!%20I%20am%20waiting%20for%20the%20website%20launch.%20Can%20you%20help%20me%20with%20some%20designs?"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366] hover:text-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all mb-8"
          >
            <MessageCircle className="w-4 h-4" /> 
            Reach us on WhatsApp
          </a>

          <div className="flex items-center gap-6 text-zinc-500">
            <a href="#" className="hover:text-fuchsia-400 transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-blue-400 transition-colors"><Facebook className="w-5 h-5" /></a>
          </div>
          
          <p className="mt-6 text-[10px] text-zinc-600 font-medium tracking-wider uppercase">
            © {new Date().getFullYear()} Ossam Jewels. All Rights Reserved.
          </p>
        </div>

      </div>
    </div>
  );
}