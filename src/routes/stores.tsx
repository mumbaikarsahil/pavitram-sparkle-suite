import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { StoreLocator } from "@/components/site/StoreLocator";

// 1. Define the expected URL search parameters
type StoreSearchDeps = {
  q?: string;
  lat?: number;
  lng?: number;
};

export const Route = createFileRoute('/stores')({
  component: StoresPage,
  // 2. Validate and parse the search parameters from the URL
  validateSearch: (search: Record<string, unknown>): StoreSearchDeps => {
    return {
      q: search.q as string | undefined,
      lat: search.lat ? Number(search.lat) : undefined,
      lng: search.lng ? Number(search.lng) : undefined,
    };
  },
});

function StoresPage() {
  // 3. Extract the parameters
  const { q, lat, lng } = Route.useSearch();

  // 4. Format the GPS coordinates if they exist
  const initialLocation = lat && lng ? { lat, lng } : null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] md:bg-white pt-8 md:pt-12 pb-24 font-sans border-t border-zinc-100">
      <StoreLocator 
        showSearch={true} 
        title="Our Boutiques" 
        subtitle="Experience our exquisite diamond collections in person across Maharashtra."
        initialQuery={q}
        initialLocation={initialLocation}
      />
    </div>
  );
}