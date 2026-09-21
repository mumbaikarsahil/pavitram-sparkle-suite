"use client";

import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Package, CheckCircle2, Clock, 
  Loader2, Search, MapPin, ShieldAlert
} from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/track-order')({
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<'input' | 'loading' | 'found' | 'error' | 'locked'>('input');
  const [trackingData, setTrackingData] = useState<any>(null);
  
  // Security: Frontend Spam Protection
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Basic Input Sanitization
    const cleanOrderId = orderId.trim().toUpperCase();
    const cleanContact = contact.trim();
    if (!cleanOrderId || !cleanContact) return;

    // 2. Frontend Throttling (Lockout after 5 failed attempts)
    if (attempts >= 5) {
      setStatus('locked');
      setErrorMessage("Too many attempts. For your security, tracking is temporarily locked. Please try again in 15 minutes.");
      return;
    }

    setStatus('loading');

    try {
      // 3. SECURE BACKEND CALL
      // We pass BOTH the Order ID and the Contact info. The backend must verify they match.
      /* 
        // REAL API IMPLEMENTATION:
        const response = await fetch('https://your-project.supabase.co/functions/v1/track-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: cleanOrderId, contact: cleanContact })
        });
        const data = await response.json();
        if (!data.success) throw new Error("Order not found or details do not match.");
      */

      // MOCK API DELAY FOR UI TESTING
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (cleanOrderId.startsWith("ORD-")) {
        // MOCK SUCCESS DATA (Notice how the address is masked for security)
        setTrackingData({
          order_number: cleanOrderId,
          est_delivery: "Sep 10, 2026",
          masked_destination: "Mumbai, Maharashtra - 400089",
          stages: [
            { id: 1, label: "Order Placed", date: "Sep 05, 2026", time: "10:30 AM", completed: true },
            { id: 2, label: "Processing at Atelier", date: "Sep 06, 2026", time: "02:15 PM", completed: true },
            { id: 3, label: "Quality Check & Certification", date: "Sep 07, 2026", time: "11:00 AM", completed: true },
            { id: 4, label: "Dispatched", date: "Sep 08, 2026", time: "09:45 AM", completed: false, current: true },
            { id: 5, label: "Out for Delivery", date: "Pending", time: "--", completed: false },
          ]
        });
        setStatus('found');
        setAttempts(0); // Reset attempts on success
      } else {
        throw new Error("We couldn't find an order matching those exact details.");
      }
    } catch (err: any) {
      setStatus('error');
      setAttempts(prev => prev + 1);
      setErrorMessage(err.message || "Invalid order details. Please check your inputs.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8] flex flex-col font-sans pb-24 relative overflow-hidden">
      
      <img 
        src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/bg_pattern2.webp" 
        alt="Decorative Floral" 
        className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply z-0"
      />

      <header className="bg-white/80 backdrop-blur-md border-b border-[#E9D8C3] relative z-10">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-[9px] font-sans font-bold uppercase tracking-widest text-zinc-400 hover:text-[#C9A15B] transition-colors">
            ← Back to Home
          </Link>
          <Logo className="h-7 md:h-8 w-auto absolute left-1/2 -translate-x-1/2" />
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-[500px] bg-white rounded-sm shadow-[0_10px_40px_rgba(74,31,88,0.05)] border border-[#E9D8C3] overflow-hidden">
          
          <div className="h-1.5 w-full bg-[#C9A15B]" />

          {status === 'input' || status === 'loading' || status === 'error' || status === 'locked' ? (
            <div className="p-8 md:p-10">
              
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-[#F7F1E8] rounded-full flex items-center justify-center mb-6 border border-[#E9D8C3] shadow-sm">
                  <Package className="w-7 h-7 text-[#C9A15B]" strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-medium text-[#4A1F58] mb-3">
                  Track Your Order
                </h1>
                <p className="text-xs font-sans text-zinc-500 leading-relaxed px-4">
                  Enter your order details below to securely check the real-time status of your delivery.
                </p>
              </div>

              {(status === 'error' || status === 'locked') && (
                <div className="mb-6 bg-red-50 border border-red-100 flex items-start gap-3 px-4 py-3 rounded-sm">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-sans font-medium text-red-700 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              )}

              <form onSubmit={handleTrack} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">
                    Order ID <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    disabled={status === 'loading' || status === 'locked'}
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. ORD-123456"
                    className="w-full h-12 bg-zinc-50 border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] focus:bg-white transition-colors rounded-sm placeholder:text-zinc-400 text-[#302832] disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">
                    Mobile Number or Email <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    disabled={status === 'loading' || status === 'locked'}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Entered during checkout"
                    className="w-full h-12 bg-zinc-50 border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] focus:bg-white transition-colors rounded-sm placeholder:text-zinc-400 text-[#302832] disabled:opacity-60"
                  />
                  <p className="text-[9px] text-zinc-400 mt-2 font-medium">
                    * Required for security verification.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'loading' || status === 'locked' || !orderId || !contact}
                  className="w-full mt-4 bg-[#4A1F58] hover:bg-[#302832] text-white font-sans font-bold text-[10px] tracking-[0.2em] uppercase h-12 rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <><Search className="w-3.5 h-3.5" /> Find My Order</>
                  )}
                </button>
              </form>

            </div>
          ) : (
            /* --- TRACKING RESULT TIMELINE --- */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="bg-[#F7F1E8]/50 p-6 md:p-8 border-b border-[#E9D8C3] flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-[0.2em] block mb-1">
                    Order details
                  </span>
                  <h2 className="text-xl font-serif font-medium text-[#4A1F58] uppercase">
                    {trackingData?.order_number}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-[0.2em] block mb-1">
                    Est. Delivery
                  </span>
                  <span className="text-sm font-sans font-bold text-[#C9A15B]">
                    {trackingData?.est_delivery}
                  </span>
                </div>
              </div>

              <div className="p-6 md:p-10">
                <div className="relative pl-4 border-l border-[#E9D8C3] ml-3 md:ml-4 space-y-8">
                  
                  {trackingData?.stages.map((stage: any) => (
                    <div key={stage.id} className="relative">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[22px] md:-left-[26px] top-0.5 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 bg-white ${
                        stage.completed 
                          ? 'border-[#C9A15B] bg-[#C9A15B]' 
                          : stage.current 
                            ? 'border-[#4A1F58] bg-[#4A1F58] shadow-[0_0_0_4px_rgba(74,31,88,0.1)]' 
                            : 'border-[#E9D8C3]'
                      }`} />
                      
                      <div className={`pl-2 ${!stage.completed && !stage.current ? 'opacity-50' : ''}`}>
                        <h4 className={`text-sm md:text-base font-serif font-medium ${stage.current ? 'text-[#4A1F58]' : 'text-[#302832]'}`}>
                          {stage.label}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] md:text-xs font-sans text-zinc-500 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {stage.date}</span>
                          <span className="opacity-50">•</span>
                          <span>{stage.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                </div>

                <div className="mt-10 pt-6 border-t border-[#E9D8C3] flex flex-col gap-3">
                  <div className="flex items-center gap-3 bg-[#F7F1E8]/50 p-4 rounded-sm border border-[#E9D8C3]">
                    <MapPin className="w-5 h-5 text-[#C9A15B] shrink-0" />
                    <div>
                      <span className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-zinc-400 block mb-0.5">Destination</span>
                      {/* Masked destination for security */}
                      <p className="text-xs font-sans font-medium text-[#302832]">{trackingData?.masked_destination}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setStatus('input');
                      setOrderId("");
                      setContact("");
                    }}
                    className="w-full bg-white hover:bg-[#F7F1E8] border border-[#E9D8C3] text-[#4A1F58] font-sans font-bold text-[10px] tracking-[0.2em] uppercase h-12 rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    Track Another Order
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}