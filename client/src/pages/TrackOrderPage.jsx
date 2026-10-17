import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  Package,
  Check,
  AlertCircle,
  MapPin,
  Phone
} from 'lucide-react';
import apiFetch from '../utils/api.js';
import { useCurrency } from '../context/CurrencyContext';

const TrackOrderPage = () => {
  const [searchParams] = useSearchParams();
  const { formatPrice } = useCurrency();

  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setOrder(null);

    try {
      const query = new URLSearchParams();
      query.set('orderNumber', orderNumber.trim());
      if (phone.trim()) query.set('phone', phone.trim());

      const res = await apiFetch(`/orders/track?${query.toString()}`);
      if (res.success && res.order) {
        setOrder(res.order);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to find an order with this Order ID and phone number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('orderNumber')) {
      handleTrack();
    }
  }, [searchParams]);

  const getStatusIndex = (status) => {
    const idx = statuses.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sand-200 text-bamboo font-semibold text-xs uppercase tracking-wider">
          <Truck size={14} />
          <span>Live Tracking</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-walnut">
          Track Your Lighting Order
        </h1>
        <p className="text-sm text-sand-500 leading-relaxed max-w-xl mx-auto">
          Enter your Canzir order number (e.g. CNZ-10842) and phone number to see real-time workshop and shipping progress.
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-cream p-6 sm:p-8 rounded-2xl border border-sand-300 shadow-sm max-w-2xl mx-auto">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-walnut mb-1">
                Order Reference Number *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. CNZ-89421"
                className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut uppercase focus:outline-none focus:border-bamboo"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-walnut mb-1">
                Phone Number (Last 4 or 11 digits)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-walnut hover:bg-walnut-700 text-cream rounded font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Search size={14} />
            <span>{loading ? 'Searching...' : 'Track Order Status'}</span>
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Order Status Display */}
      {order && (
        <div className="bg-sand-50 rounded-2xl border border-sand-300 p-6 sm:p-10 shadow-sm space-y-8 animate-fade-in">
          {/* Top Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sand-300 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-bamboo tracking-wider">
                Order Found
              </span>
              <h2 className="font-mono text-2xl font-bold text-walnut">{order.orderNumber}</h2>
              <p className="text-xs text-sand-500 mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-walnut text-cream rounded-full text-xs font-semibold">
                Status: {order.orderStatus}
              </span>
              <p className="text-xs text-sand-500 mt-1">
                Estimated Delivery: <strong>{order.estimatedDelivery || '2-4 days'}</strong>
              </p>
            </div>
          </div>

          {/* Stepper Progress */}
          <div>
            <div className="relative flex items-center justify-between">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-sand-200 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-bamboo -translate-y-1/2 z-0 transition-all duration-700"
                style={{
                  width: `${(getStatusIndex(order.orderStatus) / (statuses.length - 1)) * 100}%`
                }}
              />

              {statuses.map((st, idx) => {
                const isCompleted = getStatusIndex(order.orderStatus) >= idx;
                const isCurrent = order.orderStatus === st;

                return (
                  <div key={st} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCompleted
                          ? 'bg-bamboo text-cream ring-4 ring-cream'
                          : 'bg-sand-200 text-sand-500'
                      }`}
                    >
                      {isCompleted ? <Check size={16} /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] mt-2 font-medium hidden sm:inline ${
                        isCurrent ? 'text-walnut font-bold' : isCompleted ? 'text-walnut-700' : 'text-sand-400'
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex sm:hidden justify-between text-[10px] text-sand-500 mt-2 font-medium">
              <span>Placed</span>
              <span>In Craft</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Delivery & Timeline History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-sand-300 text-xs">
            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-walnut">Delivery Address</h4>
              <p className="font-semibold text-walnut">{order.customer.name}</p>
              <p className="text-sand-500">{order.customer.address}</p>
              <p className="text-sand-500">{order.customer.city}, {order.customer.district}</p>
              <p className="text-sand-500">Contact: {order.customer.phone}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-walnut">Status Updates</h4>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {order.statusHistory?.map((hist, i) => (
                  <div key={i} className="p-2 bg-white rounded border border-sand-200">
                    <p className="font-semibold text-walnut">{hist.status}</p>
                    <p className="text-[11px] text-sand-500">{hist.note}</p>
                    <span className="text-[10px] text-sand-400">
                      {new Date(hist.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="pt-4 border-t border-sand-300 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-walnut">Fixtures in this Package</h4>
            <div className="divide-y divide-sand-200">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-2 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt="" className="w-10 h-10 object-cover rounded bg-sand-200" />
                    <div>
                      <span className="font-semibold text-walnut">{item.title}</span>
                      <p className="text-[11px] text-sand-500">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-walnut">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrderPage;
