import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { inr } from "@/lib/format";
import { productImage } from "@/lib/product-image";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Pavitram" }] }),
  component: CartPage,
});

const DEMO = [
  { slug: "twist-diamond-pendant", name: "Twist Diamond Pendant", variant: "18KT Rose Gold", price: 29760, qty: 1 },
  { slug: "floral-diamond-stud", name: "Floral Diamond Stud Earrings", variant: "18KT Yellow Gold", price: 38912, qty: 1 },
];

function CartPage() {
  const [items, setItems] = useState(DEMO);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 5000 ? 0 : 199;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-serif text-3xl lg:text-4xl">Your Cart</h1>
      <div className="gold-divider w-24 mt-3 mb-8" />

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="font-serif text-xl mt-4">Your cart is empty</p>
          <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Continue shopping</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-10">
          <div className="space-y-4">
            {items.map((i, idx) => (
              <div key={i.slug} className="flex gap-4 rounded-xl border hairline bg-card p-4">
                <img src={productImage(i.slug)} alt={i.name} className="h-28 w-28 object-cover rounded-lg" />
                <div className="flex-1">
                  <Link to="/product/$slug" params={{ slug: i.slug }} className="font-serif text-lg hover:text-[color:var(--plum)]">{i.name}</Link>
                  <p className="text-xs text-muted-foreground">{i.variant}</p>
                  <p className="mt-2 font-medium">{inr(i.price)}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="inline-flex items-center rounded-full border hairline">
                      <button className="p-2" onClick={() => setItems(items.map((x, j) => j === idx ? { ...x, qty: Math.max(1, x.qty - 1) } : x))}><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-sm">{i.qty}</span>
                      <button className="p-2" onClick={() => setItems(items.map((x, j) => j === idx ? { ...x, qty: x.qty + 1 } : x))}><Plus className="h-3 w-3" /></button>
                    </div>
                    <button onClick={() => setItems(items.filter((_, j) => j !== idx))} className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                    <button className="text-xs text-muted-foreground hover:text-foreground">Save for later</button>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-xl border hairline bg-card p-4 flex gap-3">
              <input placeholder="Have a coupon code?" className="flex-1 bg-transparent text-sm outline-none px-2" />
              <button className="rounded-full bg-foreground text-background px-5 text-sm">Apply</button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border hairline bg-card p-6">
              <h2 className="font-serif text-xl">Order Summary</h2>
              <div className="gold-divider my-4" />
              <div className="space-y-2 text-sm">
                <Row label="Subtotal" value={inr(subtotal)} />
                <Row label="Shipping" value={shipping === 0 ? "Free" : inr(shipping)} />
                <div className="border-t hairline pt-3 mt-3" />
                <Row label="Total" value={inr(total)} strong />
              </div>
              <Link to="/checkout" className="mt-6 block rounded-full bg-primary text-center text-primary-foreground py-3.5 text-sm font-medium hover:shadow-[var(--shadow-card)]">Secure Checkout</Link>
              <p className="text-[11px] text-center text-muted-foreground mt-3">Free insured shipping on orders above ₹5,000</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex justify-between ${strong ? "font-medium text-base" : "text-muted-foreground"}`}><span>{label}</span><span className={strong ? "text-foreground" : ""}>{value}</span></div>;
}
