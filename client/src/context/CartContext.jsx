import React, { createContext, useContext, useState, useEffect } from 'react';
import apiFetch from '../utils/api.js';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('canzir_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [shippingCity, setShippingCity] = useState('Dhaka');

  useEffect(() => {
    localStorage.setItem('canzir_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, selectedVariants = {}) => {
    // Generate a unique item key based on product ID and selected variant combination
    const variantKey = Object.entries(selectedVariants)
      .sort(([k1], [k2]) => k1.localeCompare(k2))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    const cartItemId = `${product._id}_${variantKey}`;

    // Calculate adjusted price with variants
    let itemPrice = product.price;
    if (product.variants && selectedVariants) {
      Object.entries(selectedVariants).forEach(([varName, optLabel]) => {
        const variant = product.variants.find(v => v.name.toLowerCase() === varName.toLowerCase());
        if (variant) {
          const opt = variant.options.find(o => o.label === optLabel);
          if (opt && opt.priceAdjustment) {
            itemPrice += opt.priceAdjustment;
          }
        }
      });
    }

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        const maxStock = product.stockQuantity || 50;
        updated[existingIndex].quantity = Math.min(newQty, maxStock);
        return updated;
      } else {
        return [
          ...prev,
          {
            cartItemId,
            productId: product._id,
            title: product.title,
            slug: product.slug,
            image: product.images[0] || '/assets/products/bamboo-lattice-table-lamp.jpeg',
            price: itemPrice,
            originalPrice: product.price,
            quantity: Math.min(quantity, product.stockQuantity || 50),
            maxStock: product.stockQuantity || 50,
            selectedVariants
          }
        ];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: Math.min(quantity, item.maxStock || 50) }
          : item
      )
    );
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const isDhaka = shippingCity.toLowerCase().includes('dhaka');
  const baseShipping = isDhaka ? 80 : 150;
  const shippingFee = subtotal >= 5000 || subtotal === 0 ? 0 : baseShipping;

  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscountAmount && discountAmount > appliedCoupon.maxDiscountAmount) {
        discountAmount = appliedCoupon.maxDiscountAmount;
      }
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const grandTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  const applyCoupon = async (code) => {
    setCouponError('');
    if (!code || !code.trim()) return;
    try {
      const res = await apiFetch('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: code.trim(), cartTotal: subtotal })
      });
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponError('');
        return res.coupon;
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
      setAppliedCoupon(null);
      throw err;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      totalItemCount,
      subtotal,
      shippingFee,
      shippingCity,
      setShippingCity,
      discountAmount,
      appliedCoupon,
      couponError,
      grandTotal,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      applyCoupon,
      removeCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
