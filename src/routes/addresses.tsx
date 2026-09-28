import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  User, MapPin, Package, Heart, LogOut, 
  Loader2, ShieldCheck, Plus, Trash2, Edit2,
  Phone
} from "lucide-react";

export const Route = createFileRoute('/addresses')({
  component: AddressesPage,
});

function AddressesPage() {
  const navigate = useNavigate();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Mock Addresses (Replace with Supabase fetch)
  const [addresses, setAddresses] = useState([
    {
      id: "addr_1",
      type: "Home",
      name: "Priya Sharma",
      street: "A-402, Lodha Bellissimo, NM Joshi Marg",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400011",
      phone: "9876543210",
      isDefault: true
    }
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem("pavitram_user");
    if (!storedUser) {
      navigate({ to: "/login" });
    } else {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("pavitram_user");
        navigate({ to: "/login" });
      }
    }
    setIsLoadingAuth(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("pavitram_user");
    navigate({ to: "/login" });
  };

  const handleDelete = (id: string) => {
    if(window.confirm("Are you sure you want to remove this address?")) {
      setAddresses(addresses.filter(a => a.id !== id));
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F1E8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A15B]" />
      </div>
    );
  }

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
              Saved Addresses
            </h1>
            <p className="text-[10px] md:text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-zinc-500">
              Manage your delivery locations
            </p>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-zinc-400 bg-white/50 px-4 py-2 rounded-sm border border-[#E9D8C3] w-max">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A15B]" /> Verified Delivery
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* --- SIDEBAR NAVIGATION --- */}
          <aside className="w-full md:w-[240px] shrink-0">
            <div className="md:hidden flex overflow-x-auto hide-scrollbar gap-2 border-b border-[#E9D8C3] pb-4 mb-6">
              {[
                { name: 'Profile', icon: User, active: false, to: '/Account' },
                { name: 'Orders', icon: Package, active: false, to: '/orders' },
                { name: 'Wishlist', icon: Heart, active: false, to: '/wishlist' },
                { name: 'Addresses', icon: MapPin, active: true, to: '/addresses' },
              ].map((item, idx) => (
                <Link key={idx} to={item.to} className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-[10px] font-sans font-bold uppercase tracking-widest shrink-0 transition-colors ${item.active ? 'bg-[#4A1F58] text-white border border-[#4A1F58]' : 'bg-[#F7F1E8]/50 text-zinc-500 border border-[#E9D8C3]'}`}>
                  <item.icon className="w-3.5 h-3.5" /> {item.name}
                </Link>
              ))}
            </div>

            <nav className="hidden md:flex flex-col gap-2 sticky top-24">
              <Link to="/Account" className="flex items-center gap-3 px-5 py-3.5 text-zinc-500 hover:bg-[#F7F1E8]/50 hover:text-[#4A1F58] rounded-sm border border-transparent hover:border-[#E9D8C3] text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all">
                <User className="w-4 h-4" /> Profile Details
              </Link>
              <Link to="/orders" className="flex items-center gap-3 px-5 py-3.5 text-zinc-500 hover:bg-[#F7F1E8]/50 hover:text-[#4A1F58] rounded-sm border border-transparent hover:border-[#E9D8C3] text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all">
                <Package className="w-4 h-4" /> Order History
              </Link>
              <Link to="/wishlist" className="flex items-center gap-3 px-5 py-3.5 text-zinc-500 hover:bg-[#F7F1E8]/50 hover:text-[#4A1F58] rounded-sm border border-transparent hover:border-[#E9D8C3] text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all">
                <Heart className="w-4 h-4" /> Saved Wishlist
              </Link>
              <Link to="/addresses" className="flex items-center gap-3 px-5 py-3.5 bg-[#4A1F58] text-white rounded-sm text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all shadow-sm">
                <MapPin className="w-4 h-4" /> Saved Addresses
              </Link>
              <div className="h-px bg-[#E9D8C3] my-2" />
              <button onClick={handleLogout} className="flex items-center gap-3 px-5 py-3.5 text-rose-500 hover:bg-rose-50 rounded-sm border border-transparent hover:border-rose-100 text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all w-full text-left">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </nav>
          </aside>

          {/* --- MAIN CONTENT (ADDRESSES) --- */}
          <div className="flex-1 space-y-6">
            
            {/* Add New Button */}
            <button className="w-full sm:w-auto px-6 py-3.5 bg-white border border-[#E9D8C3] hover:border-[#C9A15B] text-[#4A1F58] text-[11px] font-sans font-bold uppercase tracking-[0.15em] rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Add New Address
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white border border-[#E9D8C3] rounded-sm p-6 relative group">
                  {addr.isDefault && (
                    <span className="absolute top-6 right-6 bg-[#F7F1E8] text-[#C9A15B] text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border border-[#E9D8C3]">
                      Default
                    </span>
                  )}
                  
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-[#C9A15B]" />
                    <h3 className="text-sm font-serif font-medium text-[#4A1F58] uppercase tracking-[0.1em]">{addr.type}</h3>
                  </div>

                  <div className="space-y-1 text-sm font-sans text-zinc-600 mb-8 leading-relaxed">
                    <p className="font-medium text-[#302832] pb-1">{addr.name}</p>
                    <p>{addr.street}</p>
                    <p>{addr.city}, {addr.state} {addr.pincode}</p>
                    <p className="pt-2 flex items-center gap-1.5 text-zinc-500 text-xs">
                      <Phone className="w-3.5 h-3.5" /> +91 {addr.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-[#E9D8C3]/50">
                    <button className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-[#4A1F58] hover:text-[#C9A15B] transition-colors">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <span className="text-zinc-200">|</span>
                    <button onClick={() => handleDelete(addr.id)} className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-400 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}