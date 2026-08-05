import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string; // product id
  title: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  manufacturing_buffer_days: number;
  slug: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  updateQuantity: (id: string, newQty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_cart");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("app_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: any, quantity = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      const displayImage =
        product.cover_image_url ||
        (product.gallery_images && product.gallery_images.length > 0
          ? product.gallery_images[0]
          : "");

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          sku: product.sku_reference || "N/A",
          price: Number(product.mrp),
          quantity,
          image: displayImage,
          manufacturing_buffer_days: product.manufacturing_buffer_days || 14,
          slug: product.slug,
        },
      ];
    });
  };

  const updateQuantity = (id: string, newQty: number) => {
    if (newQty < 1) return;
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}