import React, { useState } from 'react';
import {
  Search,
  Filter,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  ExternalLink,
  RotateCw,
  FileText,
  User,
  ShieldCheck,
  Eye,
  RefreshCw
} from 'lucide-react';
import apiFetch from '../../../utils/api.js';

export default function PaymentsTab({
  payments,
  loading,
  onRefresh,
  onOpenOrder,
  formatPrice
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [providerFilter, setProviderFilter] = useState('All');

  // Selected Payment for Detail View
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Remittance Form State
  const [courierNameInput, setCourierNameInput] = useState('Steadfast Courier');
  const [remittanceAmountInput, setRemittanceAmountInput] = useState('');

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
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  const filteredPayments = payments.filter(pay => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchOrder = pay.orderNumber?.toLowerCase().includes(term);
      const matchName = pay.customer?.name?.toLowerCase().includes(term);
      const matchPhone = pay.customer?.phone?.toLowerCase().includes(term);
      const matchTrx = pay.transactionId?.toLowerCase().includes(term);
      if (!matchOrder && !matchName && !matchPhone && !matchTrx) return false;
    }

    if (statusFilter !== 'All') {
      if (pay.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    }

    if (providerFilter !== 'All') {
      if (!pay.provider?.toLowerCase().includes(providerFilter.toLowerCase())) return false;
    }

    return true;
  });

  const handleUpdatePayment = async (status, courierCollected = false) => {
    if (!selectedPayment) return;
    setActionLoading(true);
    setFeedback('');
    try {
      const res = await apiFetch(`/orders/admin/${selectedPayment.orderId}/payment`, {
        method: 'PUT',
        body: JSON.stringify({
          paymentStatus: status,
          courierCollected,
          courierName: courierNameInput,
          receivedAmount: status === 'paid' ? selectedPayment.amount : selectedPayment.received
        })
      });

      if (res.success && res.order) {
        setFeedback(`Payment updated to ${status.toUpperCase()}`);
        setSelectedPayment(prev => ({
          ...prev,
          status,
          received: status === 'paid' ? selectedPayment.amount : prev.received,
          outstanding: status === 'paid' ? 0 : prev.outstanding,
          courierCollected
        }));
        onRefresh();
      }
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Summary metrics
  const totalExpected = payments.reduce((sum, p) => sum + (Number(p.expected) || 0), 0);
  const totalReceived = payments.reduce((sum, p) => sum + (Number(p.received) || 0), 0);
  const totalPendingRemittance = Math.max(0, totalExpected - totalReceived);
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C58B4B]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C58B4B]">
              Financial Ledger &amp; Treasury
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-stone-100 font-bold">
            Payments &amp; Remittances
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Reconcile digital mobile wallet transactions, verify bank deposits, and track courier cash collections.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-stone-800/90 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-700/60 transition shadow-xs cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C58B4B]' : 'text-stone-400'}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5">
        <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">Total Invoiced Volume</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-stone-100 mt-2 block">{formatPrice(totalExpected)}</span>
          <span className="text-[11px] text-stone-400 mt-1 block">Across {payments.length} order invoices</span>
        </div>
        <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">Settled Payments</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-2 block">{formatPrice(totalReceived)}</span>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">Verified &amp; banked in studio account</span>
        </div>
        <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">Outstanding Remittance</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-400 mt-2 block">{formatPrice(totalPendingRemittance)}</span>
          <span className="text-[11px] text-amber-400/80 mt-1 block">Due from courier or pending TrxID</span>
        </div>
        <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">Pending Verification</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-[#E6AF68] mt-2 block">{pendingCount}</span>
          <span className="text-[11px] text-[#E6AF68]/80 mt-1 block">Transactions awaiting manual audit</span>
        </div>
      </div>

      {/* Filter and Search Bar - Responsive Full Width */}
      <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, customer, TrxID, phone, or account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#C58B4B] focus:ring-1 focus:ring-[#C58B4B]/30 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C58B4B] transition cursor-pointer"
          >
            <option value="All">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C58B4B] transition cursor-pointer"
          >
            <option value="All">All Channels</option>
            <option value="Cash on Delivery">Cash on Delivery</option>
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Rocket">Rocket</option>
            <option value="Bank">Bank Transfer</option>
          </select>

          {(searchTerm || statusFilter !== 'All' || providerFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setProviderFilter('All');
              }}
              className="px-3 py-2.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl transition cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Payments Table - Edge-to-Edge Fluid Design */}
      <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>Found <strong className="text-stone-200 font-mono">{filteredPayments.length}</strong> payment transactions</span>
          <span className="text-[11px] text-stone-500">Click any transaction to reconcile or record remittance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900/90 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="py-3.5 px-5 font-bold">Order ID</th>
                <th className="py-3.5 px-5 font-bold">Customer</th>
                <th className="py-3.5 px-5 font-bold">Payment Method</th>
                <th className="py-3.5 px-5 font-bold">Invoiced</th>
                <th className="py-3.5 px-5 font-bold">Settled</th>
                <th className="py-3.5 px-5 font-bold">Status</th>
                <th className="py-3.5 px-5 font-bold">TrxID / Reference</th>
                <th className="py-3.5 px-5 font-bold">Date</th>
                <th className="py-3.5 px-5 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-16 text-stone-500">
                    No payment records match the current filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedPayment(pay)}
                    className="hover:bg-stone-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-5 font-mono font-bold text-stone-100 group-hover:text-[#E6AF68] transition-colors">
                      {pay.orderNumber}
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C58B4B]/20 to-stone-800 text-[#E6AF68] font-bold text-[11px] flex items-center justify-center border border-[#C58B4B]/30 flex-shrink-0">
                          {pay.customer?.name ? pay.customer.name.substring(0, 2).toUpperCase() : 'CU'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-stone-200 truncate">{pay.customer?.name || 'Customer'}</div>
                          <div className="text-[10px] text-stone-400 font-mono">{pay.customer?.phone || 'No phone'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="text-stone-200 font-semibold">{pay.channel}</div>
                      <div className="text-[10px] text-stone-400">{pay.provider}</div>
                    </td>

                    <td className="py-4 px-5 text-stone-100 font-mono font-bold">
                      {formatPrice(pay.expected)}
                    </td>

                    <td className="py-4 px-5 text-emerald-400 font-mono font-bold">
                      {formatPrice(pay.received)}
                    </td>

                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getPaymentStatusBadge(pay.status)}`}>
                        {pay.status || 'pending'}
                      </span>
                    </td>

                    <td className="py-4 px-5 font-mono text-xs text-stone-300">
                      {pay.transactionId ? (
                        <span className="bg-stone-900 border border-stone-800 px-2 py-0.5 rounded text-[11px] text-[#E6AF68]">
                          {pay.transactionId}
                        </span>
                      ) : (
                        <span className="text-stone-600">Pending</span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-stone-400 font-mono text-[11px]">
                      <div>
                        {new Date(pay.lastUpdated).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {new Date(pay.lastUpdated).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    <td className="py-4 px-5 text-right" onClick={(e) => { e.stopPropagation(); setSelectedPayment(pay); }}>
                      <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-[#C58B4B] text-stone-200 hover:text-stone-950 border border-stone-700 hover:border-[#C58B4B] transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1c1917] border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-stone-800 bg-stone-900/80 sticky top-0 z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-serif text-stone-100 font-semibold">
                    Payment {selectedPayment.orderNumber}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPaymentStatusBadge(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Recorded with customer order {selectedPayment.orderNumber}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const ordId = selectedPayment.orderId;
                    setSelectedPayment(null);
                    onOpenOrder({ _id: ordId, orderNumber: selectedPayment.orderNumber });
                  }}
                  className="px-3 py-1.5 text-xs text-[#C58B4B] hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> View Order
                </button>
                <button
                  onClick={() => { setSelectedPayment(null); setFeedback(''); }}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs border border-stone-700 transition"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Feedback alert */}
            {feedback && (
              <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 flex items-center justify-between">
                <span>{feedback}</span>
                <button onClick={() => setFeedback('')} className="text-stone-400 hover:text-stone-200">✕</button>
              </div>
            )}

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Financial Status Summary */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-stone-950 rounded-xl border border-stone-800 text-center">
                <div>
                  <span className="text-[11px] text-stone-500 block uppercase">Expected</span>
                  <span className="text-lg font-bold text-stone-100">{formatPrice(selectedPayment.expected)}</span>
                </div>
                <div className="border-x border-stone-800">
                  <span className="text-[11px] text-stone-500 block uppercase">Received / Applied</span>
                  <span className="text-lg font-bold text-emerald-400">{formatPrice(selectedPayment.received)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 block uppercase">Outstanding</span>
                  <span className="text-lg font-bold text-amber-400">{formatPrice(selectedPayment.outstanding)}</span>
                </div>
              </div>

              {/* Payment Context Card */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 space-y-3 text-xs">
                <div className="border-b border-stone-800 pb-2">
                  <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px]">
                    Payment &amp; Channel Context
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Payment channel and provider snapshot saved when customer placed order.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-stone-500 block">Channel</span>
                    <span className="font-semibold text-stone-200">{selectedPayment.channel}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Operation</span>
                    <span className="font-semibold text-stone-200">{selectedPayment.provider}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Transaction Reference / TrxID</span>
                    <span className="font-mono text-stone-200">{selectedPayment.transactionId || '—'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Customer Contact</span>
                    <span className="font-medium text-stone-200">{selectedPayment.customer?.name} ({selectedPayment.customer?.phone})</span>
                  </div>
                </div>
              </div>

              {/* Courier Remittance Section (for COD) */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 space-y-3 text-xs">
                <div className="border-b border-stone-800 pb-2 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#C58B4B]" /> COD Courier Collection &amp; Remittance
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Record physical cash collected by delivery courier and remitted to atelier bank account.
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${selectedPayment.courierCollected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-stone-800 text-stone-400 border-stone-700'}`}>
                    {selectedPayment.courierCollected ? 'Remittance Received' : 'Pending Remittance'}
                  </span>
                </div>

                {selectedPayment.courierCollected ? (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs">
                    ✓ Full courier collection remittance of <strong>{formatPrice(selectedPayment.expected)}</strong> has been verified and settled.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-stone-400 text-xs">
                      Once the courier service (e.g. Steadfast, Pathao) pays out the collected cash for this delivery, click below to record the remittance.
                    </p>
                    <div className="flex gap-2">
                      <select
                        value={courierNameInput}
                        onChange={(e) => setCourierNameInput(e.target.value)}
                        className="bg-stone-950 border border-stone-700 rounded px-2.5 py-1.5 text-xs text-stone-200"
                      >
                        <option value="Steadfast Courier">Steadfast Courier</option>
                        <option value="Pathao Courier">Pathao Courier</option>
                        <option value="RedX Logistics">RedX Logistics</option>
                        <option value="Paperfly">Paperfly</option>
                        <option value="Direct Cash">Direct Studio Cash</option>
                      </select>
                      <button
                        onClick={() => handleUpdatePayment('paid', true)}
                        disabled={actionLoading}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition text-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Record Courier Remittance
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-800 flex flex-wrap gap-2">
                <button
                  disabled={actionLoading || selectedPayment.status === 'paid'}
                  onClick={() => handleUpdatePayment('paid')}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                >
                  Verify TrxID &amp; Mark Paid
                </button>
                <button
                  disabled={actionLoading || selectedPayment.status === 'unpaid'}
                  onClick={() => handleUpdatePayment('unpaid')}
                  className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition"
                >
                  Mark as Unpaid
                </button>
                <button
                  disabled={actionLoading || selectedPayment.status === 'refunded'}
                  onClick={() => handleUpdatePayment('refunded')}
                  className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition"
                >
                  Issue Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
