import React, { createContext, useState, useContext, useEffect } from 'react';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to localStorage every time it changes (including when cleared to [])
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.menuItemId === item._id);
      if (existing) {
        return prevCart.map((c) =>
          c.menuItemId === item._id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [
        ...prevCart,
        {
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (menuItemId) => {
    setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId, change) => {
    setCart((prev) => {
      const item = prev.find((c) => c.menuItemId === menuItemId);
      if (!item) return prev;
      const newQty = item.quantity + change;
      if (newQty <= 0) return prev.filter((c) => c.menuItemId !== menuItemId);
      return prev.map((c) =>
        c.menuItemId === menuItemId ? { ...c, quantity: newQty } : c
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Convenience hook
export const useCart = () => useContext(CartContext);
