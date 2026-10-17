import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  DollarSign,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import apiFetch from '../utils/api.js';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const CheckoutPage = () => {
  const {
    cartItems,
    subtotal,
    shippingFee,
    shippingCity,
    setShippingCity,
    discountAmount,
    appliedCoupon,
    grandTotal,
    clearCart
  } = useCart();

  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || 'Dhaka',
    district: user?.addresses?.[0]?.district || 'Dhaka',
    deliveryNotes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'bkash' | 'nagad' | 'card'
  const [transactionId, setTransactionId] = useState('');
  const [senderPhone, setSenderPhone] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
    if (name === 'city' || name === 'district') {
      setShippingCity(value);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customer.name || !customer.phone || !customer.address || !customer.city) {
      setErrorMsg('Please fill in your name, mobile number, and complete delivery address.');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !transactionId.trim()) {
      setErrorMsg(`Please enter your ${paymentMethod.toUpperCase()} Transaction ID (TrxID) to confirm payment.`);
      return;
    }

    if (cartItems.length === 0) {
      setErrorMsg('Your cart is empty. Please add items before checking out.');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        customer,
        items: cartItems.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          selectedVariants: item.selectedVariants
        })),
        paymentMethod,
        paymentDetails: {
          transactionId: transactionId.trim(),
          senderPhone: senderPhone.trim()
        },
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        shippingCity: customer.city
      };

      const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });

      if (res.success && res.order) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        clearCart();
        navigate(`/order-confirmation/${res.order.orderNumber}`, {
          state: { order: res.order }
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order. Please review your details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center px-4 space-y-4">
        <h2 className="font-display text-2xl font-bold text-walnut">Your Bag is Empty</h2>
        <p className="text-xs text-sand-500">Please choose a lighting piece before proceeding to checkout.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 bg-walnut text-cream text-xs font-semibold rounded">
          Browse Lighting Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-10 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">
          Final Step
        </span>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-walnut mt-1">
          {t.checkout.title}
        </h1>
        <p className="text-sm text-sand-500 mt-2">
          Complete your delivery and payment details to begin crafting and dispatching your fixtures.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Delivery & Payment Details (7-8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div className="bg-cream p-6 sm:p-8 rounded-2xl border border-sand-300 shadow-sm space-y-5">
            <h2 className="font-display text-xl font-bold text-walnut flex items-center gap-2">
              <span>1. Delivery & Contact Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-walnut mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  value={customer.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Tanvir Chowdhury"
                  className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-walnut mb-1">
                  Mobile Number (for delivery SMS) *
                </label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={customer.phone}
                  onChange={handleInputChange}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-walnut mb-1">
                Email Address (for invoice copy)
              </label>
              <input
                type="email"
                name="email"
                value={customer.email}
                onChange={handleInputChange}
                placeholder="tanvir@example.com"
                className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-walnut mb-1">
                Full Street Address, House/Apartment No *
              </label>
              <textarea
                rows={2}
                required
                name="address"
                value={customer.address}
                onChange={handleInputChange}
                placeholder="House 12, Road 4, Sector 7, Uttara"
                className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-walnut mb-1">
                  City / Area *
                </label>
                <input
                  type="text"
                  required
                  name="city"
                  value={customer.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Dhaka or Chittagong"
                  className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-walnut mb-1">
                  District *
                </label>
                <input
                  type="text"
                  required
                  name="district"
                  value={customer.district}
                  onChange={handleInputChange}
                  placeholder="e.g. Dhaka, Sylhet, etc."
                  className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-walnut mb-1">
                Special Delivery Notes (Optional)
              </label>
              <input
                type="text"
                name="deliveryNotes"
                value={customer.deliveryNotes}
                onChange={handleInputChange}
                placeholder="e.g. Call before arrival, leave with concierge"
                className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
              />
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-cream p-6 sm:p-8 rounded-2xl border border-sand-300 shadow-sm space-y-5">
            <h2 className="font-display text-xl font-bold text-walnut flex items-center justify-between">
              <span>2. Preferred Payment Method</span>
              <span className="text-xs font-normal text-sand-500 flex items-center gap-1">
                <Lock size={12} /> Encrypted
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: COD */}
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'cod'
                    ? 'border-bamboo bg-sand-100 shadow-sm'
                    : 'border-sand-300 bg-white hover:border-sand-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-walnut">Cash on Delivery (COD)</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-bamboo focus:ring-bamboo"
                  />
                </div>
                <p className="text-[11px] text-sand-500">
                  Pay cash directly to the courier when your lighting fixture arrives at your door.
                </p>
              </label>

              {/* Option 2: bKash */}
              <label
                onClick={() => setPaymentMethod('bkash')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'bkash'
                    ? 'border-bamboo bg-sand-100 shadow-sm'
                    : 'border-sand-300 bg-white hover:border-sand-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-pink-700">bKash Online / TrxID</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="text-bamboo focus:ring-bamboo"
                  />
                </div>
                <p className="text-[11px] text-sand-500">
                  Send Money or Payment to Canzir merchant number and verify with Transaction ID.
                </p>
              </label>

              {/* Option 3: Nagad */}
              <label
                onClick={() => setPaymentMethod('nagad')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'nagad'
                    ? 'border-bamboo bg-sand-100 shadow-sm'
                    : 'border-sand-300 bg-white hover:border-sand-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-orange-700">Nagad Wallet</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'nagad'}
                    onChange={() => setPaymentMethod('nagad')}
                    className="text-bamboo focus:ring-bamboo"
                  />
                </div>
                <p className="text-[11px] text-sand-500">
                  Transfer via Nagad and submit your transaction confirmation.
                </p>
              </label>

              {/* Option 4: Card */}
              <label
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'card'
                    ? 'border-bamboo bg-sand-100 shadow-sm'
                    : 'border-sand-300 bg-white hover:border-sand-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-walnut">Credit / Debit Card</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="text-bamboo focus:ring-bamboo"
                  />
                </div>
                <p className="text-[11px] text-sand-500">
                  Visa, Mastercard, or Amex via SSLCommerz secure payment gateway.
                </p>
              </label>
            </div>

            {/* bKash / Nagad Transaction ID input prompt */}
            {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
              <div className="p-4 bg-sand-100 rounded-xl border border-sand-300 space-y-3 animate-fade-in text-xs">
                <p className="font-semibold text-walnut">
                  {paymentMethod.toUpperCase()} Merchant Instructions:
                </p>
                <p className="text-sand-600">
                  1. Open your {paymentMethod.toUpperCase()} app and select "Make Payment" or "Send Money".<br />
                  2. Merchant Number: <strong className="text-walnut font-mono text-sm">01712-345678</strong><br />
                  3. Amount: <strong className="text-bamboo font-bold">{formatPrice(grandTotal)}</strong><br />
                  4. Reference: <strong className="text-walnut">CANZIR</strong>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-walnut mb-1">
                      Your {paymentMethod.toUpperCase()} Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-white border border-sand-300 rounded px-3 py-1.5 text-xs text-walnut focus:outline-none focus:border-bamboo"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-walnut mb-1">
                      Transaction ID (TrxID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. BL92XK81M"
                      className="w-full bg-white border border-sand-300 rounded px-3 py-1.5 text-xs text-walnut uppercase focus:outline-none focus:border-bamboo"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 sticky top-28">
          <div className="bg-sand-50 p-6 sm:p-8 rounded-3xl border border-sand-300 shadow-card space-y-5">
            <h2 className="font-display text-2xl font-bold text-walnut">
              Order Review ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)
            </h2>

            {/* Item List */}
            <div className="divide-y divide-sand-200 max-h-72 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="py-3 flex gap-3 items-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-14 h-14 object-cover rounded bg-sand-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-walnut truncate">{item.title}</h4>
                    {item.selectedVariants && (
                      <p className="text-[10px] text-sand-500 truncate">
                        {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </p>
                    )}
                    <span className="text-xs text-sand-500">Qty: {item.quantity}</span>
                  </div>
                  <div className="text-xs font-bold text-walnut">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs text-walnut-700 pt-4 border-t border-sand-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-olive-600 font-semibold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee ({shippingCity})</span>
                <span>{shippingFee === 0 ? <strong className="text-olive-600">Free</strong> : formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-walnut pt-3 border-t border-sand-200">
                <span>Total Amount</span>
                <span className="text-bamboo-600 font-sans">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-walnut hover:bg-walnut-700 text-cream font-semibold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              <span>{submitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight size={15} />
            </button>

            <div className="pt-2 text-[11px] text-sand-500 space-y-1 text-center">
              <p>By placing this order, you support fair artisan wages and river bamboo conservation.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
