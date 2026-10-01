"use client";

import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import { getAccountProfileFn, updateAccountProfileFn } from "@/lib/api/account.functions";
import { logoutFn } from "@/lib/api/auth.functions";
import { WhatsAppAuthModal } from "@/components/site/WhatsAppAuthModal";
import { toast } from "sonner";
import { 
  ArrowLeft, Lock, CreditCard, Loader2, AlertTriangle, 
  RefreshCw, X, Ticket, MapPin, CheckCircle2, UserCircle2, ShieldCheck, Mail, Phone, Edit2,
  LogIn
} from "lucide-react";

export const Route = createFileRoute('/checkout')({
  validateSearch: (search: Record<string, unknown>) => ({
    coupon: search.coupon as string | undefined,
  }),
  component: CheckoutPage,
});

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function CheckoutPage() {
  const navigate = useNavigate();
  const { coupon } = Route.useSearch();
  const { cartItems, clearCart } = useCart();
  
  // Application State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("Securing payment channel...");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Auth & Profile States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Payment Failure State
  const [paymentFailedModal, setPaymentFailedModal] = useState({ isOpen: false, reason: "" });

  // Dynamic DB States
  const [checkoutConfig, setCheckoutConfig] = useState({ 
    is_active: false, flat_rate: 0, free_shipping_threshold: 0, gst_percentage: 3 
  });
  const [voucherDetails, setVoucherDetails] = useState<any>(null);

  // Unified Form State
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    addressLine1: "", addressLine2: "", city: "", state: "", pincode: "",
  });

  // ==========================================
  // 1. FETCH SECURE PROFILE FROM SERVER
  // ==========================================
  const fetchSecureProfile = async () => {
    try {
      const data = await getAccountProfileFn();
      if (data && data.customer) {
        setCurrentUser(data.customer);
        // Auto-fill existing data so user doesn't have to type it again
        setFormData({
          firstName: data.profile?.first_name || data.customer.full_name?.split(' ')[0] || "",
          lastName: data.profile?.last_name || data.customer.full_name?.split(' ').slice(1).join(' ') || "",
          email: data.customer.email || "",
          phone: data.customer.phone.replace('91', '') || "",
          addressLine1: data.profile?.street_address || "",
          addressLine2: data.profile?.apartment || "",
          city: data.profile?.city || "",
          state: data.profile?.state || "",
          pincode: data.profile?.pincode || ""
        });
      }
    } catch (error) {
      setCurrentUser(null); // Valid: User is just a guest
    }
  };

  useEffect(() => {
    const initializeCheckout = async () => {
      setIsDataLoading(true);
      try {
        // A. Load Store Config
        const { data: configData } = await supabase.from("ecommerce_store_config").select("config_value").eq("config_key", "shipping_settings").single();
        if (configData?.config_value) {
          setCheckoutConfig({ ...configData.config_value, gst_percentage: configData.config_value.gst_percentage ?? 3 });
        }

        // B. Load Voucher
        if (coupon) {
          const { data: voucher } = await supabase.from('vouchers').select('id, code, discount_value, handling_fee, status, customer_id, valid_from, expiry_date').ilike('code', coupon).eq('status', 'registered').maybeSingle();
          if (voucher) setVoucherDetails(voucher);
        }

        // C. Fetch Authenticated Profile securely
        await fetchSecureProfile();

      } catch (error) {
        console.error("Initialization Error", error);
      } finally {
        setIsDataLoading(false);
      }
    };
    
    initializeCheckout();
  }, [coupon]);

  const handleLogout = async () => {
    await logoutFn(); // Clears secure HttpOnly cookie
    
    // ✨ FIX: Clear global frontend state
    localStorage.removeItem("pavitram_user");
    window.dispatchEvent(new Event("storage")); 
    
    setCurrentUser(null);
    setFormData({ firstName: "", lastName: "", email: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "" });
    toast.success("Logged out successfully.");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Determine UI Flow states
  const hasCompleteAddress = formData.addressLine1 && formData.city && formData.pincode && formData.state;
  const showAddressForm = !currentUser || !hasCompleteAddress || isEditingAddress;

  // ==========================================
  // 2. STRICT BILLING MATH ENGINE
  // ==========================================
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  let rawDiscount = 0, handlingFee = 0, appliedDiscount = 0, taxableValue = subtotal;

  if (voucherDetails) {
    rawDiscount = voucherDetails.discount_value || 0;
    handlingFee = voucherDetails.handling_fee || 0;
    if (subtotal >= rawDiscount) {
      appliedDiscount = rawDiscount - handlingFee;
      taxableValue = subtotal - appliedDiscount;
    } else {
      appliedDiscount = subtotal > handlingFee ? subtotal - handlingFee : 0;
      taxableValue = handlingFee;
    }
  }

  taxableValue = Math.max(0, taxableValue);
  const totalGstAmount = taxableValue * (checkoutConfig.gst_percentage / 100);
  const cgstAmount = totalGstAmount / 2;
  const sgstAmount = totalGstAmount / 2;

  let shippingCharge = 0;
  if (checkoutConfig.is_active && subtotal < checkoutConfig.free_shipping_threshold) {
    shippingCharge = checkoutConfig.flat_rate;
  }

  const exactTotal = taxableValue + totalGstAmount + shippingCharge;
  const total = Math.round(exactTotal);

  const isFormValid = !!(
    formData.firstName.trim() && formData.lastName.trim() && formData.email.trim() &&
    (currentUser ? true : formData.phone.trim()) && // If logged in, phone is guaranteed
    formData.addressLine1.trim() && formData.city.trim() && formData.state.trim() && formData.pincode.trim() &&
    dpdpConsent
  );

  // ==========================================
  // 3. SECURE CHECKOUT EXECUTION
  // ==========================================
  const handlePayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cartItems.length === 0) return toast.error("Your cart is empty!");
    if (!isFormValid) return toast.error("Please complete all required fields and accept the DPDP privacy consent to continue.");

    setPaymentFailedModal({ isOpen: false, reason: "" });
    setIsProcessing(true);
    setProcessingMessage("Verifying order and connecting to Razorpay...");

    try {
      // If user is authenticated, silently push their fresh address to the DB before taking payment
      if (currentUser) {
        await updateAccountProfileFn({
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            streetAddress: formData.addressLine1,
            apartment: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode
          }
        }).catch(err => console.warn("Failed to sync profile update, but continuing checkout:", err));
      }

      if (voucherDetails) {
        const { data: verifyVoucher, error: vError } = await supabase.from('vouchers').select('status, customer_id').eq('id', voucherDetails.id).single();
        if (vError || verifyVoucher?.status !== 'registered') {
          setIsProcessing(false);
          return toast.error("Security Alert: This voucher is no longer valid or has already been redeemed.");
        }
      }

      setProcessingMessage("Launching secure payment portal...");
      const res = await loadRazorpayScript();
      if (!res) throw new Error("Payment gateway failed to load. Please check your connection.");

      const orderResponse = await fetch('https://mfdjlbvqfbujipihehpt.supabase.co/functions/v1/razorpay-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
          coupon_code: voucherDetails?.code || null,
          shipping_pincode: formData.pincode
        }) 
      });
      const orderData = await orderResponse.json();

      if (!orderData.id) throw new Error("Failed to initialize order on server.");

      const options = {
        key: "rzp_test_TWOt1jOLaW5e92", 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Pavitram Diamond Jewellery",
        description: "Bespoke Jewellery Purchase",
        order_id: orderData.id, 
        handler: async function (response: any) {
          setProcessingMessage("Verifying payment confirmation...");
          setIsProcessing(true);

          const verifyRes = await fetch('https://mfdjlbvqfbujipihehpt.supabase.co/functions/v1/razorpay-verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              cartItems: cartItems,
              formData: formData,
              subtotal: subtotal,
              discount: appliedDiscount,
              handling_fee: handlingFee,
              shipping: shippingCharge,
              total: total,
              voucher_code: voucherDetails?.code || null,
              voucher_id: voucherDetails?.id || null,
              customer_id: currentUser?.id || null
            }),
          });
          
          const verifyData = await verifyRes.json();
          
          if (verifyData.success) {
            clearCart();
            setIsProcessing(false);
            navigate({ to: "/success", search: { order_id: verifyData.orderId } }); 
          } else {
            setIsProcessing(false);
            setPaymentFailedModal({
              isOpen: true,
              reason: "Payment verification failed on the server. If money was deducted, our team will verify and confirm your order shortly.",
            });
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: currentUser ? currentUser.phone : formData.phone,
        },
        notes: {
          address: `${formData.addressLine1}, ${formData.city}, ${formData.pincode}`,
        },
        theme: { color: "#4A0B49" },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            setPaymentFailedModal({ isOpen: true, reason: "You closed the payment gateway before the transaction could finish." });
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);

      paymentObject.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        setPaymentFailedModal({
          isOpen: true,
          reason: response.error?.description || "Your bank or card issuer was unable to process this payment.",
        });
      });

      paymentObject.open();

    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      setIsProcessing(false);
      setPaymentFailedModal({
        isOpen: true,
        reason: error.message || "Unable to establish connection with the payment gateway.",
      });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-zinc-900 mb-4">Your cart is empty</h2>
        <Link to="/" className="text-[#4A0B49] font-bold hover:underline">Return to Shop</Link>
      </div>
    );
  }

  return (
    <>
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-5 p-8 max-w-sm text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-zinc-100 border-t-[#4A0B49] rounded-full animate-spin" />
              <Lock className="w-5 h-5 text-[#4A0B49] absolute inset-0 m-auto" />
            </div>
            <div>
              <h3 className="text-base font-serif font-semibold text-zinc-900 mb-1">Connecting to Secure Gateway</h3>
              <p className="text-xs text-zinc-500 font-sans leading-relaxed">{processingMessage}</p>
            </div>
          </div>
        </div>
      )}

      {paymentFailedModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200">
            <div className="bg-[#FCF9F5] p-6 border-b border-[#E9D8C3]/60 flex flex-col items-center text-center relative">
              <button onClick={() => setPaymentFailedModal({ isOpen: false, reason: "" })} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1">
                <X className="w-5 h-5" />
              </button>
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-3 border border-amber-200 shadow-sm">
                <AlertTriangle className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-serif font-medium text-[#4A0B49]">Payment Could Not Be Completed</h3>
              <p className="text-xs text-zinc-600 mt-2">{paymentFailedModal.reason}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-left">
                <p className="text-xs text-emerald-900 leading-relaxed">
                  <strong>Your funds are safe.</strong> If deducted, they will be reversed within 3-5 days.
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                <button onClick={handlePayment} className="w-full bg-[#4A0B49] hover:bg-[#340733] text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Retry Payment
                </button>
                <button onClick={() => setPaymentFailedModal({ isOpen: false, reason: "" })} className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-wider py-3 rounded-xl">
                  Review Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-zinc-50 font-sans pb-24 ${(isProcessing || isDataLoading) ? 'pointer-events-none' : ''}`}>
        <header className="bg-white border-b border-zinc-200 relative z-10">
          <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="shrink-0 absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => navigate({ to: "/" })}>
              <Logo className="h-10 w-auto" />
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Secure Checkout</span>
            </div>
          </div>
        </header>

        {isDataLoading ? (
          <div className="pt-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>
        ) : (
          <main className="max-w-[1200px] mx-auto px-4 pt-8 relative z-0 animate-in fade-in duration-500">
            <form className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              
              {/* LEFT COLUMN: CUSTOMER & ADDRESS DETAILS */}
              <div className="w-full lg:w-[55%] xl:w-[60%] space-y-8">
                
                {/* ========================================== */}
                {/* 1. AUTH / CONTACT INFO */}
                {/* ========================================== */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs">1</span>
                      Contact Information
                    </h2>
                  </div>
                  
                  {currentUser ? (
                    // ✨ COMPACT VERIFIED PILL
                    <div className="p-4 border border-emerald-200 bg-emerald-50/50 rounded-xl flex items-center justify-between animate-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-4 pl-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{currentUser.full_name || 'Verified Customer'}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-600 font-mono flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400"/> +91 {currentUser.phone.replace('91', '')}</span>
                            {currentUser.email && <span className="text-xs text-slate-600 font-sans flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400"/> {currentUser.email}</span>}
                          </div>
                        </div>
                      </div>
                      <button type="button" onClick={handleLogout} className="text-xs font-bold text-rose-500 hover:text-rose-700 uppercase tracking-wider px-3 py-1.5 rounded-md hover:bg-rose-50 transition-colors">
                        Logout
                      </button>
                    </div>
                  ) : (
                    // 📝 GUEST FORM & LOGIN BUTTON
                    <div className="animate-in fade-in duration-300">
                      <div className="p-4 md:p-5 mb-6 border border-[#E9D8C3] bg-[#FCF9F5] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">Checkout as Guest or Member</h3>
                          <p className="text-xs text-slate-500 mt-1">Log in via OTP to access saved addresses & Loyalty Points.</p>
                        </div>
                        <button type="button" onClick={() => setIsAuthModalOpen(true)} className="w-full sm:w-auto shrink-0 bg-[#4A1F58] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#302832] transition-colors shadow-sm">
                          <LogIn className="w-4 h-4" /> Log In
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-zinc-600">Mobile Number <span className="text-red-500">*</span></label>
                          <div className="relative flex items-center">
                            <span className="absolute left-4 text-sm font-bold text-zinc-500">+91</span>
                            <input required type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} maxLength={10} className="w-full h-12 pl-12 pr-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" placeholder="9876543210" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-600">First Name <span className="text-red-500">*</span></label>
                          <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-600">Last Name <span className="text-red-500">*</span></label>
                          <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-zinc-600">Email Address (For Invoices)</label>
                          <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" placeholder="you@example.com" />
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* ========================================== */}
                {/* 2. DELIVERY ADDRESS OPTIONS */}
                {/* ========================================== */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                  <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs">2</span>
                    Delivery Details
                  </h2>
                  
                  {!showAddressForm ? (
                    // ✨ SAVED ADDRESS COMPACT PILL
                    <div className="p-5 border border-zinc-200 rounded-xl flex items-start justify-between shadow-sm group animate-in zoom-in-95 duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 mt-1">
                          <MapPin className="w-5 h-5 text-zinc-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                            {formData.firstName} {formData.lastName}
                          </p>
                          <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                            {formData.addressLine1}, {formData.addressLine2 && `${formData.addressLine2}, `}
                            {formData.city}, {formData.state} - {formData.pincode}
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setIsEditingAddress(true)} className="text-xs font-bold text-[#4A0B49] hover:text-[#340733] uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-zinc-50 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                    </div>
                  ) : (
                    // 📝 FULL ADDRESS FORM
                    <div className="animate-in fade-in duration-300">
                      
                      {currentUser && !hasCompleteAddress && !isEditingAddress && (
                         <div className="mb-6 pb-6 border-b border-zinc-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                               <MapPin className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                               <h3 className="text-sm font-bold text-slate-800">Where should we send your order?</h3>
                               <p className="text-xs text-slate-500 mt-1">Please provide your complete delivery details below.</p>
                            </div>
                         </div>
                      )}

                      {/* If the user is logged in, but they lack a first/last name (new profile), ask for it here smoothly */}
                      {currentUser && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pb-4 border-b border-zinc-100">
                           <div className="space-y-1.5">
                             <label className="text-xs font-bold text-zinc-600">First Name <span className="text-red-500">*</span></label>
                             <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" />
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-xs font-bold text-zinc-600">Last Name <span className="text-red-500">*</span></label>
                             <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" />
                           </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-zinc-600">Street Address <span className="text-red-500">*</span></label>
                          <input required type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" placeholder="House number and street name" />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-zinc-600">Apartment, suite, etc. (Optional)</label>
                          <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-600">City <span className="text-red-500">*</span></label>
                          <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-600">State <span className="text-red-500">*</span></label>
                          <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-zinc-600">PIN Code <span className="text-red-500">*</span></label>
                          <input required type="text" maxLength={6} name="pincode" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" />
                        </div>
                      </div>
                      
                      {currentUser && isEditingAddress && hasCompleteAddress && (
                        <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-zinc-100">
                          <button type="button" onClick={() => setIsEditingAddress(false)} className="px-5 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-800 transition-colors">Cancel</button>
                          <button type="button" onClick={() => setIsEditingAddress(false)} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-sm">
                            Save Address
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>

              {/* RIGHT COLUMN: ORDER SUMMARY & PAY NOW */}
              <div className="w-full lg:w-[45%] xl:w-[40%]">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-zinc-200 sticky top-24">
                  <h2 className="text-lg font-bold text-zinc-900 mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 items-start">
                        <div className="relative w-16 h-16 bg-[#F9F6F0] rounded-lg border border-zinc-100 shrink-0 p-1">
                          <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                          <span className="absolute -top-2 -right-2 bg-zinc-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 pt-1">
                          <h4 className="text-xs font-bold text-zinc-900 line-clamp-2 leading-snug">{item.title}</h4>
                          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">SKU: {item.sku}</p>
                        </div>
                        <div className="pt-1 text-sm font-bold text-zinc-900 shrink-0">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="border-zinc-100 mb-6" />

                  <div className="space-y-3 text-sm border-b border-zinc-100 pb-6 mb-6">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-zinc-900">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    {voucherDetails && appliedDiscount > 0 && (
                      <div className="my-3">
                        <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 p-2 rounded-md border border-emerald-100">
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold text-xs uppercase tracking-widest">{voucherDetails.code} Applied</span>
                          </div>
                          <span className="font-bold">- ₹{appliedDiscount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between text-zinc-800 font-semibold border-t border-zinc-100 pt-3 mt-3">
                      <span>Taxable Value</span>
                      <span>₹{taxableValue.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-zinc-500 text-xs pl-2">
                      <span>CGST ({(checkoutConfig.gst_percentage / 2).toFixed(1)}%)</span>
                      <span>+ ₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500 text-xs pl-2">
                      <span>SGST ({(checkoutConfig.gst_percentage / 2).toFixed(1)}%)</span>
                      <span>+ ₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between text-zinc-600 pt-3 border-t border-zinc-100">
                      <span>Shipping</span>
                      {shippingCharge === 0 ? (
                        <span className="font-bold text-emerald-600 uppercase tracking-widest text-[10px]">Free Insured Delivery</span>
                      ) : (
                        <span className="font-medium text-zinc-900">₹{shippingCharge.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-end mb-8">
                    <span className="text-base font-bold text-zinc-900">Total Payable</span>
                    <span className="text-2xl font-black text-zinc-900 tracking-tight">₹{total.toLocaleString('en-IN')}</span>
                  </div>

                  {/* DPDP Act Consent */}
                  <div className="mb-6 flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="dpdp-consent"
                      checked={dpdpConsent}
                      onChange={(e) => setDpdpConsent(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-zinc-300 text-[#4A0B49] focus:ring-[#4A0B49] cursor-pointer shrink-0"
                    />
                    <label htmlFor="dpdp-consent" className="text-xs text-zinc-600 leading-tight cursor-pointer">
                      I consent to the collection and processing of my personal data for order fulfillment in accordance with the DPDP Act, 2023, and I agree to the{" "}
                      <Link to="/policy/$slug" params={{ slug: "terms" }} target="_blank" className="text-[#4A0B49] font-semibold hover:underline">Terms of Service</Link>,{" "}
                      <Link to="/policy/$slug" params={{ slug: "privacy" }} target="_blank" className="text-[#4A0B49] font-semibold hover:underline">Privacy Policy</Link>, and{" "}
                      <Link to="/policy/$slug" params={{ slug: "shipping" }} target="_blank" className="text-[#4A0B49] font-semibold hover:underline">Shipping Policy</Link>.
                    </label>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={handlePayment}
                    className={`w-full text-white font-bold text-sm tracking-widest uppercase py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                      isFormValid && !isProcessing 
                        ? 'bg-[#4A0B49] hover:bg-[#340733] active:scale-[0.98] cursor-pointer opacity-100' 
                        : 'bg-zinc-400 opacity-60 cursor-pointer'
                    }`}
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />} 
                    Pay Now
                  </button>
                </div>
              </div>
            </form>
          </main>
        )}
      </div>

      <WhatsAppAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => {
          setIsAuthModalOpen(false);
          toast.success("Successfully verified!");
          fetchSecureProfile(); // Fetches identity and transforms the UI instantly
        }}
      />
    </>
  );
}