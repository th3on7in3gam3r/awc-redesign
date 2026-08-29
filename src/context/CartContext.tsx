import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProductById } from '../data/storeProducts';

export type CartItem = {
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (productId: string, size: string, color: string, quantity?: number) => void;
  updateQty: (productId: string, size: string, color: string, quantity: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  clear: () => void;
  itemCount: number;
  subtotalCents: number;
};

const STORAGE_KEY = 'awc-store-cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

function sameLine(a: CartItem, productId: string, size: string, color: string) {
  return a.productId === productId && a.size === size && a.color === color;
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        item &&
        typeof item.productId === 'string' &&
        typeof item.size === 'string' &&
        typeof item.color === 'string' &&
        item.color.length > 0 &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
    );
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() =>
    typeof window !== 'undefined' ? loadCart() : []
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (productId: string, size: string, color: string, quantity = 1) => {
    const product = getProductById(productId);
    if (!product || quantity < 1 || !color) return;
    if (!product.colors.some((c) => c.id === color)) return;
    if (!product.sizes.includes(size)) return;

    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, productId, size, color));
      if (existing) {
        return prev.map((i) =>
          sameLine(i, productId, size, color)
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { productId, size, color, quantity }];
    });
  };

  const updateQty = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId, size, color);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        sameLine(i, productId, size, color) ? { ...i, quantity } : i
      )
    );
  };

  const removeItem = (productId: string, size: string, color: string) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, size, color)));
  };

  const clear = () => setItems([]);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotalCents = useMemo(
    () =>
      items.reduce((sum, i) => {
        const product = getProductById(i.productId);
        return sum + (product ? product.priceCents * i.quantity : 0);
      }, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQty, removeItem, clear, itemCount, subtotalCents }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
