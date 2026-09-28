import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail, ChevronDown, ChevronUp, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client"; // Adjust path if needed

const MAIN_COLUMNS = [
  {
    title: "Our Heritage",
    links: [
      { label: "About Pavitram", to: "/about" },
      { label: "Design & Craftsmanship", to: "/heritage" },
      { label: "The Pavitram Promise", to: "/heritage" },
      { label: "Careers", to: "/careers" },
    ],
  },
  {
    title: "Categories",
    links: [
      { label: "Rings", to: "/category/$slug", params: { slug: "rings" } },
      { label: "Earrings", to: "/category/$slug", params: { slug: "earrings" } },
      { label: "Necklaces", to: "/category/$slug", params: { slug: "necklaces" } },
      { label: "Pendants", to: "/category/$slug", params: { slug: "pendants" } },
      { label: "Bangles", to: "/category/$slug", params: { slug: "bangles" } },
      { label: "Mangalsutras", to: "/category/$slug", params: { slug: "mangalsutras" } },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Track Order", to: "/track-order" },
      { label: "Exchange & Buy-Back", to: "/policy/$slug", params: { slug: "exchange-buyback" } },
      { label: "Shipping & Delivery", to: "/policy/$slug", params: { slug: "shipping" } },
      { label: "Terms of Service", to: "/policy/$slug", params: { slug: "terms" } },
      { label: "Gift Vouchers", to: "/policy/$slug", params: { slug: "gift-voucher" } },
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
  
  // Newsletter States
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("ecommerce_newsletter_subscribers")
        .insert([{ email: email.toLowerCase().trim() }]);

      if (error) {
        if (error.code === '23505') throw new Error("This email is already subscribed.");
        throw error;
      }

      setStatus("success");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Failed to subscribe. Please try again.");
    }
  };

  return (
    <footer className="font-sans">
      
      {/* 1. TOP SECTION: Split Full-Bleed Layout */}
      <div className="w-full flex flex-col lg:flex-row border-b border-[#E9D8C3]">
        
        {/* Left Side: Beige Background */}
        <div className="w-full lg:w-[35%] bg-[#F7F1E8] py-12 lg:py-16 px-4 md:px-8 flex lg:justify-end border-b lg:border-b-0 lg:border-r border-[#E9D8C3]">
          <div className="w-full lg:max-w-[490px] lg:pr-8 flex flex-col items-start">
            
            {/* Bigger Logo without the wrapper box */}
            <Link to="/" className="inline-block mb-8 hover:opacity-80 transition-opacity">
              <Logo className="h-16 md:h-20 w-auto text-[#4A1F58]" />
            </Link>

            <p className="text-sm font-sans text-zinc-600 mb-10 leading-relaxed max-w-sm">
              Discover rare & beautiful items sourced both locally & globally. Timeless designs, certified authenticity, and a legacy of trust.
            </p>
            
            <h4 className="font-serif text-[#4A1F58] font-medium text-xl mb-4">Join the Inner Circle</h4>
            
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 w-full max-w-sm">
              <div className="flex gap-2 w-full">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading" || status === "success"}
                  className="flex-1 rounded-sm bg-white border border-[#E9D8C3] px-4 py-3 text-sm text-[#302832] placeholder:text-zinc-400 outline-none focus:border-[#C9A15B] transition-colors shadow-sm disabled:bg-zinc-50"
                />
                <button 
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className="rounded-sm bg-[#4A1F58] text-white px-6 text-[11px] font-bold uppercase tracking-widest hover:bg-[#302832] transition-colors shadow-sm disabled:opacity-80 flex items-center justify-center min-w-[120px]"
                >
                  {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin text-[#C9A15B]" /> : status === "success" ? "Joined" : "Subscribe"}
                </button>
              </div>
              
              {/* Status Messages */}
              <div className="h-4 mt-1">
                {status === "error" && <p className="text-xs text-red-500">{errorMessage}</p>}
                {status === "success" && <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium"><ShieldCheck className="w-3.5 h-3.5"/> Thank you for subscribing!</p>}
              </div>
            </form>

          </div>
        </div>

        {/* Right Side: Royal Purple Background */}
        <div className="w-full lg:w-[65%] bg-[#4A1F58] py-12 lg:py-16 px-4 md:px-8 flex lg:justify-start relative overflow-hidden">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C9A15B]/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="w-full lg:max-w-[910px] lg:pl-10 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-6">
              
              {/* Navigation Links */}
              {MAIN_COLUMNS.map((col) => (
                <div key={col.title}>
                  <h4 className="font-sans font-bold uppercase tracking-[0.15em] text-[#C9A15B] text-[11px] mb-6">
                    {col.title}
                  </h4>
                  <ul className="space-y-3.5 text-[13px] font-sans text-[#F7F1E8]/80">
                    {col.links.map((link, idx) => (
                      <li key={idx}>
                        <Link 
                          to={link.to} 
                          params={link.params} 
                          className="hover:text-[#C9A15B] transition-colors block py-0.5"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Contact & Visit Us */}
              <div>
                <h4 className="font-sans font-bold uppercase tracking-[0.15em] text-[#C9A15B] text-[11px] mb-6">Visit Us</h4>
                <ul className="space-y-5 text-[13px] font-sans text-[#F7F1E8]/80">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#C9A15B] shrink-0 mt-0.5" />
                    <Link to="/stores" className="hover:text-[#C9A15B] transition-colors">Find a Showroom Near You</Link>
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
                    <a href="mailto:info@pavitram.com" className="hover:text-[#C9A15B] transition-colors">info@pavitram.com</a>
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