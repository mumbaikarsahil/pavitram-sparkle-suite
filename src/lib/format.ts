export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const discountPct = (mrp: number, offer: number) =>
  mrp > offer ? Math.round(((mrp - offer) / mrp) * 100) : 0;
