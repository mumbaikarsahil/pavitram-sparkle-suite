import React, { useState, useEffect } from "react";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendOtpFn, verifyOtpFn } from "@/lib/api/auth.functions";

export default function WhatsAppAuthModal({ onSuccess }: { onSuccess: (customer: any) => void }) {
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(60);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
  
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
        // ✨ NO FETCH CALL NEEDED! Just call the TanStack server function directly
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
        // ✨ TanStack handles the secure backend execution automatically
        const res = await verifyOtpFn({ data: { phone, otp } });
        onSuccess(res.customer);
      } catch (err: any) {
        setErrorMsg(err.message || "Verification failed.");
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full font-sans">
      <div className="flex items-center gap-2 mb-4 text-[#4A1F58]">
        <ShieldCheck className="w-5 h-5" />
        <h3 className="font-bold text-base">WhatsApp Verification</h3>
      </div>

      {step === "phone" ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Enter your WhatsApp number to receive an instant verification code.</p>
          <div className="flex gap-2">
            <span className="flex items-center px-3 border border-slate-200 rounded-md bg-slate-50 text-xs font-bold">+91</span>
            <Input
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-sm"
            />
          </div>
          {errorMsg && <p className="text-xs text-rose-500">{errorMsg}</p>}
          <Button onClick={handleSendOtp} disabled={isLoading} className="w-full bg-[#4A1F58] hover:bg-[#302832] text-white">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Get OTP <ArrowRight className="w-4 h-4 ml-1" /></>}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Enter the 6-digit code sent to your WhatsApp number.</p>
          <Input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="text-center font-mono font-bold tracking-widest text-lg h-12"
          />
          {errorMsg && <p className="text-xs text-rose-500">{errorMsg}</p>}
          <Button onClick={handleVerifyOtp} disabled={isLoading} className="w-full bg-[#4A1F58] hover:bg-[#302832] text-white">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Continue"}
          </Button>
          <div className="text-center">
            {timer > 0 ? (
              <span className="text-[11px] text-slate-400">Resend code in {timer}s</span>
            ) : (
              <button onClick={handleSendOtp} className="text-xs font-semibold text-[#4A1F58] hover:underline">
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}