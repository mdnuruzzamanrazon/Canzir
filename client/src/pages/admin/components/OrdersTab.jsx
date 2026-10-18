import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package,
  FileText,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  RotateCw,
  Send,
  Printer,
  ChevronDown,
  UserCheck,
  Navigation
} from 'lucide-react';
import apiFetch from '../../../utils/api.js';

export default function OrdersTab({
  orders,
  loading,
  onRefresh,
  onCreateOrder,
  selectedOrder,
  setSelectedOrder,
  onOpenPayment,
  formatPrice
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('All');
  const [filterClaim, setFilterClaim] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');

  // Order Detail Drawer State
  const [actionLoading, setActionLoading] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [courierInput, setCourierInput] = useState('Steadfast Courier');
  const [statusFeedback, setStatusFeedback] = useState('');

  // Status badge styling helper
  const getOrderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'processing':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'out for delivery':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'delivered':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'verified':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'failed':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'refunded':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(ord => {
    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchOrderNum = ord.orderNumber?.toLowerCase().includes(term);
      const matchName = ord.customer?.name?.toLowerCase().includes(term);
      const matchPhone = ord.customer?.phone?.toLowerCase().includes(term);
      const matchEmail = ord.customer?.email?.toLowerCase().includes(term);
      if (!matchOrderNum && !matchName && !matchPhone && !matchEmail) return false;
    }

    // Source
    if (filterSource !== 'All') {
      if (ord.source?.toLowerCase() !== filterSource.toLowerCase()) return false;
    }

    // Claim
    if (filterClaim !== 'All') {
      if (ord.claim?.claimStatus?.toLowerCase() !== filterClaim.toLowerCase()) return false;
    }

    // Order Status
    if (filterStatus !== 'All') {
      if (ord.orderStatus?.toLowerCase() !== filterStatus.toLowerCase()) return false;
    }

    // Payment Status
    if (filterPayment !== 'All') {
      if (ord.paymentStatus?.toLowerCase() !== filterPayment.toLowerCase()) return false;
    }

    return true;
  });

  // Actions for Order Detail Drawer
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setStatusFeedback('');
    try {
      const res = await apiFetch(`/orders/admin/${selectedOrder._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          note: `Staff updated status to ${newStatus}`
        })
      });
      if (res.success && res.order) {
        setSelectedOrder(res.order);
        setStatusFeedback(`Order status updated to ${newStatus}`);
        onRefresh();
      }
    } catch (err) {
      setStatusFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTracking = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      const res = await apiFetch(`/orders/admin/${selectedOrder._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          trackingNumber: trackingInput,
          courierName: courierInput,
          status: selectedOrder.orderStatus === 'Pending' || selectedOrder.orderStatus === 'Confirmed' ? 'Shipped' : selectedOrder.orderStatus
        })
      });
      if (res.success && res.order) {
        setSelectedOrder(res.order);
        setStatusFeedback('Tracking & courier assigned successfully');
        onRefresh();
      }
    } catch (err) {
      setStatusFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !newNoteText.trim()) return;
    setActionLoading(true);
    try {
      const res = await apiFetch(`/orders/admin/${selectedOrder._id}/note`, {
        method: 'POST',
        body: JSON.stringify({ note: newNoteText.trim() })
      });
      if (res.success && res.internalNotes) {
        setSelectedOrder(prev => ({ ...prev, internalNotes: res.internalNotes }));
        setNewNoteText('');
        setStatusFeedback('Internal note added');
      }
    } catch (err) {
      setStatusFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendClaim = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      const res = await apiFetch(`/orders/admin/${selectedOrder._id}/claim/resend`, {
        method: 'POST'
      });
      if (res.success) {
        setStatusFeedback('Customer claim email dispatched with new 90-day expiry token');
        if (res.claim) {
          setSelectedOrder(prev => ({ ...prev, claim: res.claim }));
        }
      }
    } catch (err) {
      setStatusFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C58B4B]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C58B4B]">
              Fulfillment Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-stone-100 font-bold">
            Orders Management
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Track customer purchases, process workshop assembly, record courier dispatch, and manage client claims.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-stone-800/90 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-700/60 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C58B4B]' : 'text-stone-400'}`} />
            <span>Refresh</span>
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

      {/* Quick Filter Status Counter Chips */}
      <div className="flex flex-wrap items-center gap-2.5">
        {[
          { label: 'All Orders', value: 'All', count: orders.length, color: 'text-stone-300' },
          { label: 'Pending Confirmation', value: 'Pending', count: orders.filter(o => o.orderStatus === 'Pending').length, color: 'text-amber-400' },
          { label: 'Confirmed', value: 'Confirmed', count: orders.filter(o => o.orderStatus === 'Confirmed').length, color: 'text-emerald-400' },
          { label: 'Processing', value: 'Processing', count: orders.filter(o => o.orderStatus === 'Processing').length, color: 'text-blue-400' },
          { label: 'Dispatched / In Transit', value: 'Shipped', count: orders.filter(o => o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery').length, color: 'text-purple-400' },
          { label: 'Delivered', value: 'Delivered', count: orders.filter(o => o.orderStatus === 'Delivered').length, color: 'text-teal-400' },
          { label: 'Cancelled', value: 'Cancelled', count: orders.filter(o => o.orderStatus === 'Cancelled').length, color: 'text-rose-400' }
        ].map(chip => (
          <button
            key={chip.value}
            type="button"
            onClick={() => setFilterStatus(chip.value)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              filterStatus === chip.value
                ? 'bg-[#C58B4B]/15 text-[#E6AF68] border-[#C58B4B]/40 shadow-xs'
                : 'bg-[#181513] text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200'
            }`}
          >
            <span>{chip.label}</span>
            <span className={`px-1.5 py-0.2 rounded-md bg-stone-900 border border-stone-800 text-[10px] font-mono font-bold ${chip.color}`}>
              {chip.count}
            </span>
          </button>
        ))}
      </div>

      {/* Multi-Faceted Filter & Search Bar - Responsive Full Width */}
      <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center justify-between shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID (CNZ-...), customer name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#C58B4B] focus:ring-1 focus:ring-[#C58B4B]/30 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
            >
              &times;
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Source Filter */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C58B4B] transition cursor-pointer"
          >
            <option value="All">All Sources</option>
            <option value="guest">Guest checkout</option>
            <option value="web">Registered web</option>
            <option value="manual">Manual staff order</option>
          </select>

          {/* Claim Status Filter */}
          <select
            value={filterClaim}
            onChange={(e) => setFilterClaim(e.target.value)}
            className="bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C58B4B] transition cursor-pointer"
          >
            <option value="All">All Claim Statuses</option>
            <option value="email_sent">Email Sent</option>
            <option value="claimed">Claimed</option>
            <option value="unclaimed">Unclaimed</option>
          </select>

          {/* Payment Filter */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C58B4B] transition cursor-pointer"
          >
            <option value="All">All Payments</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Reset Filters button */}
          {(searchTerm || filterSource !== 'All' || filterClaim !== 'All' || filterStatus !== 'All' || filterPayment !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSource('All');
                setFilterClaim('All');
                setFilterStatus('All');
                setFilterPayment('All');
              }}
              className="px-3 py-2.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl transition cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table - Edge-to-Edge Fluid Design */}
      <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>Found <strong className="text-stone-200 font-mono">{filteredOrders.length}</strong> matching orders</span>
          <span className="text-[11px] text-stone-500">Click any row to open full order details and fulfillment timeline</span>
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
                <th className="py-3.5 px-5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-16 text-stone-500">
                    No matching orders found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
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
                          <div className="font-semibold text-stone-200 truncate">{order.customer?.name || 'Valued Client'}</div>
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
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getPaymentStatusBadge(order.paymentStatus)}`}>
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

                    <td className="py-4 px-5 text-right" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}>
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

      {/* Dedicated Order Detail Modal / Slide-over Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-end animate-fadeIn">
          <div className="bg-[#1c1917] border-l border-stone-800 w-full max-w-3xl h-full overflow-y-auto flex flex-col shadow-2xl">
            {/* Header Toolbar */}
            <div className="p-6 border-b border-stone-800 bg-stone-900/90 sticky top-0 z-20 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-serif text-stone-100 font-semibold">
                    Order {selectedOrder.orderNumber}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getOrderStatusBadge(selectedOrder.orderStatus)}`}>
                    {selectedOrder.orderStatus}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPaymentStatusBadge(selectedOrder.paymentStatus)}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  title="Print Packing Slip / Invoice"
                  className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setSelectedOrder(null); setStatusFeedback(''); }}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs border border-stone-700 transition"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Status Feedback Toast */}
            {statusFeedback && (
              <div className="mx-6 mt-4 p-3 bg-[#C58B4B]/10 border border-[#C58B4B]/30 rounded-lg text-xs text-[#C58B4B] flex items-center justify-between">
                <span>{statusFeedback}</span>
                <button onClick={() => setStatusFeedback('')} className="text-stone-400 hover:text-stone-200">✕</button>
              </div>
            )}

            {/* Quick Action Buttons Toolbar */}
            <div className="p-6 border-b border-stone-800 bg-stone-900/40 flex flex-wrap gap-2">
              <button
                disabled={actionLoading || selectedOrder.orderStatus === 'Confirmed'}
                onClick={() => handleUpdateStatus('Confirmed')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30 transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Confirm Order
              </button>
              <button
                disabled={actionLoading || selectedOrder.orderStatus === 'Processing'}
                onClick={() => handleUpdateStatus('Processing')}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/30 transition flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" /> Mark Processing
              </button>
              <button
                disabled={actionLoading || selectedOrder.orderStatus === 'Shipped'}
                onClick={() => handleUpdateStatus('Shipped')}
                className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium border border-blue-500/30 transition flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" /> Mark Shipped
              </button>
              <button
                disabled={actionLoading || selectedOrder.orderStatus === 'Out for Delivery'}
                onClick={() => handleUpdateStatus('Out for Delivery')}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium border border-indigo-500/30 transition flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" /> Mark Out for Delivery
              </button>
              <button
                disabled={actionLoading || selectedOrder.orderStatus === 'Delivered'}
                onClick={() => handleUpdateStatus('Delivered')}
                className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-medium border border-teal-500/30 transition flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5" /> Mark Delivered
              </button>
              <button
                disabled={actionLoading || selectedOrder.orderStatus === 'Cancelled'}
                onClick={() => handleUpdateStatus('Cancelled')}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/30 transition flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel Order
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="p-6 space-y-6 flex-1">
              {/* Order Claim Banner */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-200">Order claim •</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {selectedOrder.claim?.claimStatus === 'claimed' ? 'Claimed' : 'Email Sent'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Customer ownership for guest and manual orders. Expires {selectedOrder.claim?.claimExpiresAt ? new Date(selectedOrder.claim.claimExpiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'in 90 days'}.
                  </p>
                </div>
                <button
                  disabled={actionLoading}
                  onClick={handleResendClaim}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition self-start sm:self-auto shrink-0 flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3 text-[#C58B4B]" /> Resend Claim Email
                </button>
              </div>

              {/* Grid: Customer Info & Order Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Information Card */}
                <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-4 space-y-3">
                  <div className="border-b border-stone-800 pb-2">
                    <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider">
                      Customer Information
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Billing contact recorded with this order.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C58B4B]/20 text-[#C58B4B] font-bold text-sm flex items-center justify-center">
                      {selectedOrder.customer?.name ? selectedOrder.customer.name.substring(0, 2).toUpperCase() : 'CU'}
                    </div>
                    <div>
                      <h5 className="font-semibold text-stone-100 text-sm">{selectedOrder.customer?.name}</h5>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                        {selectedOrder.source === 'guest' ? 'Guest checkout' : (selectedOrder.source === 'manual' ? 'Manual staff commission' : 'Registered customer')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-300 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Phone:</span>
                      <a href={`tel:${selectedOrder.customer?.phone}`} className="text-stone-200 hover:text-[#C58B4B] font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#C58B4B]" /> {selectedOrder.customer?.phone}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Email:</span>
                      <a href={`mailto:${selectedOrder.customer?.email}`} className="text-stone-200 hover:text-[#C58B4B] truncate max-w-[180px]">
                        {selectedOrder.customer?.email || '—'}
                      </a>
                    </div>
                    <div className="pt-2">
                      <a
                        href={`https://wa.me/${selectedOrder.customer?.phone?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                {/* Order & Context Card */}
                <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-4 space-y-3">
                  <div className="border-b border-stone-800 pb-2">
                    <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider">
                      Order &amp; Context
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Order status and source snapshot saved.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-stone-500 block text-[11px]">Order status</span>
                      <span className="font-semibold text-stone-200">{selectedOrder.orderStatus}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[11px]">Payment status</span>
                      <span className="font-semibold text-stone-200">{selectedOrder.paymentStatus}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[11px]">Source</span>
                      <span className="font-semibold text-stone-200 capitalize">{selectedOrder.source}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[11px]">Order Total</span>
                      <span className="font-semibold text-[#C58B4B]">{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information Card */}
              <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="border-b border-stone-800 pb-2 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#C58B4B]" /> Delivery Information
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Destination shipping address and courier dispatch details.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-stone-300 bg-stone-800 px-2 py-0.5 rounded">
                    Home Delivery
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-300">
                  <div className="space-y-1">
                    <div className="font-medium text-stone-100">{selectedOrder.customer?.name}</div>
                    <div>{selectedOrder.customer?.phone}</div>
                    <div className="text-stone-400">{selectedOrder.customer?.address}</div>
                    <div className="text-stone-400">{selectedOrder.customer?.city}, {selectedOrder.customer?.district} {selectedOrder.customer?.postalCode}</div>
                    <div className="text-stone-500">Bangladesh</div>
                    {selectedOrder.customer?.deliveryNotes && (
                      <div className="mt-2 p-2 rounded bg-stone-950 border border-stone-800 text-[11px] text-stone-300">
                        <strong className="text-stone-400">Customer Note:</strong> {selectedOrder.customer.deliveryNotes}
                      </div>
                    )}
                  </div>

                  {/* Courier & Tracking Assignment */}
                  <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 space-y-2">
                    <span className="text-[11px] font-semibold text-stone-300 block">
                      Assign Tracking &amp; Courier Carrier
                    </span>
                    <div>
                      <select
                        value={courierInput}
                        onChange={(e) => setCourierInput(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 text-xs rounded px-2 py-1.5 text-stone-200"
                      >
                        <option value="Steadfast Courier">Steadfast Courier</option>
                        <option value="Pathao Courier">Pathao Courier</option>
                        <option value="RedX Logistics">RedX Logistics</option>
                        <option value="Paperfly">Paperfly</option>
                        <option value="Sundarban Courier">Sundarban Courier Service</option>
                        <option value="Atelier Direct Delivery">Atelier Direct Concierge</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Tracking Number / Waybill ID"
                        value={trackingInput || selectedOrder.trackingNumber || ''}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 text-xs rounded px-2.5 py-1.5 text-stone-200"
                      />
                    </div>
                    <button
                      onClick={handleUpdateTracking}
                      disabled={actionLoading}
                      className="w-full py-1.5 text-xs font-semibold rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition"
                    >
                      Save Tracking
                    </button>
                    {selectedOrder.trackingNumber && (
                      <div className="text-[11px] text-emerald-400 pt-1">
                        Carrier: {selectedOrder.courierName || 'Assigned'} | Waybill: {selectedOrder.trackingNumber}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Snapshot Card */}
              <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="border-b border-stone-800 pb-2">
                  <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#C58B4B]" /> Ordered Items
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Product and price snapshots saved when the order was placed.
                  </p>
                </div>

                <div className="divide-y divide-stone-800">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || '/assets/products/bamboo-lattice-table-lamp.jpeg'}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-md border border-stone-700"
                        />
                        <div>
                          <div className="font-semibold text-xs text-stone-200">{item.title}</div>
                          {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                            <div className="text-[11px] text-stone-500">
                              {Object.entries(item.selectedVariants)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(' · ')}
                            </div>
                          )}
                          <div className="text-[11px] text-[#C58B4B]">
                            {formatPrice(item.price)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-stone-400">Qty: {item.quantity}</div>
                        <div className="text-xs font-semibold text-stone-100">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary Card */}
              <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="border-b border-stone-800 pb-2 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#C58B4B]" /> Payment Details
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Financial breakdown, remittance state, and transaction reference.
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenPayment(selectedOrder)}
                    className="text-xs text-[#C58B4B] hover:underline font-medium"
                  >
                    View in Payments &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Channel snapshot */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded bg-[#C58B4B]/20 text-[#C58B4B] font-bold text-xs flex items-center justify-center">
                        {selectedOrder.paymentMethod ? selectedOrder.paymentMethod.substring(0, 2).toUpperCase() : 'CO'}
                      </span>
                      <div>
                        <div className="font-semibold text-stone-200">
                          {selectedOrder.paymentDetails?.channelName || selectedOrder.paymentMethod?.toUpperCase()}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {selectedOrder.paymentDetails?.provider || 'Cash On Delivery'}
                        </div>
                      </div>
                    </div>
                    {selectedOrder.paymentDetails?.transactionId && (
                      <div className="text-[11px] text-stone-400">
                        <strong className="text-stone-300">TrxID / Reference:</strong> {selectedOrder.paymentDetails.transactionId}
                      </div>
                    )}
                    {selectedOrder.paymentDetails?.senderPhone && (
                      <div className="text-[11px] text-stone-400">
                        <strong className="text-stone-300">Sender Phone:</strong> {selectedOrder.paymentDetails.senderPhone}
                      </div>
                    )}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="space-y-1.5 text-xs text-stone-400 bg-stone-950 p-3 rounded-lg border border-stone-800">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="text-stone-200">{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee:</span>
                      <span className="text-stone-200">{formatPrice(selectedOrder.shippingFee || 0)}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount ({selectedOrder.couponCode}):</span>
                        <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-stone-100 pt-1 border-t border-stone-800">
                      <span>Total Amount:</span>
                      <span className="text-[#C58B4B]">{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1">
                      <span>Received / Settled:</span>
                      <span className="text-emerald-400">{formatPrice(selectedOrder.paymentDetails?.receivedAmount || (selectedOrder.paymentStatus === 'paid' ? selectedOrder.totalAmount : 0))}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Outstanding Balance:</span>
                      <span className="text-amber-400">{formatPrice(selectedOrder.paymentDetails?.outstandingAmount ?? (selectedOrder.paymentStatus === 'paid' ? 0 : selectedOrder.totalAmount))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Internal Staff Notes Card */}
              <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="border-b border-stone-800 pb-2">
                  <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#C58B4B]" /> Internal Staff Notes
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Private notes visible only to atelier administrators and workshop staff.
                  </p>
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type an internal operational note..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#C58B4B]"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading || !newNoteText.trim()}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition"
                  >
                    Add Note
                  </button>
                </form>

                <div className="space-y-2 pt-1">
                  {selectedOrder.internalNotes?.length === 0 ? (
                    <div className="text-[11px] text-stone-500 italic">No internal staff notes yet.</div>
                  ) : (
                    selectedOrder.internalNotes?.map((nt, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-stone-500">
                          <span className="font-semibold text-stone-400">{nt.author || 'Staff'}</span>
                          <span>{new Date(nt.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-stone-300">{nt.note}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Order Activity & Fulfillment History Timeline */}
              <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="border-b border-stone-800 pb-2">
                  <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C58B4B]" /> Order Activity Timeline
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Fulfillment history, newest activity first.
                  </p>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-800">
                  {selectedOrder.statusHistory?.map((ev, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#C58B4B] border-2 border-stone-900" />
                      <div className="text-xs font-semibold text-stone-200">{ev.status}</div>
                      <div className="text-[11px] text-stone-400">{ev.note}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        {ev.author || 'System'} · {new Date(ev.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
