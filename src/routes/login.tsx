import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  ArrowLeft, Mail, Loader2, ShieldCheck, 
  Smartphone, CheckCircle2, ArrowRight
} from "lucide-react";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute('/login')({
  component: AuthPage,
});

function AuthPage() {
  // View states
  const [step, setStep] = useState<'input' | 'magic_link_sent'>('input');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;

    setIsLoading(true);
    
    // TODO: Replace with actual Supabase Magic Link call:
    // await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
    
    setTimeout(() => {
      setIsLoading(false);
      setStep('magic_link_sent');
    }, 1200);
  };

  const handleGoogleLogin = () => {
    // TODO: Replace with actual Supabase Google OAuth call
    // await supabase.auth.signInWithOAuth({ provider: 'google' })
    console.log("Initiating Google Login...");
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8] flex flex-col md:items-center md:justify-center font-sans relative overflow-hidden">
      
      {/* Subtle Floral Background overlay */}
      <img 
        src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
        alt="Decorative Floral" 
        className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply z-0"
      />

    

      <div className="flex-1 flex flex-col justify-center w-full max-w-[440px] bg-white md:shadow-[0_10px_40px_rgba(74,31,88,0.05)] md:border md:border-[#E9D8C3] md:rounded-sm overflow-hidden relative min-h-[calc(100vh-56px)] md:min-h-fit z-10 my-0 md:my-8">
        
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-[#C9A15B] hidden md:block" />

        <div className="p-8 md:p-10 flex-1 flex flex-col">
          
          {step === 'input' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
              
              <div className="text-center mb-8">
                <Logo className="h-8 w-auto mx-auto mb-6 hidden md:block" />
                <h1 className="text-2xl md:text-3xl font-medium text-[#4A1F58] tracking-wide font-serif mb-2">
                  Welcome to Pavitram
                </h1>
                <p className="text-[11px] md:text-xs font-sans text-zinc-500 uppercase tracking-widest">
                  Sign in or create an account
                </p>
              </div>

              {/* Google OAuth Login */}
              <button 
                onClick={handleGoogleLogin}
                className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-[#E9D8C3] rounded-sm hover:bg-[#F7F1E8] transition-colors shadow-sm mb-6 group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-[11px] font-sans font-bold text-[#302832] uppercase tracking-[0.15em] group-hover:text-[#4A1F58]">Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-x-0 h-px bg-[#E9D8C3]" />
                <span className="relative bg-white px-4 text-[9px] font-sans font-bold tracking-[0.2em] uppercase text-zinc-400">Or use email</span>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-25 flex-1 flex flex-col">
                
                {/* Unified Email Input (Passwordless) */}
                <div>
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="w-full h-12 bg-white border border-[#E9D8C3] rounded-sm px-4 text-sm font-sans focus:border-[#C9A15B] outline-none transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mt-auto pt-4">
                  <label className="flex items-start gap-3 cursor-pointer group mb-6">
                    <div className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${termsAccepted ? 'bg-[#4A1F58] border-[#4A1F58] text-white' : 'border-[#E9D8C3] bg-white group-hover:border-[#C9A15B]'}`}>
                      {termsAccepted && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <span className="text-[10px] font-sans text-zinc-500 leading-relaxed">
                      I agree to Pavitram's <Link to="/" className="text-[#4A1F58] hover:text-[#C9A15B] font-bold transition-colors">Terms of Service</Link> and <Link to="/" className="text-[#4A1F58] hover:text-[#C9A15B] font-bold transition-colors">Privacy Policy</Link>.
                    </span>
                  </label>

                  <button 
                    type="submit"
                    disabled={isLoading || !termsAccepted || !email}
                    className="w-full h-12 bg-[#4A1F58] hover:bg-[#302832] text-white font-sans font-bold tracking-[0.2em] uppercase text-[10px] rounded-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>Continue with Email <ArrowRight className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                </div>

                {/* Graceful Degradation: Phone Login placeholder */}
                <div className="pt-4 border-t border-[#E9D8C3]/50">
                  <button 
                    type="button"
                    disabled
                    className="w-full h-12 bg-[#F7F1E8]/50 border border-[#E9D8C3] text-zinc-400 font-sans font-bold tracking-[0.1em] uppercase text-[9px] rounded-sm flex items-center justify-center gap-2 cursor-not-allowed"
                    title="We are currently upgrading our SMS systems to comply with new TRAI DLT regulations."
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Continue with Phone (Coming Soon)
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // ==========================================
            // MAGIC LINK SENT STEP
            // ==========================================
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1 flex flex-col justify-center items-center text-center py-8">
              
              <div className="w-16 h-16 rounded-full bg-[#F7F1E8] border border-[#E9D8C3] flex items-center justify-center mb-6 text-[#C9A15B]">
                <Mail className="w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-serif font-medium text-[#4A1F58] mb-3">Check your inbox</h2>
              
              <p className="text-sm font-sans text-zinc-600 mb-8 leading-relaxed max-w-[280px]">
                We've sent a secure magic link to <strong className="text-[#302832] font-medium block mt-1">{email}</strong>
              </p>
              
              <div className="space-y-4 w-full">
                <p className="text-[10px] font-sans text-zinc-500 uppercase tracking-widest">
                  Click the link in the email to instantly sign in. No password required.
                </p>

                <div className="pt-8 flex flex-col gap-3">
                  <button 
                    onClick={() => setStep('input')} 
                    className="text-[10px] font-sans font-bold text-[#4A1F58] hover:text-[#C9A15B] uppercase tracking-[0.15em] transition-colors"
                  >
                    Try a different email
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mt-8 text-[9px] font-sans text-zinc-400 font-bold uppercase tracking-[0.2em]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A15B]" /> Secure 256-Bit Encryption
          </div>

        </div>
      </div>
    </div>
  );
}