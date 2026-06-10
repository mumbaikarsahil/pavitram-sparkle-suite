import { createFileRoute, Link } from "@tanstack/react-router";
import { User, Package, MapPin, Heart, Calendar, LogOut } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — Pavitram" }] }),
  component: AccountPage,
});

const TILES = [
  { icon: Package, label: "Orders", desc: "Track and manage your orders" },
  { icon: Heart, label: "Wishlist", desc: "Pieces you love" },
  { icon: MapPin, label: "Addresses", desc: "Manage delivery addresses" },
  { icon: Calendar, label: "Appointments", desc: "Try-at-home & boutique visits" },
  { icon: User, label: "Profile", desc: "Edit personal details" },
  { icon: LogOut, label: "Sign out", desc: "End this session" },
];

function AccountPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-3xl bg-[image:var(--gradient-ivory)] border hairline p-8 lg:p-10 flex items-center gap-6">
        <div className="h-16 w-16 rounded-full bg-[color:var(--plum)] text-primary-foreground grid place-items-center font-serif text-2xl">P</div>
        <div>
          <h1 className="font-serif text-2xl">Welcome to Pavitram</h1>
          <p className="text-sm text-muted-foreground">Sign in to view your orders, addresses and wishlist.</p>
        </div>
        <Link to="/auth" className="ml-auto rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm">Sign in</Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
        {TILES.map(({ icon: I, label, desc }) => (
          <button key={label} className="group text-left rounded-2xl border hairline bg-card p-6 hover:shadow-[var(--shadow-card)] transition-shadow">
            <div className="h-11 w-11 rounded-full bg-[color:var(--primary-soft)] text-[color:var(--plum)] grid place-items-center"><I className="h-5 w-5" /></div>
            <p className="font-serif text-lg mt-4">{label}</p>
            <p className="text-sm text-muted-foreground mt-1">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
