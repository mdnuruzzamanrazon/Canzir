import React, { useState } from 'react';
import {
  Search,
  User,
  ShoppingBag,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Eye,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function CustomersTab({
  customers,
  orders,
  loading,
  onRefresh,
  onOpenOrder,
  formatPrice
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = customers.filter(c => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  });

  // Find all orders associated with the selected customer
  const customerOrders = selectedCustomer
    ? orders.filter(ord => {
        const phoneMatch = ord.customer?.phone && selectedCustomer.phone && ord.customer.phone === selectedCustomer.phone;
        const emailMatch = ord.customer?.email && selectedCustomer.email && ord.customer.email.toLowerCase() === selectedCustomer.email.toLowerCase();
        const nameMatch = ord.customer?.name && selectedCustomer.name && ord.customer.name.toLowerCase() === selectedCustomer.name.toLowerCase();
        return phoneMatch || emailMatch || nameMatch;
      })
    : [];

  const aov = selectedCustomer?.ordersCount > 0
    ? Math.round(selectedCustomer.totalSpent / selectedCustomer.ordersCount)
    : 0;

  // Aggregate Customer Stats
  const totalLTV = customers.reduce((sum, c) => sum + (Number(c.totalSpent) || 0), 0);
  const repeatBuyers = customers.filter(c => (Number(c.ordersCount) || 0) > 1).length;
  const avgSpend = customers.length > 0 ? Math.round(totalLTV / customers.length) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C58B4B]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C58B4B]">
              Collector Relationships &amp; CRM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-stone-100 font-bold">
            Customer Directory &amp; LTV
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Complete records of registered collectors and guest buyers, their purchase frequencies, lifetime value, and order history.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-stone-800/90 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-700/60 transition shadow-xs cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C58B4B]' : 'text-stone-400'}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* 4 Customer KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5">
        <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">Total Active Collectors</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-stone-100 mt-2 block">{customers.length}</span>
          <span className="text-[11px] text-stone-400 mt-1 block">Registered &amp; verified guest buyers</span>
        </div>
        <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">Repeat Patrons</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-2 block">{repeatBuyers}</span>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">Customers with multiple orders</span>
        </div>
        <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">Cumulative Lifetime Spend</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-[#E6AF68] mt-2 block">{formatPrice(totalLTV)}</span>
          <span className="text-[11px] text-[#E6AF68]/80 mt-1 block">Total customer gross revenue</span>
        </div>
        <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">Average Customer Value</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-blue-400 mt-2 block">{formatPrice(avgSpend)}</span>
          <span className="text-[11px] text-blue-400/80 mt-1 block">Mean gross spend per collector</span>
        </div>
      </div>

      {/* Search Bar - Responsive Full Width */}
      <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center justify-between shadow-sm">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone number, or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#C58B4B] focus:ring-1 focus:ring-[#C58B4B]/30 transition"
          />
        </div>
        <span className="text-xs text-stone-400">
          Showing <strong className="text-stone-100 font-mono">{filteredCustomers.length}</strong> of {customers.length} patrons
        </span>
      </div>

      {/* Customers Table - Edge-to-Edge Fluid Design */}
      <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900/90 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="py-3.5 px-5 font-bold">Collector / Name</th>
                <th className="py-3.5 px-5 font-bold">Contact Phone</th>
                <th className="py-3.5 px-5 font-bold text-center">Orders</th>
                <th className="py-3.5 px-5 font-bold">Lifetime Value</th>
                <th className="py-3.5 px-5 font-bold">Latest Order</th>
                <th className="py-3.5 px-5 font-bold">Status</th>
                <th className="py-3.5 px-5 font-bold">First Purchase</th>
                <th className="py-3.5 px-5 text-right font-bold">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-16 text-stone-500">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedCustomer(cust)}
                    className="hover:bg-stone-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C58B4B]/20 to-stone-800 text-[#E6AF68] font-bold text-xs flex items-center justify-center border border-[#C58B4B]/30 flex-shrink-0">
                          {cust.name ? cust.name.substring(0, 2).toUpperCase() : 'CU'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-stone-100 group-hover:text-[#E6AF68] transition-colors truncate">
                            {cust.name}
                          </div>
                          <div className="text-[11px] text-stone-500 font-sans truncate">
                            {cust.email || 'Guest without email'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 font-mono text-stone-300">
                      {cust.phone}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <span className="px-2.5 py-1 rounded-md bg-stone-900 border border-stone-800 text-stone-200 font-mono font-bold text-[11px]">
                        {cust.ordersCount}
                      </span>
                    </td>

                    <td className="py-4 px-5 font-mono font-bold text-stone-100 text-sm">
                      {formatPrice(cust.totalSpent)}
                    </td>

                    <td className="py-4 px-5 text-stone-400 text-[11px] font-mono">
                      {cust.lastOrderDate ? (
                        <div>
                          <div className="text-stone-300">
                            {new Date(cust.lastOrderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-[10px] text-[#E6AF68] font-bold">
                            {cust.lastOrderNumber}
                          </div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{cust.status || 'Active'}</span>
                      </span>
                    </td>

                    <td className="py-4 px-5 text-stone-500 text-[11px] font-mono">
                      {cust.joined ? new Date(cust.joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>

                    <td className="py-4 px-5 text-right" onClick={(e) => { e.stopPropagation(); setSelectedCustomer(cust); }}>
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

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1c1917] border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-stone-800 bg-stone-900/80 sticky top-0 z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#C58B4B]/20 text-[#C58B4B] font-bold text-base flex items-center justify-center">
                  {selectedCustomer.name ? selectedCustomer.name.substring(0, 2).toUpperCase() : 'CU'}
                </div>
                <div>
                  <h3 className="text-xl font-serif text-stone-100 font-semibold">
                    {selectedCustomer.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                      {selectedCustomer.type || 'Collector Profile'}
                    </span>
                    <span className="text-xs text-stone-400">
                      Joined {selectedCustomer.joined ? new Date(selectedCustomer.joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs border border-stone-700 transition"
              >
                Close
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Lifetime Metrics Summary */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-stone-950 rounded-xl border border-stone-800 text-center">
                <div>
                  <span className="text-[11px] text-stone-500 block uppercase">Total Orders</span>
                  <span className="text-xl font-bold text-stone-100">{selectedCustomer.ordersCount}</span>
                </div>
                <div className="border-x border-stone-800">
                  <span className="text-[11px] text-stone-500 block uppercase">Lifetime Spend</span>
                  <span className="text-xl font-bold text-[#C58B4B]">{formatPrice(selectedCustomer.totalSpent)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 block uppercase">Avg. Order Value</span>
                  <span className="text-xl font-bold text-emerald-400">{formatPrice(aov)}</span>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 space-y-3 text-xs">
                <div className="border-b border-stone-800 pb-2">
                  <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px]">
                    Contact &amp; Delivery Address
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-stone-300">
                      <Phone className="w-3.5 h-3.5 text-[#C58B4B]" />
                      <a href={`tel:${selectedCustomer.phone}`} className="hover:underline font-mono">
                        {selectedCustomer.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-stone-300">
                      <Mail className="w-3.5 h-3.5 text-[#C58B4B]" />
                      <a href={`mailto:${selectedCustomer.email}`} className="hover:underline">
                        {selectedCustomer.email || 'No email provided'}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-stone-300">
                    <MapPin className="w-3.5 h-3.5 text-[#C58B4B] shrink-0 mt-0.5" />
                    <span className="text-stone-400">{selectedCustomer.address || 'Standard Delivery Address'}</span>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="border-b border-stone-800 pb-2 flex items-center justify-between">
                  <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#C58B4B]" /> Order History ({customerOrders.length})
                  </h4>
                </div>

                <div className="space-y-2">
                  {customerOrders.length === 0 ? (
                    <div className="text-center py-6 text-stone-500 text-xs">
                      No matching order history found.
                    </div>
                  ) : (
                    customerOrders.map(ord => (
                      <div
                        key={ord._id}
                        onClick={() => {
                          setSelectedCustomer(null);
                          onOpenOrder(ord);
                        }}
                        className="p-3 bg-stone-950 hover:bg-stone-900 rounded-lg border border-stone-800 transition cursor-pointer flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-stone-100 text-xs">{ord.orderNumber}</span>
                            <span className="text-[10px] text-stone-500">
                              {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-400 mt-1">
                            {ord.items?.map(it => `${it.title} (x${it.quantity})`).join(', ')}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold text-[#C58B4B] text-xs">{formatPrice(ord.totalAmount)}</div>
                          <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                            {ord.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
