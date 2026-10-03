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
  RefreshCw, X, Ticket, MapPin, CheckCircle2, UserCircle2, Mail, Phone, Plus
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
  const [hasDbAddress, setHasDbAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Payment Failure State
  const [paymentFailedModal, setPaymentFailedModal] = useState({ isOpen: false, reason: "" });

  // Dynamic DB States
  const [checkoutConfig, setCheckoutConfig] = useState({ 
    is_active: false, flat_rate: 0, free_shipping_threshold: 0, gst_percentage: 3 
  });
  const [voucherDetails, setVoucherDetails] = useState<any>(null);

  // Unified Form State (Combined Profile & Address)
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", 
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
        
        const addressExists = !!(data.profile?.street_address && data.profile?.city && data.profile?.pincode);
        setHasDbAddress(addressExists);
        setIsEditingAddress(false); // Always keep accordion closed initially
        
        setFormData({
          firstName: data.profile?.first_name || data.customer.full_name?.split(' ')[0] || "",
          lastName: data.profile?.last_name || data.customer.full_name?.split(' ').slice(1).join(' ') || "",
          email: data.customer.email || "",
          addressLine1: data.profile?.street_address || "",
          addressLine2: data.profile?.apartment || "",
          city: data.profile?.city || "",
          state: data.profile?.state || "",
          pincode: data.profile?.pincode || ""
        });
      }
    } catch (error) {
      setCurrentUser(null);
      setHasDbAddress(false);
    }
  };

  useEffect(() => {
    const initializeCheckout = async () => {
      setIsDataLoading(true);
      try {
        const { data: configData } = await supabase.from("ecommerce_store_config").select("config_value").eq("config_key", "shipping_settings").single();
        if (configData?.config_value) {
          setCheckoutConfig({ ...configData.config_value, gst_percentage: configData.config_value.gst_percentage ?? 3 });
        }

        if (coupon) {
          const { data: voucher } = await supabase.from('vouchers').select('id, code, discount_value, handling_fee, status, customer_id, valid_from, expiry_date').ilike('code', coupon).eq('status', 'registered').maybeSingle();
          if (voucher) setVoucherDetails(voucher);
        }

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
    await logoutFn(); 
    localStorage.removeItem("pavitram_user");
    window.dispatchEvent(new Event("storage")); 
    setCurrentUser(null);
    setHasDbAddress(false);
    setIsEditingAddress(false);
    setFormData({ firstName: "", lastName: "", email: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "" });
    toast.success("Logged out securely.");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
      return toast.error("Please fill all required fields.");
    }

    setIsSavingAddress(true);
    try {
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
      });
      await fetchSecureProfile(); 
      toast.success("Delivery details saved.");
    } catch (error: any) {
      toast.error("Failed to save address.");
    } finally {
      setIsSavingAddress(false);
    }
  };

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

  const isCheckoutReady = !!(currentUser && hasDbAddress && dpdpConsent && !isEditingAddress);

  // ==========================================
  // 3. SECURE CHECKOUT EXECUTION
  // ==========================================
  const handlePayment = async () => {
    if (cartItems.length === 0) return toast.error("Your cart is empty!");
    if (!isCheckoutReady) return toast.error("Please complete your delivery details and accept the privacy consent.");

    setPaymentFailedModal({ isOpen: false, reason: "" });
    setIsProcessing(true);
    setProcessingMessage("Verifying order and connecting to Gateway...");

    try {
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
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
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
              customer_id: currentUser.id
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
          contact: currentUser.phone,
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
      {/* PROCESSING OVERLAY */}
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

      {/* ERROR MODAL */}
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
              <div className="flex flex-col gap-2.5">
                <button onClick={handlePayment} className="w-full bg-[#4A0B49] hover:bg-[#340733] text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Retry Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✨ FIX: Increased pb-[140px] so you can scroll to the bottom of the order summary without it being blocked */}
      <div className={`min-h-screen bg-[#F1F2F4] font-sans pb-[140px] md:pb-24 ${(isProcessing || isDataLoading) ? 'pointer-events-none' : ''}`}>
        
        {/* HEADER */}
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-zinc-900">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="shrink-0 absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => navigate({ to: "/" })}>
              <Logo className="h-10 w-auto" />
            </div>
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100">
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Secure</span>
            </div>
          </div>
        </header>

        {isDataLoading ? (
          <div className="pt-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>
        ) : (
          <main className="max-w-[1200px] mx-auto px-0 sm:px-4 pt-4 sm:pt-8 relative z-0 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-10">
              
              {/* LEFT COLUMN: ACCORDION STEPS */}
              <div className="w-full lg:w-[55%] xl:w-[60%] space-y-4 sm:space-y-6">
                
                {/* ========================================== */}
                {/* STEP 1: LOGIN (MANDATORY) */}
                {/* ========================================== */}
                <section className="bg-white sm:rounded-xl shadow-sm border-y sm:border border-zinc-200 overflow-hidden">
                  <div className={`p-4 sm:p-5 flex items-center justify-between ${currentUser ? 'bg-emerald-50/50' : 'bg-white'}`}>
                    <h2 className="text-base font-bold text-zinc-900 flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${currentUser ? 'bg-emerald-100 text-emerald-700' : 'bg-[#4A0B49] text-white'}`}>
                        {currentUser ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                      </span>
                      Account Login
                    </h2>
                    {currentUser && (
                      <button onClick={handleLogout} className="text-xs font-bold text-zinc-500 hover:text-rose-600 transition-colors">
                        Change Account
                      </button>
                    )}
                  </div>
                  
                  {!currentUser ? (
                    <div className="p-4 sm:p-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50/50">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-800">Please log in to continue</h3>
                        <p className="text-xs text-zinc-500 mt-1">We require authentication to secure your purchase.</p>
                      </div>
                      <button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="w-full sm:w-auto bg-[#4A0B49] text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-[#340733] transition-colors"
                      >
                        Login via OTP
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 sm:px-5 pb-5 pt-1 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0">
                        <UserCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{currentUser.full_name || 'Verified Customer'}</p>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">+91 {currentUser.phone.replace('91', '')}</p>
                      </div>
                    </div>
                  )}
                </section>

                {/* ========================================== */}
                {/* STEP 2: DELIVERY ADDRESS */}
                {/* ========================================== */}
                <section className={`bg-white sm:rounded-xl shadow-sm border-y sm:border border-zinc-200 overflow-hidden transition-opacity duration-300 ${!currentUser ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                  <div className={`p-4 sm:p-5 flex items-center justify-between ${hasDbAddress && !isEditingAddress ? 'bg-emerald-50/50' : 'bg-white'}`}>
                    <h2 className="text-base font-bold text-zinc-900 flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${hasDbAddress && !isEditingAddress ? 'bg-emerald-100 text-emerald-700' : 'bg-[#4A0B49] text-white'}`}>
                        {hasDbAddress && !isEditingAddress ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                      </span>
                      Delivery Address
                    </h2>
                    {hasDbAddress && !isEditingAddress && (
                      <button onClick={() => setIsEditingAddress(true)} className="text-xs font-bold text-[#4A0B49] hover:underline transition-colors">
                        Change
                      </button>
                    )}
                  </div>

                  {/* ADDRESS ACCORDION LOGIC */}
                  {currentUser && !isEditingAddress ? (
                    hasDbAddress ? (
                      // HAS ADDRESS & CLOSED -> Show Pill
                      <div className="px-4 sm:px-5 pb-5 pt-1">
                        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex gap-3">
                          <MapPin className="w-5 h-5 text-zinc-500 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-zinc-900 mb-1">{formData.firstName} {formData.lastName}</p>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                              {formData.addressLine1}, {formData.addressLine2 && `${formData.addressLine2}, `}
                              {formData.city}, {formData.state} - {formData.pincode}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // NO ADDRESS & CLOSED -> Show "Add Address" Prompt
                      <div className="p-4 sm:p-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-zinc-800">No delivery address saved</h3>
                            <p className="text-xs text-zinc-500 mt-1">Please add a delivery address to continue.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsEditingAddress(true)}
                          className="w-full sm:w-auto bg-white border border-zinc-300 text-zinc-700 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Add Address
                        </button>
                      </div>
                    )
                  ) : currentUser && isEditingAddress ? (
                    // OPEN EDIT/ADD FORM
                    <form onSubmit={handleSaveAddress} className="p-4 sm:p-6 border-t border-zinc-100 bg-white">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">First Name *</label>
                          <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full h-11 px-3 text-sm border border-zinc-300 rounded-md focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all bg-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">Last Name *</label>
                          <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full h-11 px-3 text-sm border border-zinc-300 rounded-md focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all bg-white" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">Email Address (For Invoices) *</label>
                          <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full h-11 px-3 text-sm border border-zinc-300 rounded-md focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all bg-white" />
                        </div>
                      </div>

                      <hr className="border-zinc-100 my-5" />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">Street Address *</label>
                          <input required type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className="w-full h-11 px-3 text-sm border border-zinc-300 rounded-md focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all bg-white" placeholder="Flat No., Building, Street Name" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">Landmark / Apartment (Optional)</label>
                          <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} className="w-full h-11 px-3 text-sm border border-zinc-300 rounded-md focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all bg-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">City *</label>
                          <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full h-11 px-3 text-sm border border-zinc-300 rounded-md focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all bg-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">State *</label>
                          <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full h-11 px-3 text-sm border border-zinc-300 rounded-md focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all bg-white" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">PIN Code *</label>
                          <input required type="text" maxLength={6} name="pincode" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})} className="w-full h-11 px-3 text-sm border border-zinc-300 rounded-md focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all bg-white" />
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end gap-3">
                        {hasDbAddress && (
                          <button type="button" onClick={() => setIsEditingAddress(false)} className="px-5 py-2.5 text-xs font-bold text-zinc-500 uppercase tracking-wider hover:text-zinc-800 transition-colors">Cancel</button>
                        )}
                        <button type="submit" disabled={isSavingAddress} className="w-full sm:w-auto bg-[#C9A15B] text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#b08d4f] transition-all shadow-sm flex items-center justify-center gap-2">
                          {isSavingAddress ? <Loader2 className="w-4 h-4 animate-spin" /> : "Use this Address"}
                        </button>
                      </div>
                    </form>
                  ) : null}
                </section>
                
                {/* ========================================== */}
                {/* STEP 3: PAYMENT / REVIEW */}
                {/* ========================================== */}
                <section className={`bg-white sm:rounded-xl shadow-sm border-y sm:border border-zinc-200 overflow-hidden transition-opacity duration-300 hidden sm:block ${!isCheckoutReady ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                  <div className="p-4 sm:p-5 flex items-center justify-between">
                    <h2 className="text-base font-bold text-zinc-900 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold bg-[#4A0B49] text-white">3</span>
                      Payment Options
                    </h2>
                  </div>
                  <div className="px-4 sm:px-5 pb-5 pt-1">
                    <div className="p-4 border border-zinc-200 rounded-lg flex items-center gap-4 bg-zinc-50">
                      <CreditCard className="w-6 h-6 text-zinc-400" />
                      <div>
                        <p className="text-sm font-bold text-zinc-800">Secure Razorpay Gateway</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Google Pay, PhonePe, Paytm, UPI, Cards & NetBanking</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN: ORDER SUMMARY */}
              <div className="w-full lg:w-[45%] xl:w-[40%]">
                <div className="bg-white p-5 sm:p-6 sm:rounded-xl shadow-sm border-y sm:border border-zinc-200 sticky top-24">
                  <h2 className="text-base font-bold text-zinc-900 mb-4 pb-4 border-b border-zinc-100">Order Summary</h2>
                  
                  <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 items-start">
                        <div className="relative w-16 h-16 bg-[#F9F6F0] rounded-lg border border-zinc-100 shrink-0 p-1">
                          <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                          <span className="absolute -top-2 -right-2 bg-zinc-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
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

                  <div className="space-y-2.5 text-sm border-y border-zinc-100 py-4 mb-4">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-zinc-900">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    {voucherDetails && appliedDiscount > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 text-xs font-bold">
                        <span>Discount ({voucherDetails.code})</span>
                        <span>- ₹{appliedDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-zinc-500 text-xs">
                      <span>GST ({(checkoutConfig.gst_percentage).toFixed(1)}%)</span>
                      <span>+ ₹{totalGstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between text-zinc-600">
                      <span>Delivery</span>
                      {shippingCharge === 0 ? (
                        <span className="font-bold text-emerald-600 uppercase tracking-widest text-[10px]">Free</span>
                      ) : (
                        <span className="font-medium text-zinc-900">₹{shippingCharge.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-end mb-6">
                    <span className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Total</span>
                    <span className="text-xl font-black text-zinc-900 tracking-tight">₹{total.toLocaleString('en-IN')}</span>
                  </div>

                  {/* DPDP Act Consent */}
                  <div className={`mb-6 flex items-start gap-3 p-3 rounded-lg border transition-colors ${dpdpConsent ? 'bg-emerald-50/50 border-emerald-100' : 'bg-zinc-50 border-zinc-200'}`}>
                    <input 
                      type="checkbox" 
                      id="dpdp-consent"
                      checked={dpdpConsent}
                      onChange={(e) => setDpdpConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-zinc-300 text-[#4A0B49] focus:ring-[#4A0B49] cursor-pointer shrink-0"
                    />
                    <label htmlFor="dpdp-consent" className="text-[11px] text-zinc-600 leading-snug cursor-pointer">
                      I agree to the <Link to="/policy/$slug" params={{ slug: "terms" }} target="_blank" className="text-[#4A0B49] font-bold hover:underline">Terms</Link> & <Link to="/policy/$slug" params={{ slug: "privacy" }} target="_blank" className="text-[#4A0B49] font-bold hover:underline">Privacy Policy</Link> as per DPDP Act 2023.
                    </label>
                  </div>
                  
                  {/* Desktop Pay Button */}
                  <button 
                    type="button"
                    onClick={handlePayment}
                    disabled={!isCheckoutReady || isProcessing}
                    className={`hidden sm:flex w-full text-white font-bold text-sm tracking-widest uppercase py-4 rounded-xl shadow-md transition-all items-center justify-center gap-2 ${
                      isCheckoutReady && !isProcessing 
                        ? 'bg-[#4A0B49] hover:bg-[#340733] active:scale-[0.98] cursor-pointer opacity-100' 
                        : 'bg-zinc-300 opacity-70 cursor-not-allowed text-zinc-500'
                    }`}
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />} 
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* ✨ FIX: Increased z-index to 60 to completely overlay any website bottom navigation bars */}
      {/* MOBILE STICKY BOTTOM BAR FOR PAYMENT */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-4 pt-4 pb-6 md:pb-4 shadow-[0_-10px_20px_rgba(0,0,0,0.08)] z-[60]">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Payable</span>
          <span className="text-lg font-black text-zinc-900">₹{total.toLocaleString('en-IN')}</span>
        </div>
        <button 
          onClick={handlePayment}
          disabled={!isCheckoutReady || isProcessing}
          className={`w-full font-bold text-sm tracking-widest uppercase py-3.5 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all ${
            isCheckoutReady && !isProcessing 
              ? 'bg-[#C9A15B] text-white hover:bg-[#b08d4f] active:scale-[0.98]' 
              : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
          }`}
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />} 
          {isCheckoutReady ? "Pay Now" : "Complete Details"}
        </button>
      </div>

      <WhatsAppAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => {
          setIsAuthModalOpen(false);
          toast.success("Successfully verified!");
          fetchSecureProfile(); // Fetches profile and manages step unrolling
        }}
      />
    </>
  );
}