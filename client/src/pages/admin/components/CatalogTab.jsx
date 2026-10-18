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
  const [modalActiveTab, setModalActiveTab] = useState('basic'); // 'basic' | 'images' | 'specs' | 'features' | 'variants'

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Comprehensive Product Form
  const [productForm, setProductForm] = useState({
    title: '',
    sku: '',
    category: 'Bamboo Table Lamps',
    price: '',
    compareAtPrice: '',
    stockQuantity: 15,
    inStock: true,
    shortDescription: '',
    description: '',
    images: ['/assets/products/bamboo-lattice-table-lamp.jpeg'],
    materials: 'Natural River Bamboo, Seasoned Teak',
    lightingStyle: 'Warm Ambient Glow',
    roomType: 'Living Room, Dining',
    specifications: {
      bulbType: 'E27 Warm Amber LED (Included)',
      wattage: '5W - 9W',
      voltage: '220V - 240V AC',
      cordLength: '1.8 meters woven braided cord with inline switch',
      craftMethod: 'Hand-split bamboo lattice, artisan woven'
    },
    dimensions: {
      height: '14"',
      width: '10"',
      diameter: '10"',
      weight: '1.2 kg'
    },
    variants: [
      {
        name: 'Finish',
        options: [
          { label: 'Natural Riverbed Bamboo', priceAdjustment: 0, inStock: true },
          { label: 'Smoked Walnut Heat Cure', priceAdjustment: 350, inStock: true }
        ]
      }
    ],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true
  });

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

  // Sample catalog imagery to easily pick from
  const sampleImages = [
    { label: 'Bamboo Bell Pendant', url: '/assets/products/bamboo-bell-pendant.jpg' },
    { label: 'Bamboo Lattice Table Lamp', url: '/assets/products/bamboo-lattice-table-lamp.jpeg' },
    { label: 'Cottage Bamboo Wall Sconce', url: '/assets/products/cottage-bamboo-wall-sconce.jpeg' },
    { label: 'Minimalist Wooden Table Lamp', url: '/assets/products/minimalist-wooden-lamp.jpg' },
    { label: 'Woven Curved Floor Lamp', url: '/assets/products/woven-floor-lamp.jpg' },
    { label: 'Organic Ambient Sconce', url: '/assets/products/organic-ambient-sconce.jpg' }
  ];

  // Open Add Product
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setModalActiveTab('basic');
    setProductForm({
      title: '',
      sku: `CNZ-${Math.floor(1000 + Math.random() * 9000)}`,
      category: categories[0]?.name || 'Bamboo Table Lamps',
      price: '',
      compareAtPrice: '',
      stockQuantity: 15,
      inStock: true,
      shortDescription: '',
      description: '',
      images: ['/assets/products/bamboo-lattice-table-lamp.jpeg'],
      materials: 'Natural River Bamboo, Seasoned Burma Teak',
      lightingStyle: 'Warm Ambient Glow',
      roomType: 'Living Room, Dining',
      specifications: {
        bulbType: 'E27 Warm Amber LED (Included)',
        wattage: '5W - 9W',
        voltage: '220V - 240V AC',
        cordLength: '1.8 meters woven braided cord with inline switch',
        craftMethod: 'Hand-split riverbed bamboo lattice, artisan woven'
      },
      dimensions: {
        height: '14"',
        width: '10"',
        diameter: '10"',
        weight: '1.2 kg'
      },
      variants: [
        {
          name: 'Finish',
          options: [
            { label: 'Natural Riverbed Bamboo', priceAdjustment: 0, inStock: true },
            { label: 'Smoked Walnut Heat Cure', priceAdjustment: 350, inStock: true }
          ]
        }
      ],
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true
    });
    setShowProductModal(true);
  };

  // Open Edit Product
  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setModalActiveTab('basic');
    setProductForm({
      title: prod.title || '',
      sku: prod.sku || '',
      category: prod.category || categories[0]?.name || 'Bamboo Table Lamps',
      price: prod.price ?? '',
      compareAtPrice: prod.compareAtPrice ?? '',
      stockQuantity: prod.stockQuantity ?? 10,
      inStock: prod.inStock ?? true,
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
      images: prod.images?.length ? prod.images : ['/assets/products/bamboo-lattice-table-lamp.jpeg'],
      materials: Array.isArray(prod.materials) ? prod.materials.join(', ') : (prod.materials || ''),
      lightingStyle: prod.lightingStyle || 'Warm Ambient Glow',
      roomType: Array.isArray(prod.roomType) ? prod.roomType.join(', ') : (prod.roomType || 'Living Room'),
      specifications: {
        bulbType: prod.specifications?.bulbType || 'E27 Warm Amber LED (Included)',
        wattage: prod.specifications?.wattage || '5W - 9W',
        voltage: prod.specifications?.voltage || '220V - 240V AC',
        cordLength: prod.specifications?.cordLength || '1.8m braided jute cord',
        craftMethod: prod.specifications?.craftMethod || 'Artisan hand-split bamboo'
      },
      dimensions: {
        height: prod.dimensions?.height || '14"',
        width: prod.dimensions?.width || '10"',
        diameter: prod.dimensions?.diameter || '10"',
        weight: prod.dimensions?.weight || '1.2 kg'
      },
      variants: prod.variants?.length ? prod.variants : [
        {
          name: 'Finish',
          options: [
            { label: 'Natural Riverbed Bamboo', priceAdjustment: 0, inStock: true },
            { label: 'Smoked Walnut Heat Cure', priceAdjustment: 350, inStock: true }
          ]
        }
      ],
      isFeatured: Boolean(prod.isFeatured),
      isBestSeller: Boolean(prod.isBestSeller),
      isNewArrival: Boolean(prod.isNewArrival)
    });
    setShowProductModal(true);
  };

  // Image Upload handler
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFeedback('');
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await apiFetch('/upload', {
        method: 'POST',
        body: formData
      });

      if (res.success && res.fileUrl) {
        setProductForm(prev => ({
          ...prev,
          images: [...prev.images, res.fileUrl]
        }));
        setFeedback('Image uploaded successfully and added to gallery');
      }
    } catch (err) {
      setFeedback(`Upload error: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddCustomImage = () => {
    if (!customImageUrl.trim()) return;
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, customImageUrl.trim()]
    }));
    setCustomImageUrl('');
  };

  const handleRemoveImage = (index) => {
    if (productForm.images.length <= 1) return;
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSetPrimaryImage = (index) => {
    const selected = productForm.images[index];
    const rest = productForm.images.filter((_, i) => i !== index);
    setProductForm(prev => ({
      ...prev,
      images: [selected, ...rest]
    }));
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback('');
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        compareAtPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : null,
        stockQuantity: Number(productForm.stockQuantity),
        inStock: Boolean(productForm.inStock),
        materials: productForm.materials ? productForm.materials.split(',').map(s => s.trim()).filter(Boolean) : [],
        roomType: productForm.roomType ? productForm.roomType.split(',').map(s => s.trim()).filter(Boolean) : []
      };

      if (editingProduct) {
        await apiFetch(`/products/${editingProduct._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setFeedback(`✓ Product "${payload.title}" updated and synchronized with live store immediately!`);
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setFeedback(`✓ Product "${payload.title}" created and published to live store!`);
      }
      setShowProductModal(false);
      onRefresh();
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
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

      {/* COMPREHENSIVE ADD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1c1917] border border-stone-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-800 bg-stone-900/90 sticky top-0 z-20 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-stone-100 font-semibold">
                  {editingProduct ? `Edit Piece: ${editingProduct.title}` : 'Add New Artisan Fixture to Store'}
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  All changes are saved to the MongoDB database and immediately updated in the live Store.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="text-stone-400 hover:text-stone-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="px-6 pt-3 border-b border-stone-800 bg-stone-900/40 flex items-center gap-2 overflow-x-auto text-xs">
              {[
                { id: 'basic', label: '1. Basic Info & Pricing' },
                { id: 'images', label: '2. Images & Gallery' },
                { id: 'specs', label: '3. Technical Specs & Dimensions' },
                { id: 'features', label: '4. Badges & Storefront Visibility' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setModalActiveTab(t.id)}
                  className={`pb-2.5 font-medium border-b-2 transition whitespace-nowrap ${
                    modalActiveTab === t.id
                      ? 'border-[#C58B4B] text-[#C58B4B]'
                      : 'border-transparent text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-6 text-xs flex-1">
              {/* TAB 1: BASIC INFO & PRICING */}
              {modalActiveTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-stone-300 mb-1 font-semibold">Product Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Artisan Woven Riverbed Bamboo Pendant"
                        value={productForm.title}
                        onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-300 mb-1 font-semibold">SKU Identifier</label>
                      <input
                        type="text"
                        placeholder="e.g. CNZ-8821"
                        value={productForm.sku}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 uppercase font-mono focus:outline-none focus:border-[#C58B4B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-300 mb-1 font-semibold">Category *</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                      >
                        {categories.map(c => (
                          <option key={c._id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-300 mb-1 font-semibold">Stock Quantity (Units)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={productForm.stockQuantity}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          stockQuantity: e.target.value,
                          inStock: Number(e.target.value) > 0
                        })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-300 mb-1 font-semibold">Regular Selling Price (BDT ৳) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="e.g. 4500"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-300 mb-1 font-semibold">Compare-at / Original Price (৳)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 5200 (shows discount on store)"
                        value={productForm.compareAtPrice}
                        onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 mb-1 font-semibold">Short Editorial Catchphrase</label>
                    <input
                      type="text"
                      placeholder="e.g. Handcrafted riverbed bamboo lattice with warm ambient glow"
                      value={productForm.shortDescription}
                      onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 mb-1 font-semibold">Full Craftsmanship Story &amp; Description</label>
                    <textarea
                      rows="4"
                      placeholder="Detail the natural seasoning of the bamboo, woodcraft origins, and how this piece enhances room ambiance..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-stone-200 font-medium">
                      <input
                        type="checkbox"
                        checked={productForm.inStock}
                        onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                        className="rounded bg-stone-950 border-stone-700 text-[#C58B4B] w-4 h-4"
                      />
                      Available for immediate purchase in store (In Stock)
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: IMAGES & GALLERY */}
              {modalActiveTab === 'images' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-stone-200 text-xs mb-1">Upload New Photo</h4>
                    <p className="text-[11px] text-stone-500 mb-3">
                      Upload photos directly from your device. Files are saved to the server and linked immediately.
                    </p>

                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium cursor-pointer border border-stone-700 transition">
                      <Upload className="w-4 h-4 text-[#C58B4B]" />
                      <span>{uploadingImage ? 'Uploading Image...' : 'Choose Image File from Computer'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="pt-2 border-t border-stone-800">
                    <h4 className="font-semibold text-stone-200 text-xs mb-1">Or Add Image URL / Studio Asset</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. /assets/products/woven-floor-lamp.jpg or https://..."
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomImage}
                        className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium border border-stone-700"
                      >
                        Add URL
                      </button>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-stone-500 block w-full">Quick Pick From Studio Library:</span>
                      {sampleImages.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (!productForm.images.includes(s.url)) {
                              setProductForm(prev => ({ ...prev, images: [...prev.images, s.url] }));
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-[10px] border border-stone-800"
                        >
                          + {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Gallery Grid */}
                  <div className="pt-2 border-t border-stone-800">
                    <h4 className="font-semibold text-stone-200 text-xs mb-2">Attached Image Gallery ({productForm.images.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {productForm.images.map((img, idx) => (
                        <div key={idx} className="relative group bg-stone-950 rounded-lg border border-stone-800 overflow-hidden">
                          <img
                            src={img}
                            alt={`Preview ${idx}`}
                            className="w-full h-28 object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-[#C58B4B] text-stone-950 text-[9px] font-bold px-1.5 py-0.2 rounded shadow">
                              Primary Image
                            </span>
                          )}
                          <div className="p-1.5 bg-stone-900 flex items-center justify-between gap-1">
                            {idx !== 0 ? (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="text-[10px] text-[#C58B4B] hover:underline"
                              >
                                Make Primary
                              </button>
                            ) : (
                              <span className="text-[10px] text-stone-500">Main Cover</span>
                            )}
                            {productForm.images.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="text-stone-400 hover:text-rose-400"
                                title="Remove Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TECHNICAL SPECS & DIMENSIONS */}
              {modalActiveTab === 'specs' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-300 mb-1 font-semibold">Bulb Compatibility</label>
                      <input
                        type="text"
                        placeholder="e.g. E27 Warm Amber LED (Included)"
                        value={productForm.specifications?.bulbType || ''}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          specifications: { ...productForm.specifications, bulbType: e.target.value }
                        })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-300 mb-1 font-semibold">Power Wattage</label>
                      <input
                        type="text"
                        placeholder="e.g. 5W - 9W"
                        value={productForm.specifications?.wattage || ''}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          specifications: { ...productForm.specifications, wattage: e.target.value }
                        })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-300 mb-1 font-semibold">Cord Type &amp; Length</label>
                      <input
                        type="text"
                        placeholder="e.g. 1.8m braided natural jute with inline switch"
                        value={productForm.specifications?.cordLength || ''}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          specifications: { ...productForm.specifications, cordLength: e.target.value }
                        })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-300 mb-1 font-semibold">Craft Method</label>
                      <input
                        type="text"
                        placeholder="e.g. Hand-split riverbed bamboo, seasoned teak"
                        value={productForm.specifications?.craftMethod || ''}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          specifications: { ...productForm.specifications, craftMethod: e.target.value }
                        })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200"
                      />
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div className="pt-2 border-t border-stone-800">
                    <h4 className="font-semibold text-stone-200 text-xs mb-2">Physical Dimensions</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-stone-400 text-[10px] mb-1">Height</label>
                        <input
                          type="text"
                          placeholder='e.g. 14"'
                          value={productForm.dimensions?.height || ''}
                          onChange={(e) => setProductForm({
                            ...productForm,
                            dimensions: { ...productForm.dimensions, height: e.target.value }
                          })}
                          className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-stone-200"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-400 text-[10px] mb-1">Width</label>
                        <input
                          type="text"
                          placeholder='e.g. 10"'
                          value={productForm.dimensions?.width || ''}
                          onChange={(e) => setProductForm({
                            ...productForm,
                            dimensions: { ...productForm.dimensions, width: e.target.value }
                          })}
                          className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-stone-200"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-400 text-[10px] mb-1">Diameter</label>
                        <input
                          type="text"
                          placeholder='e.g. 10"'
                          value={productForm.dimensions?.diameter || ''}
                          onChange={(e) => setProductForm({
                            ...productForm,
                            dimensions: { ...productForm.dimensions, diameter: e.target.value }
                          })}
                          className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-stone-200"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-400 text-[10px] mb-1">Weight</label>
                        <input
                          type="text"
                          placeholder="e.g. 1.2 kg"
                          value={productForm.dimensions?.weight || ''}
                          onChange={(e) => setProductForm({
                            ...productForm,
                            dimensions: { ...productForm.dimensions, weight: e.target.value }
                          })}
                          className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-stone-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-800">
                    <div>
                      <label className="block text-stone-300 mb-1 font-semibold">Materials (comma separated)</label>
                      <input
                        type="text"
                        placeholder="Natural River Bamboo, Seasoned Teak"
                        value={productForm.materials}
                        onChange={(e) => setProductForm({ ...productForm, materials: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-300 mb-1 font-semibold">Recommended Rooms</label>
                      <input
                        type="text"
                        placeholder="Living Room, Bedroom, Dining"
                        value={productForm.roomType}
                        onChange={(e) => setProductForm({ ...productForm, roomType: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: BADGES & STOREFRONT VISIBILITY */}
              {modalActiveTab === 'features' && (
                <div className="space-y-4">
                  <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-4">
                    <div>
                      <h4 className="font-semibold text-stone-100 text-xs">Featured On Storefront Homepage</h4>
                      <p className="text-[11px] text-stone-500 mb-2">
                        Promote this piece in the primary curated showcase on the front page.
                      </p>
                      <label className="flex items-center gap-2 cursor-pointer text-stone-200 font-medium">
                        <input
                          type="checkbox"
                          checked={productForm.isFeatured}
                          onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                          className="rounded bg-stone-900 border-stone-700 text-[#C58B4B] w-4 h-4"
                        />
                        ⭐ Enable Featured Showcase on Homepage
                      </label>
                    </div>

                    <div className="pt-3 border-t border-stone-800">
                      <h4 className="font-semibold text-stone-100 text-xs">Best Seller Collection</h4>
                      <p className="text-[11px] text-stone-500 mb-2">
                        Include in the Best Sellers carousel and catalog filter.
                      </p>
                      <label className="flex items-center gap-2 cursor-pointer text-stone-200 font-medium">
                        <input
                          type="checkbox"
                          checked={productForm.isBestSeller}
                          onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                          className="rounded bg-stone-900 border-stone-700 text-[#C58B4B] w-4 h-4"
                        />
                        🔥 Mark as Best Seller Piece
                      </label>
                    </div>

                    <div className="pt-3 border-t border-stone-800">
                      <h4 className="font-semibold text-stone-100 text-xs">New Arrival Collection</h4>
                      <p className="text-[11px] text-stone-500 mb-2">
                        Badge with &ldquo;New Arrival&rdquo; and display in recent workshop releases.
                      </p>
                      <label className="flex items-center gap-2 cursor-pointer text-stone-200 font-medium">
                        <input
                          type="checkbox"
                          checked={productForm.isNewArrival}
                          onChange={(e) => setProductForm({ ...productForm, isNewArrival: e.target.checked })}
                          className="rounded bg-stone-900 border-stone-700 text-[#C58B4B] w-4 h-4"
                        />
                        ✨ Mark as New Arrival
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                <div className="text-[11px] text-stone-500">
                  Instant live synchronization enabled
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-lg bg-[#C58B4B] hover:bg-[#b0793c] text-stone-950 font-semibold shadow-xs"
                  >
                    {actionLoading ? 'Saving to Database...' : (editingProduct ? 'Update Product & Sync Store' : 'Create & Publish to Store')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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
