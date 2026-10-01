"use client";

import React, { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Package, ShoppingBag, FileText, Download, Loader2, X, User } from "lucide-react";
import { Logo } from "@/components/site/Logo"; 
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute('/success')({
  validateSearch: (search: Record<string, unknown>) => ({
    order_id: search.order_id as string | undefined,
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { order_id } = Route.useSearch();
  
  const [showReceipt, setShowReceipt] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [orderData, setOrderData] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  const displayOrderId = order_id || "ORD-PENDING";

  // 1. Auto-Scroll to Top & Load Pure jsPDF Engine
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Inject strictly jsPDF to bypass CSS parsing crashes
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // 2. CRASH-PROOF Data Fetching
  useEffect(() => {
    async function fetchOrderDetails() {
      if (!order_id) {
        setIsLoadingOrder(false);
        return;
      }
      
      try {
        // Step A: Fetch Main Order
        const { data: order, error: orderErr } = await supabase
          .from('ecommerce_orders')
          .select('*')
          .eq('order_number', order_id)
          .maybeSingle();

        if (orderErr) throw orderErr;

        if (order) {
          setOrderData(order); // Immediately bind Order Details to UI
          
          try {
            // Step B: Try standard Join for Items
            const { data: joinData, error: joinErr } = await supabase
              .from('ecommerce_order_items')
              .select(`quantity, total_price, product_id, ecommerce_products ( title )`)
              .eq('order_id', order.id);
              
            if (!joinErr && joinData && joinData.length > 0) {
              setOrderItems(joinData);
            } else {
              // Step C: Secure Manual Fallback (If RLS blocks joins)
              const { data: rawItems } = await supabase
                .from('ecommerce_order_items')
                .select('*')
                .eq('order_id', order.id);
                
              if (rawItems && rawItems.length > 0) {
                // Safely extract Product IDs
                const pIds = rawItems.map((i: any) => i.product_id).filter(Boolean);
                let prods: any[] = [];
                
                // ONLY run product query if IDs exist (prevents Supabase Crash)
                if (pIds.length > 0) {
                  const { data: pData } = await supabase.from('ecommerce_products').select('id, title').in('id', pIds);
                  if (pData) prods = pData;
                }
                
                const finalItems = rawItems.map((i: any) => ({
                  quantity: i.quantity,
                  total_price: i.total_price,
                  ecommerce_products: { title: prods.find((p: any) => p.id === i.product_id)?.title || "Bespoke Jewellery Item" }
                }));
                
                setOrderItems(finalItems);
              }
            }
          } catch (itemError) {
            console.error("Item processing skipped:", itemError);
            // Notice: We don't throw here. If items fail, the order details still display!
          }
        }
      } catch (error) {
        console.error("Failed to fetch order details", error);
      } finally {
        setIsLoadingOrder(false);
      }
    }

    fetchOrderDetails();
  }, [order_id]);

  // 3. Pure PDF Binary Generation (Immune to UI / CSS crashes)
  const handleDownloadInvoice = () => {
    if (!(window as any).jspdf) {
      toast.error("Document engine is still loading, please click again in a second.");
      return;
    }

    setIsDownloading(true);
    setShowReceipt(false); // Hide the on-screen modal immediately

    try {
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      
      const orderDate = orderData?.created_at ? new Date(orderData.created_at).toLocaleString() : new Date().toLocaleString();
      const customerName = orderData?.customer_name || "Guest Customer";
      const customerEmail = orderData?.customer_email || "N/A";
      const customerPhone = orderData?.customer_phone || "N/A";
      const totalAmount = (orderData?.final_total || orderData?.total_amount || 0).toLocaleString('en-IN');
      const paymentStatus = orderData?.payment_status || "Processing";

      // Branding & Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(74, 31, 88); // #4A1F58 Pavitram Purple
      doc.text("PAVITRAM", 105, 25, { align: "center", renderingMode: "fill" });
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("E-RECEIPT", 105, 34, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(orderDate, 105, 40, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Order No: ${displayOrderId}`, 105, 48, { align: "center" });

      doc.setDrawColor(200, 200, 200);
      doc.line(20, 55, 190, 55);

      // Billed To Section
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("BILLED TO:", 20, 65);
      doc.setFont("helvetica", "normal");
      doc.text(customerName, 20, 72);
      doc.text(customerEmail, 20, 78);
      doc.text(customerPhone, 20, 84);

      doc.line(20, 92, 190, 92);

      // Items Section
      doc.setFont("helvetica", "bold");
      doc.text("ITEMS PURCHASED", 20, 102);
      
      doc.setFontSize(9);
      doc.text("ITEM", 20, 110);
      doc.text("QTY", 150, 110, { align: "right" });
      doc.text("PRICE", 190, 110, { align: "right" });
      
      doc.line(20, 114, 190, 114);

      let yPos = 122;
      doc.setFont("helvetica", "normal");
      
      if (orderItems.length > 0) {
        orderItems.forEach((item) => {
          const title = item.ecommerce_products?.title || "Jewellery Item";
          const splitTitle = doc.splitTextToSize(title, 110); // Word wrap long titles
          doc.text(splitTitle, 20, yPos);
          doc.text(String(item.quantity), 150, yPos, { align: "right" });
          doc.setFont("helvetica", "bold");
          doc.text(`INR ${(item.total_price || 0).toLocaleString('en-IN')}`, 190, yPos, { align: "right" });
          doc.setFont("helvetica", "normal");
          yPos += (splitTitle.length * 6) + 4;
        });
      } else {
        doc.setFont("helvetica", "italic");
        doc.text("Item details processing...", 20, yPos);
        yPos += 10;
      }

      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, 190, yPos);
      yPos += 10;

      // Summary Totals
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Total Amount Paid:", 20, yPos);
      doc.setTextColor(74, 31, 88);
      doc.text(`INR ${totalAmount}`, 190, yPos, { align: "right" });

      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("Payment Status:", 20, yPos);
      doc.setTextColor(21, 128, 61); // Tailwind Emerald-700
      doc.text(paymentStatus.toUpperCase(), 190, yPos, { align: "right" });

      yPos += 8;
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text("Gateway:", 20, yPos);
      doc.text("Razorpay Secure", 190, yPos, { align: "right" });

      // Footer
      yPos += 40;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("We will send you the detailed tax invoice and order details on your registered", 105, yPos, { align: "center" });
      doc.text("email and WhatsApp number.", 105, yPos + 4, { align: "center" });
      doc.text("This is a system generated e-receipt and does not require a signature.", 105, yPos + 12, { align: "center" });

      // Trigger the direct download
      doc.save(`Pavitram_Receipt_${displayOrderId}.pdf`);
      
      setIsDownloading(false);
      toast.success("Receipt downloaded successfully!");
      
    } catch (error) {
      console.error("Native PDF Engine Error:", error);
      setIsDownloading(false);
      toast.error("Download failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8] flex flex-col font-sans pb-24 relative overflow-hidden">
      
      <img 
        src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/bg_pattern2.webp" 
        alt="Decorative Floral" 
        className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply z-0"
      />

      <header className="bg-white/80 backdrop-blur-md border-b border-[#E9D8C3] relative z-10">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-center">
          <Logo className="h-8 md:h-10 w-auto" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative z-10 animate-in zoom-in-95 duration-500 mt-4 md:mt-10">
        <div className="w-full max-w-[480px] bg-white rounded-sm shadow-[0_10px_40px_rgba(74,31,88,0.05)] border border-[#E9D8C3] p-8 md:p-12 text-center relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C9A15B]" />
          
          <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" strokeWidth={2} />
          </div>

          <div className="space-y-3 mb-8">
            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#4A1F58] leading-tight">
              Order Confirmed
            </h1>
            <p className="text-sm font-sans text-zinc-500 px-2 leading-relaxed">
              Thank you for your purchase. We have sent your receipt and confirmation details directly to your email and WhatsApp.
            </p>
          </div>

          <div className="bg-[#F7F1E8]/50 rounded-sm p-5 border border-[#E9D8C3] flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <span className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-[0.2em]">
              Order Number
            </span>
            <span className="text-lg font-sans font-bold text-[#302832] tracking-wider">
              {displayOrderId}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-10">
            <button 
              onClick={() => setShowReceipt(true)}
              className="flex-1 bg-white border border-[#E9D8C3] hover:border-[#C9A15B] text-[#4A1F58] hover:bg-[#F7F1E8]/50 h-11 rounded-sm text-[10px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-[#C9A15B]" /> View Receipt
            </button>
            <button 
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
              className="flex-1 bg-white border border-[#E9D8C3] hover:border-[#C9A15B] text-[#4A1F58] hover:bg-[#F7F1E8]/50 h-11 rounded-sm text-[10px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              {isDownloading ? <Loader2 className="w-3.5 h-3.5 text-[#C9A15B] animate-spin" /> : <Download className="w-3.5 h-3.5 text-[#C9A15B]" />}
              {isDownloading ? "Generating..." : "Download PDF"}
            </button>
          </div>

          <div className="space-y-3 border-t border-zinc-100 pt-8">
            {/* ✨ UPDATED ROUTE: Points to the unified Account dashboard */}
            <Link 
              to="/Account"
              className="w-full bg-[#4A1F58] hover:bg-[#302832] text-white font-sans font-bold text-[10px] tracking-[0.2em] uppercase h-12 rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" /> View Order History
            </Link>
            
            <Link 
              to="/" 
              className="w-full bg-transparent text-zinc-500 hover:text-[#4A1F58] font-sans font-bold text-[10px] tracking-[0.2em] uppercase h-12 rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      {/* ========================================== */}
      {/* ON-SCREEN E-RECEIPT MODAL */}
      {/* ========================================== */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FCF9F5] rounded-md shadow-2xl max-w-md w-full overflow-hidden border border-[#E9D8C3] relative">
            <div className="bg-[#4A1F58] p-5 text-center relative">
              <button onClick={() => setShowReceipt(false)} className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <Logo className="h-6 w-auto mx-auto brightness-0 invert opacity-90" />
            </div>

            <div className="p-6 font-mono text-xs text-zinc-700 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="text-center mb-6 border-b border-zinc-200 border-dashed pb-4">
                <h2 className="text-lg font-bold text-[#302832] mb-1">E-RECEIPT</h2>
                <p className="text-[10px] text-zinc-500">
                  {orderData?.created_at ? new Date(orderData.created_at).toLocaleString() : new Date().toLocaleString()}
                </p>
                <p className="text-[11px] font-bold text-[#302832] mt-2">Order No: {displayOrderId}</p>
              </div>

              {isLoadingOrder ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
              ) : (
                <>
                  <div className="mb-6 border-b border-zinc-200 border-dashed pb-4 space-y-1.5">
                    <p className="font-bold text-[#302832] uppercase mb-2 text-[10px] tracking-widest">Billed To:</p>
                    <p>{orderData?.customer_name || "Guest Customer"}</p>
                    <p>{orderData?.customer_email || "N/A"}</p>
                    <p>{orderData?.customer_phone || "N/A"}</p>
                  </div>

                  <div className="mb-6 border-b border-zinc-200 border-dashed pb-4">
                    <p className="font-bold text-[#302832] uppercase mb-3 text-[10px] tracking-widest">Items Purchased:</p>
                    {orderItems.length > 0 ? (
                      <div className="space-y-3">
                        {orderItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-[#302832] leading-tight line-clamp-2">
                                {item.ecommerce_products?.title || "Jewellery Item"}
                              </p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">Qty: {item.quantity}</p>
                            </div>
                            <span className="font-bold shrink-0">₹{(item.total_price || 0).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-500 italic">No item details found.</p>
                    )}
                  </div>

                  <div className="space-y-2.5 mb-6 border-b border-zinc-200 border-dashed pb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-[#302832]">Total Amount:</span>
                      <span className="font-bold text-[#4A1F58] text-base">
                        ₹{(orderData?.final_total || orderData?.total_amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-zinc-500">Payment Status:</span>
                      <span className={`font-bold uppercase ${orderData?.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {orderData?.payment_status || "Processing"}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2 mb-8">
                <p className="text-[10px] leading-relaxed text-zinc-500 text-center font-sans">
                  We will send you the detailed tax invoice and order details on your registered email and WhatsApp number.
                </p>
              </div>

              <button 
                onClick={handleDownloadInvoice}
                disabled={isDownloading}
                className="w-full bg-white border border-[#E9D8C3] hover:border-[#C9A15B] text-[#4A1F58] font-sans font-bold text-[10px] tracking-widest uppercase h-10 rounded-sm transition-colors flex justify-center items-center gap-2"
              >
                {isDownloading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Download Direct PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}