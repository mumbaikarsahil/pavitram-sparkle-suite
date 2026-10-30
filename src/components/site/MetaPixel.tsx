"use client";

import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export function MetaPixel() {
  const routerState = useRouterState();

  // 1. Initialize the Pixel (Runs only once on the first load)
  useEffect(() => {
    // ✨ FIX: Pulled from .env file
    const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID; 

    if (typeof window !== "undefined" && PIXEL_ID) {
      // @ts-ignore
      !function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', PIXEL_ID);
    }
  }, []);

  // 2. Track PageView whenever the route changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [routerState.location.pathname]);

  return null; 
}