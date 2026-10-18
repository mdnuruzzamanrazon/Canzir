import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Package,
  Layers,
  Sliders,
  AlertTriangle,
  Users,
  MessageSquare,
  HelpCircle,
  Image,
  SlidersHorizontal,
  Truck,
  Mail,
  UserCheck,
  RefreshCw,
  Plus,
  Search,
  ExternalLink,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Bell,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

import apiFetch from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

// Admin Subcomponents
import OverviewTab from './components/OverviewTab';
import OrdersTab from './components/OrdersTab';
import PaymentsTab from './components/PaymentsTab';
import CustomersTab from './components/CustomersTab';
import CatalogTab from './components/CatalogTab';
import ContentTab from './components/ContentTab';
import SettingsTab from './components/SettingsTab';
import CreateManualOrderModal from './components/CreateManualOrderModal';

export default function AdminDashboard() {
  const { user, token, isAdmin, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Global Data State
  const [loading, setLoading] = useState(true);
  const [syncTimestamp, setSyncTimestamp] = useState(new Date());
  const [autoSync, setAutoSync] = useState(true);

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [announcementText, setAnnouncementText] = useState('');

  // Selected Order for Drawer View
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Manual Order Modal State
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);

  // Check Auth
  useEffect(() => {
    if (!token || !isAdmin) {
      navigate('/login');
      return;
    }
    loadAllAdminData();
  }, [token, isAdmin]);

  // Real-time Auto-Sync Interval (Every 15 seconds)
  useEffect(() => {
    if (!token || !isAdmin || !autoSync) return;

    const interval = setInterval(() => {
      fetchRealtimeUpdates();
    }, 15000);

    return () => clearInterval(interval);
  }, [token, isAdmin, autoSync]);

  // Initial Full Load
  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        ordersRes,
        paymentsRes,
        customersRes,
        productsRes,
        categoriesRes,
        reviewsRes,
        questionsRes,
        settingsRes
      ] = await Promise.all([
        apiFetch('/orders/admin/stats').catch(() => ({})),
        apiFetch('/orders/admin/all').catch(() => ({})),
        apiFetch('/orders/admin/payments').catch(() => ({})),
        apiFetch('/orders/admin/customers').catch(() => ({})),
        apiFetch('/products?limit=100').catch(() => ({})),
        apiFetch('/products/categories').catch(() => ({})),
        apiFetch('/reviews/admin').catch(() => ({})),
        apiFetch('/questions/admin').catch(() => ({})),
        apiFetch('/settings').catch(() => ({}))
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (ordersRes.success) setOrders(ordersRes.orders || []);
      if (paymentsRes.success) setPayments(paymentsRes.payments || []);
      if (customersRes.success) setCustomers(customersRes.customers || []);
      if (productsRes.success) setProducts(productsRes.products || []);
      if (categoriesRes.success) setCategories(categoriesRes.categories || []);
      if (reviewsRes.success) setReviews(reviewsRes.reviews || []);
      if (questionsRes.success) setQuestions(questionsRes.questions || []);
      if (settingsRes.success && settingsRes.settings) {
        setSettings(settingsRes.settings);
        if (settingsRes.settings.announcementBar) {
          setAnnouncementText(settingsRes.settings.announcementBar.textEn || '');
        }
      }
      setSyncTimestamp(new Date());
    } catch (err) {
      console.error('[Admin] Error loading master records:', err);
    } finally {
      setLoading(false);
    }
  };

  // Background Realtime Synchronization
  const fetchRealtimeUpdates = async () => {
    try {
      const [statsRes, ordersRes, paymentsRes, customersRes] = await Promise.all([
        apiFetch('/orders/admin/stats'),
        apiFetch('/orders/admin/all'),
        apiFetch('/orders/admin/payments'),
        apiFetch('/orders/admin/customers')
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (ordersRes.success) setOrders(ordersRes.orders || []);
      if (paymentsRes.success) setPayments(paymentsRes.payments || []);
      if (customersRes.success) setCustomers(customersRes.customers || []);
      setSyncTimestamp(new Date());
    } catch (err) {
      console.warn('[Admin] Realtime sync skipped:', err.message);
    }
  };

  const handleOpenOrder = (ord) => {
    setSelectedOrder(ord);
    setActiveTab('orders');
  };

  const handleOpenPayment = (ord) => {
    setActiveTab('payments');
  };

  const handleOrderCreated = (newOrder) => {
    setOrders([newOrder, ...orders]);
    loadAllAdminData();
  };

  // Dynamic Badges
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'Pending').length;
  const pendingPaymentsCount = payments.filter(p => p.status === 'pending').length;
  const lowStockCount = products.filter(p => p.stockQuantity <= 5).length;
  const pendingQuestionsCount = questions.filter(q => q.status === 'pending').length;

  // Breadcrumbs text helper
  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'overview': return 'Overview';
      case 'orders': return 'Operations / Orders';
      case 'payments': return 'Operations / Payments';
      case 'products':
      case 'categories':
      case 'variants':
      case 'inventory': return 'Catalog & Inventory';
      case 'customers': return 'Customers & Activity';
      case 'reviews':
      case 'questions':
      case 'banners': return 'Content & Engagement';
      case 'payment-channels':
      case 'delivery-rules':
      case 'staff':
      case 'email-settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#12100E] text-[#f5f5f4] flex antialiased">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen ${
          sidebarCollapsed ? 'w-20' : 'w-64 xl:w-72'
        } bg-[#181513] border-r border-stone-800/80 z-50 flex flex-col justify-between transition-all duration-300 shadow-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-stone-800">
          {/* Brand Header */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} pb-4 border-b border-stone-800/80`}>
            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="/assets/canzir-logo.png"
                  alt="Canzir Logo"
                  className="w-9 h-9 rounded-full border border-[#C58B4B]/40 object-contain p-0.5 bg-stone-900 shadow-sm group-hover:border-[#C58B4B] transition"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#181513]" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <span className="font-serif text-sm tracking-widest font-bold text-stone-100 uppercase block group-hover:text-[#C58B4B] transition">
                    CANZIR
                  </span>
                  <span className="text-[10px] text-[#C58B4B] tracking-wider uppercase font-semibold block">
                    STORE ADMIN
                  </span>
                </div>
              )}
            </Link>

            {!sidebarCollapsed && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#C58B4B]/15 text-[#C58B4B] border border-[#C58B4B]/30 uppercase">
                  owner
                </span>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  title="Collapse Sidebar"
                  className="hidden lg:flex p-1.5 rounded-md hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-5 text-xs">
            {/* 1. Overview */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold px-3">
                  Overview
                </span>
              )}
              <button
                onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
                title={sidebarCollapsed ? 'Dashboard' : ''}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-[#C58B4B]/20 to-stone-800 text-[#E6AF68] font-semibold border-l-2 border-[#C58B4B] shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className={`w-4 h-4 ${activeTab === 'overview' ? 'text-[#C58B4B]' : ''}`} />
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </div>
              </button>
            </div>

            {/* 2. Operations */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold px-3">
                  Operations
                </span>
              )}
              <button
                onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }}
                title={sidebarCollapsed ? 'Orders' : ''}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl font-medium transition-all relative ${
                  activeTab === 'orders'
                    ? 'bg-gradient-to-r from-[#C58B4B]/20 to-stone-800 text-[#E6AF68] font-semibold border-l-2 border-[#C58B4B] shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className={`w-4 h-4 ${activeTab === 'orders' ? 'text-[#C58B4B]' : ''}`} />
                  {!sidebarCollapsed && <span>Orders</span>}
                </div>
                {pendingOrdersCount > 0 && (
                  sidebarCollapsed ? (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {pendingOrdersCount}
                    </span>
                  )
                )}
              </button>

              <button
                onClick={() => { setActiveTab('payments'); setSidebarOpen(false); }}
                title={sidebarCollapsed ? 'Payments' : ''}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl font-medium transition-all relative ${
                  activeTab === 'payments'
                    ? 'bg-gradient-to-r from-[#C58B4B]/20 to-stone-800 text-[#E6AF68] font-semibold border-l-2 border-[#C58B4B] shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className={`w-4 h-4 ${activeTab === 'payments' ? 'text-[#C58B4B]' : ''}`} />
                  {!sidebarCollapsed && <span>Payments</span>}
                </div>
                {pendingPaymentsCount > 0 && (
                  sidebarCollapsed ? (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-400" />
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                      {pendingPaymentsCount}
                    </span>
                  )
                )}
              </button>
            </div>

            {/* 3. Catalog */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold px-3">
                  Catalog
                </span>
              )}
              <button
                onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}
                title={sidebarCollapsed ? 'Products' : ''}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'products'
                    ? 'bg-gradient-to-r from-[#C58B4B]/20 to-stone-800 text-[#E6AF68] font-semibold border-l-2 border-[#C58B4B] shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className={`w-4 h-4 ${activeTab === 'products' ? 'text-[#C58B4B]' : ''}`} />
                  {!sidebarCollapsed && <span>Products</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-stone-500 text-[10px] font-mono">{products.length}</span>
                )}
              </button>

              <button
                onClick={() => { setActiveTab('categories'); setSidebarOpen(false); }}
                title={sidebarCollapsed ? 'Categories' : ''}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'categories'
                    ? 'bg-gradient-to-r from-[#C58B4B]/20 to-stone-800 text-[#E6AF68] font-semibold border-l-2 border-[#C58B4B] shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className={`w-4 h-4 ${activeTab === 'categories' ? 'text-[#C58B4B]' : ''}`} />
                  {!sidebarCollapsed && <span>Categories</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-stone-500 text-[10px] font-mono">{categories.length}</span>
                )}
              </button>

              <button
                onClick={() => { setActiveTab('variants'); setSidebarOpen(false); }}
                title={sidebarCollapsed ? 'Variants' : ''}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'variants'
                    ? 'bg-gradient-to-r from-[#C58B4B]/20 to-stone-800 text-[#E6AF68] font-semibold border-l-2 border-[#C58B4B] shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sliders className={`w-4 h-4 ${activeTab === 'variants' ? 'text-[#C58B4B]' : ''}`} />
                  {!sidebarCollapsed && <span>Variants</span>}
                </div>
              </button>

              <button
                onClick={() => { setActiveTab('inventory'); setSidebarOpen(false); }}
                title={sidebarCollapsed ? 'Inventory' : ''}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl font-medium transition-all relative ${
                  activeTab === 'inventory'
                    ? 'bg-gradient-to-r from-[#C58B4B]/20 to-stone-800 text-[#E6AF68] font-semibold border-l-2 border-[#C58B4B] shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-4 h-4 ${activeTab === 'inventory' ? 'text-[#C58B4B]' : ''}`} />
                  {!sidebarCollapsed && <span>Inventory</span>}
                </div>
                {lowStockCount > 0 && (
                  sidebarCollapsed ? (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {lowStockCount}
                    </span>
                  )
                )}
              </button>
            </div>

            {/* 4. Customers */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold px-3">
                  Customers
                </span>
              )}
              <button
                onClick={() => { setActiveTab('customers'); setSidebarOpen(false); }}
                title={sidebarCollapsed ? 'Customers' : ''}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'customers'
                    ? 'bg-gradient-to-r from-[#C58B4B]/20 to-stone-800 text-[#E6AF68] font-semibold border-l-2 border-[#C58B4B] shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${activeTab === 'customers' ? 'text-[#C58B4B]' : ''}`} />
                  {!sidebarCollapsed && <span>Customers</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-stone-500 text-[10px] font-mono">{customers.length}</span>
                )}
              </button>
            </div>

            {/* 5. Content */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold px-3">
                  Content
                </span>
              )}
              <button
                onClick={() => { setActiveTab('content'); setSidebarOpen(false); }}
                title={sidebarCollapsed ? 'Reviews & Q&A' : ''}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl font-medium transition-all relative ${
                  activeTab === 'content'
                    ? 'bg-gradient-to-r from-[#C58B4B]/20 to-stone-800 text-[#E6AF68] font-semibold border-l-2 border-[#C58B4B] shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className={`w-4 h-4 ${activeTab === 'content' ? 'text-[#C58B4B]' : ''}`} />
                  {!sidebarCollapsed && <span>Reviews &amp; Q&amp;A</span>}
                </div>
                {pendingQuestionsCount > 0 && (
                  sidebarCollapsed ? (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {pendingQuestionsCount}
                    </span>
                  )
                )}
              </button>
            </div>

            {/* 6. Settings */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold px-3">
                  Settings
                </span>
              )}
              <button
                onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
                title={sidebarCollapsed ? 'Store Settings' : ''}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-[#C58B4B]/20 to-stone-800 text-[#E6AF68] font-semibold border-l-2 border-[#C58B4B] shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#C58B4B]' : ''}`} />
                  {!sidebarCollapsed && <span>Store Settings</span>}
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer User Badge */}
        <div className="p-3 border-t border-stone-800/80 bg-[#141210]/60 space-y-2.5">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C58B4B] to-[#925F29] text-stone-950 font-bold text-xs flex items-center justify-center shadow-sm">
                CA
              </div>
              {!sidebarCollapsed && (
                <div className="overflow-hidden">
                  <div className="font-semibold text-xs text-stone-200 truncate leading-tight">
                    {user?.name || 'Canzir Admin'}
                  </div>
                  <div className="text-[10px] text-stone-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Administrator</span>
                  </div>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <button
                onClick={() => { logout(); navigate('/login'); }}
                title="Logout"
                className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-rose-400 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {!sidebarCollapsed ? (
            <Link
              to="/"
              target="_blank"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-stone-100 text-[11px] font-medium border border-stone-700/60 transition shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C58B4B]" />
              <span>Open Storefront</span>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-2 pt-1">
              <Link
                to="/"
                target="_blank"
                title="Open Storefront"
                className="p-2 rounded-lg bg-stone-800/80 text-stone-300 hover:text-[#C58B4B] transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                title="Logout"
                className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-rose-400 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area - Full-Width Fluid Enterprise Canvas */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden bg-[#12100E]">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#181513]/95 backdrop-blur-md border-b border-stone-800/80 px-4 sm:px-6 lg:px-8 xl:px-10 py-3.5 flex items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 lg:hidden transition"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden lg:flex p-2 rounded-lg bg-stone-800/60 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700/50 transition"
            >
              {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium">Dashboard</span>
              <ChevronRight className="w-3 h-3 text-stone-600" />
              <span className="text-[#E6AF68] font-semibold tracking-wide">{getBreadcrumb()}</span>
            </div>
          </div>

          {/* Real-time Live Sync Indicator & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-[11px] text-stone-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">
                Live Synced: {syncTimestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="sm:hidden">Live</span>
            </div>

            {/* Auto-Sync Toggle */}
            <button
              onClick={() => setAutoSync(!autoSync)}
              title={autoSync ? 'Auto-sync active (15s)' : 'Auto-sync paused'}
              className={`p-2 rounded-xl border text-xs transition ${
                autoSync
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-xs'
                  : 'bg-stone-800 text-stone-500 border-stone-700'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoSync ? 'text-emerald-400' : ''}`} />
            </button>

            {/* Add Product Button */}
            <button
              onClick={() => {
                setActiveTab('products');
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('canzir-open-add-product'));
                }, 50);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-[#C58B4B] border border-[#C58B4B]/30 font-semibold text-xs shadow-xs transition hover:border-[#C58B4B]/60"
            >
              <Plus className="w-3.5 h-3.5 text-[#C58B4B]" />
              <span>Add Product</span>
            </button>

            {/* Manual Order Trigger */}
            <button
              onClick={() => setShowManualOrderModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C58B4B] to-[#b0793c] hover:from-[#d19655] hover:to-[#be8445] text-stone-950 font-bold text-xs shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create Manual Order</span>
              <span className="sm:hidden">New Order</span>
            </button>
          </div>
        </header>

        {/* Dynamic Viewport Body - Fluid Full Width */}
        <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab
              stats={stats}
              orders={orders}
              loading={loading}
              onRefresh={loadAllAdminData}
              onOpenOrder={handleOpenOrder}
              onCreateOrder={() => setShowManualOrderModal(true)}
              formatPrice={formatPrice}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              loading={loading}
              onRefresh={loadAllAdminData}
              onCreateOrder={() => setShowManualOrderModal(true)}
              selectedOrder={selectedOrder}
              setSelectedOrder={setSelectedOrder}
              onOpenPayment={handleOpenPayment}
              formatPrice={formatPrice}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsTab
              payments={payments}
              loading={loading}
              onRefresh={loadAllAdminData}
              onOpenOrder={handleOpenOrder}
              formatPrice={formatPrice}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersTab
              customers={customers}
              orders={orders}
              loading={loading}
              onRefresh={loadAllAdminData}
              onOpenOrder={handleOpenOrder}
              formatPrice={formatPrice}
            />
          )}

          {['products', 'categories', 'variants', 'inventory'].includes(activeTab) && (
            <CatalogTab
              products={products}
              categories={categories}
              activeSubTab={['products', 'categories', 'variants', 'inventory'].includes(activeTab) ? activeTab : 'products'}
              loading={loading}
              onRefresh={loadAllAdminData}
              formatPrice={formatPrice}
            />
          )}

          {activeTab === 'content' && (
            <ContentTab
              reviews={reviews}
              questions={questions}
              announcementText={announcementText}
              setAnnouncementText={setAnnouncementText}
              loading={loading}
              onRefresh={loadAllAdminData}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onRefresh={loadAllAdminData}
              formatPrice={formatPrice}
            />
          )}
        </main>
      </div>

      {/* Create Manual Order Modal */}
      <CreateManualOrderModal
        isOpen={showManualOrderModal}
        onClose={() => setShowManualOrderModal(false)}
        products={products}
        onOrderCreated={handleOrderCreated}
        formatPrice={formatPrice}
      />
    </div>
  );
}
