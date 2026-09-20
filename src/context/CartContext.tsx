import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '../types';
import { api } from '../services/api';

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  total: number;
  currency: string;
  loading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: string, quantity?: number, isKit?: boolean) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(499);
  const [total, setTotal] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('₹');
  const [loading, setLoading] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const fetchCart = async () => {
    try {
      const data = await api.getCart();
      setItems(data.items || []);
      setSubtotal(data.subtotal || 0);
      setDeliveryFee(data.deliveryFee || 0);
      setFreeDeliveryThreshold(data.freeDeliveryThreshold || 499);
      setTotal(data.total || 0);
      setCurrency(data.currency || '₹');
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId: string, quantity = 1, isKit = false) => {
    const res = await api.addToCart(productId, quantity, isKit);
    setItems(res.items);
    setSubtotal(res.subtotal);
    setDeliveryFee(res.deliveryFee);
    setTotal(res.total);
    setIsCartOpen(true);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }
    const res = await api.updateCartItem(itemId, quantity);
    setItems(res.items);
    setSubtotal(res.subtotal);
    setDeliveryFee(res.deliveryFee);
    setTotal(res.total);
  };

  const removeItem = async (itemId: string) => {
    const res = await api.removeFromCart(itemId);
    setItems(res.items);
    setSubtotal(res.subtotal);
    setDeliveryFee(res.deliveryFee);
    setTotal(res.total);
  };

  const clearCart = async () => {
    await api.clearCart();
    setItems([]);
    setSubtotal(0);
    setDeliveryFee(0);
    setTotal(0);
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        deliveryFee,
        freeDeliveryThreshold,
        total,
        currency,
        loading,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
