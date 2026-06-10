import pendant from "@/assets/hero-pendant.jpg";
import collection from "@/assets/category-collection.jpg";
import bridal from "@/assets/hero-bridal.jpg";

const map: Record<string, string> = {
  "twist-diamond-pendant": pendant,
  "classic-solitaire-pendant": pendant,
  "silver-lotus-pendant": pendant,
  "floral-diamond-stud": collection,
  "petal-diamond-drop": collection,
  "twist-diamond-ring": collection,
  "eternal-band": collection,
  "gift-set-mini-studs": collection,
  "heritage-mangalsutra": bridal,
  "royal-temple-bangles": bridal,
};

export const productImage = (slug?: string | null) =>
  (slug && map[slug]) || pendant;
