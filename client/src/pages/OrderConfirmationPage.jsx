import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle2, Printer, ArrowRight, Package, Truck, Clock } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const OrderConfirmationPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const { formatPrice } = useCurrency();
  const order = location.state?.order;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20 space-y-8">
      {/* Success Banner */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-olive-100 text-olive-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 size={36} />
        </div>
        <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">
          Order Successfully Placed
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-walnut">
          Thank You For Supporting Artisan Craft
        </h1>
        <p className="text-xs sm:text-sm text-sand-500 max-w-md mx-auto">
          Your order has been recorded. Our craftsmen are preparing your fixture with utmost care.
        </p>
      </div>

      {/* Order Summary Box */}
      <div className="bg-cream p-6 sm:p-8 rounded-2xl border border-sand-300 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sand-200 gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/canzir-logo.png"
              alt="Canzir"
              className="h-12 w-auto object-contain"
            />
            <div>
              <p className="text-xs text-sand-500 uppercase tracking-wider">Order Reference ID</p>
              <p className="font-mono text-xl font-bold text-walnut mt-0.5">{orderNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 border border-sand-300 rounded text-xs font-medium text-walnut hover:bg-sand-100 flex items-center gap-1.5 transition-colors"
            >
              <Printer size={14} />
              <span>Print Invoice</span>
            </button>
            <Link
              to={`/track-order?orderNumber=${orderNumber}`}
              className="px-3.5 py-1.5 bg-walnut text-cream rounded text-xs font-medium hover:bg-walnut-700 flex items-center gap-1.5 transition-colors"
            >
              <Truck size={14} />
              <span>Track Live Status</span>
            </Link>
          </div>
        </div>

        {order ? (
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-walnut uppercase tracking-wider text-[10px] text-sand-500">Shipping To</p>
                <p className="font-bold text-walnut">{order.customer.name}</p>
                <p className="text-sand-500">{order.customer.address}</p>
                <p className="text-sand-500">{order.customer.city}, {order.customer.district}</p>
                <p className="text-sand-500">Phone: {order.customer.phone}</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-walnut uppercase tracking-wider text-[10px] text-sand-500">Payment & Delivery</p>
                <p className="font-bold text-walnut">Method: {order.paymentMethod.toUpperCase()}</p>
                <p className="text-sand-500">Status: {order.paymentStatus}</p>
                <p className="text-sand-500">Estimated Delivery: {order.estimatedDelivery || '2-4 business days'}</p>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-sand-200 border-t border-sand-200 pt-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt="" className="w-10 h-10 object-cover rounded bg-sand-100" />
                    <div>
                      <p className="font-semibold text-walnut">{item.title}</p>
                      <p className="text-[11px] text-sand-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-walnut">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-sand-200 flex justify-between items-center text-sm font-bold text-walnut">
              <span>Total Paid / Payable:</span>
              <span className="text-bamboo-600 font-sans text-base">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-sand-500 py-4">
            Your order details have been dispatched to your phone number and email address.
          </div>
        )}
      </div>

      <div className="text-center pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-walnut hover:text-bamboo transition-colors"
        >
          <span>Return to Canzir Home</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
