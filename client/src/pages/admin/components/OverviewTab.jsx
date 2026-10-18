import React, { useState } from 'react';
import {
  ShoppingBag,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Eye,
  CheckCircle2,
  Truck,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Percent
} from 'lucide-react';
import SalesAnalyticsChart from './SalesAnalyticsChart.jsx';

export default function OverviewTab({
  stats,
  orders,
  loading,
  onRefresh,
  onOpenOrder,
  onCreateOrder,
  formatPrice
}) {

  // Status badge styling helper with glowing dots
  const getOrderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'processing':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
      case 'out for delivery':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25';
      case 'delivered':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/25';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'verified':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'failed':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'refunded':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
    }
  };

  const recentOrders = orders?.slice(0, 8) || [];
  const totalOrdersCount = stats?.totalOrders ?? orders?.length ?? 0;

  // Status distribution calculations
  const statusCounts = {
    pending: stats?.statusDistribution?.pending ?? orders.filter(o => o.orderStatus === 'Pending').length,
    processing: stats?.statusDistribution?.processing ?? orders.filter(o => o.orderStatus === 'Processing').length,
    shipped: stats?.statusDistribution?.shipped ?? orders.filter(o => o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery').length,
    delivered: stats?.statusDistribution?.delivered ?? orders.filter(o => o.orderStatus === 'Delivered').length,
    cancelled: stats?.statusDistribution?.cancelled ?? orders.filter(o => o.orderStatus === 'Cancelled').length
  };

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* Overview Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C58B4B]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C58B4B]">
              Operations Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-stone-100 font-bold">
            Executive Overview
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Real-time fulfillment metrics, customer transactions, workshop inventory health, and studio performance.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-stone-800/90 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-700/60 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C58B4B]' : 'text-stone-400'}`} />
            <span>Sync Data</span>
          </button>
          <button
            onClick={onCreateOrder}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#C58B4B] to-[#b0793c] hover:from-[#d19655] hover:to-[#be8445] text-stone-950 transition shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Manual Order</span>
          </button>
        </div>
      </div>

      {/* Top 4 Key Metric Cards - Full Width Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5">
        {/* Card 1: New Orders Today */}
        <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-5 xl:p-6 hover:border-[#C58B4B]/50 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-[#C58B4B]/5">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#C58B4B]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="flex items-center justify-between text-stone-400 mb-3 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              New Orders Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-stone-800/80 border border-stone-700/50 flex items-center justify-center text-[#C58B4B] group-hover:bg-[#C58B4B] group-hover:text-stone-950 transition-colors shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 relative z-10">
            <span className="text-3xl xl:text-4xl font-bold font-mono text-stone-100 tracking-tight">
              {stats?.newOrdersToday ?? 0}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-2.5 flex items-center gap-1.5 relative z-10">
            <span>Incoming customer purchases awaiting processing</span>
          </p>
        </div>

        {/* Card 2: Pending Verification */}
        <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-5 xl:p-6 hover:border-amber-500/50 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-amber-500/5">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="flex items-center justify-between text-stone-400 mb-3 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Pending Verification
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 relative z-10">
            <span className="text-3xl xl:text-4xl font-bold font-mono text-stone-100 tracking-tight">
              {stats?.pendingVerification ?? 0}
            </span>
            <span className="inline-flex items-center text-[11px] text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              Requires Action
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-2.5 flex items-center gap-1.5 relative z-10">
            <span>Orders pending confirmation or TrxID check</span>
          </p>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-5 xl:p-6 hover:border-rose-500/50 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-rose-500/5">
          <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="flex items-center justify-between text-stone-400 mb-3 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Low Stock Alerts
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-stone-950 transition-colors shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 relative z-10">
            <span className="text-3xl xl:text-4xl font-bold font-mono text-stone-100 tracking-tight">
              {stats?.lowStockAlerts ?? 0}
            </span>
            <span className="inline-flex items-center text-[11px] text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
              Threshold &le; 5 units
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-2.5 flex items-center gap-1.5 relative z-10">
            <span>Artisan pieces requiring workshop restocking</span>
          </p>
        </div>

        {/* Card 4: Orders This Month */}
        <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-5 xl:p-6 hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-emerald-500/5">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="flex items-center justify-between text-stone-400 mb-3 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Orders This Month
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-stone-950 transition-colors shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 relative z-10">
            <span className="text-3xl xl:text-4xl font-bold font-mono text-stone-100 tracking-tight">
              {stats?.ordersThisMonth ?? orders?.length ?? 0}
            </span>
            <span className="inline-flex items-center text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Total: {formatPrice(stats?.totalRevenue || 0)}
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-2.5 flex items-center justify-between relative z-10">
            <span>Settled Revenue</span>
            <strong className="text-emerald-400 font-mono font-semibold">{formatPrice(stats?.settledRevenue || 0)}</strong>
          </p>
        </div>
      </div>

      {/* Sales Analytics & Status Breakdown - Full 12-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Real-Time Connected Sales Analytics Chart (8 cols on XL) */}
        <div className="xl:col-span-8">
          <SalesAnalyticsChart
            formatPrice={formatPrice}
            autoRefreshSignal={orders?.length}
          />
        </div>

        {/* Order Status Breakdown (4 cols on XL) */}
        <div className="xl:col-span-4 bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-stone-100 tracking-wide">
                Fulfillment Distribution
              </h3>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#C58B4B]/15 text-[#E6AF68] border border-[#C58B4B]/30">
                Live Status
              </span>
            </div>
            <p className="text-xs text-stone-400 mb-6">
              Milestone progress across all historical atelier purchases.
            </p>

            <div className="space-y-4">
              {[
                { label: 'Pending Confirmation', count: statusCounts.pending, color: 'bg-amber-400', pct: totalOrdersCount ? Math.round((statusCounts.pending / totalOrdersCount) * 100) : 36 },
                { label: 'Processing & In Assembly', count: statusCounts.processing, color: 'bg-blue-400', pct: totalOrdersCount ? Math.round((statusCounts.processing / totalOrdersCount) * 100) : 18 },
                { label: 'Dispatched / In Transit', count: statusCounts.shipped, color: 'bg-purple-400', pct: totalOrdersCount ? Math.round((statusCounts.shipped / totalOrdersCount) * 100) : 9 },
                { label: 'Delivered & Completed', count: statusCounts.delivered, color: 'bg-emerald-400', pct: totalOrdersCount ? Math.round((statusCounts.delivered / totalOrdersCount) * 100) : 27 },
                { label: 'Cancelled / Returned', count: statusCounts.cancelled, color: 'bg-rose-400', pct: totalOrdersCount ? Math.round((statusCounts.cancelled / totalOrdersCount) * 100) : 10 }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-xs`} />
                      <span className="text-stone-300 font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500 text-[11px] font-mono">{item.pct}%</span>
                      <span className="font-bold text-stone-200 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded-md text-[11px] font-mono min-w-6 text-center">
                        {item.count}
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.max(item.pct, 4)}%` }}
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between text-xs">
            <div className="text-stone-400">
              Total Recorded Orders: <strong className="text-stone-100 font-mono ml-1">{totalOrdersCount}</strong>
            </div>
            <div className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>98.5% Fulfillment Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Live Table - Edge-to-Edge Luxury Design */}
      <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 xl:p-6 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-100 tracking-wide">
              Recent Studio Orders
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Live customer transactions and manual orders placed recently across all sales channels.
            </p>
          </div>
          <span className="text-xs text-stone-400 font-medium bg-stone-900 border border-stone-800 px-3 py-1 rounded-lg self-start sm:self-auto">
            Showing latest {recentOrders.length} orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900/90 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="py-3.5 px-5 font-bold">Order ID</th>
                <th className="py-3.5 px-5 font-bold">Customer</th>
                <th className="py-3.5 px-5 font-bold">Fulfillment Status</th>
                <th className="py-3.5 px-5 font-bold">Payment</th>
                <th className="py-3.5 px-5 font-bold">Channel</th>
                <th className="py-3.5 px-5 font-bold text-center">Items</th>
                <th className="py-3.5 px-5 font-bold">Total</th>
                <th className="py-3.5 px-5 font-bold">Placed / Updated</th>
                <th className="py-3.5 px-5 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-stone-500">
                    No orders recorded yet. Place an order or click "Create Manual Order" above.
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr
                    key={order._id}
                    onClick={() => onOpenOrder(order)}
                    className="hover:bg-stone-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-5">
                      <div className="font-mono font-bold text-stone-100 group-hover:text-[#E6AF68] transition-colors">
                        {order.orderNumber}
                      </div>
                      <div className="text-[10px] text-stone-500 font-sans mt-0.5">
                        {order.source === 'guest' ? 'Guest Checkout' : order.source === 'manual' ? 'Staff Manual' : 'Registered Member'}
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C58B4B]/20 to-stone-800 text-[#E6AF68] font-bold text-[11px] flex items-center justify-center border border-[#C58B4B]/30 flex-shrink-0">
                          {order.customer?.name ? order.customer.name.substring(0, 2).toUpperCase() : 'CU'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-stone-200 truncate">{order.customer?.name || 'Valued Customer'}</div>
                          <div className="text-[10px] text-stone-400 font-mono">{order.customer?.phone || 'No phone'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getOrderStatusBadge(order.orderStatus)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{order.orderStatus}</span>
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border uppercase tracking-wider text-[10px] ${getPaymentStatusBadge(order.paymentStatus)}`}>
                        {order.paymentStatus || 'pending'}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-stone-300 font-medium">
                      {order.paymentDetails?.channelName || order.paymentMethod?.toUpperCase() || 'Cash on Delivery'}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <span className="font-mono text-stone-300 bg-stone-900 border border-stone-800 px-2.5 py-1 rounded-md text-[11px]">
                        {order.items?.length || 1}
                      </span>
                    </td>

                    <td className="py-4 px-5 font-bold font-mono text-stone-100 text-sm">
                      {formatPrice(order.totalAmount)}
                    </td>

                    <td className="py-4 px-5 text-stone-400 text-[11px] font-mono">
                      <div>
                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {new Date(order.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    <td className="py-4 px-5 text-right" onClick={(e) => { e.stopPropagation(); onOpenOrder(order); }}>
                      <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-[#C58B4B] text-stone-200 hover:text-stone-950 border border-stone-700 hover:border-[#C58B4B] transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer">
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
