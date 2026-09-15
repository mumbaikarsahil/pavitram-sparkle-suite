import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Sparkles, X } from "lucide-react";

export function FloatingHelp() {
  // Individual states for each button
  const [showAi, setShowAi] = useState(true);
  const [showChat, setShowChat] = useState(true);
  
  // Track scroll position
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Auto-collapse into edge mode when scrolling down (past 100px)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowAi(false);
        setShowChat(false);
      } 
      // ✨ FIXED: Auto-expand immediately when scrolling UP (with a 10px buffer to prevent jitter)
      else if (currentScrollY < lastScrollY.current - 10 || currentScrollY < 20) {
        setShowAi(true);
        setShowChat(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed bottom-24 md:bottom-8 right-0 z-[90] flex flex-col gap-4 items-end">
      
      {/* 1. Ask AI Segment */}
      <div className="flex justify-end">
        {showAi ? (
          <div className="relative mr-4 md:mr-8 animate-in slide-in-from-right-8 duration-300">
            <button 
              className="group relative flex items-center justify-center bg-white border border-[#E9D8C3] shadow-[0_8px_20px_rgba(74,31,88,0.12)] rounded-2xl h-[50px] md:h-[56px] hover:pr-5 transition-all duration-300 ease-out overflow-hidden"
              onClick={() => alert("Pavitram AI Chatbot Opening...")} 
            >
              <div className="w-[50px] h-[50px] md:w-[56px] md:h-[56px] flex items-center justify-center shrink-0 text-[#C9A15B]">
                <Sparkles strokeWidth={1.5} className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 text-[11px] md:text-[13px] font-sans font-bold text-[#4A1F58] uppercase tracking-widest whitespace-nowrap transition-all duration-300 ease-out">
                Ask AI
              </span>
            </button>
            <button 
              onClick={() => setShowAi(false)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-[#E9D8C3] rounded-full flex items-center justify-center shadow-md text-zinc-400 hover:text-[#4A1F58] hover:bg-[#F7F1E8] transition-colors z-10"
              title="Hide AI Button"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          /* AI Edge Panel Tab */
          <div 
            onClick={() => setShowAi(true)}
            title="Show AI"
            className="w-6 md:w-7 h-16 md:h-20 bg-white/95 border border-r-0 border-[#E9D8C3] rounded-l-lg shadow-[0_4px_10px_rgba(0,0,0,0.05)] cursor-pointer flex flex-col items-center justify-center gap-1 hover:w-8 md:hover:w-9 transition-all duration-300 group backdrop-blur-md animate-in slide-in-from-right-4"
          >
            <span style={{ writingMode: 'vertical-rl' }} className="text-[10px] md:text-[11px] font-sans font-bold text-[#4A1F58] uppercase tracking-widest rotate-180">
              AI
            </span>
          </div>
        )}
      </div>

      {/* 2. WhatsApp Segment */}
      <div className="flex justify-end">
        {showChat ? (
          <div className="relative mr-4 md:mr-8 animate-in slide-in-from-right-8 duration-300">
            <a 
              href="https://wa.me/918356834764" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center bg-[#4A1F58] shadow-[0_8px_20px_rgba(74,31,88,0.2)] rounded-2xl h-[50px] md:h-[56px] hover:pr-5 transition-all duration-300 ease-out overflow-hidden"
            >
              <div className="w-[50px] h-[50px] md:w-[56px] md:h-[56px] flex items-center justify-center shrink-0 text-white">
                <MessageCircle strokeWidth={1.5} className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 text-[12px] md:text-[14px] font-sans font-medium text-white whitespace-nowrap transition-all duration-300 ease-out pr-1">
                Chat with us
              </span>
            </a>
            <button 
              onClick={() => setShowChat(false)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-[#E9D8C3] rounded-full flex items-center justify-center shadow-md text-zinc-400 hover:text-[#4A1F58] hover:bg-[#F7F1E8] transition-colors z-10"
              title="Hide Chat Button"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          /* Chat Edge Panel Tab */
          <div 
            onClick={() => setShowChat(true)}
            title="Show Chat"
            className="w-6 md:w-7 h-16 md:h-20 bg-[#4A1F58]/95 border border-r-0 border-[#4A1F58] rounded-l-lg shadow-[0_4px_10px_rgba(74,31,88,0.2)] cursor-pointer flex flex-col items-center justify-center gap-1 hover:w-8 md:hover:w-9 transition-all duration-300 group backdrop-blur-md animate-in slide-in-from-right-4"
          >
            <span style={{ writingMode: 'vertical-rl' }} className="text-[10px] md:text-[11px] font-sans font-bold text-white uppercase tracking-widest rotate-180">
              CHAT
            </span>
          </div>
        )}
      </div>

    </div>
  );
}