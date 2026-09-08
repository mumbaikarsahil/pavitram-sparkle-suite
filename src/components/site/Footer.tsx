import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

const MAIN_COLUMNS = [
  {
    title: "Our Heritage",
    links: [
      ["About Pavitram", "/about"],
      ["Design & Craftsmanship", "/about"],
      ["The Pavitram Promise", "/about"],
      ["Careers", "/policy/contact"],
    ],
  },
  {
    title: "Categories",
    links: [
      ["Rings", "/category/rings"],
      ["Earrings", "/category/earrings"],
      ["Necklaces", "/category/necklaces"],
      ["Pendants", "/category/pendants"],
      ["Bangles", "/category/bangles"],
      ["Mangalsutras", "/category/mangalsutras"],
    ],
  },
  {
    title: "Customer Care",
    links: [
      ["Track Order", "/track-order"],
      ["Exchange & Buy-Back", "/policy/returns"],
      ["Shipping & Delivery", "/policy/shipping"],
      ["Terms of Service", "/policy/terms"],
      ["Privacy Policy", "/policy/privacy"],
    ],
  },
];

const SEO_LINKS = [
  {
    title: "Jewellery",
    items: ["Earrings", "Rings", "Necklaces", "Bangles", "Mangalsutras", "Pendants", "Bracelets", "Chains"]
  },
  {
    title: "By Categories",
    items: [
      { label: "Earrings", links: ["Drop Earrings", "Hoop Earrings", "Stud Earrings", "Modern Earrings", "Traditional Earrings", "Statement Earrings"] },
      { label: "Necklace", links: ["Short Necklace", "Choker Necklace", "Long Necklace", "Lariat Necklace", "Traditional Necklace", "Classic Necklace", "Statement Necklaces"] },
      { label: "Mangalsutra", links: ["Mangalsutra Pendant", "Mangalsutra Bracelet", "Modern Mangalsutra", "Traditional Mangalsutra", "Mangalsutra Chain"] },
      { label: "Rings", links: ["Band Rings", "Traditional Rings", "Classic Rings", "Modern Rings", "Statement Rings", "Rings For Men", "Couple Bands"] },
      { label: "Bangles & Bracelets", links: ["Tennis Bracelets", "Classic Bracelets", "Oval Bangles", "Single Bangle Design", "Traditional Bangles", "Kada"] }
    ]
  },
  {
    title: "Wedding Jewellery",
    items: ["Bridal Sets", "Engagement Rings", "Wedding Bands", "Trousseau Essentials", "Bridal Necklaces", "Heavy Bangles"]
  },
  {
    title: "Find the nearest Pavitram Store",
    items: ["Mumbai", "Pune", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Surat", "Jaipur", "Chandigarh", "Kolkata", "Indore", "Thane", "Navi Mumbai"]
  }
];

export function Footer() {
  const [isSeoExpanded, setIsSeoExpanded] = useState(false);

  return (
    <footer className="font-sans">
      
      {/* 1. TOP SECTION: Royal Purple Anchor */}
      <div className="bg-[#4A1F58] pt-16 pb-12 relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C9A15B]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-[1400px] px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
            
            {/* Brand & Newsletter Column */}
            <div className="lg:col-span-4 lg:pr-8">
              <div className="bg-[#F7F1E8] rounded-sm p-3 inline-block mb-6 shadow-sm">
                <Logo className="h-8 w-auto" />
              </div>
              <p className="text-sm font-sans text-[#F7F1E8]/80 mb-8 leading-relaxed max-w-sm">
                Discover rare & beautiful items sourced both locally & globally. Timeless designs, certified authenticity, and a legacy of trust.
              </p>
              
              <h4 className="font-serif text-[#C9A15B] font-medium text-lg mb-3">Join the Inner Circle</h4>
              <form className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-sm bg-[#302832]/50 border border-[#C9A15B]/30 px-4 py-2.5 text-sm text-[#F7F1E8] placeholder:text-[#F7F1E8]/40 outline-none focus:border-[#C9A15B] transition-colors"
                />
                <button className="rounded-sm bg-[#C9A15B] text-[#4A1F58] px-6 text-[11px] font-bold uppercase tracking-widest hover:bg-[#F7F1E8] transition-colors">
                  Subscribe
                </button>
              </form>
            </div>

            {/* Navigation Links */}
            {MAIN_COLUMNS.map((col) => (
              <div key={col.title} className="lg:col-span-2">
                <h4 className="font-sans font-bold uppercase tracking-[0.15em] text-[#C9A15B] text-[11px] mb-5">{col.title}</h4>
                <ul className="space-y-3 text-[13px] font-sans text-[#F7F1E8]/80">
                  {col.links.map(([label, to]) => (
                    <li key={to}>
                      <Link to={to} className="hover:text-[#C9A15B] transition-colors block py-0.5">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact & Visit Us */}
            <div className="lg:col-span-2">
              <h4 className="font-sans font-bold uppercase tracking-[0.15em] text-[#C9A15B] text-[11px] mb-5">Visit Us</h4>
              <ul className="space-y-4 text-[13px] font-sans text-[#F7F1E8]/80">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C9A15B] shrink-0 mt-0.5" />
                  <Link to="/stores" className="hover:text-[#C9A15B] transition-colors">Find a Boutique Near You</Link>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#C9A15B] shrink-0 mt-0.5" />
                  <div>
                    <a href="tel:+918356834764" className="hover:text-[#C9A15B] transition-colors block">+91 83568 34764</a>
                    <span className="text-[10px] text-[#F7F1E8]/50 mt-0.5 block uppercase tracking-widest">Mon-Sun, 11AM - 8:30PM</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#C9A15B] shrink-0 mt-0.5" />
                  <a href="mailto:support@pavitram.com" className="hover:text-[#C9A15B] transition-colors">support@pavitram.com</a>
                </li>
              </ul>

              <h4 className="font-sans font-bold uppercase tracking-[0.15em] text-[#C9A15B] text-[11px] mb-4 mt-8">Follow Us</h4>
              <div className="flex items-center gap-3">
                <a href="#" className="w-10 h-10 rounded-sm border border-[#C9A15B]/30 bg-transparent flex items-center justify-center text-[#F7F1E8] hover:bg-[#C9A15B] hover:text-[#4A1F58] hover:border-[#C9A15B] transition-all"><Instagram className="w-4 h-4" /></a>
                <a href="#" className="w-10 h-10 rounded-sm border border-[#C9A15B]/30 bg-transparent flex items-center justify-center text-[#F7F1E8] hover:bg-[#C9A15B] hover:text-[#4A1F58] hover:border-[#C9A15B] transition-all"><Facebook className="w-4 h-4" /></a>
                <a href="#" className="w-10 h-10 rounded-sm border border-[#C9A15B]/30 bg-transparent flex items-center justify-center text-[#F7F1E8] hover:bg-[#C9A15B] hover:text-[#4A1F58] hover:border-[#C9A15B] transition-all"><Youtube className="w-4 h-4" /></a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. BOTTOM SECTION: Beige SEO Deep Links */}
      <div className="bg-[#F7F1E8] border-b border-[#E9D8C3]">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-8">
          <button 
            onClick={() => setIsSeoExpanded(!isSeoExpanded)}
            className="w-full flex items-center justify-between text-left md:hidden mb-4"
          >
            <span className="font-sans font-bold uppercase tracking-[0.15em] text-[#302832] text-[11px]">Explore More Categories</span>
            {isSeoExpanded ? <ChevronUp className="w-4 h-4 text-[#4A1F58]" /> : <ChevronDown className="w-4 h-4 text-[#4A1F58]" />}
          </button>

          <div className={`space-y-8 ${isSeoExpanded ? 'block' : 'hidden md:block'}`}>
            {SEO_LINKS.map((section, idx) => (
              <div key={idx}>
                <h5 className="text-[11px] font-sans font-bold text-[#302832] mb-3">{section.title}</h5>
                
                {/* Handle nested By Category structure */}
                {section.title === "By Categories" ? (
                  <div className="space-y-2.5">
                    {(section.items as any[]).map((subItem, sIdx) => (
                      <div key={sIdx} className="text-[11px] font-sans text-zinc-500 leading-relaxed flex flex-wrap items-center gap-x-2 gap-y-1">
                        <strong className="text-zinc-800 font-semibold">{subItem.label}:</strong>
                        {subItem.links.map((link: string, lIdx: number) => (
                          <React.Fragment key={lIdx}>
                            <Link to="/Search" className="hover:text-[#C9A15B] transition-colors">{link}</Link>
                            {lIdx < subItem.links.length - 1 && <span className="text-zinc-300">|</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Handle flat lists */
                  <div className="text-[11px] font-sans text-zinc-500 leading-relaxed flex flex-wrap items-center gap-x-2 gap-y-1">
                    {(section.items as string[]).map((item, iIdx) => (
                      <React.Fragment key={iIdx}>
                        <Link to="/Search" className="hover:text-[#C9A15B] transition-colors">{item}</Link>
                        {iIdx < section.items.length - 1 && <span className="text-zinc-300">|</span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. ABSOLUTE BOTTOM: Copyright & Trust Badges */}
      <div className="bg-[#F7F1E8]">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-sans text-zinc-500">
            © {new Date().getFullYear()} Ossam Jewels Pvt Ltd. All Rights Reserved.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-zinc-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#C9A15B]" /> 100% Secure</span>
            <span>BIS Hallmarked</span>
            <span>IGI / SGL Certified</span>
            <span>Ethical Sourcing</span>
          </div>
        </div>
      </div>

    </footer>
  );
}