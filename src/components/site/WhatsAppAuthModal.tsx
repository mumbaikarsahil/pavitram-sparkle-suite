import React, { useState, useEffect } from "react";
import { Loader2, ShieldCheck, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendOtpFn, verifyOtpFn } from "@/lib/api/auth.functions";

interface WhatsAppAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (customer: any) => void;
}

export function WhatsAppAuthModal({ isOpen, onClose, onSuccess }: WhatsAppAuthModalProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setPhone("");
      setOtp("");
      setTimer(60);
      setErrorMsg("");
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);
  
  const handleSendOtp = async () => {
    setErrorMsg("");
    if (phone.replace(/\D/g, "").length < 10) return setErrorMsg("Enter a valid 10-digit number.");
    
    setIsLoading(true);
    try {
      await sendOtpFn({ data: { phone } });
      setStep("otp");
      setTimer(60);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOtp = async () => {
    setErrorMsg("");
    if (otp.length !== 6) return setErrorMsg("Enter the 6-digit code.");
    
    setIsLoading(true);
    try {
      const res = await verifyOtpFn({ data: { phone, otp } });
      
      // 1. Save to localStorage
      localStorage.setItem("pavitram_user", JSON.stringify(res.customer));
      
      // 2. DISPATCH EVENT HERE: Instantly updates the Header
      window.dispatchEvent(new Event("authStateChange"));
      
      if (onSuccess) {
        onSuccess(res.customer); 
      } else {
        window.location.href = "/Account";
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full font-sans relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-800 transition-colors p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center gap-2 mb-6 text-[#4A1F58]">
          <div className="w-12 h-12 bg-[#F7F1E8] rounded-full flex items-center justify-center mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl text-center">Secure Verification</h3>
        </div>

        {step === "phone" ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 text-center leading-relaxed mb-6">
              Enter your mobile number to log in securely and access your saved details.
            </p>
            <div className="flex gap-2">
              <span className="flex items-center px-4 border border-[#E9D8C3] rounded-xl bg-slate-50 text-sm font-bold text-slate-700">+91</span>
              <Input
                type="tel"
                autoFocus
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                className="h-12 text-base rounded-xl border-[#E9D8C3] focus:border-[#C9A15B] focus:ring-[#C9A15B]"
              />
            </div>
            {errorMsg && <p className="text-xs text-rose-500 font-medium text-center">{errorMsg}</p>}
            <Button onClick={handleSendOtp} disabled={isLoading || phone.length !== 10} className="w-full h-12 rounded-xl bg-[#4A1F58] hover:bg-[#302832] text-white font-bold uppercase tracking-widest text-xs mt-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Get OTP <ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 text-center leading-relaxed mb-6">
              Enter the 6-digit code sent to <br/><span className="font-bold text-slate-800">+91 {phone}</span>
            </p>
            <Input
              type="text"
              autoFocus
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="text-center font-mono font-bold tracking-[0.5em] text-2xl h-14 rounded-xl border-[#E9D8C3] focus:border-[#C9A15B] focus:ring-[#C9A15B]"
            />
            {errorMsg && <p className="text-xs text-rose-500 font-medium text-center">{errorMsg}</p>}
            <Button onClick={handleVerifyOtp} disabled={isLoading || otp.length !== 6} className="w-full h-12 rounded-xl bg-[#4A1F58] hover:bg-[#302832] text-white font-bold uppercase tracking-widest text-xs mt-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Login"}
            </Button>
            <div className="text-center mt-4">
              {timer > 0 ? (
                <span className="text-[11px] font-medium text-slate-400">Resend code in {timer}s</span>
              ) : (
                <button onClick={handleSendOtp} className="text-xs font-bold text-[#C9A15B] hover:text-[#4A1F58] uppercase tracking-wider transition-colors">
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}