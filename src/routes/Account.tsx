import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  User, MapPin, Package, Heart, LogOut, 
  Loader2, Calendar, Mail, Phone, ShieldCheck 
} from "lucide-react";

export const Route = createFileRoute('/Account')({
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Check auth status (Replace this with your actual auth hook or state check)
  const isAuthenticated = true; // Set to false if user is not logged in

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to your existing login page route
      navigate({ to: "/login" }); // Change "/login" to your exact login route if it differs
    }
  }, [isAuthenticated, navigate]);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    anniversary: "",
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    pincode: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");

    // Simulate database update
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage("Profile updated successfully.");
      setTimeout(() => setSaveMessage(""), 4000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#302832] pb-24">
      
      {/* --- PAGE HEADER --- */}
      <div className="bg-[#F7F1E8] border-b border-[#E9D8C3] relative overflow-hidden">
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply"
        />
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 py-10 md:py-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58] mb-2">
              My Account
            </h1>
            <p className="text-[10px] md:text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-zinc-500">
              Manage your profile and preferences
            </p>
          </div>
          {/* Security Badge */}
          <div className="flex items-center gap-2 text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-zinc-400 bg-white/50 px-4 py-2 rounded-sm border border-[#E9D8C3] w-max">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A15B]" /> Data Encrypted
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* --- SIDEBAR NAVIGATION --- */}
          <aside className="w-full md:w-[240px] shrink-0">
            {/* Mobile Horizontal Scroll Nav */}
            <div className="md:hidden flex overflow-x-auto hide-scrollbar gap-2 border-b border-[#E9D8C3] pb-4 mb-6">
              {[
                { name: 'Profile', icon: User, active: true },
                { name: 'Orders', icon: Package, active: false },
                { name: 'Wishlist', icon: Heart, active: false },
                { name: 'Addresses', icon: MapPin, active: false },
              ].map((item, idx) => (
                <button key={idx} className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-[10px] font-sans font-bold uppercase tracking-widest shrink-0 transition-colors ${item.active ? 'bg-[#4A1F58] text-white border border-[#4A1F58]' : 'bg-[#F7F1E8]/50 text-zinc-500 border border-[#E9D8C3]'}`}>
                  <item.icon className="w-3.5 h-3.5" /> {item.name}
                </button>
              ))}
            </div>

            {/* Desktop Vertical Nav */}
            <nav className="hidden md:flex flex-col gap-2 sticky top-24">
              <Link to="/Account" className="flex items-center gap-3 px-5 py-3.5 bg-[#4A1F58] text-white rounded-sm text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all shadow-sm">
                <User className="w-4 h-4" /> Profile Details
              </Link>
              <Link to="/ComingSoon" className="flex items-center gap-3 px-5 py-3.5 text-zinc-500 hover:bg-[#F7F1E8]/50 hover:text-[#4A1F58] rounded-sm border border-transparent hover:border-[#E9D8C3] text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all">
                <Package className="w-4 h-4" /> Order History
              </Link>
              <Link to="/wishlist" className="flex items-center gap-3 px-5 py-3.5 text-zinc-500 hover:bg-[#F7F1E8]/50 hover:text-[#4A1F58] rounded-sm border border-transparent hover:border-[#E9D8C3] text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all">
                <Heart className="w-4 h-4" /> Saved Wishlist
              </Link>
              <Link to="/ComingSoon" className="flex items-center gap-3 px-5 py-3.5 text-zinc-500 hover:bg-[#F7F1E8]/50 hover:text-[#4A1F58] rounded-sm border border-transparent hover:border-[#E9D8C3] text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all">
                <MapPin className="w-4 h-4" /> Saved Addresses
              </Link>
              <div className="h-px bg-[#E9D8C3] my-2" />
              <button onClick={() => navigate({ to: "/login" })} className="flex items-center gap-3 px-5 py-3.5 text-red-500 hover:bg-red-50 rounded-sm border border-transparent hover:border-red-100 text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all w-full text-left">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </nav>
          </aside>

          {/* --- MAIN CONTENT (PROFILE FORM) --- */}
          <div className="flex-1">
            
            {saveMessage && (
              <div className="mb-6 bg-[#F7F1E8] border border-[#C9A15B] text-[#4A1F58] px-4 py-3 rounded-sm text-xs font-sans font-bold uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> {saveMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-10">
              
              {/* SECTION 1: Personal Information */}
              <div className="bg-white border border-[#E9D8C3] rounded-sm overflow-hidden shadow-sm">
                <div className="bg-[#F7F1E8]/50 px-6 py-4 border-b border-[#E9D8C3] flex items-center gap-2.5">
                  <User className="w-4 h-4 text-[#C9A15B]" />
                  <h2 className="text-sm font-serif font-medium text-[#4A1F58] uppercase tracking-[0.15em]">Personal Information</h2>
                </div>
                
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* First Name */}
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">First Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g. Priya"
                      className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm placeholder:text-zinc-400 text-[#302832]"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">Last Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="e.g. Sharma"
                      className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm placeholder:text-zinc-400 text-[#302832]"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-zinc-400" /> Email Address <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm placeholder:text-zinc-400 text-[#302832]"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-zinc-400" /> Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <span className="h-12 flex items-center justify-center px-4 bg-zinc-50 border border-[#E9D8C3] border-r-0 rounded-l-sm text-sm font-sans text-zinc-500 shrink-0">
                        +91
                      </span>
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                        placeholder="Enter 10-digit number"
                        className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-r-sm placeholder:text-zinc-400 text-[#302832]"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-zinc-400" /> Date of Birth
                    </label>
                    <input 
                      type="date" 
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm text-[#302832]"
                    />
                  </div>

                  {/* Anniversary */}
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2 flex items-center gap-1.5">
                      <Heart className="w-3 h-3 text-zinc-400" /> Anniversary Date <span className="text-zinc-400 ml-1 font-normal normal-case tracking-normal">(Optional)</span>
                    </label>
                    <input 
                      type="date" 
                      name="anniversary"
                      value={formData.anniversary}
                      onChange={handleChange}
                      className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm text-[#302832]"
                    />
                  </div>

                </div>
              </div>

              {/* SECTION 2: Shipping Address */}
              <div className="bg-white border border-[#E9D8C3] rounded-sm overflow-hidden shadow-sm">
                <div className="bg-[#F7F1E8]/50 px-6 py-4 border-b border-[#E9D8C3] flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#C9A15B]" />
                  <h2 className="text-sm font-serif font-medium text-[#4A1F58] uppercase tracking-[0.15em]">Shipping Address</h2>
                </div>
                
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Street Address - Full Width */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">Street Address <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="streetAddress"
                      required
                      value={formData.streetAddress}
                      onChange={handleChange}
                      placeholder="House/Flat No., Building Name, Street Name"
                      className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm placeholder:text-zinc-400 text-[#302832]"
                    />
                  </div>

                  {/* Apartment - Full Width */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">
                      Apartment, suite, etc. <span className="text-zinc-400 ml-1 font-normal normal-case tracking-normal">(Optional)</span>
                    </label>
                    <input 
                      type="text" 
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleChange}
                      placeholder="e.g. Suite 200, Block A"
                      className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm placeholder:text-zinc-400 text-[#302832]"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">City <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Mumbai"
                      className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm placeholder:text-zinc-400 text-[#302832]"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">State <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Maharashtra"
                      className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm placeholder:text-zinc-400 text-[#302832]"
                    />
                  </div>

                  {/* Pincode */}
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">PIN Code <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="pincode"
                      required
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})}
                      placeholder="e.g. 400089"
                      className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm placeholder:text-zinc-400 text-[#302832]"
                    />
                  </div>

                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full md:w-auto min-w-[200px] h-12 bg-[#4A1F58] hover:bg-[#302832] text-white text-[11px] font-sans font-bold uppercase tracking-[0.2em] rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile Details"}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}