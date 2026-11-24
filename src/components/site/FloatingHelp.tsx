import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  MessageCircle,
  Gem,
  X,
  MapPin,
  Video,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Calendar,
} from "lucide-react";

const WHATSAPP_NUMBER = "918356834764";

const OCCASIONS = ["Engagement", "Daily Wear", "Gifting", "Bridal / Festive"];
const BUDGETS = ["Under ₹25,000", "₹25,000 – ₹50,000", "₹50,000 – ₹1,00,000", "₹1,00,000+"];

const buildWhatsAppUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const getContextAwareMessage = () => {
  if (typeof window === "undefined") {
    return "Hi Pavitram! I'd like help choosing a diamond piece.";
  }
  const path = window.location.pathname;
  const fullUrl = window.location.href;

  if (path.startsWith("/product/")) {
    const slug = path.replace("/product/", "").replace(/-/g, " ");
    return `Hi Pavitram! I'm interested in "${slug}" (${fullUrl}). Is it available in store or customizable?`;
  }
  if (path.startsWith("/category/")) {
    const slug = path.replace("/category/", "").replace(/-/g, " ");
    return `Hi Pavitram! I'm browsing your ${slug} collection and would love a stylist's recommendation.`;
  }
  if (path.includes("/harvesting")) {
    return "Hi Pavitram! I'd like to know more about starting the Pavitram Monthly Harvesting Plan.";
  }
  if (path.includes("/stores")) {
    return "Hi Pavitram! I'd like to book a visit to your nearest showroom.";
  }
  return "Hi Pavitram! I'm exploring your website and would love help choosing a diamond piece.";
};

