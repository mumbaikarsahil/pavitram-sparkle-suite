import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { StoreLocator } from "@/components/site/StoreLocator";

export const Route = createFileRoute('/stores')({
  component: StoresPage,
});

function StoresPage() {
  return (
    <div className="min-h-screen bg-white pt-12 pb-24 font-sans border-t border-zinc-100">
      <StoreLocator 
        showSearch={true} 
        title="Our Boutiques" 
        subtitle="Experience our exquisite diamond collections in person across Maharashtra."
      />
    </div>
  );
}