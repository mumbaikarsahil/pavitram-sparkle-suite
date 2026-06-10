import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Instagram, Facebook, Youtube } from "lucide-react";

const cols = [
  {
    title: "Shop",
    links: [
      ["Rings", "/category/rings"],
      ["Earrings", "/category/earrings"],
      ["Pendants", "/category/necklaces-pendants"],
      ["Mangalsutras", "/category/mangalsutras"],
      ["All Jewellery", "/category/rings"],
    ],
  },
  {
    title: "Customer Service",
    links: [
      ["Track Order", "/account"],
      ["Returns & Exchange", "/policy/returns-policy"],
      ["Shipping Policy", "/policy/shipping-policy"],
      ["FAQs", "/policy/faqs"],
      ["Contact Us", "/policy/contact"],
    ],
  },
  {
    title: "About Us",
    links: [
      ["Our Story", "/policy/about"],
      ["Craftsmanship", "/policy/about"],
      ["Certification", "/policy/about"],
      ["Store Locator", "/stores"],
      ["Careers", "/policy/contact"],
    ],
  },
  {
    title: "Policies",
    links: [
      ["Privacy Policy", "/policy/privacy-policy"],
      ["Terms & Conditions", "/policy/terms"],
      ["Return Policy", "/policy/returns-policy"],
      ["Cancellation Policy", "/policy/cancellation-policy"],
      ["Cookie Policy", "/policy/cookie-policy"],
      ["Grievance", "/policy/grievance-policy"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-[color:var(--plum-deep)] text-[color:var(--ivory)]">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="bg-[color:var(--ivory)] rounded-xl p-4 inline-block">
              <Logo className="h-12 w-auto" />
            </div>
            <p className="mt-6 text-sm text-[color:var(--ivory)]/70 max-w-xs">
              Timeless designs. Trusted since 1990.
            </p>
            <div className="flex items-center gap-4 mt-6 text-[color:var(--ivory)]/80">
              <a href="#" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
              <a href="#" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
              <a href="#" aria-label="Youtube"><Youtube className="h-5 w-5" /></a>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title} className="lg:col-span-2">
              <h4 className="font-serif text-[color:var(--gold)] text-lg mb-4">{c.title}</h4>
              <ul className="space-y-2.5 text-sm text-[color:var(--ivory)]/80">
                {c.links.map(([label, to]) => (
                  <li key={to}><Link to={to} className="hover:text-[color:var(--gold)]">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-3">
            <h4 className="font-serif text-[color:var(--gold)] text-lg mb-4">Newsletter</h4>
            <p className="text-sm text-[color:var(--ivory)]/80 mb-4">Subscribe for exclusive offers and updates.</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-md bg-[color:var(--ivory)]/10 border border-[color:var(--ivory)]/20 px-3 py-2 text-sm placeholder:text-[color:var(--ivory)]/50 outline-none focus:border-[color:var(--gold)]"
              />
              <button className="rounded-md bg-[color:var(--gold)] text-[color:var(--plum-deep)] px-4 text-sm font-medium hover:opacity-90">→</button>
            </form>
            <p className="text-[10px] uppercase tracking-widest text-[color:var(--ivory)]/60 mt-8">100% Secure Payments</p>
            <p className="text-xs text-[color:var(--ivory)]/70 mt-2">VISA · Mastercard · UPI · Razorpay</p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[color:var(--ivory)]/15 flex flex-wrap items-center justify-between gap-4 text-xs text-[color:var(--ivory)]/60">
          <span>© {new Date().getFullYear()} Pavitram Diamond Jewellery. All Rights Reserved.</span>
          <div className="flex flex-wrap gap-5">
            <span>100% Hallmarked Jewellery</span>
            <span>BIS Certified</span>
            <span>IGI / GIA Certified Diamonds</span>
            <span>Ethical Sourcing</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
