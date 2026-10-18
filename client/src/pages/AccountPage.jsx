import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  Key,
  MapPin,
  LogOut,
  ShoppingBag,
  ExternalLink,
  CheckCircle,
  Truck
} from 'lucide-react';
import apiFetch from '../utils/api.js';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const AccountPage = ({ onQuickView }) => {
  const { user, token, logout, requestLogout, wishlist, isInWishlist, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'orders';

  const [orders, setOrders] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile update state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileUpdated, setProfileUpdated] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (authLoading && !user) return;

    if (!authLoading && !token && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
    }

    // Fetch user orders
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await apiFetch('/orders/my');
        if (res.success) setOrders(res.orders || []);
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [token, user]);

  // Load populated wishlist products
  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (wishlist && wishlist.length > 0) {
        try {
          const res = await apiFetch('/products?limit=50');
          if (res.success && res.products) {
            const matches = res.products.filter(p => wishlist.includes(p._id));
            setWishlistProducts(matches);
          }
        } catch (err) {
          console.error('Failed to fetch wishlist products:', err);
        }
      } else {
        setWishlistProducts([]);
      }
    };

    fetchWishlistItems();
  }, [wishlist]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: profileName, phone: profilePhone })
      });
      if (res.success) {
        setProfileUpdated(true);
        setTimeout(() => setProfileUpdated(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    try {
      const res = await apiFetch('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (res.success) {
        setPasswordMsg('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-10 sm:py-16 space-y-10">
      <div className="border-b border-sand-300 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">
            Customer Dashboard
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-walnut mt-0.5">
            Welcome, {user?.name}
          </h1>
          <p className="text-sm text-sand-500">{user?.email}</p>
        </div>

        <button
          onClick={() => requestLogout({ variant: 'customer', redirectUrl: '/login' })}
          className="px-5 py-2.5 border border-sand-300 rounded-xl text-xs sm:text-sm text-sand-500 hover:text-red-700 hover:border-red-300 flex items-center gap-2 transition-colors w-fit cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 xl:col-span-3 space-y-1.5 text-xs sm:text-sm sticky top-28 bg-sand-50 p-4 rounded-2xl border border-sand-200">
          {[
            { id: 'orders', label: 'Order History', icon: Package },
            { id: 'wishlist', label: `My Wishlist (${wishlist.length})`, icon: Heart },
            { id: 'profile', label: 'Personal Information', icon: User },
            { id: 'security', label: 'Password & Security', icon: Key }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSearchParams({ tab: item.id })}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all text-left ${
                  isActive
                    ? 'bg-walnut text-cream font-bold shadow-sm'
                    : 'text-walnut hover:bg-sand-200/60'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-9 xl:col-span-9">
          {/* TAB 1: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-walnut">
                Past Orders ({orders.length})
              </h2>

              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-sand-500">Loading your orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center bg-sand-50 rounded-2xl border border-sand-200 space-y-3">
                  <Package size={36} className="text-sand-400 mx-auto" />
                  <p className="font-semibold text-walnut text-sm">You haven’t placed any orders yet.</p>
                  <p className="text-xs text-sand-500 max-w-sm mx-auto">
                    Bring the peaceful glow of natural riverbed bamboo into your home.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-block mt-3 px-6 py-2.5 bg-walnut text-cream text-xs font-semibold rounded"
                  >
                    Explore Shop
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord._id}
                      className="p-6 bg-cream rounded-2xl border border-sand-300 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sand-200 gap-2">
                        <div>
                          <p className="font-mono text-sm font-bold text-walnut">{ord.orderNumber}</p>
                          <p className="text-[11px] text-sand-500">
                            Placed on {new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} items
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-sand-200 text-walnut text-xs font-semibold rounded-full">
                            Status: {ord.orderStatus}
                          </span>
                          <Link
                            to={`/track-order?orderNumber=${ord.orderNumber}`}
                            className="text-xs text-bamboo font-semibold hover:underline flex items-center gap-1"
                          >
                            <Truck size={14} />
                            <span>Track</span>
                          </Link>
                        </div>
                      </div>

                      <div className="divide-y divide-sand-200">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                            <div className="flex items-center gap-3">
                              <img src={it.image} alt="" className="w-10 h-10 object-cover rounded bg-sand-100" />
                              <div>
                                <p className="font-semibold text-walnut">{it.title}</p>
                                <p className="text-[11px] text-sand-500">Qty: {it.quantity}</p>
                              </div>
                            </div>
                            <span className="font-bold text-walnut">{formatPrice(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-sand-200 flex justify-between items-center text-xs">
                        <span className="text-sand-500">Payment: {ord.paymentMethod.toUpperCase()} ({ord.paymentStatus})</span>
                        <span className="text-sm font-bold text-walnut">
                          Total: <span className="text-bamboo font-sans">{formatPrice(ord.totalAmount)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-walnut">
                Saved Wishlist ({wishlistProducts.length})
              </h2>

              {wishlistProducts.length === 0 ? (
                <div className="p-12 text-center bg-sand-50 rounded-2xl border border-sand-200 space-y-3">
                  <Heart size={36} className="text-sand-400 mx-auto" />
                  <p className="font-semibold text-walnut text-sm">Your wishlist is currently empty.</p>
                  <p className="text-xs text-sand-500">Tap the heart icon on any lamp to curate your favorites.</p>
                  <Link to="/shop" className="inline-block mt-3 px-6 py-2.5 bg-walnut text-cream text-xs font-semibold rounded">
                    Browse Lights
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {wishlistProducts.map((p) => (
                    <ProductCard key={p._id} product={p} onQuickView={onQuickView} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Profile */}
          {activeTab === 'profile' && (
            <div className="max-w-xl bg-cream p-6 sm:p-8 rounded-2xl border border-sand-300 shadow-sm space-y-6">
              <h2 className="font-display text-2xl font-bold text-walnut">Personal Information</h2>

              {profileUpdated && (
                <div className="p-3 bg-olive-100 text-olive-800 text-xs rounded flex items-center gap-2">
                  <CheckCircle size={15} />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-walnut mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-walnut mb-1">Email (Cannot be changed)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-sand-100 border border-sand-300 rounded px-3 py-2 text-xs text-sand-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-walnut mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-walnut hover:bg-walnut-700 text-cream text-xs font-semibold rounded uppercase tracking-wider transition-colors"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: Password & Security */}
          {activeTab === 'security' && (
            <div className="max-w-xl bg-cream p-6 sm:p-8 rounded-2xl border border-sand-300 shadow-sm space-y-6">
              <h2 className="font-display text-2xl font-bold text-walnut">Change Password</h2>

              {passwordMsg && (
                <div className="p-3 bg-olive-100 text-olive-800 text-xs rounded">
                  {passwordMsg}
                </div>
              )}
              {passwordError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-walnut mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-walnut mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-sand-300 rounded px-3 py-2 text-xs text-walnut focus:outline-none focus:border-bamboo"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-walnut hover:bg-walnut-700 text-cream text-xs font-semibold rounded uppercase tracking-wider transition-colors"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
