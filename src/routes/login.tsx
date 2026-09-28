import React, { useState, useEffect } from "react";
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
  const [otp, setOtp] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

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
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (otp.length !== 6) return setErrorMsg("Enter the 6-digit code.");

    setIsLoading(true);
    try {
      const res = await verifyOtpFn({ data: { phone, otp } });

localStorage.setItem(
  "pavitram_user",
  JSON.stringify(res.customer)
);

navigate({ to: "/Account" });
      
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8] flex flex-col md:items-center md:justify-center font-sans relative overflow-hidden">
      
      {/* Subtle Floral Background overlay */}
      <img 
        src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
        alt="Decorative Floral" 
        className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply z-0"
      />

      {/* ✨ FIXED: Removed flex-1 so the card wraps its content naturally instead of stretching */}
      <div className="w-full flex flex-col justify-center max-w-[440px] bg-white md:shadow-[0_10px_40px_rgba(74,31,88,0.05)] md:border md:border-[#E9D8C3] md:rounded-sm overflow-hidden relative min-h-[calc(100vh-56px)] md:min-h-fit md:h-auto z-10 my-0 md:my-8">
        
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-[#C9A15B] hidden md:block" />

        <div className="p-8 md:p-10 flex flex-col">
          
          {step === 'phone' ? (
            // ✨ FIXED: Removed flex-1 from animation wrapper
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col">
              
              <div className="text-center mb-10">
                <Logo className="h-8 w-auto mx-auto mb-6 hidden md:block" />
                <h1 className="text-2xl md:text-3xl font-medium text-[#4A1F58] tracking-wide font-serif mb-2">
                  Welcome to Pavitram
                </h1>
                <p className="text-[11px] md:text-xs font-sans text-zinc-500 uppercase tracking-widest">
                  Sign in to your account
                </p>
              </div>

              {/* ✨ FIXED: Removed flex-1 from form */}
              <form onSubmit={handleSendOtp} className="flex flex-col">
                <div className="flex gap-2">
                  <span className="flex items-center justify-center px-4 border border-[#E9D8C3] rounded-sm bg-[#F7F1E8]/50 text-sm font-bold text-[#4A1F58]">
                    +91
                  </span>
                  <input 
                    type="tel" 
                    placeholder="Enter your phone number" 
                    className="w-full h-12 bg-white border border-[#E9D8C3] rounded-sm px-4 text-sm font-sans focus:border-[#C9A15B] outline-none transition-colors"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    required
                  />
                </div>
                
                {errorMsg && <p className="text-[11px] text-rose-500 mt-3 font-medium">{errorMsg}</p>}

                {/* ✨ FIXED: Changed mt-auto pt-8 to just mt-8 to close the massive gap */}
                <div className="mt-8">
                  <label className="flex items-start gap-3 cursor-pointer group mb-6">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <div className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${termsAccepted ? 'bg-[#4A1F58] border-[#4A1F58] text-white' : 'border-[#E9D8C3] bg-white group-hover:border-[#C9A15B]'}`}>
                      {termsAccepted && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <span className="text-[10px] font-sans text-zinc-500 leading-relaxed select-none">
                      I agree to Pavitram's <Link to="/" className="text-[#4A1F58] hover:text-[#C9A15B] font-bold transition-colors">Terms of Service</Link> and <Link to="/" className="text-[#4A1F58] hover:text-[#C9A15B] font-bold transition-colors">Privacy Policy</Link>.
                    </span>
                  </label>

                  <button 
                    type="submit"
                    disabled={isLoading || !termsAccepted || phone.length < 10}
                    className="w-full h-12 bg-[#4A1F58] hover:bg-[#302832] text-white font-sans font-bold tracking-[0.2em] uppercase text-[10px] rounded-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>Get WhatsApp Code <MessageCircle className="w-3.5 h-3.5" /></>
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
                className="self-start mb-6 text-zinc-400 hover:text-[#C9A15B] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#E5F5E9] border border-[#CDE7D4] flex items-center justify-center mx-auto mb-6 text-[#25D366]">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif font-medium text-[#4A1F58] mb-2">Check WhatsApp</h2>
                <p className="text-xs font-sans text-zinc-500">
                  We sent a 6-digit code to <strong className="text-[#302832] font-bold">+91 {phone}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="flex flex-col">
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="000000" 
                  className="w-full h-14 bg-white border border-[#E9D8C3] rounded-sm px-4 text-center text-2xl font-mono font-bold tracking-[0.5em] focus:border-[#C9A15B] outline-none transition-colors"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
                
                {errorMsg && <p className="text-[11px] text-rose-500 mt-3 font-medium text-center">{errorMsg}</p>}

                <div className="mt-8 text-center">
                  {timer > 0 ? (
                    <span className="text-[10px] font-sans text-zinc-400 uppercase tracking-widest">
                      Resend code in {timer}s
                    </span>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => handleSendOtp()} 
                      className="text-[10px] font-sans font-bold text-[#4A1F58] hover:text-[#C9A15B] uppercase tracking-[0.15em] transition-colors"
                    >
                      Resend WhatsApp Code
                    </button>
                  )}
                </div>

                <div className="mt-8">
                  <button 
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full h-12 bg-[#4A1F58] hover:bg-[#302832] text-white font-sans font-bold tracking-[0.2em] uppercase text-[10px] rounded-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Secure Login"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mt-8 text-[9px] font-sans text-zinc-400 font-bold uppercase tracking-[0.2em]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A15B]" /> Secure Login
          </div>

        </div>
      </div>
    </div>
  );
}