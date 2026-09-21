"use client";

import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, Lock, CreditCard, Loader2, AlertTriangle, 
  MessageCircle, Phone, RefreshCw, X, Ticket
} from "lucide-react";

export const Route = createFileRoute('/checkout')({
  validateSearch: (search: Record<string, unknown>) => ({
    coupon: search.coupon as string | undefined,
  }),
  component: CheckoutPage,
});

// Helper to load Razorpay SDK dynamically
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

  // Payment Failure / Intermediary State
  const [paymentFailedModal, setPaymentFailedModal] = useState<{
    isOpen: boolean;
    reason: string;
  }>({
    isOpen: false,
    reason: "",
  });

  // Dynamic DB States (Includes GST settings)
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
  // 1. DATA INITIALIZATION
  // ==========================================
  useEffect(() => {
    const fetchCheckoutConfig = async () => {
      setIsDataLoading(true);
      try {
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

        if (coupon) {
          const { data: voucher } = await supabase
            .from('vouchers')
            .select('id, code, discount_value, handling_fee, status, customer_id, valid_from, expiry_date')
            .ilike('code', coupon)
            .eq('status', 'registered')
            .maybeSingle();

          if (voucher) setVoucherDetails(voucher);
        }
      } catch (error) {
        console.error("Initialization Error", error);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchCheckoutConfig();
  }, [coupon]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ==========================================
  // 2. STRICT BILLING MATH ENGINE (For UI Estimation)
  // ==========================================
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  let rawDiscount = 0;
  let handlingFee = 0;
  let appliedDiscount = 0;
  let taxableValue = subtotal;

  if (voucherDetails) {
    rawDiscount = voucherDetails.discount_value || 0;
    handlingFee = voucherDetails.handling_fee || 0;
    
    // Exact ERP Logic: Deduct handling fee from the discount directly.
    if (subtotal >= rawDiscount) {
      appliedDiscount = rawDiscount - handlingFee;
      taxableValue = subtotal - appliedDiscount;
    } else {
      appliedDiscount = subtotal > handlingFee ? subtotal - handlingFee : 0;
      taxableValue = handlingFee;
    }
  }

  taxableValue = Math.max(0, taxableValue);

  // Calculate GST
  const totalGstAmount = taxableValue * (checkoutConfig.gst_percentage / 100);
  const cgstAmount = totalGstAmount / 2;
  const sgstAmount = totalGstAmount / 2;

  // Calculate Shipping
  let shippingCharge = 0;
  if (checkoutConfig.is_active && subtotal < checkoutConfig.free_shipping_threshold) {
    shippingCharge = checkoutConfig.flat_rate;
  }

  // Final Payable (Rounded to nearest Rupee)
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

    // Pop-up warning if required fields are missing
    if (!isFormValid) {
      const missing: string[] = [];
      if (!formData.firstName.trim()) missing.push("First Name");
      if (!formData.lastName.trim()) missing.push("Last Name");
      if (!formData.email.trim()) missing.push("Email Address");
      if (!formData.phone.trim()) missing.push("Phone Number");
      if (!formData.addressLine1.trim()) missing.push("Street Address");
      if (!formData.city.trim()) missing.push("City");
      if (!formData.state.trim()) missing.push("State");
      if (!formData.pincode.trim()) missing.push("PIN Code");
      if (!dpdpConsent) missing.push("Data Privacy Consent (Checkbox)");
      
      alert(`Please complete the following required fields before paying:\n\n- ${missing.join('\n- ')}`);
      return;
    }

    // Dismiss failure screen if retrying
    setPaymentFailedModal({ isOpen: false, reason: "" });
    setIsProcessing(true);
    setProcessingMessage("Verifying order and connecting to Razorpay...");

    try {
      // Zero-Trust Voucher Verification
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
            alert("Security Alert: This voucher belongs to a different registered customer. Please check out using the exact registered email or phone.");
            setIsProcessing(false);
            return;
          }
        }
      }

      // Load Gateway SDK
      setProcessingMessage("Launching secure payment portal...");
      const res = await loadRazorpayScript();
      if (!res) throw new Error("Payment gateway failed to load. Please check your connection.");

      // Server-side price calculation
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

      // Razorpay Options
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
              voucher_id: voucherDetails?.id || null
            }),
          });
          
          const verifyData = await verifyRes.json();
          
          if (verifyData.success) {
            clearCart();
            setIsProcessing(false);
            navigate({ 
              to: "/success",
              search: { order_id: verifyData.orderId } // Pass the real ID returned from your edge function
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

      // Handle explicit payment failures
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
      {/* 1. PROFESSIONAL FULL-SCREEN GATEWAY LOADER */}
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
            <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">
              Please do not close or refresh this tab
            </span>
          </div>
        </div>
      )}

      {/* 2. INTERMEDIARY PAYMENT FAILED / CANCELLED SCREEN */}
      {paymentFailedModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200">
            
            {/* Header Strip */}
            <div className="bg-[#FCF9F5] p-6 border-b border-[#E9D8C3]/60 flex flex-col items-center text-center relative">
              <button 
                onClick={() => setPaymentFailedModal({ isOpen: false, reason: "" })}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-3 border border-amber-200 shadow-sm">
                <AlertTriangle className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-serif font-medium text-[#4A0B49]">
                Payment Could Not Be Completed
              </h3>
              <p className="text-xs text-zinc-600 font-sans mt-2 leading-relaxed px-2">
                {paymentFailedModal.reason || "The payment attempt was interrupted or cancelled."}
              </p>
            </div>

            {/* Assurance & Action Body */}
            <div className="p-6 space-y-4 font-sans">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-left">
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    <strong>Your funds are completely safe.</strong> If any amount was deducted by your bank, it will be automatically reversed to your original payment method within 3 to 5 business days.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => handlePayment()}
                  className="w-full bg-[#4A0B49] hover:bg-[#340733] text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Retry Payment Now
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentFailedModal({ isOpen: false, reason: "" })}
                  className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-colors"
                >
                  Review Order Details
                </button>
              </div>

              {/* Concierge Support Section */}
              <div className="pt-3 border-t border-zinc-100">
                <p className="text-[11px] text-zinc-400 uppercase tracking-widest text-center mb-2.5 font-bold">
                  Need Help Completing Your Order?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://wa.me/918356834764?text=Hi!%20My%20payment%20attempt%20on%20Pavitram%20was%20interrupted.%20Can%20you%20please%20help%20me%20complete%20it?"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-emerald-300 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp
                  </a>
                  <a
                    href="tel:+918356834764"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-50 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#4A0B49]" /> Call Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CHECKOUT PAGE CONTAINER */}
      <div className={`min-h-screen bg-zinc-50 font-sans pb-24 ${(isProcessing || isDataLoading) ? 'pointer-events-none' : ''}`}>
        
        {/* HEADER */}
        <header className="bg-white border-b border-zinc-200 relative z-10">
          <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Cart
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
                
                {/* Contact Information */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                  <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs">1</span>
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-600">Email Address <span className="text-red-500">*</span></label>
                      <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all text-sm" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-600">Phone Number <span className="text-red-500">*</span></label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all text-sm" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                </section>

                {/* Delivery Address */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                  <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs">2</span>
                    Delivery Address
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-600">First Name <span className="text-red-500">*</span></label>
                        <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-600">Last Name <span className="text-red-500">*</span></label>
                        <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all text-sm" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-600">Street Address <span className="text-red-500">*</span></label>
                      <input required type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all text-sm" placeholder="House/Flat No., Building Name, Street" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-600">Apartment, suite, etc. (optional)</label>
                      <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all text-sm" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-600">City <span className="text-red-500">*</span></label>
                        <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-600">State <span className="text-red-500">*</span></label>
                        <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all text-sm" />
                      </div>
                      <div className="space-y-1.5 col-span-2 sm:col-span-1">
                        <label className="text-xs font-bold text-zinc-600">PIN Code <span className="text-red-500">*</span></label>
                        <input required type="text" maxLength={6} name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-[#4A0B49] focus:ring-1 focus:ring-[#4A0B49] outline-none transition-all text-sm" />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN: ORDER SUMMARY & PAY NOW */}
              <div className="w-full lg:w-[45%] xl:w-[40%]">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 sticky top-24">
                  <h2 className="text-lg font-bold text-zinc-900 mb-6">Order Summary</h2>
                  
                  {/* Items List */}
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

                  {/* Totals */}
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
                        <div className="text-right mt-1.5">
                          <Link to="/policy/$slug" params={{ slug: "gift-voucher" }} className="text-[9px] text-zinc-400 hover:text-[#C9A15B] transition-colors underline">
                            For detailed breakup view the Gift Voucher Policy
                          </Link>
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

                {/* DPDP Act & Legal Compliance Consent */}
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
                      <Link 
                        to="/policy/$slug" 
                        params={{ slug: "terms" }} 
                        target="_blank" 
                        className="text-[#4A0B49] font-semibold hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms of Service
                      </Link>
                      ,{" "}
                      <Link 
                        to="/policy/$slug" 
                        params={{ slug: "privacy" }} 
                        target="_blank" 
                        className="text-[#4A0B49] font-semibold hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </Link>
                      , and{" "}
                      <Link 
                        to="/policy/$slug" 
                        params={{ slug: "shipping" }} 
                        target="_blank" 
                        className="text-[#4A0B49] font-semibold hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Shipping Policy
                      </Link>.
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