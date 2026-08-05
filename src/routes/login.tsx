import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  ArrowLeft, MessageCircle, Mail, Smartphone, 
  Loader2, CheckCircle2, ShieldCheck, Fingerprint
} from "lucide-react";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute('/login')({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  
  // View states
  const [view, setView] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);

  // OTP states
  const [otp, setOtp] = useState("");
  const [otpMethod, setOtpMethod] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [timer, setTimer] = useState(30);

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'register' && (!firstName || !lastName || !gender)) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!termsAccepted) {
      alert("Please accept the terms and conditions.");
      return;
    }

    setIsLoading(true);
    // Simulate API call to generate OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setTimer(30);
      setOtpMethod('whatsapp'); // Default to modern WhatsApp OTP
    }, 1200);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    // Simulate API verification
    setTimeout(() => {
      setIsLoading(false);
      // Route to account/home after successful login
      navigate({ to: "/" }); 
    }, 1500);
  };

  const handleResend = (method: 'whatsapp' | 'sms' | 'email') => {
    setOtpMethod(method);
    setTimer(30);
    // Simulate resend logic here
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col md:items-center md:justify-center font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white px-4 h-14 flex items-center shadow-sm border-b border-zinc-200 sticky top-0 z-50">
        <button onClick={() => history.back()} className="text-zinc-600 p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex justify-center pr-5">
          <Logo className="h-8 w-auto" />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center w-full max-w-[500px] bg-white md:rounded-3xl md:shadow-xl md:border md:border-zinc-200 overflow-hidden relative min-h-[calc(100vh-56px)] md:min-h-fit">
        
        {/* Decorative Top Banner */}
        <div className="h-2 w-full bg-gradient-to-r from-[#4A0B49] via-purple-500 to-amber-400 hidden md:block" />

        <div className="p-6 sm:p-10 flex-1 flex flex-col">
          
          {step === 'input' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
              
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-100 shadow-sm">
                  <Fingerprint className="w-7 h-7 text-[#4A0B49] stroke-[1.5]" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight font-serif">
                  {view === 'login' ? 'Login to Pavitram' : 'Signup with Pavitram'}
                </h1>
                <p className="text-[13px] text-zinc-500 mt-2 leading-relaxed px-4">
                  Unlock best prices and become an insider. Complete your profile and get <strong className="text-[#4A0B49]">₹500 worth of Pavitram Credits</strong>.
                </p>
              </div>

              {/* Social Logins */}
              <div className="flex justify-center gap-4 mb-8">
                <button className="w-12 h-12 rounded-full border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50 transition-colors shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </button>
                <button className="w-12 h-12 rounded-full border border-zinc-200 bg-white flex items-center justify-center hover:bg-blue-50 transition-colors shadow-sm">
                  <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              </div>

              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute inset-x-0 h-px bg-zinc-200" />
                <span className="relative bg-white px-4 text-[11px] font-bold tracking-widest uppercase text-zinc-400">Or continue with</span>
              </div>

              <form onSubmit={handleContinue} className="space-y-4 flex-1 flex flex-col">
                
                {/* Unified Phone/Email input for Login */}
                {view === 'login' && (
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Enter Mobile Number or Email" 
                      className="w-full h-14 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all shadow-inner"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Expanded fields for Registration */}
                {view === 'register' && (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-[100px] shrink-0 h-14 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center text-sm font-semibold text-zinc-700 shadow-inner">
                        IN +91
                      </div>
                      <input 
                        type="tel" 
                        placeholder="Mobile Number" 
                        maxLength={10}
                        className="flex-1 h-14 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all shadow-inner"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                    </div>
                    <input 
                      type="email" 
                      placeholder="Enter Email" 
                      className="w-full h-14 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all shadow-inner"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="First Name" 
                        className="flex-1 h-14 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all shadow-inner"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Last Name" 
                        className="flex-1 h-14 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all shadow-inner"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex items-center gap-6 pt-2 pb-2">
                      {['Male', 'Female', 'Others'].map((g) => (
                        <label key={g} className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${gender === g ? 'border-[#4A0B49]' : 'border-zinc-300 group-hover:border-[#4A0B49]'}`}>
                            {gender === g && <div className="w-2 h-2 bg-[#4A0B49] rounded-full" />}
                          </div>
                          <span className="text-sm font-medium text-zinc-700">{g}</span>
                        </label>
                      ))}
                    </div>

                    <div 
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${whatsappOptIn ? 'bg-[#25D366]/10 border-[#25D366]/30' : 'bg-zinc-50 border-zinc-200'}`}
                      onClick={() => setWhatsappOptIn(!whatsappOptIn)}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${whatsappOptIn ? 'bg-[#25D366] text-white' : 'bg-white border-2 border-zinc-300'}`}>
                        {whatsappOptIn && <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={3} />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[13px] font-bold text-zinc-900">Opt for WhatsApp Support</h4>
                        <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">We will share delivery & precious order related communication, and provide interactive support.</p>
                      </div>
                      <MessageCircle className={`w-6 h-6 shrink-0 ${whatsappOptIn ? 'text-[#25D366]' : 'text-zinc-300'}`} />
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6 pb-2">
                  <label className="flex items-start gap-3 cursor-pointer group mb-6">
                    <div className={`mt-0.5 w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-colors ${termsAccepted ? 'bg-[#4A0B49] border-[#4A0B49] text-white' : 'border-zinc-300 bg-white group-hover:border-[#4A0B49]'}`}>
                      {termsAccepted && <CheckCircle2 className="w-3 h-3" strokeWidth={3} />}
                    </div>
                    <span className="text-[11px] text-zinc-500 leading-relaxed">
                      By continuing you acknowledge that you are at least 18 years old and have read and agree to Pavitram's <a href="#" className="text-[#4A0B49] underline font-semibold">Terms and Conditions</a> & <a href="#" className="text-[#4A0B49] underline font-semibold">Privacy Policy</a>.
                    </span>
                  </label>

                  <button 
                    type="submit"
                    disabled={isLoading || !termsAccepted || (!phone && view === 'login')}
                    className="w-full h-14 bg-zinc-200 hover:bg-[#4A0B49] hover:text-white text-zinc-500 font-bold tracking-widest uppercase text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (view === 'login' ? 'Continue to Login' : 'Sign Me Up')}
                  </button>
                </div>

                <div className="text-center pt-4 border-t border-zinc-100">
                  <span className="text-xs text-zinc-500 font-medium">
                    {view === 'login' ? 'New to Pavitram?' : 'Already have an account?'}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setView(view === 'login' ? 'register' : 'login')}
                    className="ml-2 text-xs font-bold text-[#4A0B49] hover:underline tracking-wide uppercase"
                  >
                    {view === 'login' ? 'Create an Account' : 'Log In'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // ==========================================
            // OTP VERIFICATION STEP
            // ==========================================
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1 flex flex-col justify-center">
              
              <button onClick={() => setStep('input')} className="absolute top-6 left-6 text-zinc-400 hover:text-zinc-900 hidden md:block">
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="text-center mb-10">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border ${
                  otpMethod === 'whatsapp' ? 'bg-[#25D366]/10 border-[#25D366]/20 text-[#25D366]' : 
                  otpMethod === 'email' ? 'bg-blue-50 border-blue-100 text-blue-600' : 
                  'bg-zinc-100 border-zinc-200 text-zinc-600'
                }`}>
                  {otpMethod === 'whatsapp' ? <MessageCircle className="w-8 h-8" /> : otpMethod === 'email' ? <Mail className="w-8 h-8" /> : <Smartphone className="w-8 h-8" />}
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight font-serif mb-2">Verify your {otpMethod === 'email' ? 'email' : 'number'}</h2>
                <p className="text-sm text-zinc-500">
                  We've sent a 6-digit code to <br/>
                  <strong className="text-zinc-900">{otpMethod === 'email' ? email : `+91 ${phone}`}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-8 max-w-sm mx-auto w-full">
                
                <div className="flex justify-center gap-3">
                  {/* Visual OTP Input representation */}
                  <input 
                    type="text" 
                    maxLength={6}
                    autoFocus
                    className="w-full h-14 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-[#4A0B49] focus:ring-2 focus:ring-[#4A0B49]/20 rounded-xl text-center text-2xl font-mono font-black tracking-[1em] outline-none transition-all shadow-inner"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full h-14 bg-[#4A0B49] hover:bg-[#340733] text-white font-bold tracking-widest uppercase text-sm rounded-xl transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Secure Login'}
                </button>

                <div className="text-center space-y-4">
                  <p className="text-xs font-medium text-zinc-500">
                    Didn't receive the code? {timer > 0 && <span className="text-[#4A0B49] font-mono font-bold">00:{timer.toString().padStart(2, '0')}</span>}
                  </p>
                  
                  {timer === 0 && (
                    <div className="flex flex-col gap-3">
                      {otpMethod !== 'whatsapp' && (
                        <button type="button" onClick={() => handleResend('whatsapp')} className="text-xs font-bold text-[#25D366] flex items-center justify-center gap-1.5 hover:bg-[#25D366]/5 py-2 rounded-lg transition-colors">
                          <MessageCircle className="w-4 h-4" /> Send via WhatsApp (Fastest)
                        </button>
                      )}
                      {otpMethod !== 'sms' && (
                        <button type="button" onClick={() => handleResend('sms')} className="text-xs font-bold text-zinc-600 flex items-center justify-center gap-1.5 hover:bg-zinc-50 py-2 rounded-lg transition-colors border border-zinc-200 shadow-sm">
                          <Smartphone className="w-4 h-4" /> Send via SMS
                        </button>
                      )}
                      {view === 'register' && otpMethod !== 'email' && (
                        <button type="button" onClick={() => handleResend('email')} className="text-xs font-bold text-zinc-600 flex items-center justify-center gap-1.5 hover:bg-zinc-50 py-2 rounded-lg transition-colors">
                          <Mail className="w-4 h-4" /> Send to Email
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-center gap-2 mt-8 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure 256-Bit Encryption
                </div>

              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}