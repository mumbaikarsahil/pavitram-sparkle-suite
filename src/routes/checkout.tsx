import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { Logo } from "@/components/site/Logo";
import { 
  ArrowLeft, Lock, CreditCard 
} from "lucide-react";

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
});

// Helper to load the Razorpay script dynamically
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
  const { cartItems, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [dpdpConsent, setDpdpConsent] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "400089",
  });

  // Calculate Totals
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = 0; 
  const shipping = 0; 
  const total = subtotal - discount + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!dpdpConsent) {
        alert("Please agree to the data processing terms before continuing.");
        return;
    }

    setIsProcessing(true);

    // 1. Load Razorpay Script
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsProcessing(false);
      return;
    }

    try {
      // 2. Generate Order ID from your backend securely
      const orderResponse = await fetch('https://mfdjlbvqfbujipihehpt.supabase.co/functions/v1/razorpay-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }) 
      });
      const orderData = await orderResponse.json();

      if (!orderData.id) throw new Error("Failed to create order on backend");

      // 3. Setup Razorpay Options
      const options = {
        key: "rzp_test_TWOt1jOLaW5e92", 
        amount: orderData.amount, 
        currency: orderData.currency,
        name: "Pavitram Diamond Jewellery",
        description: "Jewellery Purchase",
        order_id: orderData.id, 
        handler: async function (response: any) {
          
          // 4. Verify Payment Signature and Create Order on Backend
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
              total: total
            }),
          });
          
          const verifyData = await verifyRes.json();
          
          if (verifyData.success) {
            clearCart();
            setIsProcessing(false);
            navigate({ to: "/success" }); 
          } else {
            alert("Payment verification failed.");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: `${formData.addressLine1}, ${formData.city}, ${formData.pincode}`,
        },
        theme: {
          color: "#4A0B49",
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      // 5. Open the Razorpay Modal
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Could not start payment. Please try again.");
      setIsProcessing(false);
    }
  };

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-zinc-900 mb-4">Your cart is empty</h2>
        <Link to="/" className="text-[#4A0B49] font-bold hover:underline">Return to Shop</Link>
      </div>
    );
  }

  return (
    <>
      {/* PROFESSIONAL FULL-SCREEN LOADER */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-zinc-200 border-t-[#4A0B49] rounded-full animate-spin" />
            <p className="text-sm font-semibold text-zinc-600 tracking-wide">Securely initializing payment...</p>
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-zinc-50 font-sans pb-24 ${isProcessing ? 'pointer-events-none' : ''}`}>
        
        {/* DISTRACTION-FREE HEADER */}
        <header className="bg-white border-b border-zinc-200 relative z-10">
          <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
            <button onClick={() => history.back()} className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Cart
            </button>
            <div className="shrink-0 absolute left-1/2 -translate-x-1/2">
              <Logo className="h-10 w-auto" />
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Secure Checkout</span>
            </div>
          </div>
        </header>

        <main className="max-w-[1200px] mx-auto px-4 pt-8 relative z-0">
          <form onSubmit={handlePayment} className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: CHECKOUT FORM */}
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

            {/* RIGHT COLUMN: ORDER SUMMARY */}
            <div className="w-full lg:w-[45%] xl:w-[40%]">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 sticky top-24">
                <h2 className="text-lg font-bold text-zinc-900 mb-6">Order Summary</h2>
                
                {/* Items List */}
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
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
                  <div className="flex justify-between text-zinc-600">
                    <span>Shipping</span>
                    <span className="font-medium text-emerald-600">Free Insured Delivery</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                  <span className="text-base font-bold text-zinc-900">Total to Pay</span>
                  <span className="text-2xl font-black text-zinc-900 tracking-tight">₹{total.toLocaleString('en-IN')}</span>
                </div>

                {/* DPDP Act Compliance Consent */}
                <div className="mb-6 flex items-start gap-3">
                    <input 
                        type="checkbox" 
                        id="dpdp-consent"
                        checked={dpdpConsent}
                        onChange={(e) => setDpdpConsent(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-zinc-300 text-[#4A0B49] focus:ring-[#4A0B49]"
                    />
                    <label htmlFor="dpdp-consent" className="text-xs text-zinc-600 leading-tight">
                        I consent to the collection and processing of my personal data for order fulfillment and communication, in accordance with the Digital Personal Data Protection (DPDP) Act, 2023 and the Privacy Policy.
                    </label>
                </div>

                {/* Payment Button */}
                <button 
                  type="submit"
                  className="w-full bg-[#4A0B49] hover:bg-[#340733] text-white font-bold text-sm tracking-widest uppercase py-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" /> Pay ₹{total.toLocaleString('en-IN')} securely
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}