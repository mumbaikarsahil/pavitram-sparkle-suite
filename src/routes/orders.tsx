import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  User, MapPin, Package, Heart, LogOut, 
  Loader2, ShieldCheck, ChevronRight, Truck, 
  CheckCircle2, Clock, FileText, ArrowUpRight
} from "lucide-react";
import { fetchCustomerOrdersFn } from "@/lib/api/orders.functions";

export const Route = createFileRoute('/orders')({
  component: OrdersPage,
});

function OrdersPage() {
  const navigate = useNavigate();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isFetchingOrders, setIsFetchingOrders] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  // Authentication & Fetch Orders
  useEffect(() => {
    const storedUser = localStorage.getItem("pavitram_user");
    
    if (!storedUser) {
      navigate({ to: "/login" });
      return;
    } 
    
    try {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setIsLoadingAuth(false);
      
      // Fetch actual orders from DB
      const loadOrders = async () => {
        try {
          const res = await fetchCustomerOrdersFn({ data: { phone: user.phone } });
          setOrders(res.orders);
        } catch (error) {
          console.error("Failed to load orders:", error);
        } finally {
          setIsFetchingOrders(false);
        }
      };
      
      loadOrders();
    } catch (e) {
      localStorage.removeItem("pavitram_user");
      navigate({ to: "/login" });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("pavitram_user");
    navigate({ to: "/login" });
  };

  // Maps your specific DB enum statuses to the UI tracker steps
  const getStatusStep = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'shipped') return 3;
    if (s === 'ready_to_ship') return 2;
    // covers 'pending_approval', 'approved_from_stock', 'sent_to_manufacturing'
    return 1; 
  };

  // Human-readable status mapping
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoadingAuth || isFetchingOrders) {
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
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58] mb-2">
              Order History
            </h1>
            <p className="text-[10px] md:text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-zinc-500">
              Track, return, or buy items again
            </p>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-zinc-400 bg-white/50 px-4 py-2 rounded-sm border border-[#E9D8C3] w-max">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A15B]" /> Fully Insured Shipping
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* --- SIDEBAR NAVIGATION --- */}
          <aside className="w-full md:w-[240px] shrink-0">
            <div className="md:hidden flex overflow-x-auto hide-scrollbar gap-2 border-b border-[#E9D8C3] pb-4 mb-6">
              {[
                { name: 'Profile', icon: User, active: false, to: '/Account' },
                { name: 'Orders', icon: Package, active: true, to: '/orders' },
                { name: 'Wishlist', icon: Heart, active: false, to: '/wishlist' },
                { name: 'Addresses', icon: MapPin, active: false, to: '/addresses' },
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
              <Link to="/orders" className="flex items-center gap-3 px-5 py-3.5 bg-[#4A1F58] text-white rounded-sm text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all shadow-sm">
                <Package className="w-4 h-4" /> Order History
              </Link>
              <Link to="/wishlist" className="flex items-center gap-3 px-5 py-3.5 text-zinc-500 hover:bg-[#F7F1E8]/50 hover:text-[#4A1F58] rounded-sm border border-transparent hover:border-[#E9D8C3] text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all">
                <Heart className="w-4 h-4" /> Saved Wishlist
              </Link>
              <Link to="/addresses" className="flex items-center gap-3 px-5 py-3.5 text-zinc-500 hover:bg-[#F7F1E8]/50 hover:text-[#4A1F58] rounded-sm border border-transparent hover:border-[#E9D8C3] text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all">
                <MapPin className="w-4 h-4" /> Saved Addresses 
              </Link>
              <div className="h-px bg-[#E9D8C3] my-2" />
              <button onClick={handleLogout} className="flex items-center gap-3 px-5 py-3.5 text-red-500 hover:bg-red-50 rounded-sm border border-transparent hover:border-red-100 text-[11px] font-sans font-bold uppercase tracking-[0.15em] transition-all w-full text-left">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </nav>
          </aside>

          {/* --- MAIN CONTENT (ORDERS LIST) --- */}
          <div className="flex-1 space-y-8">
            
            {orders.length === 0 ? (
              <div className="bg-white border border-[#E9D8C3] rounded-sm p-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-[#F7F1E8] rounded-full flex items-center justify-center mb-6">
                  <Package className="w-8 h-8 text-[#C9A15B]" />
                </div>
                <h3 className="text-xl font-serif font-medium text-[#4A1F58] mb-2">No orders yet</h3>
                <p className="text-sm font-sans text-zinc-500 mb-8 max-w-sm">
                  Looks like you haven't made your first Pavitram purchase yet.
                </p>
                <Link to="/Shop" className="bg-[#4A1F58] text-white px-8 py-3.5 rounded-sm text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#302832] transition-colors shadow-sm">
                  Start Shopping
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const step = getStatusStep(order.status);
                const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
                const deliveryDate = order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : "Pending";
                const displayCategory = order.inventory_items?.item_category || "Jewelry Item";
                
                return (
                  <div key={order.id} className="bg-white border border-[#E9D8C3] rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    
                    {/* Top Bar */}
                    <div className="bg-[#F7F1E8]/60 border-b border-[#E9D8C3] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                        <div>
                          <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-zinc-500 mb-1">Order Placed</p>
                          <p className="text-sm font-sans text-[#302832]">{orderDate}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-zinc-500 mb-1">Total Amount</p>
                          <p className="text-sm font-sans font-medium text-[#4A1F58]">₹ {Number(order.final_total).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-zinc-500 mb-1">Ship To</p>
                          <p className="text-sm font-sans text-[#C9A15B] hover:text-[#4A1F58] cursor-pointer transition-colors flex items-center gap-1">
                            {currentUser?.full_name?.split(' ')[0] || 'User'} <ChevronRight className="w-3 h-3" />
                          </p>
                        </div>
                      </div>
                      
                      <div className="sm:text-right">
                        <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-zinc-500 mb-1">Order # {order.order_number}</p>
                        <button className="text-xs font-sans font-medium text-[#4A1F58] hover:text-[#C9A15B] transition-colors flex items-center gap-1 sm:ml-auto">
                          <FileText className="w-3.5 h-3.5" /> View Invoice
                        </button>
                      </div>
                    </div>

                    {/* Order Status & Items */}
                    <div className="p-6 md:p-8">
                      
                      <div className="mb-6 flex items-start justify-between">
                        <div>
                          <h3 className={`text-xl font-serif font-medium mb-1 flex items-center gap-2 ${order.status === 'delivered' ? 'text-emerald-700' : 'text-[#4A1F58]'}`}>
                            {order.status === 'delivered' ? <CheckCircle2 className="w-6 h-6" /> : <Truck className="w-6 h-6 text-[#C9A15B]" />}
                            {order.status === 'delivered' ? `Delivered on ${deliveryDate}` : `Arriving by ${deliveryDate}`}
                          </h3>
                          {order.status !== 'delivered' && (
                            <p className="text-xs font-sans text-zinc-500 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> Status: {formatStatus(order.status)}
                            </p>
                          )}
                        </div>
                        
                        {order.status !== 'delivered' && (
                          <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-[#E9D8C3] rounded-sm text-[10px] font-sans font-bold uppercase tracking-widest text-[#4A1F58] hover:bg-[#F7F1E8] transition-colors">
                            Track Package <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Visual Progress Tracker */}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <div className="relative mb-10 mt-6 max-w-2xl">
                          <div className="absolute top-1/2 left-0 w-full h-1 bg-[#E9D8C3] -translate-y-1/2 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#C9A15B] transition-all duration-1000"
                              style={{ width: `${(step / 4) * 100}%` }}
                            />
                          </div>
                          <div className="relative flex justify-between">
                            {['Processing', 'Ready', 'Shipped', 'Delivered'].map((label, i) => (
                              <div key={label} className="flex flex-col items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 bg-white z-10 transition-colors ${step >= i + 1 ? 'border-[#C9A15B] bg-[#C9A15B]' : 'border-[#E9D8C3]'}`} />
                                <span className={`text-[9px] font-sans font-bold uppercase tracking-widest absolute top-6 w-max text-center ${step >= i + 1 ? 'text-[#4A1F58]' : 'text-zinc-400'}`}>
                                  {label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Item Summary */}
                      <div className="space-y-6 mt-8">
                        <div className="flex gap-4 sm:gap-6">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-[#F7F1E8] rounded-sm overflow-hidden border border-[#E9D8C3]">
                            <img src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" alt="Jewelry" className="w-full h-full object-cover opacity-60 mix-blend-multiply" />
                          </div>
                          <div className="flex-1 flex flex-col py-1">
                            <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-[#C9A15B] mb-1">
                              {displayCategory}
                            </span>
                            <h4 className="text-sm sm:text-base font-serif font-medium text-[#302832] mb-1 leading-snug">
                              Pavitram Exclusive Order
                            </h4>
                            <p className="text-xs font-sans text-zinc-500 mb-2">Order Ref: {order.order_number}</p>
                            
                            <div className="mt-auto flex flex-wrap gap-4">
                              <Link to="/Shop" className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#4A1F58] hover:text-[#C9A15B] transition-colors">
                                Buy it again
                              </Link>
                              <span className="text-zinc-300">|</span>
                              <button className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-500 hover:text-[#4A1F58] transition-colors">
                                Need Help?
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {order.status !== 'delivered' && (
                        <button className="w-full sm:hidden mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-[#F7F1E8]/50 border border-[#E9D8C3] rounded-sm text-[10px] font-sans font-bold uppercase tracking-widest text-[#4A1F58] hover:bg-[#F7F1E8] transition-colors">
                          Track Package <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>
      </div>
    </div>
  );
}