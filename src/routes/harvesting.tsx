import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Users, Gift, Music, Cake, Gamepad2, Handshake, 
  CalendarHeart, Sparkles, IndianRupee, ShieldCheck,
  ChevronRight, Star
} from "lucide-react";

export const Route = createFileRoute('/harvesting')({
  component: CelebrationClubPage,
});

function CelebrationClubPage() {
  const features = [
    {
      icon: Users,
      title: "Monthly Lunch, High Tea & Dinner",
      desc: "Come together with the Pavitram family over memorable meals and beautiful conversations."
    },
    {
      icon: Gift,
      title: "Signature Housie",
      desc: "Enjoy our signature housie experience with exciting prizes, including real diamond jewellery."
    },
    {
      icon: Music,
      title: "DJ, Dance & Dhamaal",
      desc: "Let your hair down, enjoy the music and make every gathering a celebration."
    },
    {
      icon: Cake,
      title: "Birthday Celebrations",
      desc: "Celebrate birthdays together with special moments and gifts."
    },
    {
      icon: Gamepad2,
      title: "Games & Entertainment",
      desc: "Fun, laughter and activities that bring our community closer."
    },
    {
      icon: Handshake,
      title: "Socialise & Network",
      desc: "Meet new people, build connections and become part of the Pavitram community."
    },
    {
      icon: Sparkles,
      title: "Special Occasions",
      desc: "Because life's special moments are even better when celebrated together."
    },
    {
      icon: CalendarHeart,
      title: "Festival Celebrations",
      desc: "Celebrate the festive spirit with the Pavitram family throughout the year."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "CHOOSE YOUR AMOUNT",
      desc: "Invest any amount every month based on what works for you."
    },
    {
      num: "02",
      title: "BECOME PART OF THE FAMILY",
      desc: "Join the Pavitram Celebration Club community."
    },
    {
      num: "03",
      title: "CELEBRATE EVERY MONTH",
      desc: "Enjoy complimentary monthly celebrations, Signature Housie, games, entertainment and special occasions."
    },
    {
      num: "04",
      title: "COMPLETE 12 MONTHS",
      desc: "Continue your monthly contributions throughout the membership period."
    },
    {
      num: "05",
      title: "REDEEM YOUR JEWELLERY",
      desc: "At the end of the membership period, redeem your eligible jewellery value as per the applicable plan terms."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#302832]">
      
      {/* HERO SECTION */}
      <section className="relative bg-[#F7F1E8] border-b border-[#E9D8C3] overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        <img 
          src="https://mfdjlbvqfbujipihehpt.supabase.co/storage/v1/object/public/ecommerce-assets/banner_images/back_layer.webp" 
          alt="Decorative Floral" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none mix-blend-multiply"
        />
        <div className="relative z-10 max-w-[1000px] mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E9D8C3] text-[10px] font-sans font-bold uppercase tracking-widest text-[#C9A15B] mb-8 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-[#C9A15B]" /> Where Every Month is a Celebration
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium text-[#4A1F58] mb-6 leading-tight">
            Pavitram Celebration Club
          </h1>
          <p className="text-sm md:text-base font-sans font-bold uppercase tracking-[0.2em] text-[#C9A15B] mb-8">
            A Community. A Family. A Reason To Celebrate Every Month.
          </p>
          <p className="text-base md:text-lg font-sans text-zinc-600 max-w-3xl mx-auto leading-relaxed mb-6">
            Welcome to the Pavitram Celebration Club a special community created to bring people together, create beautiful memories and make every month worth celebrating.
          </p>
          <p className="text-base md:text-lg font-sans text-zinc-600 max-w-3xl mx-auto leading-relaxed">
            As a member, you become part of the Pavitram family a community where celebrations don't wait for special occasions. Every month brings a new opportunity to meet, laugh, play, celebrate and create memories together.
          </p>
          <p className="text-lg md:text-xl font-serif font-medium text-[#4A1F58] mt-10">
            Because at Pavitram, every month deserves a little sparkle.
          </p>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 md:py-28 max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58] mb-4">
            More Than A Plan. It's A Celebration Family.
          </h2>
          <p className="text-sm font-sans text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            The Pavitram Celebration Club is designed around one simple idea: celebrating life together. From festive gatherings and elegant lunches to music, games, Signature Housie and birthday celebrations, there's always something happening and someone to celebrate with.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white border border-[#E9D8C3] p-8 rounded-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-[#F7F1E8] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#4A1F58] transition-colors">
                <feature.icon className="w-6 h-6 text-[#C9A15B] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-serif font-medium text-[#4A1F58] uppercase tracking-[0.1em] mb-3 leading-snug">
                {feature.title}
              </h3>
              <p className="text-xs font-sans text-zinc-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FINANCIAL HIGHLIGHT SECTION */}
      <section className="bg-[#4A1F58] text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-3xl md:text-5xl font-serif font-medium mb-6 leading-tight">
              Your Monthly Contribution. <br/><span className="text-[#C9A15B]">Your Jewellery Reward.</span>
            </h2>
            <p className="text-sm md:text-base font-sans text-white/80 leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
              You can choose to invest any amount every month, based on what works for you. For example, if you invest 5,000 every month for 12 months, your total contribution would be 60,000. At the end of 12 months, you can redeem diamond jewellery worth 65,000, as per the applicable membership terms.
            </p>
            <p className="text-sm md:text-base font-sans font-bold text-white max-w-xl mx-auto lg:mx-0">
              So while your jewellery value grows, your experiences grow too — with a full year of celebrations, connections and memories with the Pavitram family.
            </p>
          </div>

          <div className="w-full lg:w-[450px] shrink-0 bg-white rounded-sm p-8 md:p-10 shadow-2xl text-[#302832]">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-[#E9D8C3] pb-4">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-zinc-500">Your Monthly Contribution</span>
                <span className="text-lg font-serif font-medium text-[#4A1F58]">₹ 5,000</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E9D8C3] pb-4">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-zinc-500">Membership Period</span>
                <span className="text-lg font-serif font-medium text-[#4A1F58]">12 Months</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E9D8C3] pb-4">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-zinc-500">Your Total Contribution</span>
                <span className="text-lg font-serif font-medium text-[#4A1F58]">₹ 60,000</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E9D8C3] pb-4 bg-[#F7F1E8] -mx-8 px-8 py-4">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#4A1F58]">Jewellery Value At The End</span>
                <span className="text-2xl font-serif font-medium text-[#C9A15B]">₹ 65,000</span>
              </div>
              <div className="flex items-start gap-3 pt-2">
                <div className="mt-1 bg-[#4A1F58]/10 p-1.5 rounded-full"><Sparkles className="w-4 h-4 text-[#4A1F58]" /></div>
                <div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#4A1F58] block mb-1">Plus</span>
                  <span className="text-xs font-sans text-zinc-600">Celebrations every month at no additional cost</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ADDITIONAL BENEFITS */}
      <section className="py-20 md:py-28 bg-white border-b border-[#E9D8C3]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#4A1F58] mb-6">
              Earn Loyalty Points. Add More Sparkle.
            </h2>
            <p className="text-sm font-sans text-zinc-600 leading-relaxed mb-4">
              As a Pavitram Celebration Club member, you can also earn Pavitram Loyalty Points by participating in eligible activities.
            </p>
            <p className="text-sm font-sans text-zinc-600 leading-relaxed">
              Your loyalty, participation and connection with the Pavitram family can bring you even more opportunities to enjoy rewards.
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#4A1F58] mb-6">
              A Little More For Your Jewellery Journey
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#C9A15B] shrink-0 mt-0.5" />
                <span className="text-sm font-sans text-zinc-600 leading-relaxed">Enjoy Pavitram's lifetime exchange facility, available as per applicable terms.</span>
              </li>
              <li className="flex items-start gap-3">
                <IndianRupee className="w-5 h-5 text-[#C9A15B] shrink-0 mt-0.5" />
                <span className="text-sm font-sans text-zinc-600 leading-relaxed">We do not deduct labour charges while exchanging your jewellery.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 md:py-28 bg-[#F7F1E8]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#4A1F58]">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white border border-[#E9D8C3] rounded-full flex items-center justify-center text-xl font-serif font-medium text-[#C9A15B] mb-6 z-10 shadow-sm">
                  {step.num}
                </div>
                {idx !== steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-[1px] bg-[#E9D8C3] z-0" />
                )}
                <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.15em] text-[#4A1F58] mb-3 min-h-[30px]">
                  {step.title}
                </h3>
                <p className="text-xs font-sans text-zinc-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 md:py-32 bg-white text-center px-4">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif font-medium text-[#4A1F58] mb-6">
            Ready To Celebrate With Us? <br/> Join The Pavitram Family.
          </h2>
          <p className="text-sm md:text-base font-sans text-zinc-600 mb-10 leading-relaxed">
            Become a Pavitram Celebration Club member and make every month a little more special with celebrations, community, experiences and the sparkle of real diamond jewellery.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-[#4A1F58] hover:bg-[#302832] text-white text-[11px] font-sans font-bold uppercase tracking-[0.2em] rounded-sm transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              Become A Celebration Club Member <ChevronRight className="w-4 h-4" />
            </Link>
            <a 
              href="https://wa.me/918356834764?text=Hi!%20I%20would%20like%20to%20enquire%20about%20the%20Pavitram%20Celebration%20Club."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-white border border-[#E9D8C3] hover:border-[#C9A15B] text-[#4A1F58] text-[11px] font-sans font-bold uppercase tracking-[0.2em] rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Enquire Now
            </a>
          </div>

          <p className="mt-12 text-sm font-sans font-bold uppercase tracking-[0.2em] text-[#C9A15B]">
            Pavitram Jo Deta Hai, Woh Koi Nahi Deta!
          </p>
        </div>
      </section>

    </div>
  );
}