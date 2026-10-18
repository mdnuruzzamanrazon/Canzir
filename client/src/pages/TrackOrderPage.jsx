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
  Phone,
  Sparkles,
  Navigation,
  PackageCheck,
  Copy,
  CheckCheck,
  RefreshCw,
  Printer,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  XCircle,
  Calendar,
  MessageCircle,
  Mail,
  HelpCircle,
  Boxes,
  Award,
  BadgeCheck,
  Info
} from 'lucide-react';
import apiFetch from '../utils/api.js';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';

const TrackOrderPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [myOrdersList, setMyOrdersList] = useState(() => {
    try {
      const raw = localStorage.getItem('canzir_my_orders');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch (e) {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [matchingOrders, setMatchingOrders] = useState([]);

  // 5 Canonical Milestones
  const MILESTONES = [
    {
      key: 'Confirmed',
      label: 'Order Confirmed',
      shortLabel: 'Confirmed',
      description: 'Order verified & queued for artisan workshop',
      icon: CheckCircle2
    },
    {
      key: 'Processing',
      label: 'Workshop Processing',
      shortLabel: 'Processing',
      description: 'Bamboo lattice weaving, heat curing & electrical testing',
      icon: Sparkles
    },
    {
      key: 'Shipped',
      label: 'Dispatched & Shipped',
      shortLabel: 'Shipped',
      description: 'Handed over to express courier for regional transit',
      icon: Truck
    },
    {
      key: 'Out for Delivery',
      label: 'Out for Delivery',
      shortLabel: 'Out for Delivery',
      description: 'Assigned to courier delivery rider for final doorstep drop',
      icon: Navigation
    },
    {
      key: 'Delivered',
      label: 'Delivered & Complete',
      shortLabel: 'Delivered',
      description: 'Safely handed over to recipient, unpacked & illuminated',
      icon: PackageCheck
    }
  ];

  // Synchronize customer orders from database & localStorage
  const syncCustomerOrders = async () => {
    setIsSyncing(true);
    try {
      let combined = [];

      // 1. Read existing local order history
      try {
        const raw = localStorage.getItem('canzir_my_orders');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            combined = [...parsed];
          }
        }
      } catch (e) {}

      // 2. Fetch authenticated customer orders from MongoDB
      if (user) {
        try {
          const res = await apiFetch('/orders/my');
          if (res.success && Array.isArray(res.orders)) {
            res.orders.forEach(srvOrd => {
              const existingIdx = combined.findIndex(
                o => (typeof o === 'string' ? o : o.orderNumber) === srvOrd.orderNumber
              );
              const mapped = {
                orderNumber: srvOrd.orderNumber,
                orderStatus: srvOrd.orderStatus,
                createdAt: srvOrd.createdAt,
                firstItemTitle: srvOrd.items?.[0]?.title || 'Artisan Fixture'
              };
              if (existingIdx >= 0) {
                combined[existingIdx] = mapped;
              } else {
                combined.push(mapped);
              }
            });
          }
        } catch (e) {}
      }

      // 3. Normalize & Deduplicate by orderNumber, preserving order of placement
      const map = new Map();
      combined.forEach(item => {
        const ordNum = typeof item === 'string' ? item : item.orderNumber;
        if (!ordNum) return;
        if (!map.has(ordNum)) {
          map.set(
            ordNum,
            typeof item === 'string'
              ? { orderNumber: ordNum, orderStatus: 'Pending', createdAt: new Date().toISOString() }
              : item
          );
        }
      });

      // 4. Sort with newest placed orders at the front (leftmost)
      const sorted = Array.from(map.values()).sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      // 5. Keep all active orders; once sync completes, retain rolling list of up to 5 most recent
      const finalized = sorted.slice(0, 5);
      setMyOrdersList(finalized);
      try {
        localStorage.setItem('canzir_my_orders', JSON.stringify(finalized));
      } catch (e) {}
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial Sync & Real-time Live Sync Interval (every 15s)
  useEffect(() => {
    syncCustomerOrders();
    const interval = setInterval(() => {
      syncCustomerOrders();
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Load from URL query param if present
  useEffect(() => {
    const urlOrderNum = searchParams.get('orderNumber');
    if (urlOrderNum) {
      setOrderNumber(urlOrderNum);
      executeTrack(urlOrderNum);
    }
  }, [searchParams]);

  const executeTrack = async (numToTrack, isRefresh = false) => {
    const queryNum = (numToTrack !== undefined ? numToTrack : orderNumber).trim();
    const queryPhone = phone.trim();

    if (!queryNum && !queryPhone) {
      setErrorMsg('Please enter either your Order Reference ID or your Phone Number to track your order.');
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setErrorMsg('');
      setMatchingOrders([]);
    }

    try {
      const query = new URLSearchParams();
      if (queryNum) query.set('orderNumber', queryNum);
      if (queryPhone) query.set('phone', queryPhone);

      const res = await apiFetch(`/orders/track?${query.toString()}`);
      if (res.success && res.order) {
        setOrder(res.order);
        setErrorMsg('');
        if (res.order.orderNumber) {
          setOrderNumber(res.order.orderNumber);
          setSearchParams({ orderNumber: res.order.orderNumber });
        }

        // If multiple orders were returned for this phone lookup
        if (Array.isArray(res.orders) && res.orders.length > 0) {
          setMatchingOrders(res.orders);
          setMyOrdersList(prev => {
            const newMapped = res.orders.map(o => ({
              orderNumber: o.orderNumber,
              orderStatus: o.orderStatus,
              createdAt: o.createdAt || new Date().toISOString(),
              firstItemTitle: o.items?.[0]?.title || 'Artisan Fixture'
            }));
            const combined = [
              ...newMapped,
              ...prev.filter(
                o => !newMapped.some(m => m.orderNumber === (typeof o === 'string' ? o : o.orderNumber))
              )
            ].slice(0, 5);
            try {
              localStorage.setItem('canzir_my_orders', JSON.stringify(combined));
            } catch (e) {}
            return combined;
          });
        } else {
          // Insert single order at front of Quick Select
          const newEntry = {
            orderNumber: res.order.orderNumber,
            orderStatus: res.order.orderStatus,
            createdAt: res.order.createdAt || new Date().toISOString(),
            firstItemTitle: res.order.items?.[0]?.title || 'Artisan Fixture'
          };

          setMyOrdersList(prev => {
            const filtered = prev.filter(
              o => (typeof o === 'string' ? o : o.orderNumber) !== res.order.orderNumber
            );
            const updated = [newEntry, ...filtered].slice(0, 5);
            try {
              localStorage.setItem('canzir_my_orders', JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to find an order with this Order ID or phone number.');
      if (!isRefresh) setOrder(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTrackSubmit = (e) => {
    if (e) e.preventDefault();
    if (!orderNumber.trim() && !phone.trim()) {
      setErrorMsg('Please enter either your Order Reference ID or your Phone Number.');
      return;
    }
    executeTrack(orderNumber);
  };

  const handleQuickSelect = (ordNum) => {
    setOrderNumber(ordNum);
    executeTrack(ordNum);
  };

  const handleCopyTracking = (trackNum) => {
    if (!trackNum) return;
    navigator.clipboard.writeText(trackNum);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  // Milestone Progress Calculation
  const getMilestoneIndex = (status) => {
    if (!status) return 0;
    const normalized = status.toLowerCase();
    if (normalized === 'pending') return 0;
    if (normalized === 'confirmed') return 0;
    if (normalized === 'processing') return 1;
    if (normalized === 'shipped') return 2;
    if (normalized === 'out for delivery') return 3;
    if (normalized === 'delivered') return 4;
    if (normalized === 'cancelled') return -1;
    return 0;
  };

  const isCancelled = order?.orderStatus?.toLowerCase() === 'cancelled';
  const isPending = order?.orderStatus?.toLowerCase() === 'pending';
  const currentStepIdx = getMilestoneIndex(order?.orderStatus);

  // Find historical timestamp for a given status
  const getStatusTimestamp = (statusName) => {
    if (!order?.statusHistory?.length) return null;
    const entry = order.statusHistory.find(
      h => h.status?.toLowerCase() === statusName.toLowerCase()
    );
    return entry ? new Date(entry.timestamp) : null;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F3] text-walnut py-8 sm:py-12">
      {/* Full-Width Spacious Architectural Container matching Canzir Store standards */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 space-y-8">

        {/* Editorial Header Banner with Integrated Horizontal Search Console */}
        <div className="bg-[#FAF6EF] border border-[#D8C0A0]/50 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
          {/* Subtle warm glow background accent */}
          <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-[#C58B4B]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-sand-500 font-medium mb-4 relative z-10">
            <Link to="/" className="hover:text-bamboo transition">Home</Link>
            <ChevronRight size={12} className="text-sand-400" />
            <Link to="/shop" className="hover:text-bamboo transition">Shop</Link>
            <ChevronRight size={12} className="text-sand-400" />
            <span className="text-walnut font-semibold">Artisan Order Tracking</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Header Narrative (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D8C0A0]/40 text-[#8A5622] text-xs font-semibold uppercase tracking-wider">
                <Truck size={13} className="text-[#C58B4B]" />
                <span>Live Workshop &amp; Transit Tracking</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-walnut leading-tight">
                Track Your Lighting Order
              </h1>
              <p className="text-xs sm:text-sm text-sand-600 leading-relaxed max-w-xl">
                Follow real-time bamboo seasoning, artisan hand-weaving, quality safety testing, and courier express doorstep delivery.
              </p>
            </div>

            {/* Right Integrated Horizontal Search Console (7 cols) */}
            <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-2xl border border-sand-300/80 p-5 sm:p-6 shadow-sm space-y-3.5">
              <form onSubmit={handleTrackSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {/* Order ID Input (Optional) */}
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-walnut mb-1 flex items-center justify-between">
                      <span>Order Reference ID</span>
                      <span className="text-[10px] text-sand-400 font-normal">Optional</span>
                    </label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
                      <input
                        type="text"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        placeholder="e.g. CNZ-37163"
                        className="w-full bg-[#FAF7F3] border border-sand-300 rounded-lg pl-8 pr-3 py-2 text-xs text-walnut font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#C58B4B]/30 focus:border-[#C58B4B] transition"
                      />
                    </div>
                  </div>

                  {/* Phone Input (Optional) */}
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-walnut mb-1 flex items-center justify-between">
                      <span>Phone Number</span>
                      <span className="text-[10px] text-[#8A5622] font-semibold bg-[#EBDDCB]/60 px-1.5 py-0.2 rounded text-[9px]">
                        Track by Phone
                      </span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-[#FAF7F3] border border-sand-300 rounded-lg px-3 py-2 text-xs text-walnut focus:outline-none focus:ring-2 focus:ring-[#C58B4B]/30 focus:border-[#C58B4B] transition"
                    />
                  </div>

                  {/* Search Button */}
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-[38px] bg-walnut hover:bg-walnut-700 active:scale-[0.98] text-cream rounded-lg font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? (
                        <RefreshCw size={13} className="animate-spin text-[#C58B4B]" />
                      ) : (
                        <>
                          <Search size={13} />
                          <span>Track</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Quick Select Order Chips - Only Genuine User Orders */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-sand-200/60 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-walnut">Quick Select:</span>
                  {myOrdersList.length === 0 ? (
                    <span className="text-[11px] text-sand-400 italic">
                      No orders placed yet. Orders you place will appear here for 1-click tracking.
                    </span>
                  ) : (
                    myOrdersList.map((ordItem) => {
                      const ordNum = typeof ordItem === 'string' ? ordItem : ordItem.orderNumber;
                      const ordStatus = typeof ordItem === 'string' ? '' : ordItem.orderStatus;
                      const isSelected = order?.orderNumber === ordNum;

                      const getStatusDot = (status) => {
                        switch (status?.toLowerCase()) {
                          case 'delivered': return 'bg-emerald-500';
                          case 'out for delivery': return 'bg-indigo-500';
                          case 'shipped': return 'bg-blue-500';
                          case 'processing': return 'bg-amber-500';
                          case 'confirmed': return 'bg-emerald-400';
                          case 'cancelled': return 'bg-rose-500';
                          default: return 'bg-amber-400';
                        }
                      };

                      return (
                        <button
                          key={ordNum}
                          type="button"
                          onClick={() => handleQuickSelect(ordNum)}
                          title={ordStatus ? `Status: ${ordStatus}` : ''}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#C58B4B] text-white border-[#C58B4B] shadow-xs'
                              : 'bg-[#FAF7F3] hover:bg-[#EBDDCB]/60 text-walnut border-sand-300'
                          }`}
                        >
                          {ordStatus && (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : getStatusDot(ordStatus)}`} />
                          )}
                          <span>{ordNum}</span>
                          {ordStatus?.toLowerCase() === 'delivered' && (
                            <span className={`text-[9px] font-sans ${isSelected ? 'text-white' : 'text-emerald-700 font-bold'}`}>✓</span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Real-time Live Sync Indicator */}
                <div className="flex items-center gap-1.5 text-[10px] text-sand-500 font-medium">
                  <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-spin' : 'bg-emerald-500 animate-pulse'}`} />
                  <span>
                    {isSyncing
                      ? 'Synchronizing...'
                      : lastSyncTime
                      ? `Live Synced (${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})`
                      : 'Live Synced'}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2 animate-fade-in">
                  <AlertCircle size={15} className="text-rose-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ORDER TRACKING MAIN VIEWPORT */}
        {order ? (
          <div className="space-y-6 animate-fade-in">

            {/* Multiple Orders Found for this Phone Switcher */}
            {matchingOrders.length > 1 && (
              <div className="p-4 bg-white rounded-2xl border border-sand-300/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-walnut">
                    Found {matchingOrders.length} orders for this phone number:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchingOrders.map(mo => (
                      <button
                        key={mo._id || mo.orderNumber}
                        type="button"
                        onClick={() => {
                          setOrder(mo);
                          setOrderNumber(mo.orderNumber);
                          setSearchParams({ orderNumber: mo.orderNumber });
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold border transition cursor-pointer ${
                          order?.orderNumber === mo.orderNumber
                            ? 'bg-[#C58B4B] text-white border-[#C58B4B] shadow-xs'
                            : 'bg-[#FAF7F3] hover:bg-sand-100 text-walnut border-sand-300'
                        }`}
                      >
                        {mo.orderNumber} ({mo.orderStatus})
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-sand-500 font-medium">Click any order to view details</span>
              </div>
            )}

            {/* 1. GRAND FULL-WIDTH VISUAL PROGRESS SHOWCASE CARD */}
            <div className="bg-white rounded-3xl border border-sand-200/80 p-6 sm:p-10 lg:p-12 shadow-sm space-y-8">
              
              {/* Header Info Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sand-200/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-[#8A5622] bg-[#EBDDCB]/50 px-3 py-1 rounded-full border border-[#D8C0A0]/60">
                      Live Order Tracking
                    </span>
                    <span className="text-xs text-sand-400">•</span>
                    <span className="text-xs text-sand-500 font-medium">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <h2 className="font-mono text-3xl sm:text-4xl font-bold text-walnut tracking-tight">
                      {order.orderNumber}
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sand-100 text-sand-600 border border-sand-200">
                      {order.items?.length || 0} {order.items?.length === 1 ? 'fixture' : 'fixtures'}
                    </span>
                  </div>
                </div>

                {/* Right Top Status & Actions */}
                <div className="flex items-center flex-wrap gap-3">
                  {/* Live Status Badge */}
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isCancelled
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : order.orderStatus === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-[#C58B4B]/15 text-[#8A5622] border border-[#C58B4B]/30'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${isCancelled ? 'bg-rose-500' : 'bg-[#C58B4B] animate-pulse'}`} />
                    <span>{order.orderStatus}</span>
                  </span>

                  {/* Refresh Button */}
                  <button
                    onClick={() => executeTrack(order.orderNumber, true)}
                    disabled={refreshing}
                    title="Refresh live status from server"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-sand-300 hover:bg-sand-50 text-xs text-walnut font-medium transition cursor-pointer"
                  >
                    <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#C58B4B]' : 'text-sand-500'} />
                    <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
                  </button>

                  {/* Print Button */}
                  <button
                    onClick={() => window.print()}
                    title="Print order receipt"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-sand-300 hover:bg-sand-50 text-xs text-walnut font-medium transition cursor-pointer"
                  >
                    <Printer size={13} className="text-sand-500" />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>

              {/* Status Special Banners */}
              {isCancelled && (
                <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3.5 text-xs text-rose-800">
                  <XCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-rose-900">This Order Has Been Cancelled</h3>
                    <p className="mt-0.5 text-rose-700 leading-relaxed">
                      {order.statusHistory?.[0]?.note || 'This order was cancelled by the workshop or per customer request.'}
                    </p>
                    <p className="mt-2 text-[11px] text-rose-600 font-medium">
                      If an upfront payment was made (bKash/Nagad/Card), your refund will be processed within 3-5 business days. Please contact our artisan concierge below for immediate assistance.
                    </p>
                  </div>
                </div>
              )}

              {isPending && !isCancelled && (
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3.5 text-xs text-amber-900">
                  <Clock size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-amber-950">Payment &amp; Order Verification In Progress</h3>
                    <p className="mt-0.5 text-amber-800 leading-relaxed">
                      We have received your order! Our workshop fulfillment team is verifying your payment details and will confirm your order shortly to queue materials for handcrafting.
                    </p>
                  </div>
                </div>
              )}

              {/* THE 5 HORIZONTAL MILESTONES (Wide Desktop View) */}
              {!isCancelled && (
                <div className="hidden md:block pt-4 pb-2">
                  <div className="relative">
                    {/* Background Progress Rail */}
                    <div className="absolute top-7 left-12 right-12 h-2 bg-[#EFE7E2] rounded-full z-0" />

                    {/* Illuminated Progress Bar Fill */}
                    <div
                      className="absolute top-7 left-12 h-2 bg-gradient-to-r from-[#C58B4B] via-[#A97033] to-[#8A5622] rounded-full z-0 transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            (currentStepIdx / (MILESTONES.length - 1)) * 100
                          )
                        )}%`
                      }}
                    />

                    {/* 5 Milestone Nodes Grid */}
                    <div className="relative z-10 grid grid-cols-5 gap-4">
                      {MILESTONES.map((step, idx) => {
                        const isCompleted = currentStepIdx > idx;
                        const isCurrent = currentStepIdx === idx && !isPending;
                        const StepIcon = step.icon;
                        const stepDate = getStatusTimestamp(step.key);

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center px-2">
                            {/* Step Badge Node */}
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                                isCompleted
                                  ? 'bg-[#8A5622] text-cream ring-4 ring-[#FAF7F3]'
                                  : isCurrent
                                  ? 'bg-[#C58B4B] text-cream ring-6 ring-[#C58B4B]/30 scale-110 shadow-glow-sm'
                                  : 'bg-white text-sand-400 border-2 border-sand-300'
                              }`}
                            >
                              {isCompleted ? (
                                <Check size={22} strokeWidth={2.8} />
                              ) : (
                                <StepIcon size={22} strokeWidth={isCurrent ? 2.5 : 2} />
                              )}
                            </div>

                            {/* Milestone Title */}
                            <span
                              className={`text-sm mt-3.5 font-bold tracking-tight ${
                                isCurrent
                                  ? 'text-[#8A5622]'
                                  : isCompleted
                                  ? 'text-walnut'
                                  : 'text-sand-400'
                              }`}
                            >
                              {step.label}
                            </span>

                            {/* Status Tag */}
                            <div className="mt-1">
                              {isCompleted ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCheck size={12} /> Done
                                </span>
                              ) : isCurrent ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C58B4B] text-white uppercase tracking-wider animate-pulse">
                                  Active Stage
                                </span>
                              ) : (
                                <span className="text-[11px] text-sand-400 font-medium">Pending</span>
                              )}
                            </div>

                            {/* Narrative Subtitle */}
                            <p className="text-[11px] text-sand-500 leading-snug mt-1.5 max-w-[190px]">
                              {step.description}
                            </p>

                            {/* Timestamp */}
                            {stepDate && (
                              <span className="text-[10px] text-sand-400 font-mono mt-1 font-medium">
                                {stepDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* MOBILE VERTICAL TIMELINE (Mobile View) */}
              {!isCancelled && (
                <div className="md:hidden space-y-4 pt-2">
                  <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EFE7E2]">
                    {MILESTONES.map((step, idx) => {
                      const isCompleted = currentStepIdx > idx;
                      const isCurrent = currentStepIdx === idx && !isPending;
                      const StepIcon = step.icon;
                      const stepDate = getStatusTimestamp(step.key);

                      return (
                        <div key={step.key} className="relative group">
                          {/* Circle on Rail */}
                          <div
                            className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition ${
                              isCompleted
                                ? 'bg-[#8A5622] text-cream ring-2 ring-white'
                                : isCurrent
                                ? 'bg-[#C58B4B] text-cream ring-2 ring-[#C58B4B]/40 scale-110 shadow-sm'
                                : 'bg-white text-sand-400 border border-sand-300'
                            }`}
                          >
                            {isCompleted ? <Check size={12} strokeWidth={3} /> : idx + 1}
                          </div>

                          {/* Text Info */}
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`text-xs font-semibold ${
                                  isCurrent
                                    ? 'text-[#8A5622] font-bold'
                                    : isCompleted
                                    ? 'text-walnut'
                                    : 'text-sand-400'
                                }`}
                              >
                                {step.label}
                              </h4>

                              {isCurrent ? (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#C58B4B] text-white uppercase tracking-wider">
                                  Current Status
                                </span>
                              ) : isCompleted ? (
                                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                                  <CheckCheck size={11} /> Done
                                </span>
                              ) : (
                                <span className="text-[10px] text-sand-400">Pending</span>
                              )}
                            </div>

                            <p className="text-[11px] text-sand-500 leading-tight">
                              {step.description}
                            </p>

                            {stepDate && (
                              <p className="text-[10px] text-sand-400 font-mono pt-0.5">
                                {stepDate.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Full-Width Active Phase Highlight Banner */}
              {!isCancelled && (
                <div className="p-5 rounded-2xl bg-[#FAF7F3] border border-sand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#C58B4B]/15 text-[#C58B4B] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-walnut uppercase tracking-wider">
                        Current Fulfillment Phase: {order.orderStatus}
                      </h4>
                      <p className="text-xs text-sand-600 mt-0.5 leading-relaxed">
                        {order.orderStatus === 'Confirmed' && 'Your order has been confirmed by our artisans. Bamboo materials are being seasoned and selected.'}
                        {order.orderStatus === 'Processing' && 'Artisans are currently splitting, weaving, heat-curing, and performing safety voltage QC on your fixtures.'}
                        {order.orderStatus === 'Shipped' && 'Your package has departed the workshop hub and is in transit with our logistics partner.'}
                        {order.orderStatus === 'Out for Delivery' && 'Our local delivery rider has picked up your package and is on the way to your delivery address.'}
                        {order.orderStatus === 'Delivered' && 'This order has been safely delivered to your doorstep. We hope it illuminates your space beautifully!'}
                        {order.orderStatus === 'Pending' && 'Payment verification in progress. Our team will verify and queue your fixture shortly.'}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right flex-shrink-0 pl-12 sm:pl-0 border-t sm:border-t-0 sm:border-l border-sand-200/80 pt-3 sm:pt-0 sm:pl-6">
                    <span className="text-[10px] uppercase font-bold text-sand-400 tracking-wider block">
                      Estimated Arrival Window
                    </span>
                    <span className="text-sm font-bold text-[#8A5622]">
                      {order.estimatedDelivery || '2 to 4 business days'}
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* 2. BALANCED SPACIOUS 2-COLUMN INFORMATION GRID (12 Columns: 8 Main + 4 Sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT MAIN COLUMN (8 Columns - ~66% Width) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* A. Fixtures in this Package (Generous, wide cards) */}
                <div className="bg-white rounded-3xl border border-sand-200/80 p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-sand-200/80 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Boxes size={18} className="text-[#C58B4B]" />
                      <h3 className="font-bold text-base text-walnut uppercase tracking-wide">
                        Artisan Fixtures in this Package
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sand-100 text-sand-600">
                      {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="divide-y divide-sand-200/80">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded-2xl bg-sand-100 border border-sand-200 flex-shrink-0"
                          />
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm sm:text-base text-walnut">
                              {item.title}
                            </h4>
                            {item.selectedVariants && typeof item.selectedVariants === 'object' && Object.keys(item.selectedVariants).length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {Object.entries(item.selectedVariants).map(([k, v]) => (
                                  <span key={k} className="text-[11px] font-medium px-2 py-0.5 rounded bg-sand-100 text-[#8A5622]">
                                    {k}: {v}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-sand-500 pt-0.5">
                              Quantity: <strong className="text-walnut">{item.quantity}</strong> × {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right pl-24 sm:pl-0">
                          <span className="text-[10px] uppercase font-bold text-sand-400 tracking-wider block">
                            Item Total
                          </span>
                          <span className="font-bold text-base text-walnut">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* B. Courier & Delivery Logistics (3-Column Sub-Grid) */}
                <div className="bg-white rounded-3xl border border-sand-200/80 p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-sand-200/80 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Truck size={18} className="text-[#C58B4B]" />
                      <h3 className="font-bold text-base text-walnut uppercase tracking-wide">
                        Courier &amp; Delivery Logistics
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Standard Express Delivery
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                    {/* 1. Courier Partner */}
                    <div className="p-4 bg-[#FAF7F3] rounded-2xl border border-sand-200/60 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-sand-400 tracking-wider">
                        Courier Partner
                      </span>
                      <p className="font-bold text-sm text-walnut">
                        {order.courierName || 'Canzir Dedicated Fleet / Steadfast Express'}
                      </p>
                      <p className="text-[11px] text-sand-500 leading-tight">
                        Dispatched with real-time consignment tracking and doorstep delivery.
                      </p>
                    </div>

                    {/* 2. Tracking ID */}
                    <div className="p-4 bg-[#FAF7F3] rounded-2xl border border-sand-200/60 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-sand-400 tracking-wider">
                        Consignment Tracking ID
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#8A5622]">
                          {order.trackingNumber || `CNZ-TRK-${order.orderNumber.replace('CNZ-', '')}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyTracking(order.trackingNumber || `CNZ-TRK-${order.orderNumber.replace('CNZ-', '')}`)}
                          title="Copy tracking code"
                          className="p-1 rounded hover:bg-sand-200 text-sand-500 hover:text-walnut transition cursor-pointer"
                        >
                          {copiedTracking ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                      {copiedTracking && (
                        <span className="text-[10px] text-emerald-600 font-semibold block">Copied to clipboard!</span>
                      )}
                    </div>

                    {/* 3. Recipient Destination */}
                    <div className="p-4 bg-[#FAF7F3] rounded-2xl border border-sand-200/60 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#C58B4B]" />
                        <span className="text-[10px] uppercase font-bold text-sand-400 tracking-wider">
                          Delivery Destination
                        </span>
                      </div>
                      <p className="font-bold text-walnut">{order.customer.name}</p>
                      <p className="text-sand-600 leading-tight">{order.customer.address}</p>
                      <p className="text-sand-500">{order.customer.city}, {order.customer.district} {order.customer.postalCode}</p>
                      <p className="text-sand-600 font-medium">Contact: {order.customer.phone}</p>
                    </div>
                  </div>

                  {order.customer.deliveryNotes && (
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-950">Customer Delivery Instructions: </span>
                        <span>"{order.customer.deliveryNotes}"</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* C. Complete Activity Log & Timeline */}
                <div className="bg-white rounded-3xl border border-sand-200/80 p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-sand-200/80 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Clock size={18} className="text-[#C58B4B]" />
                      <h3 className="font-bold text-base text-walnut uppercase tracking-wide">
                        Real-Time Activity &amp; Workshop Log
                      </h3>
                    </div>
                    <span className="text-xs text-sand-400 font-medium">
                      {order.statusHistory?.length || 0} recorded event(s)
                    </span>
                  </div>

                  <div className="space-y-3">
                    {order.statusHistory?.map((hist, i) => (
                      <div
                        key={i}
                        className="p-4 bg-[#FAF7F3] rounded-2xl border border-sand-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-walnut">{hist.status}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-sand-200/70 text-sand-700 font-medium">
                              {hist.author || 'System'}
                            </span>
                          </div>
                          <p className="text-xs text-sand-600">{hist.note}</p>
                        </div>
                        <span className="text-[11px] text-sand-400 font-mono sm:text-right whitespace-nowrap">
                          {new Date(hist.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT SIDEBAR COLUMN (4 Columns - ~33% Width) */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* 1. Payment & Financial Summary Card */}
                <div className="bg-white rounded-3xl border border-sand-200/80 p-6 sm:p-7 shadow-sm space-y-5">
                  <div className="flex items-center gap-2.5 border-b border-sand-200/80 pb-4">
                    <ShieldCheck size={18} className="text-[#C58B4B]" />
                    <h3 className="font-bold text-sm text-walnut uppercase tracking-wide">
                      Payment &amp; Financial Receipt
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-sand-500">Payment Channel:</span>
                      <span className="font-bold text-walnut">
                        {order.paymentDetails?.channelName || order.paymentMethod?.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sand-500">Payment Status:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.paymentStatus === 'paid' || order.paymentStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus === 'paid' || order.paymentStatus === 'verified'
                          ? 'Verified & Paid'
                          : 'Payable on Delivery'}
                      </span>
                    </div>

                    {order.paymentDetails?.transactionId && (
                      <div className="flex justify-between items-center pt-1 border-t border-sand-200/60">
                        <span className="text-sand-500">Transaction ID:</span>
                        <span className="font-mono text-xs font-semibold text-walnut">
                          {order.paymentDetails.transactionId}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Financial Price Breakdown */}
                  <div className="pt-4 border-t border-sand-200 space-y-2 text-xs text-sand-600">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span className="text-walnut font-medium">{formatPrice(order.subtotal)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Shipping Fee:</span>
                      <span className="text-walnut font-medium">
                        {order.shippingFee === 0 ? (
                          <span className="text-emerald-600 font-bold">Complimentary (Free)</span>
                        ) : (
                          formatPrice(order.shippingFee)
                        )}
                      </span>
                    </div>

                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Coupon ({order.couponCode || 'DISCOUNT'}):</span>
                        <span>-{formatPrice(order.discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm font-bold text-walnut pt-3 border-t border-sand-200">
                      <span>Total Amount:</span>
                      <span className="text-xl font-bold text-[#8A5622]">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Artisan Concierge Assistance Card */}
                <div className="bg-[#4A2E20] text-cream rounded-3xl p-6 sm:p-7 shadow-md space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-[#D9AF7D]">
                      Artisan Concierge
                    </span>
                    <h3 className="font-display text-xl font-bold leading-tight">
                      Need Assistance with Your Order?
                    </h3>
                    <p className="text-xs text-sand-300 leading-relaxed">
                      Our customer care artisans are available daily from 9:00 AM to 9:00 PM to assist with address adjustments, delivery timing, or custom requests.
                    </p>
                  </div>

                  <div className="pt-2 space-y-2.5">
                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/8801700000000?text=Hello%20Canzir%20Atelier%2C%20I%20am%20inquiring%20about%20my%20lighting%20order%20${order.orderNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      <MessageCircle size={15} />
                      <span>Chat on WhatsApp</span>
                    </a>

                    {/* Call Hotline */}
                    <a
                      href="tel:+8801700000000"
                      className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-cream text-xs font-semibold flex items-center justify-center gap-2 transition border border-white/10"
                    >
                      <Phone size={14} />
                      <span>Call: +880 1700-000000</span>
                    </a>

                    {/* Email Support */}
                    <a
                      href={`mailto:concierge@canzir.com?subject=Inquiry%20regarding%20Order%20${order.orderNumber}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/15 text-sand-300 hover:text-cream text-xs font-medium flex items-center justify-center gap-2 transition"
                    >
                      <Mail size={14} />
                      <span>Email Concierge</span>
                    </a>
                  </div>
                </div>

                {/* 3. Canzir Heritage Guarantee */}
                <div className="bg-white rounded-3xl border border-sand-200/80 p-6 shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-walnut">
                    <Award size={16} className="text-[#C58B4B]" />
                    <span>Canzir Atelier Guarantee</span>
                  </div>
                  <ul className="space-y-2 text-xs text-sand-600">
                    <li className="flex items-start gap-2">
                      <BadgeCheck size={14} className="text-[#C58B4B] flex-shrink-0 mt-0.5" />
                      <span>2-Year comprehensive electrical &amp; structural craft warranty.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BadgeCheck size={14} className="text-[#C58B4B] flex-shrink-0 mt-0.5" />
                      <span>100% seasoned mature riverbed bamboo from Sylhet artisans.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BadgeCheck size={14} className="text-[#C58B4B] flex-shrink-0 mt-0.5" />
                      <span>Safe transit guarantee in reinforced eco-friendly packaging.</span>
                    </li>
                  </ul>
                  <div className="pt-2 text-center">
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8A5622] hover:text-[#C58B4B] transition"
                    >
                      <span>Explore More Fixtures</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* EMPTY STATE / INTRODUCTORY GUIDANCE WHEN NO ORDER LOADED YET */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 animate-fade-in">
            <div className="bg-white rounded-3xl border border-sand-200/80 p-8 shadow-sm space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EBDDCB]/60 text-[#8A5622] flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-bold text-base text-walnut">1. Order Confirmation</h3>
              <p className="text-xs text-sand-500 leading-relaxed">
                As soon as your order is received, our master artisans review fixture specifications and reserve seasoned river bamboo.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-sand-200/80 p-8 shadow-sm space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EBDDCB]/60 text-[#8A5622] flex items-center justify-center mx-auto">
                <Sparkles size={24} />
              </div>
              <h3 className="font-bold text-base text-walnut">2. Workshop Handcrafting</h3>
              <p className="text-xs text-sand-500 leading-relaxed">
                Every fixture is woven by hand, heat cured, and subjected to rigorous AC voltage safety testing before packaging.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-sand-200/80 p-8 shadow-sm space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EBDDCB]/60 text-[#8A5622] flex items-center justify-center mx-auto">
                <Truck size={24} />
              </div>
              <h3 className="font-bold text-base text-walnut">3. Doorstep Express</h3>
              <p className="text-xs text-sand-500 leading-relaxed">
                Packed in protective wooden reinforced cartons and dispatched with trusted courier partners for prompt delivery.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TrackOrderPage;
