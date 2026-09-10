import React from "react";
import { MessageCircle, Sparkles } from "lucide-react";

export function FloatingHelp() {
  return (

    <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[90] flex flex-col gap-3 items-end">
      
      {/* 1. Pavitram AI Chatbot Button */}
      <button 
        
        className="group relative flex items-center justify-center bg-white border border-[#E9D8C3] shadow-[0_8px_20px_rgba(74,31,88,0.1)] rounded-xl h-12 md:h-14 hover:pr-5 transition-all duration-300 ease-out overflow-hidden"
        onClick={() => alert("Pavitram AI Chatbot Opening...")} 
      >
        <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shrink-0 text-[#C9A15B]">
          <Sparkles strokeWidth={1.5} className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 text-[11px] md:text-[13px] font-sans font-bold text-[#4A1F58] uppercase tracking-widest whitespace-nowrap transition-all duration-300 ease-out">
          Ask Pavitram AI
        </span>
      </button>

      {/* 2. WhatsApp Connect Button */}
      <a 
        href="https://wa.me/918356834764" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center bg-[#4A1F58] shadow-[0_8px_20px_rgba(74,31,88,0.2)] rounded-xl h-12 md:h-14 hover:pr-6 transition-all duration-300 ease-out overflow-hidden"
      >
        <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shrink-0 text-white">
          <MessageCircle strokeWidth={1.5} className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 text-[12px] md:text-[14px] font-sans font-medium text-white whitespace-nowrap transition-all duration-300 ease-out pr-2">
          Chat with us
        </span>
      </a>

    </div>
  );
}