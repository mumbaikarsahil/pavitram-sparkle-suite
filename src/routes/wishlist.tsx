import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Pavitram" }] }),
  component: () => (
    <div className="mx-auto max-w-5xl px-6 py-20 text-center">
      <Heart className="h-12 w-12 mx-auto text-[color:var(--plum)]" />
      <h1 className="font-serif text-3xl mt-6">Your Wishlist</h1>
      <p className="text-muted-foreground mt-2">Sign in to view and sync your wishlist across devices.</p>
      <Link to="/auth" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Sign in</Link>
    </div>
  ),
});
