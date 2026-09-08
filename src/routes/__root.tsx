import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

// ✨ NEW: Import Lenis for Premium Smooth Scrolling
import { ReactLenis } from 'lenis/react';

import appCss from "../styles.css?url";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { MobileBottomNav } from "../components/site/MobileBottomNav";
import { Toaster } from "../components/ui/sonner";
import { CartProvider } from '@/context/CartContext';

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-6xl text-foreground">404</h1>
        <div className="gold-divider w-24 mx-auto my-4" />
        <h2 className="text-xl font-medium">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Try again
          </button>
          <a href="/" className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Pavitram Diamond Jewellery — Timeless Elegance. Crafted for You." },
      { name: "description", content: "Pavitram Diamond Jewellery — BIS hallmarked gold, IGI-certified diamonds, premium Indian craftsmanship since 1990. Shop rings, earrings, pendants, mangalsutras and bridal jewellery." },
      { name: "author", content: "Pavitram Diamond Jewellery" },
      { property: "og:title", content: "Pavitram Diamond Jewellery" },
      { property: "og:description", content: "Timeless designs. Trusted since 1990." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Pavitram Diamond Jewellery" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#3b1f4a" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Pavitram Diamond Jewellery",
        slogan: "Timeless Elegance. Crafted for You.",
        foundingDate: "1990",
        sameAs: [],
      }),
    }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthRoute = pathname.startsWith("/auth");

  return (
  <CartProvider>
    <QueryClientProvider client={queryClient}>
      {/* ✨ WRAPPED APP IN PREMIUM SMOOTH SCROLL */}
      <ReactLenis root options={{ lerp: 0.07, duration: 1.2, smoothWheel: true }}>
        <div className="flex min-h-screen flex-col pb-16 md:pb-0">
          {!isAuthRoute && <Header />}
          <main className="flex-1">
            <Outlet />
          </main>
          {!isAuthRoute && <Footer />}
          {!isAuthRoute && <MobileBottomNav />}
        </div>
      </ReactLenis>
      <Toaster />
    </QueryClientProvider>
  </CartProvider>
  );
}