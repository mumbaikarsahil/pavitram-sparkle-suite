import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { 
  User, MapPin, Package, Heart, LogOut, 
  Loader2, Calendar, Mail, Phone, ShieldCheck, 
  AlertTriangle, Trash2, FileText, 
  CheckCircle2, Truck, Clock, Plus, Edit2, Sparkles
} from "lucide-react";
import { getAccountProfileFn, updateAccountProfileFn, deleteAccountFn } from "@/lib/api/account.functions";

export const Route = createFileRoute('/Account')({
  component: UnifiedAccountPage,
});

type TabType = 'profile' | 'orders' | 'wishlist' | 'addresses';

function UnifiedAccountPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // --- PROFILE STATE ---
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
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

  // --- LIVE DATA STATES ---
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    const initializeAccount = async () => {
      const storedUser = localStorage.getItem("pavitram_user");
      
      if (!storedUser) {
        navigate({ to: "/login" });
        return;
      } 
      
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        
        const nameParts = (user.full_name || "").split(" ");
        let displayPhone = user.phone || "";
        if (displayPhone.startsWith("91") && displayPhone.length === 12) {
          displayPhone = displayPhone.substring(2);
        }

        setFormData(prev => ({
          ...prev,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          phone: displayPhone,
        }));

        setIsLoadingAuth(false);

        // Fetch Real Data
        const res = (await getAccountProfileFn({ 
          data: { customerId: user.id } 
        })) as any;
        
        setOrders(res.orders || []);
        setAddresses(res.profile ? [res.profile] : []); 

        if (res.profile) {
          setFormData(prev => ({
            ...prev,
            streetAddress: res.profile.street_address || "",
            apartment: res.profile.apartment || "",
            city: res.profile.city || "",
            state: res.profile.state || "",
            pincode: res.profile.pincode || ""
          }));
        }

        if (res.customer) {
          setFormData(prev => ({
            ...prev,
            email: res.customer.email || "",
            dob: res.customer.birth_date || "",
            anniversary: res.customer.anniversary_date || ""
          }));
        }

      } catch (e) {
        console.error("Account initialization failed:", e);
        localStorage.removeItem("pavitram_user");
        navigate({ to: "/login" });
      } finally {
        setIsFetchingData(false);
      }
    };

    initializeAccount();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("pavitram_user");
    navigate({ to: "/login" });
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    
    try {
      const res = (await updateAccountProfileFn({
        data: {
          customerId: currentUser.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          dob: formData.dob,
          anniversary: formData.anniversary,
          streetAddress: formData.streetAddress,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
      })) as any;
      
      if (res.profile) setAddresses([res.profile]);

      // Update LocalStorage so the onboarding screen goes away permanently
      const updatedUser = { 
        ...currentUser, 
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email 
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("pavitram_user", JSON.stringify(updatedUser));
      
      setSaveMessage("Profile updated successfully.");
      setTimeout(() => setSaveMessage(""), 4000);
      
    } catch (err) {
      console.error(err);
      alert("Failed to save profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "DPDP ACT COMPLIANCE: Are you sure you want to permanently delete your account? This will erase your profile, order history, and saved data from our servers. This action cannot be undone."
    );
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      await deleteAccountFn({ data: { customerId: currentUser.id } });
      localStorage.removeItem("pavitram_user");
      navigate({ to: "/" });
    } catch (error) {
      alert("Failed to delete account. Please contact support.");
      setIsDeleting(false);
    }
  };

  const getOrderStatusStep = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'delivered') return 4;
    if (s === 'shipped') return 3;
    if (s === 'ready_to_ship') return 2;
    return 1; 
  };

  const formatStatus = (status: string) => {
    if (!status) return "Processing";
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F7F1E8]"><Loader2 className="w-8 h-8 animate-spin text-[#C9A15B]" /></div>;
  }

  // ✨ NEW USER CHECK: If they don't have a name saved yet, force onboarding view
  const isProfileIncomplete = !currentUser?.full_name || currentUser.full_name.trim() === "";

  if (isProfileIncomplete) {
    return (
      <div className="min-h-screen bg-[#F7F1E8] flex items-center justify-center p-4 relative overflow-hidden">
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/bg_pattern2.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply"
        />
        <div className="bg-white max-w-[500px] w-full rounded-sm border border-[#E9D8C3] shadow-lg relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
          <div className="bg-[#4A1F58] p-8 text-center text-white relative">
            <Sparkles className="w-8 h-8 text-[#C9A15B] mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-medium mb-2">Welcome to Pavitram</h1>
            <p className="text-xs font-sans text-white/80">Please complete your profile to unlock your dashboard and begin your journey with us.</p>
          </div>
          <form onSubmit={handleProfileSave} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">First Name <span className="text-rose-500">*</span></label>
                <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required placeholder="e.g. Priya" className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm text-[#302832]" />
              </div>
              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">Last Name <span className="text-rose-500">*</span></label>
                <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required placeholder="e.g. Sharma" className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm text-[#302832]" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2 flex items-center gap-1.5">Email Address <span className="text-rose-500">*</span></label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required placeholder="you@example.com" className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm text-[#302832]" />
            </div>
            <button type="submit" disabled={isSaving || !formData.firstName || !formData.lastName || !formData.email} className="w-full h-12 mt-4 bg-[#4A1F58] hover:bg-[#302832] text-white text-[11px] font-sans font-bold uppercase tracking-[0.2em] rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Setup"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- SUB-RENDERERS FOR TABS (Main Dashboard) ---

  const renderProfile = () => (
    <div className="animate-in fade-in duration-300">
      {saveMessage && (
        <div className="mb-6 bg-[#F7F1E8] border border-[#C9A15B] text-[#4A1F58] px-4 py-3 rounded-sm text-xs font-sans font-bold uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" /> {saveMessage}
        </div>
      )}
      <form onSubmit={handleProfileSave} className="space-y-8">
        <div className="bg-white border border-[#E9D8C3] rounded-sm shadow-sm">
          <div className="bg-[#F7F1E8]/50 px-4 md:px-6 py-4 border-b border-[#E9D8C3] flex items-center gap-2.5">
            <User className="w-4 h-4 text-[#C9A15B]" />
            <h2 className="text-sm font-serif font-medium text-[#4A1F58] uppercase tracking-[0.15em]">Personal Info</h2>
          </div>
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">First Name <span className="text-rose-500">*</span></label>
              <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm text-[#302832]" />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">Last Name <span className="text-rose-500">*</span></label>
              <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm text-[#302832]" />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2 flex items-center gap-1.5"><Mail className="w-3 h-3 text-zinc-400" /> Email <span className="text-rose-500">*</span></label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm text-[#302832]" />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2 flex items-center gap-1.5"><Phone className="w-3 h-3 text-zinc-400" /> Mobile</label>
              <div className="flex">
                <span className="h-12 flex items-center justify-center px-3 bg-zinc-50 border border-[#E9D8C3] border-r-0 rounded-l-sm text-sm font-sans text-zinc-500 shrink-0">+91</span>
                <input type="tel" value={formData.phone} disabled className="w-full h-12 bg-zinc-50 border border-[#E9D8C3] px-3 font-sans text-sm outline-none rounded-r-sm text-zinc-500 cursor-not-allowed min-w-0" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-zinc-400" /> Date of Birth
              </label>
              <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm text-[#302832]" />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2 flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-zinc-400" /> Anniversary Date <span className="text-zinc-400 ml-1 font-normal normal-case tracking-normal">(Optional)</span>
              </label>
              <input type="date" value={formData.anniversary} onChange={(e) => setFormData({...formData, anniversary: e.target.value})} className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm text-[#302832]" />
            </div>
          </div>
        </div>

        {/* Shipping Address Section */}
        <div className="bg-white border border-[#E9D8C3] rounded-sm shadow-sm mt-8">
          <div className="bg-[#F7F1E8]/50 px-4 md:px-6 py-4 border-b border-[#E9D8C3] flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-[#C9A15B]" />
            <h2 className="text-sm font-serif font-medium text-[#4A1F58] uppercase tracking-[0.15em]">Primary Address</h2>
          </div>
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">Street Address</label>
              <input type="text" value={formData.streetAddress} onChange={(e) => setFormData({...formData, streetAddress: e.target.value})} className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm text-[#302832]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">Apartment, suite, etc.</label>
              <input type="text" value={formData.apartment} onChange={(e) => setFormData({...formData, apartment: e.target.value})} className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm text-[#302832]" />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">City</label>
              <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm text-[#302832]" />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">State</label>
              <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm text-[#302832]" />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#302832] mb-2">PIN Code</label>
              <input type="text" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})} maxLength={6} className="w-full h-12 bg-white border border-[#E9D8C3] px-4 font-sans text-sm outline-none focus:border-[#C9A15B] transition-colors rounded-sm text-[#302832]" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={isSaving} className="w-full md:w-auto min-w-[200px] h-12 bg-[#4A1F58] hover:bg-[#302832] text-white text-[11px] font-sans font-bold uppercase tracking-[0.2em] rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
          </button>
        </div>
      </form>

      {/* DPDP Zone */}
      <div className="mt-12 pt-8 border-t border-rose-100">
        <div className="bg-rose-50/50 border border-rose-200 rounded-sm p-5 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-serif font-medium text-rose-700">Danger Zone</h3>
          </div>
          <p className="text-xs font-sans text-rose-600/80 mb-5 leading-relaxed">
            In compliance with the DPDP Act 2023, you have the "Right to be Forgotten". Deleting your account will permanently erase your personal data.
          </p>
          <button onClick={handleDeleteAccount} disabled={isDeleting} className="w-full md:w-auto px-6 py-3 bg-white border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white text-[10px] font-sans font-bold uppercase tracking-widest rounded-sm transition-colors shadow-sm flex items-center justify-center gap-2">
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isDeleting ? "Erasing..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => {
    if (isFetchingData) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#C9A15B]" /></div>;

    return (
      <div className="animate-in fade-in duration-300 space-y-6">
        {orders.length === 0 ? (
          <div className="bg-white border border-[#E9D8C3] rounded-sm p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#F7F1E8] rounded-full flex items-center justify-center mb-4"><Package className="w-6 h-6 text-[#C9A15B]" /></div>
            <h3 className="text-lg font-serif font-medium text-[#4A1F58] mb-1">No orders yet</h3>
            <p className="text-xs font-sans text-zinc-500 mb-6">Looks like you haven't made your first purchase.</p>
            <Link to="/Shop" className="bg-[#4A1F58] text-white px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">Start Shopping</Link>
          </div>
        ) : (
          orders.map((order) => {
            const step = getOrderStatusStep(order.status);
            const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
            const deliveryDate = order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : "Pending";
            
            return (
              <div key={order.id} className="bg-white border border-[#E9D8C3] rounded-sm shadow-sm hover:shadow-md transition-shadow">
                
                <div className="bg-[#F7F1E8]/60 border-b border-[#E9D8C3] px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div>
                      <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Placed</p>
                      <p className="text-xs font-sans text-[#302832]">{orderDate}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Total</p>
                      <p className="text-xs font-sans font-medium text-[#4A1F58]">₹ {Number(order.final_total).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="md:text-right flex md:flex-col items-center md:items-end justify-between">
                    <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Order # {order.order_number}</p>
                    <button className="text-[10px] font-sans font-medium text-[#4A1F58] hover:text-[#C9A15B] transition-colors flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Invoice
                    </button>
                  </div>
                </div>

                <div className="p-4 md:p-6">
                  <div className="mb-6">
                    <h3 className={`text-lg font-serif font-medium mb-1 flex items-center gap-2 ${order.status === 'delivered' ? 'text-emerald-700' : 'text-[#4A1F58]'}`}>
                      {order.status === 'delivered' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <Truck className="w-5 h-5 shrink-0 text-[#C9A15B]" />}
                      <span className="truncate">{order.status === 'delivered' ? `Delivered ${deliveryDate}` : `Arriving ${deliveryDate}`}</span>
                    </h3>
                    {order.status !== 'delivered' && (
                      <p className="text-[11px] font-sans text-zinc-500 flex items-center gap-1.5 mt-1"><Clock className="w-3 h-3 shrink-0" /> Status: {formatStatus(order.status)}</p>
                    )}
                  </div>

                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="relative mb-10 mt-8 hidden sm:block">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-[#E9D8C3] -translate-y-1/2 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C9A15B] transition-all duration-1000" style={{ width: `${(step / 4) * 100}%` }} />
                      </div>
                      <div className="relative flex justify-between px-1">
                        {['Processing', 'Ready', 'Shipped', 'Delivered'].map((label, i) => (
                          <div key={label} className="flex flex-col items-center">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 bg-white z-10 transition-colors ${step >= i + 1 ? 'border-[#C9A15B] bg-[#C9A15B]' : 'border-[#E9D8C3]'}`} />
                            <span className={`text-[9px] font-sans font-bold uppercase tracking-widest absolute top-5 w-20 text-center -ml-10 ${step >= i + 1 ? 'text-[#4A1F58]' : 'text-zinc-400'}`}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 sm:mt-8">
                    {order.ecommerce_order_items?.map((item: any) => (
                       <div key={item.id} className="flex gap-4">
                         <div className="w-16 h-16 shrink-0 bg-[#F7F1E8] rounded-sm overflow-hidden border border-[#E9D8C3] flex items-center justify-center">
                           <Package className="w-6 h-6 text-[#C9A15B]/50" />
                         </div>
                         <div className="flex-1 flex flex-col justify-center min-w-0">
                           <h4 className="text-sm font-serif font-medium text-[#302832] truncate">Pavitram Collection Item</h4>
                           <p className="text-xs font-sans text-zinc-500 mt-0.5">Qty: {item.quantity} | ₹ {Number(item.total_price).toLocaleString('en-IN')}</p>
                           <Link to="/Shop" className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#4A1F58] hover:text-[#C9A15B] transition-colors mt-2 inline-block">Buy it again</Link>
                         </div>
                       </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const renderAddresses = () => {
    if (isFetchingData) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#C9A15B]" /></div>;

    const hasAddress = addresses.length > 0 && (addresses[0].street_address || addresses[0].city);

    return (
      <div className="animate-in fade-in duration-300 space-y-6">
        {!hasAddress ? (
          <div className="bg-white border border-[#E9D8C3] rounded-sm p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#F7F1E8] rounded-full flex items-center justify-center mb-4"><MapPin className="w-6 h-6 text-[#C9A15B]" /></div>
            <h3 className="text-lg font-serif font-medium text-[#4A1F58] mb-1">No Saved Addresses</h3>
            <p className="text-xs font-sans text-zinc-500 mb-6">Add an address for faster checkout on your next purchase.</p>
            <button onClick={() => setActiveTab('profile')} className="bg-[#4A1F58] text-white px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {addresses.map((addr) => {
              const streetLine = [addr.street_address, addr.apartment].filter(Boolean).join(", ");
              const cityStateLine = [addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");

              return (
                <div key={addr.id} className="bg-white border border-[#E9D8C3] rounded-sm p-5 relative">
                  <span className="absolute top-5 right-5 bg-[#F7F1E8] text-[#C9A15B] text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border border-[#E9D8C3]">Default</span>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-[#C9A15B]" />
                    <h3 className="text-sm font-serif font-medium text-[#4A1F58] uppercase tracking-[0.1em]">Primary Address</h3>
                  </div>
                  <div className="space-y-1 text-xs md:text-sm font-sans text-zinc-600 mb-6 leading-relaxed">
                    <p className="font-medium text-[#302832] pb-1">{addr.first_name} {addr.last_name}</p>
                    {streetLine && <p>{streetLine}</p>}
                    {cityStateLine && <p>{cityStateLine}</p>}
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-[#E9D8C3]/50">
                    <button onClick={() => setActiveTab('profile')} className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-[#4A1F58] hover:text-[#C9A15B] transition-colors"><Edit2 className="w-3.5 h-3.5" /> Edit Details</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderWishlist = () => (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div className="bg-white border border-[#E9D8C3] rounded-sm p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[#F7F1E8] rounded-full flex items-center justify-center mb-4"><Heart className="w-6 h-6 text-[#C9A15B]" /></div>
        <h3 className="text-lg font-serif font-medium text-[#4A1F58] mb-1">Wishlist is Empty</h3>
        <p className="text-xs font-sans text-zinc-500 mb-6 max-w-sm">Explore our collections and save your favorite pieces here.</p>
        <Link to="/Shop" className="bg-[#4A1F58] text-white px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">Discover</Link>
      </div>
    </div>
  );

  const TABS = [
    { id: 'profile', short: 'Profile', name: 'Profile Details', icon: User, desc: 'Manage your profile and preferences' },
    { id: 'orders', short: 'Orders', name: 'Order History', icon: Package, desc: 'Track, return, or buy items again' },
    { id: 'wishlist', short: 'Wishlist', name: 'Saved Wishlist', icon: Heart, desc: 'View and manage your saved items' },
    { id: 'addresses', short: 'Address', name: 'Saved Addresses', icon: MapPin, desc: 'Manage your delivery locations' },
  ];

  const currentTabInfo = TABS.find(t => t.id === activeTab) || TABS[0];

  return (
    <div className="min-h-screen bg-white font-sans text-[#302832] pb-24">
      
      {/* Dynamic Header */}
      <div className="bg-[#F7F1E8] border-b border-[#E9D8C3] relative overflow-hidden transition-all duration-300">
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply"
        />
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-medium text-[#4A1F58] mb-1.5 md:mb-2">
              {currentTabInfo.name}
            </h1>
            <p className="text-[9px] md:text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-zinc-500">
              {currentTabInfo.desc}
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-zinc-400 bg-white/50 px-3 py-1.5 rounded-sm border border-[#E9D8C3]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A15B]" /> Encrypted
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-6 md:pt-10">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
          
          <aside className="w-full md:w-[240px] shrink-0">
            {/* Mobile Tab Scroll: strict 2-column grid to prevent overflow */}
            <div className="md:hidden grid grid-cols-2 gap-2 border-b border-[#E9D8C3] pb-4 mb-4">
              {TABS.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-sm text-[10px] font-sans font-bold uppercase tracking-widest transition-colors ${activeTab === item.id ? 'bg-[#4A1F58] text-white shadow-sm' : 'bg-[#F7F1E8]/50 text-zinc-500 border border-[#E9D8C3]'}`}
                >
                  <item.icon className="w-3 h-3 shrink-0" /> {item.short}
                </button>
              ))}
            </div>

            <nav className="hidden md:flex flex-col gap-2 sticky top-24">
              {TABS.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-sm text-[10px] lg:text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all text-left ${activeTab === item.id ? 'bg-[#4A1F58] text-white shadow-sm' : 'text-zinc-500 hover:bg-[#F7F1E8]/50 hover:text-[#4A1F58] border border-transparent hover:border-[#E9D8C3]'}`}
                >
                  <item.icon className="w-4 h-4 shrink-0" /> {item.name}
                </button>
              ))}
              <div className="h-px bg-[#E9D8C3] my-2" />
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3.5 text-rose-500 hover:bg-rose-50 rounded-sm border border-transparent hover:border-rose-100 text-[10px] lg:text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all w-full text-left">
                <LogOut className="w-4 h-4 shrink-0" /> Sign Out
              </button>
            </nav>
          </aside>

          <div className="flex-1 min-w-0 min-h-[400px]">
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'addresses' && renderAddresses()}
            {activeTab === 'wishlist' && renderWishlist()}
          </div>

        </div>
      </div>
    </div>
  );
}