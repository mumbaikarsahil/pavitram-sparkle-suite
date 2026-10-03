import React, { useState, useEffect, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  ArrowLeft, Loader2, ShieldCheck, 
  CheckCircle2, MessageCircle
} from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { sendOtpFn, verifyOtpFn } from "@/lib/api/auth.functions";

export const Route = createFileRoute('/login')({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate({ from: '/login' });
  
  // View states
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [timer, setTimer] = useState(60);

  // Form states
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Refs for auto-focusing
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Instantly redirect to Account if already logged in
  useEffect(() => {
    const user = localStorage.getItem("pavitram_user");
    if (user) {
      navigate({ to: "/Account", replace: true });
    }
  }, [navigate]);

  // Focus management
  useEffect(() => {
    if (step === 'phone') {
      phoneInputRef.current?.focus();
    } else if (step === 'otp') {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    
    if (!termsAccepted) return setErrorMsg("Please accept the terms to continue.");
    if (phone.replace(/\D/g, "").length < 10) return setErrorMsg("Enter a valid 10-digit number.");

    setIsLoading(true);
    try {
      await sendOtpFn({ data: { phone } });
      setStep('otp');
      setTimer(60);
      setOtp(Array(6).fill("")); // Reset OTP boxes
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) return setErrorMsg("Enter the complete 6-digit code.");

    setIsLoading(true);
    try {
      const res = await verifyOtpFn({ data: { phone, otp: finalOtp } });

      localStorage.setItem("pavitram_user", JSON.stringify(res.customer));
      window.dispatchEvent(new Event("authStateChange"));
      navigate({ to: "/Account" });
      
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed. Please try again.");
      // Clear OTP on failure and re-focus first box
      setOtp(Array(6).fill(""));
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // --- ZOMATO/SWIGGY STYLE OTP BOX LOGIC ---
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    // Take only the last character if they somehow type multiple
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next box
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If box is empty and they hit backspace, move to previous box
        otpRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === 'Enter' && otp.join("").length === 6) {
      handleVerifyOtp(e as any);
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    
    if (pastedData) {
      const newOtp = [...otp];
      pastedData.split("").forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      
      // Auto focus the next logical box, or the last box if full
      const focusIndex = Math.min(pastedData.length, 5);
      otpRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Subtle Floral Background overlay */}
      <img 
        src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/bg_pattern2.webp" 
        alt="Decorative Floral" 
        className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply z-0"
      />

      {/* Universally Centered Card Layout */}
      <div className="w-full max-w-[420px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E9D8C3] rounded-2xl overflow-hidden relative z-10">
        
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-[#C9A15B]" />

        <div className="p-6 sm:p-8 flex flex-col">
          
          {step === 'phone' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col">
              
              <div className="mb-8 text-center sm:text-left">
                <Logo className="h-8 w-auto mb-6 mx-auto sm:mx-0" />
                <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight mb-2">
                  Welcome to Pavitram
                </h1>
                <p className="text-sm font-sans text-zinc-500">
                  Enter your WhatsApp number to continue
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="flex flex-col">
                {/* Modern App-style Phone Input */}
                <div className="flex items-center h-14 bg-white border border-zinc-300 rounded-xl px-4 focus-within:border-[#4A1F58] focus-within:ring-1 focus-within:ring-[#4A1F58] transition-all shadow-sm">
                  <span className="text-base font-bold text-zinc-800 border-r border-zinc-200 pr-3 mr-3">
                    +91
                  </span>
                  <input 
                    ref={phoneInputRef}
                    type="tel" 
                    placeholder="WhatsApp Number" 
                    className="w-full h-full bg-transparent text-lg font-semibold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    required
                  />
                </div>
                
                {errorMsg && <p className="text-xs text-rose-500 mt-2.5 font-medium">{errorMsg}</p>}

                <div className="mt-8">
                  <label className="flex items-start gap-3 cursor-pointer group mb-6">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${termsAccepted ? 'bg-[#4A1F58] border-[#4A1F58] text-white' : 'border-zinc-300 bg-white group-hover:border-[#C9A15B]'}`}>
                      {termsAccepted && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-sans text-zinc-500 leading-relaxed select-none">
                      I agree to Pavitram's <Link to="/policy/$slug" params={{slug: 'terms'}} className="text-zinc-900 hover:text-[#C9A15B] font-bold transition-colors">Terms of Service</Link> and <Link to="/policy/$slug" params={{slug: 'privacy'}} className="text-zinc-900 hover:text-[#C9A15B] font-bold transition-colors">Privacy Policy</Link>.
                    </span>
                  </label>

                  <button 
                    type="submit"
                    disabled={isLoading || !termsAccepted || phone.length < 10}
                    className="w-full h-14 bg-[#4A1F58] hover:bg-[#302832] text-white font-sans font-bold tracking-widest uppercase text-xs rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>Get WhatsApp Code <MessageCircle className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // ==========================================
            // OTP VERIFICATION STEP
            // ==========================================
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col py-2">
              
              <button 
                type="button"
                onClick={() => setStep('phone')}
                className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-6 text-zinc-600 hover:bg-zinc-200 transition-colors active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 mb-2">Verify Details</h2>
                <p className="text-sm font-sans text-zinc-500">
                  Code sent securely to <strong className="text-zinc-900">+91 {phone}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="flex flex-col">
                
                {/* Modern App-style OTP Boxes */}
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-full aspect-[4/5] bg-white border border-zinc-300 rounded-xl text-center text-2xl font-bold text-zinc-900 focus:border-[#4A1F58] focus:ring-2 focus:ring-[#4A1F58]/20 outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>
                
                {errorMsg && <p className="text-xs text-rose-500 mt-4 font-medium text-center">{errorMsg}</p>}

                <div className="mt-8 flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Didn't receive code?</span>
                  {timer > 0 ? (
                    <span className="text-sm font-semibold text-zinc-400">
                      Resend in {timer}s
                    </span>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => handleSendOtp()} 
                      className="text-sm font-bold text-[#4A1F58] hover:text-[#C9A15B] transition-colors"
                    >
                      Resend Now
                    </button>
                  )}
                </div>

                <div className="mt-8">
                  <button 
                    type="submit"
                    disabled={isLoading || otp.join("").length !== 6}
                    className="w-full h-14 bg-[#4A1F58] hover:bg-[#302832] text-white font-sans font-bold tracking-widest uppercase text-xs rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Secure Login"}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}