"use client";

import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, Lock, CreditCard, Loader2, AlertTriangle, 
  MessageCircle, Phone, RefreshCw, X, Ticket, MapPin, 
  UserPlus, CheckCircle2, UserCircle2
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

  // Auth & Address States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [savedProfile, setSavedProfile] = useState<any>(null);
  const [useSavedAddress, setUseSavedAddress] = useState<boolean>(false);

  // Payment Failure State
  const [paymentFailedModal, setPaymentFailedModal] = useState<{
    isOpen: boolean;
    reason: string;
  }>({
    isOpen: false,
    reason: "",
  });

  // Dynamic DB States
  const [checkoutConfig, setCheckoutConfig] = useState({ 
    is_active: false, 
    flat_rate: 0, 
    free_shipping_threshold: 0, 
    gst_percentage: 3 
  });
  const [voucherDetails, setVoucherDetails] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    addressLine1: "", addressLine2: "", city: "", state: "", pincode: "400089",
  });

  // ==========================================
  // 1. DATA INITIALIZATION & AUTH CHECK
  // ==========================================
  useEffect(() => {
    const initializeCheckout = async () => {
      setIsDataLoading(true);
      try {
        // A. Load Store Config
        const { data: configData } = await supabase
          .from("ecommerce_store_config")
          .select("config_value")
          .eq("config_key", "shipping_settings")
          .single();
          
        if (configData?.config_value) {
          setCheckoutConfig({
            ...configData.config_value,
            gst_percentage: configData.config_value.gst_percentage ?? 3
          });
        }

        // B. Load Voucher
        if (coupon) {
          const { data: voucher } = await supabase
            .from('vouchers')
            .select('id, code, discount_value, handling_fee, status, customer_id, valid_from, expiry_date')
            .ilike('code', coupon)
            .eq('status', 'registered')
            .maybeSingle();

          if (voucher) setVoucherDetails(voucher);
        }

        // C. Load Auth User & Saved Profile
        const storedUser = localStorage.getItem("pavitram_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);

          const nameParts = (user.full_name || "").split(" ");
          let displayPhone = user.phone || "";
          if (displayPhone.startsWith("91") && displayPhone.length === 12) {
            displayPhone = displayPhone.substring(2);
          }

          // Fetch Master Address
          const { data: profile } = await supabase
            .from("ecommerce_customer_profiles")
            .select("*")
            .eq("customer_id", user.id)
            .maybeSingle();

          const hasValidSavedAddress = profile && (profile.street_address || profile.city);

          if (hasValidSavedAddress) {
            setSavedProfile(profile);
            setUseSavedAddress(true);
            
            // Auto-fill form with saved data behind the scenes
            setFormData({
              firstName: profile.first_name || nameParts[0] || "",
              lastName: profile.last_name || nameParts.slice(1).join(" ") || "",
              email: user.email || "",
              phone: displayPhone,
              addressLine1: profile.street_address || "",
              addressLine2: profile.apartment || "",
              city: profile.city || "",
              state: profile.state || "",
              pincode: profile.pincode || ""
            });
          } else {
            // Pre-fill contact info only if no address exists
            setFormData(prev => ({
              ...prev,
              firstName: nameParts[0] || "",
              lastName: nameParts.slice(1).join(" ") || "",
              email: user.email || "",
              phone: displayPhone,
            }));
          }
        }
      } catch (error) {
        console.error("Initialization Error", error);
      } finally {
        setIsDataLoading(false);
      }
    };
    
    initializeCheckout();
  }, [coupon]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAddressMode = (useSaved: boolean) => {
    setUseSavedAddress(useSaved);
    if (useSaved && savedProfile) {
      setFormData(prev => ({
        ...prev,
        firstName: savedProfile.first_name || currentUser?.full_name?.split(" ")[0] || "",
        lastName: savedProfile.last_name || currentUser?.full_name?.split(" ").slice(1).join(" ") || "",
        addressLine1: savedProfile.street_address || "",
        addressLine2: savedProfile.apartment || "",
        city: savedProfile.city || "",
        state: savedProfile.state || "",
        pincode: savedProfile.pincode || ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: ""
      }));
    }
  };

  // ==========================================
  // 2. STRICT BILLING MATH ENGINE
  // ==========================================
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  let rawDiscount = 0;
  let handlingFee = 0;
  let appliedDiscount = 0;
  let taxableValue = subtotal;

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

  // ==========================================
  // 3. FORM VALIDATION
  // ==========================================
  const isFormValid = !!(
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.addressLine1.trim() &&
    formData.city.trim() &&
    formData.state.trim() &&
    formData.pincode.trim() &&
    dpdpConsent
  );

  // ==========================================
  // 4. SECURE CHECKOUT EXECUTION
  // ==========================================
  const handlePayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cartItems.length === 0) return alert("Your cart is empty!");

    if (!isFormValid) {
      alert("Please complete all required fields and accept the DPDP privacy consent to continue.");
      return;
    }

    setPaymentFailedModal({ isOpen: false, reason: "" });
    setIsProcessing(true);
    setProcessingMessage("Verifying order and connecting to Razorpay...");

    try {
      if (voucherDetails) {
        const { data: verifyVoucher, error: vError } = await supabase
          .from('vouchers')
          .select('status, customer_id')
          .eq('id', voucherDetails.id)
          .single();

        if (vError || verifyVoucher?.status !== 'registered') {
          alert("Security Alert: This voucher is no longer valid or has already been redeemed.");
          setIsProcessing(false);
          return;
        }

        if (verifyVoucher.customer_id) {
          const { data: customerMatch } = await supabase
            .from('customers')
            .select('id')
            .eq('id', verifyVoucher.customer_id)
            .or(`email.eq.${formData.email.trim()},phone.eq.${formData.phone.trim()}`)
            .maybeSingle();

          if (!customerMatch) {
            alert("Security Alert: This voucher belongs to a different registered customer.");
            setIsProcessing(false);
            return;
          }
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
            navigate({ 
              to: "/success",
              search: { order_id: verifyData.orderId } 
            }); 
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
          contact: formData.phone,
        },
        notes: {
          address: `${formData.addressLine1}, ${formData.city}, ${formData.pincode}`,
        },
        theme: { color: "#4A0B49" },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            setPaymentFailedModal({
              isOpen: true,
              reason: "You closed the payment gateway before the transaction could finish.",
            });
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
              <h3 className="text-base font-serif font-semibold text-zinc-900 mb-1">
                Connecting to Secure Gateway
              </h3>
              <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                {processingMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {paymentFailedModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200">
            <div className="bg-[#FCF9F5] p-6 border-b border-[#E9D8C3]/60 flex flex-col items-center text-center relative">
              <button 
                onClick={() => setPaymentFailedModal({ isOpen: false, reason: "" })}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1"
              >
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
                
                {/* 1. AUTH / CONTACT INFO */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs">1</span>
                      Contact Information
                    </h2>
                    {!currentUser && (
                      <Link to="/login" className="text-xs font-bold text-[#4A0B49] hover:underline flex items-center gap-1">
                        <UserCircle2 className="w-4 h-4" /> Log in for faster checkout
                      </Link>
                    )}
                  </div>
                  
                  {currentUser && (
                    <div className="mb-4 p-3 bg-[#F7F1E8]/50 border border-[#E9D8C3] rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#4A0B49] rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">Checking out as {currentUser.full_name || 'Guest'}</p>
                        <p className="text-xs text-zinc-500">{formData.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-600">Email Address <span className="text-red-500">*</span></label>
                      <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-600">Phone Number <span className="text-red-500">*</span></label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" placeholder="9876543210" />
                    </div>
                  </div>
                </section>

                {/* 2. DELIVERY ADDRESS OPTIONS */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                  <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs">2</span>
                    Delivery Details
                  </h2>
                  
                  {/* Address Toggle (Only visible if they have a saved profile) */}
                  {savedProfile && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <button
                        type="button"
                        onClick={() => toggleAddressMode(true)}
                        className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                          useSavedAddress ? 'border-[#4A0B49] bg-[#4A0B49]/5 shadow-sm' : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <MapPin className={`w-5 h-5 ${useSavedAddress ? 'text-[#4A0B49]' : 'text-zinc-400'}`} />
                        <span className={`text-xs font-bold ${useSavedAddress ? 'text-[#4A0B49]' : 'text-zinc-600'}`}>Use Saved Address</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAddressMode(false)}
                        className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                          !useSavedAddress ? 'border-[#4A0B49] bg-[#4A0B49]/5 shadow-sm' : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <UserPlus className={`w-5 h-5 ${!useSavedAddress ? 'text-[#4A0B49]' : 'text-zinc-400'}`} />
                        <span className={`text-xs font-bold ${!useSavedAddress ? 'text-[#4A0B49]' : 'text-zinc-600'}`}>Send to someone else</span>
                      </button>
                    </div>
                  )}

                  {/* Saved Address Summary Card */}
                  {useSavedAddress && savedProfile ? (
                    <div className="p-5 border border-emerald-200 bg-emerald-50/30 rounded-xl relative overflow-hidden">
                      <div className="absolute top-4 right-4"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
                      <h3 className="text-sm font-bold text-zinc-900 mb-1">{formData.firstName} {formData.lastName}</h3>
                      <p className="text-xs text-zinc-600 leading-relaxed max-w-[85%]">
                        {formData.addressLine1}, {formData.addressLine2 && `${formData.addressLine2}, `} <br/>
                        {formData.city}, {formData.state} {formData.pincode}
                      </p>
                      <button type="button" onClick={() => toggleAddressMode(false)} className="mt-4 text-[10px] font-bold uppercase tracking-widest text-[#4A0B49] hover:underline">
                        Edit or enter new address
                      </button>
                    </div>
                  ) : (
                    /* Manual Address Form */
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-600">First Name <span className="text-red-500">*</span></label>
                          <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-600">Last Name <span className="text-red-500">*</span></label>
                          <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-600">Street Address <span className="text-red-500">*</span></label>
                        <input required type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" placeholder="House/Flat No., Building Name, Street" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-600">Apartment, suite, etc. (optional)</label>
                        <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-600">City <span className="text-red-500">*</span></label>
                          <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-600">State <span className="text-red-500">*</span></label>
                          <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" />
                        </div>
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                          <label className="text-xs font-bold text-zinc-600">PIN Code <span className="text-red-500">*</span></label>
                          <input required type="text" maxLength={6} name="pincode" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] outline-none transition-all text-sm" />
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* RIGHT COLUMN: ORDER SUMMARY & PAY NOW */}
              <div className="w-full lg:w-[45%] xl:w-[40%]">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 sticky top-24">
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
                      I consent to the collection and processing of my personal data for order fulfillment in accordance with the Digital Personal Data Protection (DPDP) Act, 2023, and I agree to the{" "}
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
    </>
  );
}