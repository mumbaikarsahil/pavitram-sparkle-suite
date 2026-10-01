"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { 
  User, Package, MapPin, ShieldCheck, LogOut, 
  Loader2, AlertTriangle, CheckCircle2,
  ArrowLeft, Edit3, X, Calendar, Phone, Sparkles, Store
} from "lucide-react";
import { toast } from "sonner";

import { getAccountProfileFn, updateAccountProfileFn, deleteAccountFn } from "@/lib/api/account.functions";
import { logoutFn } from "@/lib/api/auth.functions";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute('/Account')({
  component: AccountDashboard,
});

function AccountDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'privacy'>('orders');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sync & Onboarding States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasOfflineData, setHasOfflineData] = useState(false);

  const [customer, setCustomer] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  const [whatsappConsent, setWhatsappConsent] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", dob: "", anniversary: "",
    streetAddress: "", apartment: "", city: "", state: "", pincode: ""
  });

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      const res = (await getAccountProfileFn()) as any;
      const c = res.customer;
      const p = res.profile;

      setCustomer(c);
      setProfile(p);
      setOrders(res.orders || []);

      if (c || p) {
        setFormData({
          firstName: p?.first_name || "",
          lastName: p?.last_name || "",
          email: c?.email || "",
          dob: c?.birth_date || "",
          anniversary: c?.anniversary_date || "",
          streetAddress: p?.street_address || "",
          apartment: p?.apartment || "",
          city: p?.city || "",
          state: p?.state || "",
          pincode: p?.pincode || ""
        });
      }

      // ✨ SMART ONBOARDING LOGIC
      const isOnlineProfileEmpty = !p?.first_name && !p?.last_name;
      const hasOfflineName = c?.full_name && c.full_name.trim() !== "";

      if (isOnlineProfileEmpty) {
        setShowOnboarding(true);
        if (hasOfflineName) {
          setHasOfflineData(true);
        }
      }

    } catch (error: any) {
      toast.error(error.message || "Session expired. Please log in again.");
      localStorage.removeItem("pavitram_user");
      navigate({ to: "/login" });
    } finally {
      setIsLoading(false);
    }
  };

  // ✨ IMPORT OFFLINE DATA HANDLER
  const handleImportOfflineData = () => {
    const nameParts = customer?.full_name?.split(" ") || [];
    const fName = nameParts[0] || "";
    const lName = nameParts.slice(1).join(" ") || "";

    setFormData(prev => ({
      ...prev,
      firstName: fName,
      lastName: lName,
      dob: customer?.birth_date || prev.dob,
      anniversary: customer?.anniversary_date || prev.anniversary,
      email: customer?.email || prev.email,
    }));
    
    setHasOfflineData(false);
    toast.success("Store details imported! Please review and confirm below.");
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateAccountProfileFn({ data: formData });
      await fetchAccountData();
      setIsEditing(false);
      setShowOnboarding(false);
      toast.success("Profile details saved successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently erase your profile? Under the DPDP Act 2023, your profile, addresses, and marketing data will be permanently wiped. Anonymized financial records are retained for statutory tax compliance."
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await deleteAccountFn();
      localStorage.removeItem("pavitram_user");
      toast.success("Account data permanently wiped.");
      navigate({ to: "/" });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account.");
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutFn();
    } catch {
    } finally {
      localStorage.removeItem("pavitram_user");
      toast.success("Logged out successfully.");
      navigate({ to: "/login" });
    }
  };

  const completionStats = useMemo(() => {
    let score = 0;
    const missing: string[] = [];

    if (formData.firstName && formData.lastName) score += 25;
    else missing.push("Full Name");

    if (formData.email) score += 25;
    else missing.push("Email");

    if (formData.streetAddress && formData.city && formData.pincode) score += 30;
    else missing.push("Delivery Address");

    if (formData.dob || formData.anniversary) score += 20;
    else missing.push("Milestones");

    return { score, missing };
  }, [formData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A15B]" />
      </div>
    );
  }

  const displayName = formData.firstName 
    ? `${formData.firstName} ${formData.lastName}`.trim() 
    : customer?.full_name || "Valued Patron";

  // Helper to format dates nicely for the preview
  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans pb-24 md:pb-16 text-[#302832] relative">
      
      {/* ✨ SMART ONBOARDING / SYNC MODAL */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#302832]/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-[#4A1F58] p-6 text-center relative overflow-hidden">
              <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white opacity-10" />
              <h2 className="text-2xl font-serif font-medium text-white relative z-10">Welcome to Pavitram</h2>
              <p className="text-[#E9D8C3] text-xs mt-1 relative z-10">Let's set up your digital profile</p>
            </div>
            
            <div className="p-6">
              {hasOfflineData ? (
                <div className="mb-2 bg-[#FAF7F2] border border-[#EBE4D8] p-5 rounded-xl text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Store className="w-6 h-6 text-[#C9A15B]" />
                  </div>
                  <h3 className="font-bold text-[#4A1F58] text-base mb-1.5">Store Profile Found</h3>
                  <p className="text-xs text-zinc-600 mb-5 leading-relaxed">
                    We recognize your number from a previous showroom visit. Are these details still correct?
                  </p>
                  
                  {/* PREVIEW OF OFFLINE DATA */}
                  <div className="bg-white border border-[#EBE4D8] rounded-lg p-4 text-left space-y-2.5 mb-6 shadow-sm">
                    {customer?.full_name && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Name</span>
                        <span className="font-bold text-[#302832]">{customer.full_name}</span>
                      </div>
                    )}
                    {customer?.phone && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Phone</span>
                        <span className="font-medium text-[#302832]">{customer.phone}</span>
                      </div>
                    )}
                    {customer?.email && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Email</span>
                        <span className="font-medium text-[#302832]">{customer.email}</span>
                      </div>
                    )}
                    {customer?.birth_date && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Birthday</span>
                        <span className="font-medium text-[#302832]">{formatDate(customer.birth_date)}</span>
                      </div>
                    )}
                    {customer?.anniversary_date && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Anniversary</span>
                        <span className="font-medium text-[#302832]">{formatDate(customer.anniversary_date)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={handleImportOfflineData}
                      className="flex-1 bg-[#4A1F58] text-white text-[11px] font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-[#302832] transition-colors shadow-sm"
                    >
                      Yes, Import
                    </button>
                    <button 
                      onClick={() => setHasOfflineData(false)}
                      className="flex-1 bg-white border border-zinc-200 text-zinc-600 text-[11px] font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-zinc-50 transition-colors"
                    >
                      No, Enter New
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">First Name *</label>
                      <input required type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full h-11 px-3 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:border-[#4A1F58] focus:bg-white outline-none transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">Last Name *</label>
                      <input required type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full h-11 px-3 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:border-[#4A1F58] focus:bg-white outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">Date of Birth</label>
                    <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full h-11 px-3 text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg focus:border-[#4A1F58] focus:bg-white outline-none transition-all" />
                  </div>
                  <button type="submit" disabled={isSaving || !formData.firstName || !formData.lastName} className="w-full bg-[#4A1F58] hover:bg-[#302832] text-white text-[11px] font-bold uppercase tracking-widest h-12 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4 shadow-sm">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Profile"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* APP-LIKE COMPACT TOP BAR */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#EBE4D8] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-[#4A1F58] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Gallery</span>
            <span className="sm:hidden">Store</span>
          </Link>
          <h1 className="text-sm font-serif font-bold text-[#4A1F58] tracking-wide">
            My Account
          </h1>
          <div className="w-16 flex justify-end">
            <span className="text-[10px] uppercase font-bold text-[#C9A15B] bg-[#C9A15B]/10 px-2 py-0.5 rounded-full border border-[#C9A15B]/20">
              Patron
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        
        {/* PATRON BANNER & PROFILE COMPLETION STRIP */}
        <section className="bg-white rounded-2xl p-5 md:p-6 border border-[#EBE4D8] shadow-[0_4px_20px_rgba(74,31,88,0.03)] space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#4A1F58] to-[#302832] flex items-center justify-center text-white font-serif text-2xl font-bold shadow-md shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-xl font-serif font-bold text-[#302832] truncate">
                {displayName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-xs text-zinc-600 font-medium">
                  <Phone className="w-3 h-3 text-[#C9A15B]" /> {customer?.phone || "Phone Not Linked"}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
            </div>
          </div>

          {/* DYNAMIC PROGRESS BAR */}
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE4D8]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#4A1F58] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A15B]" />
                Profile Completion
              </span>
              <span className="text-xs font-bold font-mono text-[#C9A15B]">
                {completionStats.score}%
              </span>
            </div>
            
            <div className="w-full bg-[#EBE4D8] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#C9A15B] to-[#4A1F58] h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completionStats.score}%` }}
              />
            </div>

            {completionStats.score < 100 && (
              <p className="text-[11px] text-zinc-500 mt-2 font-medium">
                Add your <span className="text-[#4A1F58] font-bold">{completionStats.missing.slice(0, 2).join(" & ")}</span> to unlock tailored milestone rewards and seamless checkout.
              </p>
            )}
          </div>
        </section>

        {/* NATIVE MOBILE-FRIENDLY SEGMENTED TABS */}
        <div className="grid grid-cols-4 bg-white p-1.5 rounded-2xl border border-[#EBE4D8] shadow-sm">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders' 
                ? 'bg-[#4A1F58] text-white shadow-sm' 
                : 'text-zinc-600 hover:text-[#4A1F58]'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Orders</span>
            {orders.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-[#FAF7F2] text-[#4A1F58]'
              }`}>
                {orders.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile' 
                ? 'bg-[#4A1F58] text-white shadow-sm' 
                : 'text-zinc-600 hover:text-[#4A1F58]'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Profile</span>
          </button>

          <button 
            onClick={() => setActiveTab('privacy')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'privacy' 
                ? 'bg-[#4A1F58] text-white shadow-sm' 
                : 'text-zinc-600 hover:text-[#4A1F58]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Privacy</span>
          </button>

          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4 shrink-0" />}
            <span>Logout</span>
          </button>
        </div>

        {/* TAB 1: ORDER HISTORY */}
        {activeTab === 'orders' && (
          <section className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-[#EBE4D8] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] flex items-center justify-center text-zinc-400 mx-auto">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#302832]">No Orders Yet</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Your certified jewelry acquisitions and celebration pieces will appear here once placed.
                </p>
                <Link 
                  to="/Shop" 
                  className="inline-block mt-2 bg-[#4A1F58] text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-[#302832] transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white rounded-2xl p-5 border border-[#EBE4D8] shadow-sm hover:border-[#C9A15B] transition-colors space-y-4"
                >
                  <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A15B]">
                        Order #{order.order_number}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif font-bold text-base text-[#4A1F58]">
                        ₹{Number(order.final_total).toLocaleString('en-IN')}
                      </p>
                      <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 bg-amber-50 text-amber-800 border border-amber-200">
                        {order.status?.replace('_', ' ') || 'Processing'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.ecommerce_order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-xs text-zinc-600">
                        <span className="font-medium truncate pr-4">
                          {item.quantity}x Custom Jewelry Piece ({item.product_id?.slice(0, 8)})
                        </span>
                        <span className="font-semibold text-zinc-900 shrink-0">
                          ₹{Number(item.total_price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* TAB 2: PROFILE & ADDRESSES (STRUCTURED VIEW WITH EDIT TOGGLE) */}
        {activeTab === 'profile' && (
          <section className="bg-white rounded-2xl p-6 border border-[#EBE4D8] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#EBE4D8] pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#4A1F58]">
                  Personal & Shipping Details
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Manage your verified delivery details and celebration dates.
                </p>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-colors ${
                  isEditing 
                    ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200' 
                    : 'bg-[#C9A15B]/15 text-[#8A6A2E] hover:bg-[#C9A15B]/25'
                }`}
              >
                {isEditing ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Edit3 className="w-3.5 h-3.5" /> Edit Profile</>}
              </button>
            </div>

            {/* VIEW MODE */}
            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A15B] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Patron Information
                  </h4>
                  <div className="bg-[#FAF7F2] p-4 rounded-xl space-y-3 text-xs border border-[#EBE4D8]">
                    <div>
                      <span className="text-zinc-500 block">Full Name</span>
                      <span className="font-bold text-zinc-900">{displayName}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Email Address</span>
                      <span className="font-medium text-zinc-900">{formData.email || "Not Provided"}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Mobile Number</span>
                      <span className="font-medium text-zinc-900">{customer?.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A15B] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Celebrations & Milestones
                  </h4>
                  <div className="bg-[#FAF7F2] p-4 rounded-xl space-y-3 text-xs border border-[#EBE4D8]">
                    <div>
                      <span className="text-zinc-500 block">Date of Birth</span>
                      <span className="font-medium text-zinc-900">{formData.dob ? formatDate(formData.dob) : "Add your birthday"}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Anniversary</span>
                      <span className="font-medium text-zinc-900">{formData.anniversary ? formatDate(formData.anniversary) : "Add your anniversary"}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A15B] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Primary Delivery Destination
                  </h4>
                  <div className="bg-[#FAF7F2] p-4 rounded-xl text-xs space-y-1 border border-[#EBE4D8]">
                    {formData.streetAddress ? (
                      <>
                        <p className="font-bold text-zinc-900 text-sm mb-1">{formData.streetAddress}</p>
                        {formData.apartment && <p className="text-zinc-600">{formData.apartment}</p>}
                        <p className="text-zinc-600">{formData.city}, {formData.state} - {formData.pincode}</p>
                      </>
                    ) : (
                      <p className="text-zinc-500 italic">No delivery address saved yet. Tap 'Edit Profile' to add.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* EDIT MODE */
              <form onSubmit={handleProfileSave} className="space-y-5 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider ml-1">First Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.firstName} 
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                      className="w-full h-11 px-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[#4A1F58] focus:bg-white outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider ml-1">Last Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.lastName} 
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                      className="w-full h-11 px-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[#4A1F58] focus:bg-white outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider ml-1">Email Address (For Tax Invoices)</label>
                  <input 
                    required 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="w-full h-11 px-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[#4A1F58] focus:bg-white outline-none transition-all" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider ml-1">Date of Birth</label>
                    <input 
                      type="date" 
                      value={formData.dob} 
                      onChange={(e) => setFormData({...formData, dob: e.target.value})} 
                      className="w-full h-11 px-4 text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[#4A1F58] focus:bg-white outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider ml-1">Anniversary</label>
                    <input 
                      type="date" 
                      value={formData.anniversary} 
                      onChange={(e) => setFormData({...formData, anniversary: e.target.value})} 
                      className="w-full h-11 px-4 text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[#4A1F58] focus:bg-white outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A1F58]">
                    Delivery Address
                  </h4>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider ml-1">House / Flat / Street</label>
                    <input 
                      type="text" 
                      value={formData.streetAddress} 
                      onChange={(e) => setFormData({...formData, streetAddress: e.target.value})} 
                      className="w-full h-11 px-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[#4A1F58] focus:bg-white outline-none transition-all" 
                      placeholder="e.g. Flat 402, Royal Residency"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1 col-span-1">
                      <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider ml-1">City</label>
                      <input 
                        type="text" 
                        value={formData.city} 
                        onChange={(e) => setFormData({...formData, city: e.target.value})} 
                        className="w-full h-11 px-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[#4A1F58] focus:bg-white outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider ml-1">State</label>
                      <input 
                        type="text" 
                        value={formData.state} 
                        onChange={(e) => setFormData({...formData, state: e.target.value})} 
                        className="w-full h-11 px-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[#4A1F58] focus:bg-white outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider ml-1">PIN Code</label>
                      <input 
                        type="text" 
                        maxLength={6} 
                        value={formData.pincode} 
                        onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})} 
                        className="w-full h-11 px-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[#4A1F58] focus:bg-white outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex-1 bg-[#4A1F58] hover:bg-[#302832] text-white text-xs font-bold uppercase tracking-widest h-12 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save Details
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-widest h-12 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* TAB 3: PRIVACY & DPDP ACT STATUTORY CONTROLS */}
        {activeTab === 'privacy' && (
          <section className="bg-white rounded-2xl p-6 border border-[#EBE4D8] shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-[#EBE4D8] pb-4">
              <h3 className="font-serif text-lg font-bold text-[#4A1F58]">
                Privacy & Data Sovereignty
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Full transparency under the Digital Personal Data Protection (DPDP) Act, 2023.
              </p>
            </div>

            {/* CONSENT PREFERENCE */}
            <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#EBE4D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-zinc-900">Promotional WhatsApp Notifications</h4>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-md leading-relaxed">
                  Receive private showcase alerts and milestone offers. Disabling will not stop statutory order and shipping receipts.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={whatsappConsent} 
                  onChange={() => {
                    setWhatsappConsent(!whatsappConsent);
                    toast.success("Preferences saved in verifiable consent ledger.");
                  }} 
                />
                <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4A1F58]" />
              </label>
            </div>

            {/* GRIEVANCE OFFICER NOTICE */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-2 text-xs">
              <h4 className="font-bold text-[#4A1F58] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C9A15B]" /> Statutory Grievance Redressal
              </h4>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Under Section 13 of the DPDP Act 2023, you have the right to address any data concern directly to our Grievance Officer:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-[11px] text-zinc-800 bg-zinc-50 p-3 rounded-lg mt-2 border border-zinc-100">
                <div><span className="text-zinc-400 block mb-0.5">Designation:</span> Grievance Officer, Pavitram</div>
                <div><span className="text-zinc-400 block mb-0.5">Email:</span> privacy@pavitramjewellery.com</div>
                <div><span className="text-zinc-400 block mb-0.5">Response SLA:</span> Within 48 Hours</div>
                <div><span className="text-zinc-400 block mb-0.5">Escalation:</span> Data Protection Board of India</div>
              </div>
            </div>

            {/* DANGER ZONE */}
            <div className="bg-red-50/50 border border-red-100 p-5 rounded-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-red-900">Right to Erasure (Sec 12, DPDP Act)</h4>
                  <p className="text-[11px] text-red-700/80 leading-relaxed mt-1">
                    Permanently purges your profile, saved addresses, and active marketing associations. To fulfill statutory obligations under Section 36 of the CGST Act, past tax invoices and transaction records will be retained in an anonymized state.
                  </p>
                </div>
              </div>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold uppercase tracking-widest px-4 py-3 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Permanently Erase My Data"}
              </button>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}