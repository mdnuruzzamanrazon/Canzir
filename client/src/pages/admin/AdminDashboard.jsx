import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Sparkles,
  Settings,
  MessageSquare,
  Tag,
  ShieldCheck,
  ChevronRight,
  Upload,
  Eye,
  RefreshCw
} from 'lucide-react';
import apiFetch from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

const AdminDashboard = () => {
  const { user, token, isAdmin } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'custom' | 'coupons' | 'settings' | 'messages'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customInquiries, setCustomInquiries] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: 'Bamboo Table Lamps',
    price: '',
    compareAtPrice: '',
    stockQuantity: 15,
    shortDescription: '',
    description: '',
    images: ['/assets/products/bamboo-lattice-table-lamp.jpeg'],
    materials: 'Natural River Bamboo, Seasoned Teak',
    lightingStyle: 'Warm Ambient Glow',
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true
  });

  // Settings State
  const [announcementText, setAnnouncementText] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (!token || !isAdmin) {
      navigate('/login');
      return;
    }

    loadAdminData();
  }, [token, isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, prodsRes, customRes, coupRes, inqRes, settRes] = await Promise.all([
        apiFetch('/orders/admin/stats'),
        apiFetch('/orders/admin/all'),
        apiFetch('/products?limit=100'),
        apiFetch('/custom-designs/admin'),
        apiFetch('/coupons/admin'),
        apiFetch('/inquiries/admin'),
        apiFetch('/settings')
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (ordersRes.success) setOrders(ordersRes.orders || []);
      if (prodsRes.success) setProducts(prodsRes.products || []);
      if (customRes.success) setCustomInquiries(customRes.inquiries || []);
      if (coupRes.success) setCoupons(coupRes.coupons || []);
      if (inqRes.success) setInquiries(inqRes.inquiries || []);
      if (settRes.success && settRes.settings?.announcementBar) {
        setAnnouncementText(settRes.settings.announcementBar.textEn || '');
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await apiFetch(`/orders/admin/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.success) {
        setOrders(orders.map(o => o._id === orderId ? res.order : o));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Custom Inquiry Quote / Status update
  const handleUpdateCustomInquiry = async (inqId, status, quotedPrice) => {
    try {
      const res = await apiFetch(`/custom-designs/admin/${inqId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, quotedPrice })
      });
      if (res.success) {
        setCustomInquiries(customInquiries.map(i => i._id === inqId ? res.inquiry : i));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Create Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(newProduct)
      });
      if (res.success && res.product) {
        setProducts([res.product, ...products]);
        setShowAddProductModal(false);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/settings/admin', {
        method: 'POST',
        body: JSON.stringify({
          key: 'announcementBar',
          value: { enabled: true, textEn: announcementText }
        })
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-2">
        <div className="w-8 h-8 border-2 border-bamboo border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-sand-500">Loading Atelier Management...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 space-y-8">
      {/* Admin Top Header */}
      <div className="bg-walnut text-cream p-6 sm:p-8 lg:p-10 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-bamboo text-xs font-semibold uppercase tracking-widest">
            <ShieldCheck size={16} />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-cream mt-1">
            Canzir Atelier Management
          </h1>
          <p className="text-sm text-sand-300 mt-1">
            Monitor incoming orders, inventory, custom bespoke lighting commissions, and customer messages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminData}
            className="p-3 bg-cream/10 hover:bg-cream/20 text-cream rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="px-5 py-3 bg-bamboo hover:bg-bamboo-500 text-charcoal font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>New Fixture</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 bg-cream rounded-2xl border border-sand-300 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-sand-500 tracking-wider">Total Revenue</span>
          <p className="text-2xl font-bold text-walnut font-sans">{formatPrice(stats?.totalRevenue || 0)}</p>
          <p className="text-[11px] text-olive-600 font-medium">All completed orders</p>
        </div>

        <div className="p-5 bg-cream rounded-2xl border border-sand-300 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-sand-500 tracking-wider">Total Orders</span>
          <p className="text-2xl font-bold text-walnut font-mono">{stats?.totalOrders || orders.length}</p>
          <p className="text-[11px] text-bamboo-600 font-medium">{stats?.pendingOrders || 0} Pending fulfillment</p>
        </div>

        <div className="p-5 bg-cream rounded-2xl border border-sand-300 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-sand-500 tracking-wider">Catalog Fixtures</span>
          <p className="text-2xl font-bold text-walnut font-mono">{products.length}</p>
          <p className="text-[11px] text-sand-500">Active designs in stock</p>
        </div>

        <div className="p-5 bg-cream rounded-2xl border border-sand-300 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-sand-500 tracking-wider">Custom Inquiries</span>
          <p className="text-2xl font-bold text-walnut font-mono">{customInquiries.length}</p>
          <p className="text-[11px] text-sand-500">Bespoke commissions</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 sm:gap-4 border-b border-sand-300 overflow-x-auto text-xs font-semibold pb-2">
        {[
          { id: 'overview', label: 'Recent Orders', icon: Package },
          { id: 'products', label: `Products (${products.length})`, icon: ShoppingBag },
          { id: 'custom', label: `Custom Designs (${customInquiries.length})`, icon: Sparkles },
          { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
          { id: 'messages', label: `Messages (${inquiries.length})`, icon: MessageSquare },
          { id: 'settings', label: 'Store Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-walnut text-cream font-bold'
                  : 'text-walnut-700 hover:bg-sand-100'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Orders Management */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-walnut">Orders Registry</h2>
          <div className="bg-cream rounded-2xl border border-sand-300 overflow-x-auto shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-sand-100 text-sand-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-sand-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-walnut">
                      {ord.orderNumber}
                      <p className="text-[10px] text-sand-400 font-sans">{new Date(ord.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-walnut">{ord.customer.name}</p>
                      <p className="text-sand-500">{ord.customer.phone} • {ord.customer.city}</p>
                    </td>
                    <td className="p-3 font-bold text-walnut">
                      {formatPrice(ord.totalAmount)}
                    </td>
                    <td className="p-3">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-sand-200">
                        {ord.paymentMethod}
                      </span>
                      {ord.paymentDetails?.transactionId && (
                        <p className="text-[10px] font-mono text-sand-500 mt-0.5">
                          Trx: {ord.paymentDetails.transactionId}
                        </p>
                      )}
                    </td>
                    <td className="p-3">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                        className="bg-white border border-sand-300 rounded px-2 py-1 text-xs text-walnut focus:outline-none focus:border-bamboo font-medium"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/track-order?orderNumber=${ord.orderNumber}`}
                        target="_blank"
                        className="text-bamboo hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Products Catalog Management */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-xl font-bold text-walnut">Product Catalog</h2>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-3 py-1.5 bg-walnut text-cream text-xs font-semibold rounded flex items-center gap-1"
            >
              <Plus size={14} /> Add Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p._id}
                className="p-4 bg-cream rounded-xl border border-sand-300 shadow-sm flex gap-3"
              >
                <img
                  src={p.images[0]}
                  alt=""
                  className="w-16 h-16 rounded object-cover bg-sand-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-walnut truncate">{p.title}</h4>
                  <p className="text-[11px] text-sand-500">{p.category}</p>
                  <p className="text-xs font-bold text-bamboo mt-1">{formatPrice(p.price)}</p>
                  <p className="text-[10px] text-sand-400">Stock: {p.stockQuantity} units</p>
                </div>
                <button
                  onClick={() => handleDeleteProduct(p._id)}
                  className="text-sand-400 hover:text-red-600 p-1 self-start transition-colors"
                  title="Delete product"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Custom Design Inquiries */}
      {activeTab === 'custom' && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-walnut">Custom Lighting Inquiries</h2>
          <div className="divide-y divide-sand-200 bg-cream rounded-2xl border border-sand-300 p-4">
            {customInquiries.length === 0 ? (
              <p className="text-xs text-sand-500 py-6 text-center">No custom commission inquiries yet.</p>
            ) : (
              customInquiries.map((inq) => (
                <div key={inq._id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-bamboo">{inq.inquiryNumber}</span>
                      <h4 className="text-sm font-bold text-walnut">{inq.name} • {inq.phone}</h4>
                      <p className="text-xs text-sand-500">
                        Type: <strong>{inq.productType}</strong> | Material: <strong>{inq.material}</strong> | Budget: {inq.budgetRange}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={inq.status}
                        onChange={(e) => handleUpdateCustomInquiry(inq._id, e.target.value, inq.quotedPrice)}
                        className="bg-white border border-sand-300 rounded px-2 py-1 text-xs text-walnut font-medium"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Quoted">Quoted</option>
                        <option value="In Production">In Production</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-walnut-700 bg-sand-50 p-3 rounded-lg border border-sand-200">
                    "{inq.instructions}"
                  </p>

                  {inq.referenceImage && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-sand-500">Reference Photo:</span>
                      <a href={inq.referenceImage} target="_blank" rel="noreferrer" className="text-bamboo underline">
                        View Uploaded Image
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Coupons Management */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-walnut">Active Promotional Coupons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div key={c._id} className="p-4 bg-cream rounded-xl border border-sand-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-bamboo">{c.code}</span>
                  <span className="text-[10px] bg-sand-200 px-2 py-0.5 rounded font-bold">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `৳${c.discountValue} FLAT`}
                  </span>
                </div>
                <p className="text-[11px] text-sand-500">
                  Min Order: ৳{c.minOrderAmount} | Max Disc: {c.maxDiscountAmount ? `৳${c.maxDiscountAmount}` : 'None'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Contact Messages */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-walnut">Customer Messages</h2>
          <div className="divide-y divide-sand-200 bg-cream rounded-2xl border border-sand-300 p-4">
            {inquiries.length === 0 ? (
              <p className="text-xs text-sand-500 py-6 text-center">No contact inquiries.</p>
            ) : (
              inquiries.map((msg) => (
                <div key={msg._id} className="py-3 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-walnut">{msg.name} ({msg.email})</h4>
                    <span className="text-sand-400 text-[10px]">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="font-semibold text-bamboo">{msg.subject}</p>
                  <p className="text-sand-600">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Store Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-xl bg-cream p-6 sm:p-8 rounded-2xl border border-sand-300 space-y-4">
          <h2 className="font-display text-xl font-bold text-walnut">Global Store Settings</h2>
          {settingsSaved && (
            <div className="p-3 bg-olive-100 text-olive-800 text-xs rounded">
              Settings updated successfully!
            </div>
          )}
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-walnut mb-1">
                Announcement Top Bar Message
              </label>
              <textarea
                rows={2}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-walnut text-cream text-xs font-semibold rounded uppercase tracking-wider"
            >
              Save Settings
            </button>
          </form>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-cream p-6 sm:p-8 rounded-2xl border border-sand-300 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-sand-200">
              <h3 className="font-display text-xl font-bold text-walnut">Create New Lighting Fixture</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-sand-500">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-walnut mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  placeholder="e.g. Lotus Flare Woven Table Lamp"
                  className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-walnut"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-walnut mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-walnut"
                  >
                    <option value="Bamboo Table Lamps">Bamboo Table Lamps</option>
                    <option value="Wooden Wall Lamps">Wooden Wall Lamps</option>
                    <option value="Bamboo Pendant Lights">Bamboo Pendant Lights</option>
                    <option value="Floor Lamps">Floor Lamps</option>
                    <option value="Wooden Table Lamps">Wooden Table Lamps</option>
                    <option value="Decorative Ambient Lights">Decorative Ambient Lights</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-walnut mb-1">Price (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="3200"
                    className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-walnut"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-walnut mb-1">Short Description *</label>
                <input
                  type="text"
                  required
                  value={newProduct.shortDescription}
                  onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                  placeholder="One line summary for product card"
                  className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-walnut"
                />
              </div>

              <div>
                <label className="block font-semibold text-walnut mb-1">Full Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Detailed artisan and interior styling story"
                  className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-walnut"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 border border-sand-300 rounded text-walnut font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-walnut text-cream rounded font-semibold"
                >
                  Publish Fixture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
