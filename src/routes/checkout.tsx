import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { Logo } from "@/components/site/Logo";
import { 
  ArrowLeft, Lock, CreditCard, Truck, Store, ShieldCheck
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
          color: "#4A1F58",
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
      <div className="min-h-screen bg-[#F7F1E8] flex flex-col items-center justify-center font-sans">
        <h2 className="text-3xl font-serif font-medium text-[#4A1F58] mb-4">Your cart is empty</h2>
        <Link to="/Shop" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A15B] hover:text-[#4A1F58] transition-colors border-b border-transparent hover:border-[#4A1F58] pb-1">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* PROFESSIONAL FULL-SCREEN LOADER */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md">
          <div className="flex flex-col items-center gap-6">
            <div className="w-12 h-12 border-2 border-[#E9D8C3] border-t-[#C9A15B] rounded-full animate-spin" />
            <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#4A1F58]">Securely initializing payment...</p>
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-[#F7F1E8]/30 font-sans pb-24 relative overflow-hidden ${isProcessing ? 'pointer-events-none' : ''}`}>
        
        {/* Subtle Background Watermark */}
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply z-0"
        />

        {/* DISTRACTION-FREE HEADER */}
        <header className="bg-white/90 backdrop-blur-md border-b border-[#E9D8C3] relative z-10">
          <div className="max-w-[1200px] mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
            <button onClick={() => history.back()} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-[#4A1F58] transition-colors">
              <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Back to Cart</span>
            </button>
            <div className="shrink-0 absolute left-1/2 -translate-x-1/2">
              <Logo className="h-6 md:h-8 w-auto" />
            </div>
            <div className="flex items-center gap-2 text-[#C9A15B]">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-[0.2em]">Secure Checkout</span>
            </div>
          </div>
        </header>

        <main className="max-w-[1200px] mx-auto px-4 pt-8 md:pt-12 relative z-10">
          <form onSubmit={handlePayment} className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: CHECKOUT FORM */}
            <div className="w-full lg:w-[55%] xl:w-[60%] space-y-8">
              
              {/* Delivery Method Selection (Shows Pickup as disabled) */}
              <section>
                <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-4">Delivery Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border-2 border-[#4A1F58] bg-white rounded-sm p-4 flex items-start gap-3 cursor-pointer">
                    <Truck className="w-5 h-5 text-[#4A1F58] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#302832]">Home Delivery</h3>
                      <p className="text-[11px] text-zinc-500 mt-1">Free fully insured delivery</p>
                    </div>
                  </div>
                  <div className="border border-[#E9D8C3] bg-[#F7F1E8]/50 rounded-sm p-4 flex items-start gap-3 opacity-60 cursor-not-allowed relative overflow-hidden" title="Currently unavailable">
                    <Store className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Boutique Pickup</h3>
                      <p className="text-[11px] text-zinc-400 mt-1">Temporarily Unavailable</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-[#E9D8C3]">
                <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-6 border-b border-[#E9D8C3] pb-4">
                  1. Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">Email Address <span className="text-red-500">*</span></label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full h-12 bg-zinc-50 px-4 rounded-sm border border-[#E9D8C3] focus:bg-white focus:border-[#C9A15B] outline-none transition-colors text-sm font-sans placeholder:text-zinc-400" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">Phone Number <span className="text-red-500">*</span></label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full h-12 bg-zinc-50 px-4 rounded-sm border border-[#E9D8C3] focus:bg-white focus:border-[#C9A15B] outline-none transition-colors text-sm font-sans placeholder:text-zinc-400" placeholder="+91 98765 43210" />
                  </div>
                </div>
              </section>

              {/* Delivery Address */}
              <section className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-[#E9D8C3]">
                <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-6 border-b border-[#E9D8C3] pb-4">
                  2. Shipping Address
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">First Name <span className="text-red-500">*</span></label>
                      <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full h-12 bg-zinc-50 px-4 rounded-sm border border-[#E9D8C3] focus:bg-white focus:border-[#C9A15B] outline-none transition-colors text-sm font-sans placeholder:text-zinc-400" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">Last Name <span className="text-red-500">*</span></label>
                      <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full h-12 bg-zinc-50 px-4 rounded-sm border border-[#E9D8C3] focus:bg-white focus:border-[#C9A15B] outline-none transition-colors text-sm font-sans placeholder:text-zinc-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">Street Address <span className="text-red-500">*</span></label>
                    <input required type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className="w-full h-12 bg-zinc-50 px-4 rounded-sm border border-[#E9D8C3] focus:bg-white focus:border-[#C9A15B] outline-none transition-colors text-sm font-sans placeholder:text-zinc-400" placeholder="House/Flat No., Building Name, Street" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">Apartment, suite, etc. <span className="text-zinc-400 ml-1 font-normal normal-case tracking-normal">(Optional)</span></label>
                    <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} className="w-full h-12 bg-zinc-50 px-4 rounded-sm border border-[#E9D8C3] focus:bg-white focus:border-[#C9A15B] outline-none transition-colors text-sm font-sans placeholder:text-zinc-400" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">City <span className="text-red-500">*</span></label>
                      <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full h-12 bg-zinc-50 px-4 rounded-sm border border-[#E9D8C3] focus:bg-white focus:border-[#C9A15B] outline-none transition-colors text-sm font-sans placeholder:text-zinc-400" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">State <span className="text-red-500">*</span></label>
                      <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full h-12 bg-zinc-50 px-4 rounded-sm border border-[#E9D8C3] focus:bg-white focus:border-[#C9A15B] outline-none transition-colors text-sm font-sans placeholder:text-zinc-400" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">PIN Code <span className="text-red-500">*</span></label>
                      <input required type="text" maxLength={6} name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full h-12 bg-zinc-50 px-4 rounded-sm border border-[#E9D8C3] focus:bg-white focus:border-[#C9A15B] outline-none transition-colors text-sm font-sans placeholder:text-zinc-400" />
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY */}
            <div className="w-full lg:w-[45%] xl:w-[40%]">
              <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-[#E9D8C3] sticky top-28">
                <h2 className="text-xl font-serif font-medium text-[#4A1F58] mb-6 border-b border-[#E9D8C3] pb-4">Order Summary</h2>
                
                {/* Items List */}
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto hide-scrollbar pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 items-start">
                      <div className="relative w-16 h-20 bg-[#F7F1E8]/50 border border-[#E9D8C3] rounded-sm shrink-0 p-1">
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                        <span className="absolute -top-2 -right-2 bg-[#302832] text-white text-[10px] font-sans font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className="text-xs font-serif font-medium text-[#302832] line-clamp-2 leading-snug">{item.title}</h4>
                        <p className="text-[9px] text-zinc-400 mt-1 uppercase tracking-widest font-sans font-bold">SKU: {item.sku}</p>
                      </div>
                      <div className="pt-1 text-sm font-sans font-bold text-[#4A1F58] shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-4 text-sm border-t border-[#E9D8C3] pt-6 mb-6">
                  <div className="flex justify-between font-sans">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-medium text-[#302832]">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-sans">
                    <span className="text-zinc-500">Shipping</span>
                    <span className="font-medium text-[#C9A15B] uppercase tracking-widest text-[10px]">Free Insured Delivery</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-8 pt-4 border-t border-[#E9D8C3]">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Total to Pay</span>
                  <span className="text-2xl font-serif font-medium text-[#4A1F58]">₹{total.toLocaleString('en-IN')}</span>
                </div>

                {/* DPDP Act Compliance Consent */}
                <div className="mb-6 flex items-start gap-3 bg-[#F7F1E8]/50 p-4 border border-[#E9D8C3] rounded-sm">
                    <input 
                        type="checkbox" 
                        id="dpdp-consent"
                        checked={dpdpConsent}
                        onChange={(e) => setDpdpConsent(e.target.checked)}
                        className="mt-0.5 shrink-0 accent-[#4A1F58] cursor-pointer"
                    />
                    <label htmlFor="dpdp-consent" className="text-[10px] font-sans text-zinc-600 leading-relaxed cursor-pointer select-none">
                        I consent to the collection and processing of my personal data for order fulfillment, in accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the Privacy Policy.
                    </label>
                </div>

                {/* Payment Button */}
                <button 
                  type="submit"
                  className="w-full bg-[#4A1F58] hover:bg-[#302832] text-white font-sans font-bold text-[11px] tracking-[0.2em] uppercase h-14 rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" /> Pay ₹{total.toLocaleString('en-IN')} securely
                </button>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-[9px] font-sans text-zinc-400 font-bold uppercase tracking-[0.2em]">
                  <ShieldCheck className="w-3 h-3 text-[#C9A15B]" /> Encrypted Payment Gateway
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}