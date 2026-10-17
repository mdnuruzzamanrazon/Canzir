import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';

const CartPage = () => {
  const {
    cartItems,
    subtotal,
    shippingFee,
    shippingCity,
    setShippingCity,
    discountAmount,
    appliedCoupon,
    couponError,
    grandTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [promoInput, setPromoInput] = useState('');
  const [applying, setApplying] = useState(false);

  const freeThreshold = 5000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  const remainingForFree = Math.max(0, freeThreshold - subtotal);

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setApplying(true);
    try {
      await applyCoupon(promoInput.trim());
      setPromoInput('');
    } catch {
      // Handled in context
    } finally {
      setApplying(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-20 h-20 bg-sand-200 text-sand-500 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag size={36} />
        </div>
        <h1 className="font-display text-3xl font-bold text-walnut">{t.cart.empty}</h1>
        <p className="text-xs sm:text-sm text-sand-500 max-w-sm mx-auto">{t.cart.emptySubtitle}</p>
        <div className="pt-4">
          <Link
            to="/shop"
            className="px-8 py-3.5 bg-walnut hover:bg-walnut-700 text-cream rounded font-semibold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
          >
            <span>{t.cart.continueShopping}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-10 sm:py-16 space-y-10">
      <div className="border-b border-sand-300 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-walnut">
            {t.cart.title}
          </h1>
          <p className="text-sm text-sand-500 mt-1">
            Review your handcrafted selection before proceeding to secure checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs sm:text-sm text-sand-400 hover:text-red-600 transition-colors"
        >
          Clear Entire Bag
        </button>
      </div>

      {/* Free Delivery Meter */}
      <div className="bg-sand-100 p-5 rounded-2xl border border-sand-200 text-xs sm:text-sm">
        {remainingForFree > 0 ? (
          <p className="text-walnut-700">
            Add <strong>{formatPrice(remainingForFree)}</strong> more to receive{' '}
            <strong className="text-bamboo">Complimentary Delivery Across Bangladesh</strong>!
          </p>
        ) : (
          <p className="text-olive-600 font-bold flex items-center gap-1.5">
            <Check size={18} /> Free Delivery Unlocked for this Order!
          </p>
        )}
        <div className="w-full bg-sand-200 h-2.5 rounded-full mt-2.5 overflow-hidden">
          <div
            className="bg-bamboo h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left 8 Cols: Cart Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="hidden sm:grid grid-cols-12 text-xs font-semibold text-sand-500 uppercase tracking-wider pb-3 border-b border-sand-200">
            <span className="col-span-6">Lighting Piece</span>
            <span className="col-span-2 text-center">Unit Price</span>
            <span className="col-span-2 text-center">Quantity</span>
            <span className="col-span-2 text-right">Subtotal</span>
          </div>

          <div className="divide-y divide-sand-200">
            {cartItems.map((item) => (
              <div key={item.cartItemId} className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-6 flex gap-4 items-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg bg-sand-100 flex-shrink-0"
                  />
                  <div>
                    <Link to={`/product/${item.slug}`} className="text-sm font-semibold text-walnut hover:text-bamboo transition-colors">
                      {item.title}
                    </Link>
                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                      <p className="text-[11px] text-sand-500 mt-0.5">
                        {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                      </p>
                    )}
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-xs text-sand-400 hover:text-red-600 flex items-center gap-1 mt-2 transition-colors"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2 text-center text-xs font-medium text-walnut">
                  {formatPrice(item.price)}
                </div>

                <div className="sm:col-span-2 flex justify-center">
                  <div className="flex items-center border border-sand-300 rounded bg-white text-xs">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="px-2.5 py-1 text-walnut hover:bg-sand-100"
                    >
                      -
                    </button>
                    <span className="px-2.5 py-1 font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="px-2.5 py-1 text-walnut hover:bg-sand-100 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2 text-right text-sm font-bold text-walnut">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-between items-center text-xs">
            <Link to="/shop" className="text-bamboo font-semibold hover:underline">
              ← Continue Browsing More Lights
            </Link>
          </div>
        </div>

        {/* Right Col: Order Summary */}
        <div className="lg:col-span-4 p-6 sm:p-8 bg-sand-50 rounded-3xl border border-sand-300 space-y-6 sticky top-28 shadow-card">
          <h2 className="font-display text-2xl font-bold text-walnut">
            Order Summary
          </h2>

          {/* Shipping Location Selector */}
          <div>
            <label className="block text-xs font-semibold text-walnut mb-1.5">
              Select Delivery Area
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShippingCity('Dhaka')}
                className={`py-2 px-3 rounded border text-center font-medium transition-all ${
                  shippingCity === 'Dhaka'
                    ? 'border-bamboo bg-sand-200 text-walnut font-bold'
                    : 'border-sand-300 bg-white text-walnut-700'
                }`}
              >
                Inside Dhaka (৳80)
              </button>
              <button
                type="button"
                onClick={() => setShippingCity('Outside Dhaka')}
                className={`py-2 px-3 rounded border text-center font-medium transition-all ${
                  shippingCity !== 'Dhaka'
                    ? 'border-bamboo bg-sand-200 text-walnut font-bold'
                    : 'border-sand-300 bg-white text-walnut-700'
                }`}
              >
                All Bangladesh (৳150)
              </button>
            </div>
          </div>

          {/* Coupon Code Input */}
          <form onSubmit={handleApplyPromo} className="space-y-1.5">
            <label className="block text-xs font-semibold text-walnut">
              Have a Promo Code?
            </label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 bg-olive-50 border border-olive-300 rounded text-xs text-olive-700">
                <div className="flex items-center gap-1.5 font-bold">
                  <Tag size={13} />
                  <span>{appliedCoupon.code}</span>
                  <span className="text-[10px] bg-olive-200 px-1.5 rounded">Applied</span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs text-sand-500 hover:text-red-600 font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="e.g. CANZIR10"
                  className="flex-1 bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut uppercase focus:outline-none focus:border-bamboo"
                />
                <button
                  type="submit"
                  disabled={applying || !promoInput.trim()}
                  className="px-4 py-2 bg-walnut text-cream rounded text-xs font-semibold hover:bg-walnut-700 disabled:opacity-50 transition-colors"
                >
                  {applying ? '...' : 'Apply'}
                </button>
              </div>
            )}
            {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
          </form>

          {/* Financial Breakdown */}
          <div className="space-y-2 text-xs text-walnut-700 pt-3 border-t border-sand-200">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-olive-600 font-semibold">
                <span>Promotional Discount</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>
                {shippingFee === 0 ? (
                  <span className="text-olive-600 font-bold">Free</span>
                ) : (
                  formatPrice(shippingFee)
                )}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-walnut pt-3 border-t border-sand-200">
              <span>Total Payable</span>
              <span className="text-bamboo-600 font-sans">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-walnut hover:bg-walnut-700 text-cream font-semibold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <span>Proceed to Secure Checkout</span>
            <ArrowRight size={15} />
          </button>

          <div className="space-y-2 text-[11px] text-sand-500 pt-2 border-t border-sand-200">
            <p className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-olive-500" />
              <span>100% Secure Checkout & Order Tracking</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Truck size={14} className="text-bamboo" />
              <span>Delivered in protective wooden and craft cushioning</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
