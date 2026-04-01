import { createContext, useContext, useState, useEffect } from 'react';
import { Product, Offer, OrderItem } from '../types';

interface CartItem extends OrderItem {
  supermarketId: string;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, offer?: Offer) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  total: number;
  supermarketId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [supermarketId, setSupermarketId] = useState<string | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const { items, supermarketId } = JSON.parse(savedCart);
      setItems(items);
      setSupermarketId(supermarketId);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({ items, supermarketId }));
  }, [items, supermarketId]);

  const addToCart = (product: Product, quantity: number, offer?: Offer) => {
    if (supermarketId && supermarketId !== product.supermarketId) {
      if (!confirm('Solo puedes agregar productos de un supermercado a la vez. ¿Deseas vaciar el carrito actual?')) {
        return;
      }
      setItems([]);
    }

    setSupermarketId(product.supermarketId);
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: offer ? offer.discountedPrice : product.price,
        quantity,
        supermarketId: product.supermarketId,
        imageUrl: product.imageUrl
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => {
      const newItems = prev.filter(i => i.productId !== productId);
      if (newItems.length === 0) setSupermarketId(null);
      return newItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    setSupermarketId(null);
  };

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total, supermarketId }}>
      {children}
    </CartContext.Provider>
  );
};
