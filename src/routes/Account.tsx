"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { 
  User, Package, MapPin, ShieldCheck, LogOut, 
  Loader2, AlertTriangle, CheckCircle2,
  ArrowLeft, Edit3, X, Calendar, Phone, Sparkles, Store, ChevronRight, Gift, ShoppingBag
} from "lucide-react";
import { toast } from "sonner";

import { getAccountProfileFn, updateAccountProfileFn, deleteAccountFn } from "@/lib/api/account.functions";
import { logoutFn } from "@/lib/api/auth.functions";

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
  
  // Loyalty Info Modal State
  const [showLoyaltyInfo, setShowLoyaltyInfo] = useState(false);

  const [customer, setCustomer] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loyalty, setLoyalty] = useState<any>(null);

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
      setLoyalty(res.loyalty || null);

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

      const isOnlineProfileEmpty = !p?.first_name && !p?.last_name;
      const hasOfflineName = c?.full_name && c.full_name.trim() !== "";

      if (isOnlineProfileEmpty) {
        setShowOnboarding(true);
        if (hasOfflineName) setHasOfflineData(true);
      }

    } catch (error: any) {
      toast.error(error.message || "Session expired. Please log in again.");
      localStorage.removeItem("pavitram_user");
      navigate({ to: "/login" });
    } finally {
      setIsLoading(false);
    }
  };

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
      "Are you sure you want to permanently erase your profile? Under the DPDP Act 2023, your profile, addresses, and marketing data will be permanently wiped."
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

    if (formData.firstName && formData.lastName) score += 25; else missing.push("Name");
    if (formData.email) score += 25; else missing.push("Email");
    if (formData.streetAddress && formData.city && formData.pincode) score += 30; else missing.push("Address");
    if (formData.dob || formData.anniversary) score += 20; else missing.push("Milestones");

    return { score, missing };
  }, [formData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4A1F58]" />
      </div>
    );
  }

  const displayName = formData.firstName 
    ? `${formData.firstName} ${formData.lastName}`.trim() 
    : customer?.full_name || "Valued Patron";

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans pb-24 text-[#302832] relative w-full overflow-x-hidden">
      
      {/* --- SMART ONBOARDING MODAL --- */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#302832]/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-[#4A1F58] p-6 text-center relative overflow-hidden">
              <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white opacity-10" />
              <h2 className="text-2xl font-serif font-medium text-white relative z-10">Welcome to Pavitram</h2>
              <p className="text-[#E9D8C3] text-xs mt-1 relative z-10">Let's set up your digital profile</p>
            </div>
            
            <div className="p-6">
              {hasOfflineData ? (
                <div className="mb-2 bg-[#FAF7F2] border border-[#EBE4D8] p-5 rounded-2xl text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Store className="w-6 h-6 text-[#C9A15B]" />
                  </div>
                  <h3 className="font-bold text-[#4A1F58] text-base mb-1.5">Store Profile Found</h3>
                  <p className="text-xs text-zinc-600 mb-5 leading-relaxed">
                    We recognize your number from a previous showroom visit. Are these details still correct?
                  </p>
                  
                  {/* PREVIEW OF OFFLINE DATA */}
                  <div className="bg-white border border-[#EBE4D8] rounded-xl p-4 text-left space-y-3 mb-6 shadow-sm">
                    {customer?.full_name && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-medium">Name</span>
                        <span className="font-bold text-[#302832]">{customer.full_name}</span>
                      </div>
                    )}
                    {customer?.phone && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-medium">Phone</span>
                        <span className="font-bold text-[#302832]">{customer.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={handleImportOfflineData}
                      className="flex-1 bg-[#4A1F58] text-white text-[11px] font-bold uppercase tracking-widest py-3.5 rounded-xl hover:bg-[#302832] transition-colors shadow-sm"
                    >
                      Yes, Import
                    </button>
                    <button 
                      onClick={() => setHasOfflineData(false)}
                      className="flex-1 bg-white border border-[#EBE4D8] text-zinc-600 text-[11px] font-bold uppercase tracking-widest py-3.5 rounded-xl hover:bg-[#FAF7F2] transition-colors"
                    >
                      No, Enter New
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">First Name *</label>
                      <input required type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full h-12 px-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[#4A1F58] focus:bg-white focus:ring-1 focus:ring-[#4A1F58] outline-none transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Last Name *</label>
                      <input required type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full h-12 px-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[#4A1F58] focus:bg-white focus:ring-1 focus:ring-[#4A1F58] outline-none transition-all" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Email Address *</label>
                    <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full h-12 px-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[#4A1F58] focus:bg-white focus:ring-1 focus:ring-[#4A1F58] outline-none transition-all" placeholder="For order invoices" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Date of Birth</label>
                    <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full h-12 px-4 text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[#4A1F58] focus:bg-white focus:ring-1 focus:ring-[#4A1F58] outline-none transition-all" />
                  </div>
                  <button type="submit" disabled={isSaving || !formData.firstName || !formData.lastName || !formData.email} className="w-full bg-[#4A1F58] hover:bg-[#302832] text-white text-[11px] font-bold uppercase tracking-widest h-12 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4 shadow-md">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Profile"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✨ LOYALTY COIN EXPLANATION MODAL */}
      {showLoyaltyInfo && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#302832]/80 backdrop-blur-sm sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="p-6 relative">
              <button onClick={() => setShowLoyaltyInfo(false)} className="absolute top-4 right-4 p-2 bg-[#FAF7F2] rounded-full text-zinc-400 hover:text-zinc-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex flex-col items-center text-center mt-2 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#EAB308] to-[#C9A15B] rounded-full flex items-center justify-center shadow-lg mb-4 ring-4 ring-[#FAF7F2]">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-serif font-black text-[#302832] tracking-tight">Pavitram Coins</h2>
                <p className="text-sm font-medium text-zinc-500 mt-1">Your gateway to exclusive rewards.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#FAF7F2] rounded-2xl p-4 flex items-center gap-4 border border-[#EBE4D8]">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <TrendingUp className="w-5 h-5 text-[#4A1F58]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#302832]">How to Earn</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Earn coins on every valid jewellery purchase made in-store or online.</p>
                  </div>
                </div>
                <div className="bg-[#FAF7F2] rounded-2xl p-4 flex items-center gap-4 border border-[#EBE4D8]">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <Gift className="w-5 h-5 text-[#C9A15B]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#302832]">Value & Redemption</h4>
                    <p className="text-xs text-zinc-500 mt-0.5"><span className="font-bold text-[#0A7B3E]">1 Coin = ₹1.</span> Redeem your coins seamlessly at checkout for instant discounts.</p>
                  </div>
                </div>
                {loyalty?.referral_code && (
                  <div className="bg-[#FFFDF5] rounded-2xl p-4 border border-[#EBE4D8]">
                    <h4 className="text-xs font-bold text-[#8A6A2E] uppercase tracking-wider mb-2 text-center">Your Referral Code</h4>
                    <div className="bg-white border border-[#EBE4D8] rounded-xl p-3 text-center shadow-sm">
                      <span className="text-lg font-mono font-black tracking-[0.2em] text-[#C9A15B]">{loyalty.referral_code}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 text-center mt-2 font-medium leading-relaxed">
                      Share this code with friends. They get 10% off, and you earn a 5% coin bonus!
                    </p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowLoyaltyInfo(false)} 
                className="w-full mt-6 h-12 bg-[#4A1F58] hover:bg-[#302832] transition-colors text-white rounded-xl font-bold uppercase tracking-widest text-xs"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- APP-LIKE COMPACT TOP BAR --- */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#EBE4D8] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FAF7F2] text-[#302832] hover:bg-[#EBE4D8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-[15px] font-serif font-bold text-[#4A1F58] tracking-wide absolute left-1/2 -translate-x-1/2">
            My Account
          </h1>
          <div className="w-8" />
        </div>
      </header>

      {/* --- MASTER DESKTOP/MOBILE LAYOUT --- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex flex-col md:flex-row gap-6 md:gap-8 w-full">
        
        {/* LEFT COLUMN: Profile Card & Navigation */}
        <div className="w-full md:w-[320px] shrink-0 space-y-6">
          
          {/* PROFILE SUMMARY CARD (Matches Screenshot exactly) */}
          <section className="bg-white rounded-3xl p-5 border border-[#EBE4D8] shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full">
              <div className="w-16 h-16 rounded-2xl bg-[#302832] flex items-center justify-center text-white font-serif text-3xl font-bold shadow-md shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col items-center sm:items-start min-w-0 flex-1">
                <h2 className="text-xl font-serif font-bold text-[#302832] truncate w-full">
                  {displayName}
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-0.5 w-full">
                  <span className="text-[13px] text-zinc-500 font-medium truncate">
                    {customer?.phone || "No Phone"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#0A7B3E] bg-[#E5F5EC] px-1.5 py-0.5 rounded-full border border-[#A8E0C0] uppercase tracking-widest shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>

                {/* ✨ NATIVE E-COMMERCE COIN PILL (Matches screenshot) */}
                {/* ✨ NATIVE E-COMMERCE COIN PILL (Static Display) */}
<div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-[#FFFDF5] to-white border border-[#FDE68A] pl-1.5 pr-4 py-1.5 rounded-full shadow-sm w-max">
  <div className="w-6 h-6 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center shadow-inner shrink-0">
    <Sparkles className="w-3.5 h-3.5 text-white" />
  </div>
  <div className="flex flex-col items-start justify-center text-left">
    <span className="text-[8px] uppercase font-black text-[#D97706] leading-none tracking-widest mb-0.5">Pavitram Coins</span>
    <span className="text-sm font-black text-[#92400E] leading-none">{loyalty?.total_points ?? 0}</span>
  </div>
</div>
              </div>
            </div>

            {/* DYNAMIC PROGRESS BAR */}
            <div className="w-full bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE4D8] mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#302832]">Profile Completion</span>
                <span className="text-[11px] font-black text-[#4A1F58]">{completionStats.score}%</span>
              </div>
              <div className="w-full bg-[#EBE4D8] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#4A1F58] h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${completionStats.score}%` }}
                />
              </div>
              {completionStats.score < 100 ? (
                <p className="text-[10px] text-zinc-500 mt-2.5 font-medium leading-relaxed">
                  Add your <span className="text-[#302832] font-bold">{completionStats.missing.slice(0, 2).join(" & ")}</span> to unlock milestone rewards.
                </p>
              ) : (
                <p className="text-[10px] text-[#0A7B3E] mt-2.5 font-bold leading-relaxed flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Profile 100% Complete
                </p>
              )}
            </div>
          </section>

          {/* DESKTOP SIDEBAR NAVIGATION */}
          <div className="hidden md:flex flex-col bg-white rounded-2xl border border-[#EBE4D8] shadow-sm overflow-hidden">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center justify-between px-5 py-4 text-sm font-bold transition-all border-b border-[#EBE4D8] ${
                activeTab === 'orders' ? 'bg-[#FAF7F2] text-[#4A1F58] border-l-4 border-l-[#4A1F58]' : 'text-zinc-600 hover:bg-zinc-50 border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-center gap-3"><ShoppingBag className="w-4 h-4" /> My Orders</div>
              {orders.length > 0 && <span className="text-[10px] font-mono bg-[#EBE4D8] px-2 py-0.5 rounded-full text-zinc-800">{orders.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-5 py-4 text-sm font-bold transition-all border-b border-[#EBE4D8] ${
                activeTab === 'profile' ? 'bg-[#FAF7F2] text-[#4A1F58] border-l-4 border-l-[#4A1F58]' : 'text-zinc-600 hover:bg-zinc-50 border-l-4 border-l-transparent'
              }`}
            >
              <User className="w-4 h-4" /> Edit Profile
            </button>
            <button 
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-3 px-5 py-4 text-sm font-bold transition-all ${
                activeTab === 'privacy' ? 'bg-[#FAF7F2] text-[#4A1F58] border-l-4 border-l-[#4A1F58]' : 'text-zinc-600 hover:bg-zinc-50 border-l-4 border-l-transparent'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Data Privacy
            </button>
            
            <div className="p-4 bg-zinc-50 mt-auto border-t border-[#EBE4D8]">
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center justify-center w-full gap-2 text-xs font-bold text-zinc-500 hover:text-[#302832] uppercase tracking-widest transition-colors"
              >
                {isLoggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                Secure Logout
              </button>
            </div>
          </div>

          {/* MOBILE TABS WRAPPER (Fixes horizontal scroll bleeding) */}
          <div className="md:hidden flex flex-wrap gap-2 w-full">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl text-[11px] font-bold transition-all shadow-sm ${
                activeTab === 'orders' 
                  ? 'bg-[#302832] text-white' 
                  : 'bg-white border border-[#EBE4D8] text-zinc-600'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Orders
              {orders.length > 0 && <span className={`text-[9px] font-mono px-1.5 rounded-full ${activeTab === 'orders' ? 'bg-white/20' : 'bg-zinc-100'}`}>{orders.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl text-[11px] font-bold transition-all shadow-sm ${
                activeTab === 'profile' 
                  ? 'bg-[#302832] text-white' 
                  : 'bg-white border border-[#EBE4D8] text-zinc-600'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Profile
            </button>
            <button 
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl text-[11px] font-bold transition-all shadow-sm ${
                activeTab === 'privacy' 
                  ? 'bg-[#302832] text-white' 
                  : 'bg-white border border-[#EBE4D8] text-zinc-600'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Privacy
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Tab Content */}
        <div className="flex-1 min-w-0">
          
          {/* TAB 1: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <section className="space-y-4 animate-in fade-in duration-300">
              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 border border-[#EBE4D8] text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#C9A15B] mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#302832]">No Orders Yet</h3>
                    <p className="text-[13px] text-zinc-500 mt-1 max-w-[250px] mx-auto">
                      Your certified jewelry acquisitions will appear here.
                    </p>
                  </div>
                  <Link 
                    to="/Shop" 
                    className="inline-flex items-center justify-center mt-2 bg-[#4A1F58] text-white text-[11px] font-bold uppercase tracking-widest px-8 h-12 rounded-xl hover:bg-[#302832] transition-colors shadow-sm w-full sm:w-auto"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE4D8] shadow-sm space-y-5 hover:border-[#C9A15B]/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#C9A15B]">
                          Order <span className="text-[#302832]">#{order.order_number}</span>
                        </p>
                        <p className="text-[13px] font-medium text-zinc-500 mt-1">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-serif text-[19px] text-[#302832] tracking-tight">
                          ₹{Number(order.final_total).toLocaleString('en-IN')}
                        </p>
                        <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1.5 bg-[#E5F5EC] text-[#0A7B3E] border border-[#A8E0C0]">
                          {order.status?.replace('_', ' ') || 'Processing'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#FAF7F2] rounded-2xl p-4 space-y-3 border border-[#EBE4D8]/50">
                      {order.ecommerce_order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-[13px]">
                          <span className="font-medium text-zinc-600 truncate pr-4">
                            <span className="font-bold text-[#302832] mr-2">{item.quantity}x</span> 
                            Custom Jewelry ({item.product_id?.slice(0, 8)})
                          </span>
                          <span className="font-bold text-[#302832] shrink-0">
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

          {/* TAB 2: PROFILE EDIT */}
          {activeTab === 'profile' && (
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE4D8] shadow-sm animate-in fade-in duration-300">
              
              {/* VIEW MODE */}
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2">
                    <h3 className="text-lg font-serif font-bold text-[#4A1F58]">Personal Details</h3>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#4A1F58] hover:text-[#302832] bg-[#FAF7F2] border border-[#EBE4D8] px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE4D8]">
                      <span className="text-[10px] font-bold text-[#C9A15B] uppercase tracking-widest block mb-1">Email Address</span>
                      <span className="text-[13px] font-semibold text-[#302832] block truncate">{formData.email || "Not Provided"}</span>
                    </div>
                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE4D8]">
                      <span className="text-[10px] font-bold text-[#C9A15B] uppercase tracking-widest block mb-1">Mobile Number</span>
                      <span className="text-[13px] font-semibold text-[#302832] block truncate">{customer?.phone}</span>
                    </div>
                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE4D8]">
                      <span className="text-[10px] font-bold text-[#C9A15B] uppercase tracking-widest block mb-1">Date of Birth</span>
                      <span className="text-[13px] font-semibold text-[#302832] block truncate">{formData.dob ? formatDate(formData.dob) : "Add Birthday"}</span>
                    </div>
                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE4D8]">
                      <span className="text-[10px] font-bold text-[#C9A15B] uppercase tracking-widest block mb-1">Anniversary</span>
                      <span className="text-[13px] font-semibold text-[#302832] block truncate">{formData.anniversary ? formatDate(formData.anniversary) : "Add Anniversary"}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#EBE4D8]">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C9A15B] mb-3">Delivery Destination</h4>
                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE4D8] text-[13px] leading-relaxed">
                      {formData.streetAddress ? (
                        <>
                          <p className="font-bold text-[#302832] mb-0.5">{formData.streetAddress}</p>
                          {formData.apartment && <p className="text-zinc-600">{formData.apartment}</p>}
                          <p className="text-zinc-600">{formData.city}, {formData.state} - <span className="font-mono font-medium">{formData.pincode}</span></p>
                        </>
                      ) : (
                        <p className="text-zinc-400 italic">No delivery address saved. Tap 'Edit' to add.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT MODE */
                <form onSubmit={handleProfileSave} className="space-y-5 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#EBE4D8] pb-4">
                    <h3 className="text-lg font-serif font-bold text-[#4A1F58]">Edit Profile</h3>
                    <button type="button" onClick={() => setIsEditing(false)} className="p-2 bg-[#FAF7F2] rounded-full text-zinc-400 hover:text-zinc-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">First Name</label>
                      <input required type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full h-11 px-4 text-[13px] bg-white border border-[#EBE4D8] rounded-xl focus:border-[#4A1F58] focus:ring-1 focus:ring-[#4A1F58] outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Last Name</label>
                      <input required type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full h-11 px-4 text-[13px] bg-white border border-[#EBE4D8] rounded-xl focus:border-[#4A1F58] focus:ring-1 focus:ring-[#4A1F58] outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                      <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full h-11 px-4 text-[13px] bg-white border border-[#EBE4D8] rounded-xl focus:border-[#4A1F58] focus:ring-1 focus:ring-[#4A1F58] outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Date of Birth</label>
                      <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full h-11 px-4 text-[13px] text-zinc-700 bg-white border border-[#EBE4D8] rounded-xl focus:border-[#4A1F58] focus:ring-1 focus:ring-[#4A1F58] outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Anniversary</label>
                      <input type="date" value={formData.anniversary} onChange={(e) => setFormData({...formData, anniversary: e.target.value})} className="w-full h-11 px-4 text-[13px] text-zinc-700 bg-white border border-[#EBE4D8] rounded-xl focus:border-[#4A1F58] focus:ring-1 focus:ring-[#4A1F58] outline-none transition-all" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#EBE4D8] space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C9A15B] ml-1">Delivery Address</h4>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">House / Flat / Street</label>
                      <input type="text" value={formData.streetAddress} onChange={(e) => setFormData({...formData, streetAddress: e.target.value})} className="w-full h-11 px-4 text-[13px] bg-white border border-[#EBE4D8] rounded-xl focus:border-[#4A1F58] focus:ring-1 focus:ring-[#4A1F58] outline-none transition-all" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">City</label>
                        <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full h-11 px-4 text-[13px] bg-white border border-[#EBE4D8] rounded-xl focus:border-[#4A1F58] focus:ring-1 focus:ring-[#4A1F58] outline-none transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">State</label>
                        <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full h-11 px-4 text-[13px] bg-white border border-[#EBE4D8] rounded-xl focus:border-[#4A1F58] focus:ring-1 focus:ring-[#4A1F58] outline-none transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">PIN Code</label>
                        <input type="text" maxLength={6} value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})} className="w-full h-11 px-4 text-[13px] font-mono bg-white border border-[#EBE4D8] rounded-xl focus:border-[#4A1F58] focus:ring-1 focus:ring-[#4A1F58] outline-none transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#EBE4D8]">
                    <button type="submit" disabled={isSaving} className="flex-1 bg-[#4A1F58] hover:bg-[#302832] text-white text-[11px] font-bold uppercase tracking-widest h-12 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                      {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save Details
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="w-full sm:w-auto px-8 bg-[#FAF7F2] hover:bg-[#EBE4D8] text-zinc-700 text-[11px] font-bold uppercase tracking-widest h-12 rounded-xl transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}

          {/* TAB 3: PRIVACY */}
          {activeTab === 'privacy' && (
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE4D8] shadow-sm space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-[#EBE4D8] pb-4">
                <h3 className="text-lg font-serif font-bold text-[#4A1F58]">Data Sovereignty</h3>
                <p className="text-[13px] text-zinc-500 mt-1">Full control under the Digital Personal Data Protection (DPDP) Act, 2023.</p>
              </div>

              <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#EBE4D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-[13px] font-bold text-[#302832]">Promotional WhatsApp Alerts</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 max-w-sm leading-relaxed">
                    Receive private showcase alerts and milestone offers. Disabling will not stop statutory order receipts.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={whatsappConsent} 
                    onChange={() => {
                      setWhatsappConsent(!whatsappConsent);
                      toast.success("Preferences saved securely.");
                    }} 
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A7B3E]" />
                </label>
              </div>

              <div className="bg-red-50/50 border border-red-100 p-5 rounded-2xl space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-red-900">Right to Erasure (Sec 12, DPDP Act)</h4>
                    <p className="text-[11px] text-red-700/80 leading-relaxed mt-1">
                      Permanently purges your profile and addresses. Anonymized financial records are retained to fulfill statutory tax obligations.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold uppercase tracking-widest h-12 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Permanently Erase My Data"}
                </button>
              </div>
            </section>
          )}

          {/* MOBILE LOGOUT BUTTON (Only visible on mobile since Desktop has it in Sidebar) */}
          <div className="md:hidden flex justify-center pt-6 pb-8">
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center justify-center gap-2 text-[11px] font-bold text-zinc-400 hover:text-red-600 uppercase tracking-widest transition-colors"
            >
              {isLoggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              Secure Logout
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}