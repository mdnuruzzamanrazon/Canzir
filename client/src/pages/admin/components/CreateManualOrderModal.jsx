import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Package,
  User,
  MapPin,
  CreditCard,
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import apiFetch from '../../../utils/api.js';

export default function CreateManualOrderModal({
  isOpen,
  onClose,
  products,
  onOrderCreated,
  formatPrice
}) {
  if (!isOpen) return null;

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Dhaka',
    district: 'Dhaka',
    postalCode: '',
    deliveryNotes: ''
  });

  const [items, setItems] = useState([
    {
      productId: products[0]?._id || '',
      title: products[0]?.title || '',
      price: products[0]?.price || 4500,
      quantity: 1,
      variantName: 'Default Finish'
    }
  ]);

  const [shippingFee, setShippingFee] = useState(80);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [transactionId, setTransactionId] = useState('');
  const [internalNote, setInternalNote] = useState('Manual staff commission created from Admin portal.');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate Subtotal
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const totalAmount = Math.max(0, subtotal + Number(shippingFee) - Number(discountAmount));

  // Handle product selection change
  const handleProductSelect = (index, prodId) => {
    const prod = products.find(p => p._id === prodId);
    if (!prod) return;

    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId: prod._id,
      title: prod.title,
      price: prod.price,
      image: prod.images?.[0] || ''
    };
    setItems(updated);
  };

  // Add Item
  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems([
      ...items,
      {
        productId: products[0]._id,
        title: products[0].title,
        price: products[0].price,
        quantity: 1,
        variantName: 'Default'
      }
    ]);
  };

  // Remove Item
  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Submit Order
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      setErrorMsg('Customer name, phone number, and delivery street address are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer,
        items: items.map(it => ({
          productId: it.productId,
          title: it.title,
          price: Number(it.price),
          quantity: Number(it.quantity),
          selectedVariants: it.variantName ? { Finish: it.variantName } : {}
        })),
        shippingFee: Number(shippingFee),
        discountAmount: Number(discountAmount),
        paymentMethod,
        paymentStatus,
        transactionId: transactionId.trim(),
        internalNote: internalNote.trim()
      };

      const res = await apiFetch('/orders/admin/manual', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success && res.order) {
        onOrderCreated(res.order);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create manual order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#1c1917] border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-stone-800 bg-stone-900/80 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif text-stone-100 font-semibold">
              Create Manual Commission / Order
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Record a walk-in purchase, WhatsApp inquiry, or custom telephone order.
            </p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs flex-1">
          {/* Customer Details */}
          <div className="space-y-3 bg-stone-900/60 border border-stone-800 rounded-xl p-4">
            <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#C58B4B]" /> Customer Contact &amp; Shipping Address
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shakil Ahmed"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>

              <div>
                <label className="block text-stone-300 mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="customer@domain.com"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>

              <div>
                <label className="block text-stone-300 mb-1">City / Division</label>
                <select
                  value={customer.city}
                  onChange={(e) => {
                    const city = e.target.value;
                    setCustomer({ ...customer, city, district: city });
                    setShippingFee(city.toLowerCase().includes('dhaka') ? 80 : 150);
                  }}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                >
                  <option value="Dhaka">Dhaka (৳80 delivery)</option>
                  <option value="Chittagong">Chittagong (৳150 delivery)</option>
                  <option value="Sylhet">Sylhet (৳150 delivery)</option>
                  <option value="Rajshahi">Rajshahi (৳150 delivery)</option>
                  <option value="Barishal">Barishal (৳150 delivery)</option>
                  <option value="Khulna">Khulna (৳150 delivery)</option>
                  <option value="Rangpur">Rangpur (৳150 delivery)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-stone-300 mb-1">Delivery Street Address *</label>
              <textarea
                rows="2"
                required
                placeholder="House, Road, Area, Landmark..."
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
              />
            </div>
          </div>

          {/* Item Selection */}
          <div className="space-y-3 bg-stone-900/60 border border-stone-800 rounded-xl p-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#C58B4B]" /> Product Selection
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[11px] text-[#C58B4B] hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Another Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-stone-950 rounded-lg border border-stone-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-5">
                    <label className="block text-stone-400 text-[10px] mb-1">Select Piece</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductSelect(idx, e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded px-2.5 py-1.5 text-stone-200 text-xs"
                    >
                      {products.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.title} ({formatPrice(p.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-stone-400 text-[10px] mb-1">Finish / Variant</label>
                    <input
                      type="text"
                      placeholder="e.g. Smoked Walnut"
                      value={item.variantName}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].variantName = e.target.value;
                        setItems(updated);
                      }}
                      className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1.5 text-stone-200 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-400 text-[10px] mb-1">Price (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].price = Number(e.target.value);
                        setItems(updated);
                      }}
                      className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1.5 text-stone-200 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-stone-400 text-[10px] mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].quantity = Number(e.target.value);
                        setItems(updated);
                      }}
                      className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1.5 text-stone-200 text-xs text-center"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end pb-1">
                    <button
                      type="button"
                      disabled={items.length <= 1}
                      onClick={() => handleRemoveItem(idx)}
                      className="text-stone-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Financial Breakdown */}
          <div className="space-y-3 bg-stone-900/60 border border-stone-800 rounded-xl p-4">
            <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#C58B4B]" /> Payment &amp; Financial Settings
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                >
                  <option value="cod">Cash On Delivery (Doorstep)</option>
                  <option value="bkash">bKash Manual / Send Money</option>
                  <option value="nagad">Nagad Direct Wallet</option>
                  <option value="bank">BRAC Bank Transfer</option>
                  <option value="card">POS Card Terminal / Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 mb-1">Initial Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid (Fully Settled)</option>
                  <option value="verified">Verified Advance</option>
                </select>
              </div>
            </div>

            {paymentMethod !== 'cod' && (
              <div>
                <label className="block text-stone-300 mb-1">Transaction ID / Statement Reference</label>
                <input
                  type="text"
                  placeholder="e.g. BKS99882211"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-stone-300 mb-1">Shipping Fee (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>

              <div>
                <label className="block text-stone-300 mb-1">Special Discount (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>
            </div>

            {/* Total calculation banner */}
            <div className="mt-3 p-3 bg-stone-950 rounded-lg border border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-400">
                Subtotal: <strong>{formatPrice(subtotal)}</strong> | Shipping: <strong>{formatPrice(shippingFee)}</strong>
              </span>
              <span className="text-sm font-bold text-stone-100">
                Grand Total: <span className="text-[#C58B4B]">{formatPrice(totalAmount)}</span>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-stone-300 mb-1">Staff Internal Note</label>
            <input
              type="text"
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
            />
          </div>

          <div className="pt-4 border-t border-stone-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-[#C58B4B] hover:bg-[#b0793c] text-stone-950 font-semibold transition"
            >
              {submitting ? 'Creating Order...' : 'Confirm & Commit Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
