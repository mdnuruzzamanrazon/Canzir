import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Check, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';

const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingFee,
    discountAmount,
    appliedCoupon,
    couponError,
    grandTotal,
    applyCoupon,
    removeCoupon
  } = useCart();

  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 5000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    setIsApplying(true);
    try {
      await applyCoupon(promoCodeInput.trim());
      setPromoCodeInput('');
    } catch {
      // Error handled in context
    } finally {
      setIsApplying(false);
    }
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-cream shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-sand-300 flex items-center justify-between bg-cream">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-walnut" />
              <h2 className="font-display text-xl font-bold text-walnut">
                {t.cart.title} ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 text-sand-500 hover:text-walnut transition-colors"
              aria-label="Close cart drawer"
            >
              <X size={22} />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-sand-100 px-6 py-3 border-b border-sand-200 text-xs">
            {remainingForFree > 0 ? (
              <p className="text-walnut-700">
                Add <strong>{formatPrice(remainingForFree)}</strong> more to enjoy{' '}
                <span className="text-bamboo font-semibold">Free Delivery Across Bangladesh!</span>
              </p>
            ) : (
              <p className="text-olive-500 font-semibold flex items-center gap-1">
                <Check size={14} /> Congratulations! Free Delivery Unlocked.
              </p>
            )}
            <div className="w-full bg-sand-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-bamboo h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-sand-200 flex items-center justify-center text-sand-400 mb-4">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="font-display text-xl font-medium text-walnut">{t.cart.empty}</h3>
                <p className="text-xs text-sand-500 mt-1 max-w-xs">{t.cart.emptySubtitle}</p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="mt-6 px-6 py-2.5 bg-walnut text-cream text-xs font-semibold rounded hover:bg-walnut-700 transition-colors"
                >
                  {t.cart.continueShopping}
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-4 p-3 bg-cream rounded-lg border border-sand-200/80 shadow-sm"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded bg-sand-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-walnut truncate">{item.title}</h4>
                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                      <p className="text-[11px] text-sand-500 mt-0.5">
                        {Object.entries(item.selectedVariants)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' | ')}
                      </p>
                    )}
                    <p className="text-xs font-bold text-bamboo-600 mt-1">{formatPrice(item.price)}</p>

                    {/* Quantity & Delete */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-sand-300 rounded bg-white text-xs">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="px-2 py-1 text-walnut hover:bg-sand-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 py-0.5 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="px-2 py-1 text-walnut hover:bg-sand-100 disabled:opacity-40 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-sand-400 hover:text-red-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-sand-300 bg-cream space-y-4">
              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="space-y-1">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 bg-olive-50 border border-olive-200 rounded text-xs text-olive-600">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Tag size={13} />
                      <span>Code: {appliedCoupon.code}</span>
                      <span className="text-[10px] bg-olive-200 text-olive-700 px-1 rounded">Applied</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-sand-500 hover:text-red-600 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder={t.cart.couponPlaceholder}
                      className="flex-1 bg-white border border-sand-300 rounded px-3 py-1.5 text-xs text-walnut placeholder-sand-400 uppercase focus:outline-none focus:border-bamboo"
                    />
                    <button
                      type="submit"
                      disabled={isApplying || !promoCodeInput.trim()}
                      className="px-3 py-1.5 bg-sand-200 hover:bg-sand-300 text-walnut text-xs font-semibold rounded disabled:opacity-50 transition-colors"
                    >
                      {isApplying ? '...' : t.cart.applyCoupon}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
              </form>

              {/* Subtotal & Breakdown */}
              <div className="space-y-1.5 text-xs text-walnut-700 pt-2 border-t border-sand-200">
                <div className="flex justify-between">
                  <span>{t.cart.subtotal}</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-olive-600 font-medium">
                    <span>{t.cart.discount}</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t.cart.shipping}</span>
                  <span>{shippingFee === 0 ? <span className="text-olive-600 font-semibold">Free</span> : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-walnut pt-2 border-t border-sand-200">
                  <span>{t.cart.total}</span>
                  <span className="text-bamboo-600">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3 bg-walnut hover:bg-walnut-700 text-cream font-semibold rounded text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>{t.cart.checkoutBtn}</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  className="w-full py-2 text-center text-xs text-walnut-600 hover:text-bamboo transition-colors"
                >
                  View Full Cart & Shipping Calculator
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