export function FloatingHelp() {
  const [showConciergeBtn, setShowConciergeBtn] = useState(true);
  const [showChatBtn, setShowChatBtn] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"menu" | "finder">("menu");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [selectedBudget, setSelectedBudget] = useState<string>("");

  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) return;

      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowConciergeBtn(false);
        setShowChatBtn(false);
      } else if (currentScrollY < lastScrollY.current - 10 || currentScrollY < 20) {
        setShowConciergeBtn(true);
        setShowChatBtn(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setView("menu");
      setSelectedOccasion("");
      setSelectedBudget("");
    }, 200);
  };

  const openWhatsAppDirect = () => {
    window.open(
      buildWhatsAppUrl(getContextAwareMessage()),
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleFinderWhatsApp = () => {
    const msg = `Hi Pavitram! I'm looking for a diamond piece for *${selectedOccasion}* within a budget of *${selectedBudget}*. Could you share your best designs?`;
    window.open(buildWhatsAppUrl(msg), "_blank", "noopener,noreferrer");
    handleClose();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes softGlint {
          0%, 75% { transform: translateX(-140%) skewX(-20deg); opacity: 0; }
          85% { opacity: 0.6; }
          100% { transform: translateX(220%) skewX(-20deg); opacity: 0; }
        }
        @keyframes cardPop {
          0% { opacity: 0; transform: translateY(14px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-soft-glint { animation: softGlint 4.5s ease-in-out infinite; }
        .animate-card-pop { animation: cardPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />

      {/* Subtle backdrop on mobile when concierge card is open */}
      {isOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-[85] bg-black/25 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-0"
        />
      )}

      {/* PAVITRAM CONCIERGE POPUP CARD */}
      {isOpen && (
        <div className="fixed bottom-40 md:bottom-24 right-4 md:right-8 z-[95] w-[calc(100vw-2rem)] max-w-[340px] bg-[#FCF9F5] border border-[#E9D8C3] rounded-2xl shadow-[0_24px_60px_rgba(74,31,88,0.22)] overflow-hidden font-sans animate-card-pop origin-bottom-right">
          {/* Header */}
          <div className="bg-[#4A1F58] px-5 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              {view === "finder" ? (
                <button
                  onClick={() => setView("menu")}
                  className="p-1 -ml-1 rounded-full hover:bg-white/10 active:scale-90 transition-all"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4 text-[#E9D8C3]" />
                </button>
              ) : (
                <Gem className="w-4 h-4 text-[#C9A15B]" strokeWidth={1.75} />
              )}
              <div>
                <h3 className="font-serif text-lg leading-tight tracking-wide">
                  Pavitram Concierge
                </h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#E9D8C3]/85 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  {view === "finder" ? "Personal Stylist" : "Stylists Online"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
              aria-label="Close Concierge"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {view === "menu" ? (
              <div className="flex flex-col gap-2.5">
                {/* 1. Guided Diamond Finder */}
                <button
                  onClick={() => setView("finder")}
                  className="w-full text-left p-3.5 rounded-xl bg-white border border-[#E9D8C3]/80 hover:border-[#C9A15B] hover:shadow-sm active:scale-[0.98] transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F7F1E8] text-[#C9A15B] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#4A1F58] uppercase tracking-wider">
                        Find Your Diamond
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Curated picks by occasion & budget
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-[#4A1F58] group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 2. Live Video Call with Stylist */}
                <a
                  href={buildWhatsAppUrl(
                    "Hi Pavitram! I'd like to schedule a Live Video Call with a diamond stylist to view designs."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                  className="w-full text-left p-3.5 rounded-xl bg-white border border-[#E9D8C3]/80 hover:border-[#C9A15B] hover:shadow-sm active:scale-[0.98] transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F7F1E8] text-[#4A1F58] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#4A1F58] uppercase tracking-wider">
                        Live Video Call
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        See the sparkle live with our stylist
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-[#4A1F58] group-hover:translate-x-0.5 transition-all" />
                </a>

                {/* 3. Book a Showroom Visit */}
                <Link
                  to="/stores"
                  onClick={handleClose}
                  className="w-full text-left p-3.5 rounded-xl bg-white border border-[#E9D8C3]/80 hover:border-[#C9A15B] hover:shadow-sm active:scale-[0.98] transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F7F1E8] text-[#4A1F58] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#4A1F58] uppercase tracking-wider">
                        Visit a Showroom
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Try our diamonds in person near you
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-[#4A1F58] group-hover:translate-x-0.5 transition-all" />
                </Link>

                {/* 4. Harvesting Plan */}
                <a
                  href={buildWhatsAppUrl(
                    "Hi Pavitram! I'd like to know more about the Pavitram Monthly Harvesting Plan."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                  className="w-full text-left p-3.5 rounded-xl bg-white border border-[#E9D8C3]/80 hover:border-[#C9A15B] hover:shadow-sm active:scale-[0.98] transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F7F1E8] text-[#C9A15B] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#4A1F58] uppercase tracking-wider">
                        Harvesting Plan
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Save monthly & earn maturity benefits
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-[#4A1F58] group-hover:translate-x-0.5 transition-all" />
                </a>
              </div>
            ) : (
              /* 2-STEP GUIDED FINDER VIEW */
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C9A15B] mb-2">
                    1. Select Occasion
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {OCCASIONS.map((occ) => (
                      <button
                        key={occ}
                        onClick={() => setSelectedOccasion(occ)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border active:scale-95 transition-all ${
                          selectedOccasion === occ
                            ? "bg-[#4A1F58] text-white border-[#4A1F58] shadow-sm"
                            : "bg-white text-[#302832] border-[#E9D8C3] hover:border-[#C9A15B]"
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C9A15B] mb-2">
                    2. Select Budget
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {BUDGETS.map((budget) => (
                      <button
                        key={budget}
                        onClick={() => setSelectedBudget(budget)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border active:scale-95 transition-all ${
                          selectedBudget === budget
                            ? "bg-[#4A1F58] text-white border-[#4A1F58] shadow-sm"
                            : "bg-white text-[#302832] border-[#E9D8C3] hover:border-[#C9A15B]"
                        }`}
                      >
                        {budget}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleFinderWhatsApp}
                  disabled={!selectedOccasion || !selectedBudget}
                  className="w-full py-3 rounded-xl bg-[#4A1F58] hover:bg-[#302832] active:scale-[0.98] disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 mt-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  Get Curated Designs on WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTONS */}
      <div className="fixed bottom-24 md:bottom-8 right-0 z-[90] flex flex-col gap-3.5 items-end">
        {/* 1. Pavitram Stylist / Concierge Button */}
        <div className="flex justify-end">
          {showConciergeBtn ? (
            <div className="relative mr-4 md:mr-8 transition-all duration-300">
              <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="group relative flex items-center justify-center bg-white border border-[#C9A15B]/60 shadow-[0_8px_24px_rgba(74,31,88,0.16)] hover:shadow-[0_12px_28px_rgba(201,161,91,0.3)] hover:scale-105 active:scale-95 rounded-2xl h-[52px] md:h-[56px] hover:pr-5 transition-all duration-300 ease-out overflow-hidden cursor-pointer"
                aria-label="Open Pavitram Stylist Concierge"
              >
                {/* Subtle gold glint sweep */}
                {!isOpen && (
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-[#C9A15B]/20 to-transparent animate-soft-glint pointer-events-none" />
                )}

                <div className="w-[52px] h-[52px] md:w-[56px] md:h-[56px] flex items-center justify-center shrink-0 text-[#C9A15B] relative z-10">
                  {isOpen ? (
                    <X strokeWidth={1.75} className="w-5 h-5 md:w-6 md:h-6 text-[#4A1F58] transition-transform duration-300 rotate-90" />
                  ) : (
                    <Gem strokeWidth={1.6} className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform duration-300" />
                  )}
                </div>
                <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 text-[11px] md:text-[13px] font-sans font-bold text-[#4A1F58] uppercase tracking-widest whitespace-nowrap transition-all duration-300 ease-out relative z-10">
                  Ask Stylist
                </span>
              </button>

              {!isOpen && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConciergeBtn(false);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-[#E9D8C3] rounded-full flex items-center justify-center shadow-md text-zinc-400 hover:text-[#4A1F58] hover:bg-[#F7F1E8] active:scale-90 transition-all z-10"
                  title="Minimize Stylist"
                >
                  <X className="w-3 h-3" strokeWidth={2.5} />
                </button>
              )}
            </div>
          ) : (
            /* Minimized STYLIST Edge Tab -> 1-CLICK DIRECTLY OPENS CONCIERGE */
            <button
              onClick={() => {
                setShowConciergeBtn(true);
                setIsOpen(true);
              }}
              title="Open Diamond Stylist"
              className="w-7 md:w-8 h-24 md:h-28 bg-white/95 border border-r-0 border-[#C9A15B]/60 rounded-l-xl shadow-[0_6px_18px_rgba(74,31,88,0.12)] cursor-pointer flex flex-col items-center justify-center gap-1.5 hover:w-9 md:hover:w-10 hover:bg-[#FCF9F5] active:scale-95 transition-all duration-200 group backdrop-blur-md"
            >
              <Gem className="w-3.5 h-3.5 text-[#C9A15B] shrink-0 group-hover:scale-110 transition-transform" />
              <span
                style={{ writingMode: "vertical-rl" }}
                className="text-[9px] md:text-[10px] font-sans font-bold text-[#4A1F58] uppercase tracking-widest rotate-180"
              >
                STYLIST
              </span>
            </button>
          )}
        </div>

        {/* 2. Context-Aware WhatsApp Button */}
        <div className="flex justify-end">
          {showChatBtn ? (
            <div className="relative mr-4 md:mr-8 transition-all duration-300">
              <button
                onClick={openWhatsAppDirect}
                className="group relative flex items-center justify-center bg-[#4A1F58] hover:bg-[#3A1646] shadow-[0_8px_24px_rgba(74,31,88,0.28)] hover:shadow-[0_12px_28px_rgba(74,31,88,0.38)] hover:scale-105 active:scale-95 rounded-2xl h-[52px] md:h-[56px] hover:pr-5 transition-all duration-300 ease-out overflow-hidden cursor-pointer"
                aria-label="Chat on WhatsApp"
              >
                <div className="w-[52px] h-[52px] md:w-[56px] md:h-[56px] flex items-center justify-center shrink-0 text-white relative">
                  <MessageCircle strokeWidth={1.6} className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform duration-300" />
                  {/* Live online indicator dot */}
                  <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-[#4A1F58]" />
                  </span>
                </div>
                <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 text-[12px] md:text-[14px] font-sans font-medium text-white whitespace-nowrap transition-all duration-300 ease-out pr-1">
                  Chat with us
                </span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChatBtn(false);
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-[#E9D8C3] rounded-full flex items-center justify-center shadow-md text-zinc-400 hover:text-[#4A1F58] hover:bg-[#F7F1E8] active:scale-90 transition-all z-10"
                title="Minimize Chat"
              >
                <X className="w-3 h-3" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            /* Minimized CHAT Edge Tab -> 1-CLICK DIRECTLY OPENS WHATSAPP */
            <button
              onClick={openWhatsAppDirect}
              title="Chat on WhatsApp"
              className="w-7 md:w-8 h-20 md:h-24 bg-[#4A1F58]/95 border border-r-0 border-[#4A1F58] rounded-l-xl shadow-[0_6px_18px_rgba(74,31,88,0.25)] cursor-pointer flex flex-col items-center justify-center gap-1.5 hover:w-9 md:hover:w-10 hover:bg-[#3A1646] active:scale-95 transition-all duration-200 group backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span
                style={{ writingMode: "vertical-rl" }}
                className="text-[9px] md:text-[10px] font-sans font-bold text-white uppercase tracking-widest rotate-180"
              >
                CHAT
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}