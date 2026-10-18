import React, { useState, useEffect } from 'react';
import {
  Package,
  Layers,
  Sliders,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Star,
  ExternalLink,
  Info,
  Check,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import apiFetch from '../../../utils/api.js';
import ProductFormModal from './ProductFormModal.jsx';

export default function CatalogTab({
  products,
  categories,
  activeSubTab = 'products',
  loading,
  onRefresh,
  formatPrice
}) {
  const [subTab, setSubTab] = useState(activeSubTab || 'products');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Update subTab when parent changes
  useEffect(() => {
    if (activeSubTab) {
      setSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  // Global listener to open Add Product modal
  useEffect(() => {
    const handleTriggerAdd = () => {
      setSubTab('products');
      handleOpenAddProduct();
    };
    window.addEventListener('canzir-open-add-product', handleTriggerAdd);
    return () => window.removeEventListener('canzir-open-add-product', handleTriggerAdd);
  }, [categories]);

  // Product Add / Edit Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Category Add / Edit Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: '/assets/products/bamboo-lattice-table-lamp.jpeg',
    displayOrder: 1
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Open Add Product
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  // Open Edit Product
  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setShowProductModal(true);
  };

  // Delete Product
  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the live store?`)) return;
    setActionLoading(true);
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      setFeedback(`Product "${title}" removed from store`);
      onRefresh();
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Feature Badge Toggles
  const handleToggleBadge = async (prod, field) => {
    setActionLoading(true);
    try {
      const newVal = !prod[field];
      await apiFetch(`/products/${prod._id}`, {
        method: 'PUT',
        body: JSON.stringify({ [field]: newVal })
      });
      setFeedback(`Updated ${field} for "${prod.title}" to ${newVal ? 'Active' : 'Inactive'}`);
      onRefresh();
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Quick In Stock Toggle
  const handleToggleStock = async (prod) => {
    setActionLoading(true);
    try {
      const newInStock = !prod.inStock;
      await apiFetch(`/products/${prod._id}`, {
        method: 'PUT',
        body: JSON.stringify({ inStock: newInStock })
      });
      setFeedback(`"${prod.title}" is now ${newInStock ? 'In Stock' : 'Out of Stock'}`);
      onRefresh();
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Stock Adjustment
  const handleAdjustStock = async (prodId, delta) => {
    setActionLoading(true);
    try {
      await apiFetch(`/products/${prodId}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ delta })
      });
      onRefresh();
    } catch (err) {
      setFeedback(`Error adjusting stock: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Add Category
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      image: '/assets/products/bamboo-lattice-table-lamp.jpeg',
      displayOrder: categories.length + 1
    });
    setShowCategoryModal(true);
  };

  // Save Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingCategory) {
        await apiFetch(`/products/categories/${editingCategory._id}`, {
          method: 'PUT',
          body: JSON.stringify(categoryForm)
        });
        setFeedback(`Category "${categoryForm.name}" updated`);
      } else {
        await apiFetch('/products/categories', {
          method: 'POST',
          body: JSON.stringify(categoryForm)
        });
        setFeedback(`Category "${categoryForm.name}" created`);
      }
      setShowCategoryModal(false);
      onRefresh();
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    setActionLoading(true);
    try {
      await apiFetch(`/products/categories/${id}`, { method: 'DELETE' });
      setFeedback(`Category "${name}" removed`);
      onRefresh();
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchTitle = p.title?.toLowerCase().includes(term);
      const matchSku = p.sku?.toLowerCase().includes(term);
      if (!matchTitle && !matchSku) return false;
    }
    if (filterCategory !== 'All') {
      if (p.category?.toLowerCase() !== filterCategory.toLowerCase()) return false;
    }
    if (filterStatus !== 'All') {
      if (filterStatus === 'inStock' && !p.inStock) return false;
      if (filterStatus === 'outOfStock' && p.inStock) return false;
      if (filterStatus === 'featured' && !p.isFeatured) return false;
      if (filterStatus === 'bestSeller' && !p.isBestSeller) return false;
      if (filterStatus === 'newArrival' && !p.isNewArrival) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C58B4B]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C58B4B]">
              Atelier Catalog &amp; Inventory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-stone-100 font-bold">
            Products &amp; Catalog Management
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Create, edit, and publish handcrafted lighting fixtures. All changes and stock balances synchronize to the live store immediately.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleOpenAddProduct}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#C58B4B] to-[#b0793c] hover:from-[#d19655] hover:to-[#be8445] text-stone-950 transition shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
          {subTab === 'categories' && (
            <button
              onClick={handleOpenAddCategory}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-stone-800/90 hover:bg-stone-800 text-stone-200 border border-stone-700/60 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 rounded-xl bg-stone-800/90 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-700/60 transition shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh Catalog Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C58B4B]' : 'text-stone-400'}`} />
          </button>
        </div>
      </div>

      {/* Subtab Navigation Pills - Full Width Responsive */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-3">
        {[
          { id: 'products', label: 'All Products', icon: Package, count: products.length },
          { id: 'categories', label: 'Categories', icon: Layers, count: categories.length },
          { id: 'variants', label: 'Customization Variants', icon: Sliders },
          { id: 'inventory', label: 'Live Inventory & Stock', icon: AlertTriangle, count: products.filter(p => p.stockQuantity <= 5).length }
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
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                  tab.id === 'inventory' && tab.count > 0
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-stone-900 border border-stone-800 text-stone-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center justify-between animate-fadeIn shadow-xs">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="text-stone-400 hover:text-stone-200">✕</button>
        </div>
      )}

      {/* SUBTAB 1: PRODUCTS TABLE */}
      {subTab === 'products' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between shadow-sm">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by title, SKU, or materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#C58B4B] focus:ring-1 focus:ring-[#C58B4B]/30 transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C58B4B] transition cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map(c => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#C58B4B] transition cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="inStock">In Stock Only</option>
                <option value="outOfStock">Out of Stock</option>
                <option value="featured">Featured On Homepage</option>
                <option value="bestSeller">Best Sellers</option>
                <option value="newArrival">New Arrivals</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-900/90 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="py-3.5 px-5 font-bold">Product Piece</th>
                    <th className="py-3.5 px-5 font-bold">Category</th>
                    <th className="py-3.5 px-5 font-bold">Price</th>
                    <th className="py-3.5 px-5 font-bold">Stock</th>
                    <th className="py-3.5 px-5 font-bold">Availability</th>
                    <th className="py-3.5 px-5 font-bold">Store Badges / Features</th>
                    <th className="py-3.5 px-5 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-stone-500">
                        No matching products found. Click &ldquo;Add New Product&rdquo; above to publish one.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(prod => (
                      <tr key={prod._id} className="hover:bg-stone-800/40 transition-colors group">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images?.[0] || '/assets/products/bamboo-lattice-table-lamp.jpeg'}
                              alt={prod.title}
                              className="w-12 h-12 object-cover rounded-xl border border-stone-800 shrink-0 bg-stone-950 shadow-xs group-hover:border-[#C58B4B]/40 transition"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-stone-100 group-hover:text-[#E6AF68] transition-colors flex items-center gap-1.5 truncate">
                                {prod.title}
                              </div>
                              <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                                SKU: {prod.sku || 'CNZ-000'} | Slug: /{prod.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-stone-300 font-medium">
                          <span className="bg-stone-900 border border-stone-800 px-2.5 py-1 rounded-md text-[11px]">
                            {prod.category}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-mono font-bold text-stone-100">
                          <div className="text-sm">{formatPrice(prod.price)}</div>
                          {prod.compareAtPrice && (
                            <div className="text-[10px] text-stone-500 line-through">
                              {formatPrice(prod.compareAtPrice)}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-5 font-mono">
                          <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                            prod.stockQuantity <= 5
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-stone-900 border border-stone-800 text-stone-200'
                          }`}>
                            {prod.stockQuantity} units
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStock(prod)}
                            title="Click to toggle availability"
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border transition cursor-pointer ${
                              prod.inStock
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                            }`}
                          >
                            {prod.inStock ? '✓ In Stock' : '✕ Out of Stock'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            <button
                              onClick={() => handleToggleBadge(prod, 'isFeatured')}
                              title="Toggle Featured status on Homepage Hero"
                              className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer border ${
                                prod.isFeatured
                                  ? 'bg-[#C58B4B]/20 text-[#C58B4B] border-[#C58B4B]/40'
                                  : 'bg-stone-800/60 text-stone-500 border-stone-800 hover:text-stone-300'
                              }`}
                            >
                              ⭐ Featured
                            </button>
                            <button
                              onClick={() => handleToggleBadge(prod, 'isBestSeller')}
                              title="Toggle Best Seller badge"
                              className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer border ${
                                prod.isBestSeller
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-stone-800/60 text-stone-500 border-stone-800 hover:text-stone-300'
                              }`}
                            >
                              🔥 Best Seller
                            </button>
                            <button
                              onClick={() => handleToggleBadge(prod, 'isNewArrival')}
                              title="Toggle New Arrival badge"
                              className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer border ${
                                prod.isNewArrival
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                  : 'bg-stone-800/60 text-stone-500 border-stone-800 hover:text-stone-300'
                              }`}
                            >
                              ✨ New
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <a
                              href={`/product/${prod.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition"
                              title="View on Live Store"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#C58B4B]" />
                            </a>
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition"
                              title="Edit Details, Images & Features"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod._id, prod.title)}
                              className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 border border-stone-700 transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CATEGORIES */}
      {subTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-stone-900/80 border border-stone-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-800/60 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Editorial Description</th>
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Live Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {categories.map((cat, idx) => (
                    <tr key={cat._id || idx} className="hover:bg-stone-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-stone-100 flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-stone-800 flex items-center justify-center text-[#C58B4B]">
                          <Layers className="w-4 h-4" />
                        </div>
                        {cat.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-stone-400">/{cat.slug}</td>
                      <td className="py-3.5 px-4 text-stone-400 max-w-sm truncate">{cat.description}</td>
                      <td className="py-3.5 px-4 font-mono text-stone-300">{cat.displayOrder || idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteCategory(cat._id, cat.name)}
                          className="p-1.5 rounded hover:bg-stone-800 text-stone-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: VARIANTS */}
      {subTab === 'variants' && (
        <div className="space-y-4">
          <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="font-serif text-stone-100 text-base font-semibold">Artisan Customization Options</h3>
              <p className="text-xs text-stone-500">
                Options selected by customers on product pages dynamically recalculate the total order amount.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                <span className="text-xs font-semibold text-[#C58B4B] uppercase tracking-wider block">Bamboo Finishes</span>
                <ul className="text-xs text-stone-300 space-y-1.5">
                  <li className="flex justify-between border-b border-stone-800 pb-1">
                    <span>Natural Riverbed Blonde</span>
                    <strong className="text-emerald-400">+৳0</strong>
                  </li>
                  <li className="flex justify-between border-b border-stone-800 pb-1">
                    <span>Smoked Walnut Heat Cure</span>
                    <strong className="text-[#C58B4B]">+৳350</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Dark Charcoal Torch Tint</span>
                    <strong className="text-[#C58B4B]">+৳500</strong>
                  </li>
                </ul>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                <span className="text-xs font-semibold text-[#C58B4B] uppercase tracking-wider block">Timber Bases</span>
                <ul className="text-xs text-stone-300 space-y-1.5">
                  <li className="flex justify-between border-b border-stone-800 pb-1">
                    <span>Solid Burma Seasoned Teak</span>
                    <strong className="text-emerald-400">+৳0</strong>
                  </li>
                  <li className="flex justify-between border-b border-stone-800 pb-1">
                    <span>Deep Walnut Stain</span>
                    <strong className="text-[#C58B4B]">+৳250</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Bleached Sand Birch</span>
                    <strong className="text-[#C58B4B]">+৳300</strong>
                  </li>
                </ul>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                <span className="text-xs font-semibold text-[#C58B4B] uppercase tracking-wider block">Braided Cord Lengths</span>
                <ul className="text-xs text-stone-300 space-y-1.5">
                  <li className="flex justify-between border-b border-stone-800 pb-1">
                    <span>1.8m Braided Natural Jute</span>
                    <strong className="text-emerald-400">+৳0</strong>
                  </li>
                  <li className="flex justify-between border-b border-stone-800 pb-1">
                    <span>3.0m High Duplex Ceiling Cord</span>
                    <strong className="text-[#C58B4B]">+৳450</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Twisted Black Fabric Cord</span>
                    <strong className="text-[#C58B4B]">+৳250</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: INVENTORY CONTROL */}
      {subTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-stone-900/80 border border-stone-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-stone-100 text-xs uppercase tracking-wider">
                  Live Stock Adjustments &amp; Inventory Sync
                </h4>
                <p className="text-[11px] text-stone-500">
                  Update inventory levels in real-time. Changes are immediately saved to the database.
                </p>
              </div>
              <span className="text-xs text-stone-400">
                Low stock threshold: &le; 5 units
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-800/60 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="py-3 px-4">Item &amp; SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Available Units</th>
                    <th className="py-3 px-4">Stock Health</th>
                    <th className="py-3 px-4 text-right">Quick Stock Increments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {products.map(prod => (
                    <tr key={prod._id} className="hover:bg-stone-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-100">{prod.title}</div>
                        <div className="text-[10px] text-stone-500 font-mono">SKU: {prod.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-stone-400">{prod.category}</td>
                      <td className="py-3 px-4 font-mono font-bold text-base text-stone-100">
                        {prod.stockQuantity}
                      </td>
                      <td className="py-3 px-4">
                        {prod.stockQuantity <= 5 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Alert
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-medium">✓ Healthy Stock</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            disabled={actionLoading || prod.stockQuantity <= 0}
                            onClick={() => handleAdjustStock(prod._id, -1)}
                            className="w-7 h-7 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs transition"
                            title="Decrement 1"
                          >
                            -1
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleAdjustStock(prod._id, 1)}
                            className="w-7 h-7 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs transition"
                            title="Add 1"
                          >
                            +1
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleAdjustStock(prod._id, 5)}
                            className="px-2 h-7 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium text-xs transition"
                            title="Restock 5"
                          >
                            +5
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleAdjustStock(prod._id, 10)}
                            className="px-2 h-7 rounded bg-[#C58B4B]/20 hover:bg-[#C58B4B]/30 text-[#C58B4B] border border-[#C58B4B]/40 font-medium text-xs transition"
                            title="Batch Restock 10"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ENTERPRISE ADD / EDIT PRODUCT MODAL */}
      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
        categories={categories}
        onProductSaved={(msg) => {
          setFeedback(msg);
          setShowProductModal(false);
          setEditingProduct(null);
          onRefresh();
        }}
        formatPrice={formatPrice}
      />

      {/* Add / Edit Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1c1917] border border-stone-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif text-lg text-stone-100 font-semibold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-stone-400 hover:text-stone-200">✕</button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 mb-1 font-medium">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bamboo Sconces"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>

              <div>
                <label className="block text-stone-300 mb-1 font-medium">Description</label>
                <textarea
                  rows="2"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>

              <div>
                <label className="block text-stone-300 mb-1 font-medium">Display Sort Order</label>
                <input
                  type="number"
                  value={categoryForm.displayOrder}
                  onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: Number(e.target.value) })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-[#C58B4B] hover:bg-[#b0793c] text-stone-950 font-semibold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
