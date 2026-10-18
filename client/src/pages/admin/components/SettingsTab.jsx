import React, { useState } from 'react';
import {
  CreditCard,
  Truck,
  Users,
  Mail,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  Save,
  Phone,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import apiFetch from '../../../utils/api.js';

export default function SettingsTab({
  settings,
  onRefresh,
  formatPrice
}) {
  const [subTab, setSubTab] = useState('channels'); // 'channels' | 'delivery' | 'staff' | 'email'

  // Payment Channels State
  const [paymentChannels, setPaymentChannels] = useState(
    settings?.paymentChannels || [
      {
        id: 'cod',
        name: 'Cash On Delivery',
        provider: 'Cash on Delivery',
        serviceBank: 'Courier Cash Collection',
        operation: 'Cash on Delivery',
        account: 'Courier Collection at Doorstep',
        status: 'Active',
        instructions: 'Pay in cash upon doorstep delivery after inspecting the artisan packaging.'
      },
      {
        id: 'bkash',
        name: 'bKash Merchant Pay',
        provider: 'bKash',
        serviceBank: 'bKash Merchant Portal',
        operation: 'Merchant Payment / Send Money',
        account: '01712-345678',
        status: 'Active',
        instructions: 'Pay via bKash App, input Order Number as reference, and submit TrxID.'
      },
      {
        id: 'nagad',
        name: 'Nagad Direct Wallet',
        provider: 'Nagad',
        serviceBank: 'Nagad Islamic / General',
        operation: 'Merchant Payment',
        account: '01712-345678',
        status: 'Active',
        instructions: 'Pay to our official Nagad merchant wallet and enter the transaction ID.'
      },
      {
        id: 'rocket',
        name: 'Rocket DBBL',
        provider: 'Rocket',
        serviceBank: 'Dutch-Bangla Bank',
        operation: 'Personal Wallet',
        account: '01712-345678-4',
        status: 'Active',
        instructions: 'DBBL Rocket payment to official studio line.'
      },
      {
        id: 'bank',
        name: 'BRAC Bank Corporate',
        provider: 'Bank Transfer',
        serviceBank: 'BRAC Bank Ltd',
        operation: 'Direct Deposit / BEFTN / NPSB',
        account: '1501204892001 (Banani Branch)',
        status: 'Active',
        instructions: 'Account Name: Canzir Atelier Ltd | Branch: Banani | Routing: 060260489'
      }
    ]
  );

  // Delivery Rules State
  const [deliveryRules, setDeliveryRules] = useState({
    insideDhakaFee: settings?.deliveryRules?.insideDhakaFee || 80,
    outsideDhakaFee: settings?.deliveryRules?.outsideDhakaFee || 150,
    freeDeliveryThreshold: settings?.deliveryRules?.freeDeliveryThreshold || 5000,
    insideDhakaEst: settings?.deliveryRules?.insideDhakaEst || '1 to 2 business days',
    outsideDhakaEst: settings?.deliveryRules?.outsideDhakaEst || '3 to 5 business days'
  });

  // Staff State
  const [staffList, setStaffList] = useState([
    { name: 'Canzir Master Administrator', email: 'admin@canzir.com', phone: '+880 1712-345678', role: 'Owner / Administrator', status: 'Active' },
    { name: 'Artisan Workshop Studio', email: 'studio@canzir.com', phone: '+880 1712-888999', role: 'Inventory & Assembly Manager', status: 'Active' }
  ]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', phone: '', password: '', role: 'admin' });

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState({
    storeEmail: settings?.emailSettings?.storeEmail || 'concierge@canzir.com',
    claimExpiryDays: settings?.emailSettings?.claimExpiryDays || 90,
    notifyOnNewOrder: settings?.emailSettings?.notifyOnNewOrder ?? true,
    notifyOnShipped: settings?.emailSettings?.notifyOnShipped ?? true
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Save Channels
  const handleToggleChannel = async (id) => {
    const updated = paymentChannels.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return c;
    });
    setPaymentChannels(updated);
    try {
      await apiFetch('/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'paymentChannels', value: updated })
      });
      setFeedback('Payment channel status updated');
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    }
  };

  // Save Delivery Rules
  const handleSaveDeliveryRules = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback('');
    try {
      await apiFetch('/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'deliveryRules', value: deliveryRules })
      });
      setFeedback('Delivery charges and thresholds saved successfully');
      onRefresh();
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Save Email Settings
  const handleSaveEmailSettings = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback('');
    try {
      await apiFetch('/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'emailSettings', value: emailSettings })
      });
      setFeedback('Email and notification rules saved successfully');
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Add Staff Member
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await apiFetch('/auth/staff', {
        method: 'POST',
        body: JSON.stringify(newStaff)
      });
      if (res.success && res.user) {
        setStaffList([...staffList, { ...res.user, status: 'Active' }]);
        setFeedback(`Staff member "${newStaff.name}" added`);
        setShowStaffModal(false);
        setNewStaff({ name: '', email: '', phone: '', password: '', role: 'admin' });
      }
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C58B4B]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C58B4B]">
              Store Configuration &amp; Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-stone-100 font-bold">
            Settings &amp; Studio Parameters
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Configure mobile banking channels, regional delivery logistics, administrative permissions, and automated client notifications.
          </p>
        </div>
      </div>

      {/* Subtab Navigation Pills - Full Width Responsive */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-3">
        {[
          { id: 'channels', label: 'Payment Channels', icon: CreditCard },
          { id: 'delivery', label: 'Delivery Rules', icon: Truck },
          { id: 'staff', label: 'Staff Administration', icon: Users },
          { id: 'email', label: 'Email & Notifications', icon: Mail }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                subTab === tab.id
                  ? 'bg-[#C58B4B]/15 text-[#E6AF68] border border-[#C58B4B]/40 shadow-xs font-semibold'
                  : 'bg-[#181513] text-stone-400 border border-stone-800 hover:border-stone-700 hover:text-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="text-stone-400 hover:text-stone-200">✕</button>
        </div>
      )}

      {/* SUBTAB 1: PAYMENT CHANNELS */}
      {subTab === 'channels' && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-stone-800 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-stone-100 text-xs uppercase tracking-wider">
                Configured Payment Channels
              </h4>
              <p className="text-[11px] text-stone-500">
                Active payment options available to customers during checkout.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-800/60 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="py-3 px-4">Channel Name</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Payment Service / Bank</th>
                  <th className="py-3 px-4">Customer Operation</th>
                  <th className="py-3 px-4">Account / Wallet Number</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Toggle Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {paymentChannels.map((ch, idx) => (
                  <tr key={idx} className="hover:bg-stone-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-stone-100 flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-[#C58B4B]/20 text-[#C58B4B] font-bold text-[10px] flex items-center justify-center">
                        {ch.name.substring(0, 2).toUpperCase()}
                      </div>
                      {ch.name}
                    </td>
                    <td className="py-3.5 px-4 text-stone-300">{ch.provider}</td>
                    <td className="py-3.5 px-4 text-stone-400">{ch.serviceBank}</td>
                    <td className="py-3.5 px-4 text-stone-400">{ch.operation}</td>
                    <td className="py-3.5 px-4 font-mono text-stone-200">{ch.account}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        ch.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-stone-800 text-stone-400 border-stone-700'
                      }`}>
                        {ch.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleChannel(ch.id)}
                        className="px-2.5 py-1 text-[11px] rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition"
                      >
                        {ch.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DELIVERY RULES */}
      {subTab === 'delivery' && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="font-serif text-stone-100 text-base font-semibold">Shipping &amp; Delivery Rules</h3>
            <p className="text-xs text-stone-500">
              Configure baseline shipping fees, free shipping incentives, and transit schedules.
            </p>
          </div>

          <form onSubmit={handleSaveDeliveryRules} className="space-y-4 max-w-xl text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-300 mb-1 font-medium">Inside Dhaka Delivery Fee (৳)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={deliveryRules.insideDhakaFee}
                  onChange={(e) => setDeliveryRules({ ...deliveryRules, insideDhakaFee: Number(e.target.value) })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>

              <div>
                <label className="block text-stone-300 mb-1 font-medium">Outside Dhaka Delivery Fee (৳)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={deliveryRules.outsideDhakaFee}
                  onChange={(e) => setDeliveryRules({ ...deliveryRules, outsideDhakaFee: Number(e.target.value) })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-300 mb-1 font-medium">Minimum Purchase Amount for Free Delivery (৳)</label>
              <input
                type="number"
                required
                min="0"
                value={deliveryRules.freeDeliveryThreshold}
                onChange={(e) => setDeliveryRules({ ...deliveryRules, freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">
                Orders with subtotal equal or exceeding this amount receive free shipping automatically at checkout.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-300 mb-1 font-medium">Inside Dhaka Estimated Time</label>
                <input
                  type="text"
                  value={deliveryRules.insideDhakaEst}
                  onChange={(e) => setDeliveryRules({ ...deliveryRules, insideDhakaEst: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>

              <div>
                <label className="block text-stone-300 mb-1 font-medium">Outside Dhaka Estimated Time</label>
                <input
                  type="text"
                  value={deliveryRules.outsideDhakaEst}
                  onChange={(e) => setDeliveryRules({ ...deliveryRules, outsideDhakaEst: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-lg bg-[#C58B4B] hover:bg-[#b0793c] text-stone-950 font-semibold transition"
              >
                Save Delivery Rules
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 3: STAFF MANAGEMENT */}
      {subTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-stone-100 text-base font-semibold">Store Administrators &amp; Team</h3>
              <p className="text-xs text-stone-500">Authorized atelier staff with store admin privileges.</p>
            </div>
            <button
              onClick={() => setShowStaffModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#C58B4B] hover:bg-[#b0793c] text-stone-950 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Team Member
            </button>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-800/60 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {staffList.map((st, idx) => (
                    <tr key={idx} className="hover:bg-stone-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-stone-100 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#C58B4B]/20 text-[#C58B4B] font-bold text-xs flex items-center justify-center">
                          {st.name.substring(0, 2).toUpperCase()}
                        </div>
                        {st.name}
                      </td>
                      <td className="py-3.5 px-4 text-stone-400">{st.email}</td>
                      <td className="py-3.5 px-4 font-mono text-stone-300">{st.phone || '—'}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-[#C58B4B] font-medium text-[11px]">
                          {st.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {st.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: EMAIL SETTINGS */}
      {subTab === 'email' && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="font-serif text-stone-100 text-base font-semibold">Email &amp; Notification Rules</h3>
            <p className="text-xs text-stone-500">
              Manage automatic customer claim emails and order status notifications.
            </p>
          </div>

          <form onSubmit={handleSaveEmailSettings} className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="block text-stone-300 mb-1 font-medium">Official Atelier Support Email</label>
              <input
                type="email"
                required
                value={emailSettings.storeEmail}
                onChange={(e) => setEmailSettings({ ...emailSettings, storeEmail: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
              />
            </div>

            <div>
              <label className="block text-stone-300 mb-1 font-medium">Guest Claim Token Expiry (Days)</label>
              <input
                type="number"
                min="7"
                max="365"
                value={emailSettings.claimExpiryDays}
                onChange={(e) => setEmailSettings({ ...emailSettings, claimExpiryDays: Number(e.target.value) })}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">
                Standard token validity for guest buyers to claim ownership of their order records.
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                <input
                  type="checkbox"
                  checked={emailSettings.notifyOnNewOrder}
                  onChange={(e) => setEmailSettings({ ...emailSettings, notifyOnNewOrder: e.target.checked })}
                  className="rounded bg-stone-900 border-stone-700 text-[#C58B4B]"
                />
                Send automated email confirmation immediately upon customer order placement
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                <input
                  type="checkbox"
                  checked={emailSettings.notifyOnShipped}
                  onChange={(e) => setEmailSettings({ ...emailSettings, notifyOnShipped: e.target.checked })}
                  className="rounded bg-stone-900 border-stone-700 text-[#C58B4B]"
                />
                Send courier tracking number notification when order transitions to Shipped
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-lg bg-[#C58B4B] hover:bg-[#b0793c] text-stone-950 font-semibold transition"
              >
                Save Email Rules
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1c1917] border border-stone-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif text-lg text-stone-100 font-semibold">
                Add Team Member
              </h3>
              <button onClick={() => setShowStaffModal(false)} className="text-stone-400 hover:text-stone-200">✕</button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahir Rahman"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>

              <div>
                <label className="block text-stone-300 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. mahir@canzir.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>

              <div>
                <label className="block text-stone-300 mb-1 font-medium">Phone</label>
                <input
                  type="tel"
                  placeholder="+880 1712-000000"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>

              <div>
                <label className="block text-stone-300 mb-1 font-medium">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-800 text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-[#C58B4B] hover:bg-[#b0793c] text-stone-950 font-semibold"
                >
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
