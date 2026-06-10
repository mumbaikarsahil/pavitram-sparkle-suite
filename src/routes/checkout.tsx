import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Pavitram" }] }),
  component: CheckoutPage,
});

const STEPS = ["Address", "Delivery", "Payment", "Review"];

function CheckoutPage() {
  const [step, setStep] = useState(0);
  const total = 68672;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-serif text-3xl">Secure Checkout</h1>
      <div className="gold-divider w-24 mt-3 mb-8" />

      <div className="flex items-center gap-3 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3 flex-1">
            <div className={`h-8 w-8 grid place-items-center rounded-full text-xs font-medium ${i <= step ? "bg-[color:var(--plum)] text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-[color:var(--plum)]" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="rounded-2xl border hairline bg-card p-8 min-h-[320px]">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl">Shipping Address</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Full Name" />
                <Input label="Phone" />
                <Input label="Pincode" />
                <Input label="City" />
                <Input label="State" />
                <Input label="Address line 1" full />
                <Input label="Address line 2" full />
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <h2 className="font-serif text-xl mb-4">Delivery Method</h2>
              <div className="space-y-3">
                {["Standard (3–7 days · Free)", "Express (1–3 days · ₹299)"].map((d) => (
                  <label key={d} className="flex items-center gap-3 rounded-lg border hairline p-4 cursor-pointer hover:border-[color:var(--plum)]">
                    <input type="radio" name="del" className="accent-[color:var(--plum)]" defaultChecked={d.startsWith("Standard")} />
                    <span className="text-sm">{d}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="font-serif text-xl mb-4">Payment Method</h2>
              <div className="space-y-3">
                {["UPI / Cards / Net Banking (Prepaid)", "Cash on Delivery (COD)"].map((d) => (
                  <label key={d} className="flex items-center gap-3 rounded-lg border hairline p-4 cursor-pointer hover:border-[color:var(--plum)]">
                    <input type="radio" name="pay" className="accent-[color:var(--plum)]" defaultChecked={d.startsWith("UPI")} />
                    <span className="text-sm">{d}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="font-serif text-xl mb-4">Review Your Order</h2>
              <p className="text-sm text-muted-foreground">Please confirm your details before placing the order.</p>
              <div className="mt-6 space-y-2 text-sm">
                <p><span className="text-muted-foreground">Ship to:</span> Your saved address</p>
                <p><span className="text-muted-foreground">Delivery:</span> Standard, Free</p>
                <p><span className="text-muted-foreground">Payment:</span> UPI / Card</p>
              </div>
              <Link to="/" className="mt-8 inline-flex rounded-full bg-[color:var(--gold)] text-[color:var(--plum-deep)] px-7 py-3.5 text-sm font-medium hover:opacity-90">Place Order</Link>
            </div>
          )}

          <div className="mt-10 flex justify-between">
            <button disabled={step === 0} onClick={() => setStep(step - 1)} className="text-sm text-muted-foreground disabled:opacity-30">← Back</button>
            {step < STEPS.length - 1 && (
              <button onClick={() => setStep(step + 1)} className="rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground">Continue →</button>
            )}
          </div>
        </div>

        <aside className="rounded-2xl border hairline bg-card p-6 h-fit">
          <h3 className="font-serif text-lg">Order Total</h3>
          <div className="gold-divider my-3" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between"><span>Subtotal</span><span>{inr(total - 0)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
            <div className="flex justify-between text-foreground font-medium border-t hairline pt-3 mt-3"><span>Total</span><span>{inr(total)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
function Input({ label, full }: { label: string; full?: boolean }) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input className="mt-1.5 w-full rounded-md border hairline bg-background px-3 py-2.5 text-sm outline-none focus:border-[color:var(--plum)]" />
    </label>
  );
}
