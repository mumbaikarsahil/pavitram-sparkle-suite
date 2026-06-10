import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/stores")({
  head: () => ({
    meta: [
      { title: "Store Locator — Pavitram Boutiques Across India" },
      { name: "description", content: "Find a Pavitram diamond jewellery boutique near you — Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Kolkata." },
    ],
    links: [{ rel: "canonical", href: "/stores" }],
  }),
  component: StoresPage,
});

function StoresPage() {
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => (await supabase.from("store_locations").select("*").order("city")).data ?? [],
  });
  const filtered = (data ?? []).filter((s) =>
    !q || s.city.toLowerCase().includes(q.toLowerCase()) || (s.pincode ?? "").includes(q)
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--plum)]">Store Locator</p>
      <h1 className="font-serif text-4xl lg:text-5xl mt-3">Visit a Pavitram boutique</h1>
      <div className="gold-divider w-24 mt-3 mb-8" />

      <div className="max-w-md">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by city or pincode" className="w-full rounded-full border hairline bg-card px-5 py-3 text-sm outline-none focus:border-[color:var(--plum)]" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {filtered.map((s) => (
          <div key={s.id} className="rounded-2xl border hairline bg-card p-6 shadow-[var(--shadow-soft)]">
            <p className="text-[11px] uppercase tracking-widest text-[color:var(--plum)]">{s.state}</p>
            <h3 className="font-serif text-xl mt-2">{s.name}</h3>
            <div className="gold-divider w-12 my-3" />
            <p className="text-sm text-muted-foreground flex gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /> {s.address}</p>
            {s.phone && <p className="text-sm text-muted-foreground flex gap-2 mt-2"><Phone className="h-4 w-4 shrink-0 mt-0.5" /> {s.phone}</p>}
            {s.hours && <p className="text-sm text-muted-foreground flex gap-2 mt-2"><Clock className="h-4 w-4 shrink-0 mt-0.5" /> {s.hours}</p>}
            <div className="mt-5 flex gap-3">
              <a href={`tel:${s.phone}`} className="flex-1 rounded-full bg-[color:var(--primary-soft)] text-[color:var(--plum-deep)] text-center py-2.5 text-sm">Call</a>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(s.address + ", " + s.city)}`} target="_blank" rel="noreferrer" className="flex-1 rounded-full bg-primary text-primary-foreground text-center py-2.5 text-sm inline-flex items-center justify-center gap-1.5">Map <ExternalLink className="h-3.5 w-3.5" /></a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
