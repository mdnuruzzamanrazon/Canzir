import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Package,
  Layers,
  Sliders,
  AlertTriangle,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Star,
  Info,
  Check,
  TrendingUp,
  Sparkles,
  Tag,
  Maximize2,
  Zap,
  Flame,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  Palette,
  Compass,
  FileText,
  DollarSign
} from 'lucide-react';
import apiFetch from '../../../utils/api.js';

export default function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  categories,
  onProductSaved,
  formatPrice
}) {
  if (!isOpen) return null;

  // Active Section Navigation Tab
  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'basic' | 'media' | 'pricing' | 'variants' | 'specs' | 'visibility'

  // Image Upload & Asset States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  // Form Submission State
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Sample catalog imagery to easily pick from
  const sampleImages = [
    { label: 'Bamboo Bell Pendant', url: '/assets/products/bamboo-bell-pendant.jpg' },
    { label: 'Bamboo Lattice Table Lamp', url: '/assets/products/bamboo-lattice-table-lamp.jpeg' },
    { label: 'Cottage Bamboo Wall Sconce', url: '/assets/products/cottage-bamboo-wall-sconce.jpeg' },
    { label: 'Minimalist Wooden Table Lamp', url: '/assets/products/minimalist-wooden-lamp.jpg' },
    { label: 'Woven Curved Floor Lamp', url: '/assets/products/woven-floor-lamp.jpg' },
    { label: 'Organic Ambient Sconce', url: '/assets/products/organic-ambient-sconce.jpg' }
  ];

  // Helper to extract or generate clean default form state
  const getInitialForm = (prod) => {
    if (prod) {
      return {
        title: prod.title || '',
        sku: prod.sku || '',
        category: prod.category || categories[0]?.name || 'Bamboo Table Lamps',
        price: prod.price ?? '',
        compareAtPrice: prod.compareAtPrice ?? '',
        stockQuantity: prod.stockQuantity ?? 15,
        inStock: prod.inStock ?? true,
        shortDescription: prod.shortDescription || '',
        description: prod.description || '',
        images: prod.images?.length ? [...prod.images] : ['/assets/products/bamboo-lattice-table-lamp.jpeg'],
        materials: Array.isArray(prod.materials)
          ? prod.materials.join(', ')
          : (prod.materials || 'Natural River Bamboo, Seasoned Burma Teak'),
        lightingStyle: prod.lightingStyle || 'Warm Ambient Glow',
        roomType: Array.isArray(prod.roomType)
          ? prod.roomType.join(', ')
          : (prod.roomType || 'Living Room, Dining'),
        specifications: {
          bulbType: prod.specifications?.bulbType || 'E27 Warm Amber LED (Included)',
          wattage: prod.specifications?.wattage || '5W - 9W',
          voltage: prod.specifications?.voltage || '220V - 240V AC',
          cordLength: prod.specifications?.cordLength || '1.8m braided natural jute with inline brass switch',
          craftMethod: prod.specifications?.craftMethod || 'Hand-split riverbed bamboo lattice, artisan woven'
        },
        dimensions: {
          height: prod.dimensions?.height || '14"',
          width: prod.dimensions?.width || '10"',
          diameter: prod.dimensions?.diameter || '10"',
          weight: prod.dimensions?.weight || '1.2 kg'
        },
        variants: prod.variants?.length ? JSON.parse(JSON.stringify(prod.variants)) : [
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
      };
    }

    return {
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
      roomType: 'Living Room, Dining, Bedroom',
      specifications: {
        bulbType: 'E27 Warm Amber LED (Included)',
        wattage: '5W - 9W',
        voltage: '220V - 240V AC',
        cordLength: '1.8m braided natural jute with inline switch',
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
    };
  };

  // Primary Comprehensive Product State
  const [form, setForm] = useState(() => getInitialForm(editingProduct));

  // Reset/sync form state when modal opens or editingProduct changes
  useEffect(() => {
    if (isOpen) {
      setForm(getInitialForm(editingProduct));
      setValidationErrors({});
      setErrorMsg('');
      setActiveSection('all');
    }
  }, [editingProduct, isOpen]);

  // Calculate discount and margin metrics
  const regularPrice = Number(form.price) || 0;
  const comparePrice = Number(form.compareAtPrice) || 0;
  const hasDiscount = comparePrice > regularPrice && regularPrice > 0;
  const discountPercent = hasDiscount ? Math.round(((comparePrice - regularPrice) / comparePrice) * 100) : 0;
  const discountSavings = hasDiscount ? (comparePrice - regularPrice) : 0;

  // Stock status badge helper
  const stockQty = Number(form.stockQuantity) || 0;
  const isOutOfStock = stockQty <= 0 || !form.inStock;
  const isLowStock = !isOutOfStock && stockQty <= 5;

  // Generate unique SKU
  const handleGenerateSKU = () => {
    const prefix = form.category
      ? form.category.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3)
      : 'CNZ';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    setForm(prev => ({ ...prev, sku: `${prefix}-${randNum}` }));
  };

  // Image File Upload handler
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await apiFetch('/upload', {
        method: 'POST',
        body: formData
      });

      if (res.success && res.fileUrl) {
        setForm(prev => ({
          ...prev,
          images: [...prev.images, res.fileUrl]
        }));
      }
    } catch (err) {
      setErrorMsg(`Upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Add custom URL image
  const handleAddCustomImage = () => {
    if (!customImageUrl.trim()) return;
    setForm(prev => ({
      ...prev,
      images: [...prev.images, customImageUrl.trim()]
    }));
    setCustomImageUrl('');
  };

  // Remove image from gallery
  const handleRemoveImage = (index) => {
    if (form.images.length <= 1) {
      alert('Every artisan product must have at least one product photo.');
      return;
    }
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Set primary cover image
  const handleSetPrimaryImage = (index) => {
    const selected = form.images[index];
    const rest = form.images.filter((_, i) => i !== index);
    setForm(prev => ({
      ...prev,
      images: [selected, ...rest]
    }));
  };

  // Variant Option Handlers
  const handleAddVariantOption = (variantIndex) => {
    setForm(prev => {
      const updatedVariants = [...prev.variants];
      const target = updatedVariants[variantIndex];
      if (target) {
        target.options.push({
          label: `New Option ${target.options.length + 1}`,
          priceAdjustment: 0,
          inStock: true
        });
      }
      return { ...prev, variants: updatedVariants };
    });
  };

  const handleUpdateVariantOption = (variantIndex, optionIndex, field, value) => {
    setForm(prev => {
      const updatedVariants = [...prev.variants];
      const target = updatedVariants[variantIndex];
      if (target && target.options[optionIndex]) {
        target.options[optionIndex][field] = value;
      }
      return { ...prev, variants: updatedVariants };
    });
  };

  const handleRemoveVariantOption = (variantIndex, optionIndex) => {
    setForm(prev => {
      const updatedVariants = [...prev.variants];
      const target = updatedVariants[variantIndex];
      if (target && target.options.length > 1) {
        target.options = target.options.filter((_, idx) => idx !== optionIndex);
      }
      return { ...prev, variants: updatedVariants };
    });
  };

  // Form Validation
  const validate = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Product title is required';
    if (!form.sku.trim()) errors.sku = 'SKU identifier is required';
    if (!form.category.trim()) errors.category = 'Category selection is required';
    if (!form.price || Number(form.price) <= 0) errors.price = 'Valid selling price (greater than 0) is required';
    if (!form.shortDescription.trim()) errors.shortDescription = 'Editorial catchphrase is required';
    if (!form.description.trim()) errors.description = 'Craftsmanship story is required';
    if (!form.images.length) errors.images = 'At least one product photo is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (isDraftMode = false) => {
    setErrorMsg('');
    if (!validate()) {
      setErrorMsg('Please review the highlighted required fields before saving.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        sku: form.sku.trim().toUpperCase(),
        category: form.category.trim(),
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        stockQuantity: Number(form.stockQuantity) || 0,
        inStock: isDraftMode ? false : Boolean(form.inStock && Number(form.stockQuantity) > 0),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        materials: form.materials ? form.materials.split(',').map(s => s.trim()).filter(Boolean) : [],
        roomType: form.roomType ? form.roomType.split(',').map(s => s.trim()).filter(Boolean) : ['Living Room'],
        lightingStyle: form.lightingStyle || 'Warm Ambient Glow'
      };

      if (editingProduct) {
        await apiFetch(`/products/${editingProduct._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      onProductSaved(
        editingProduct
          ? `✓ Product "${payload.title}" updated and synchronized with live store immediately!`
          : `✓ Product "${payload.title}" created and published to store successfully!`
      );
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save product to database');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden animate-fadeIn"
    >
      {/* Ultra-Wide Spacious Modal Canvas */}
      <div className="bg-[#181513] border border-stone-800 rounded-2xl w-full max-w-6xl xl:max-w-7xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-[#C58B4B]/20">
        {/* Sticky Header */}
        <header className="px-6 py-4.5 border-b border-stone-800/90 bg-[#1e1b18]/95 backdrop-blur-md flex items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C58B4B]/20 to-stone-900 border border-[#C58B4B]/40 text-[#E6AF68] flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5 text-[#C58B4B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C58B4B]">
                  Atelier Fixture Management
                </span>
                <span className="text-stone-600">•</span>
                <span className="text-[11px] text-stone-400 font-mono">
                  {editingProduct ? `SKU: ${form.sku}` : 'New Piece Commission'}
                </span>
              </div>
              <h2 id="product-modal-title" className="text-lg sm:text-xl font-serif text-stone-100 font-semibold leading-tight">
                {editingProduct ? `Edit Fixture: ${editingProduct.title}` : 'Add New Artisan Fixture to Store'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Status Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-[11px] text-stone-300">
              <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>{isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Active In Stock'}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              aria-label="Close dialog"
              className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Global Error Alert Banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Section Navigation Anchor Tabs */}
        <div className="px-6 border-b border-stone-800/80 bg-[#161311] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All Sections', icon: Layers },
            { id: 'basic', label: 'Basic Info', icon: Package },
            { id: 'pricing', label: 'Pricing & Stock', icon: TrendingUp },
            { id: 'media', label: 'Images & Media', icon: ImageIcon },
            { id: 'variants', label: 'Variants & Options', icon: Sliders },
            { id: 'specs', label: 'Technical Specs', icon: Zap }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`py-3 px-3.5 font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#C58B4B] text-[#E6AF68] bg-[#C58B4B]/5'
                    : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C58B4B]' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Form Body - Responsive 12-Column Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 scrollbar-thin scrollbar-thumb-stone-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* ============================================================ */}
            {/* LEFT / MAIN WORKSPACE COLUMN (8 of 12 columns)               */}
            {/* ============================================================ */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* 1. BASIC INFORMATION SECTION */}
              {(activeSection === 'all' || activeSection === 'basic') && (
                <section className="bg-[#1c1917] border border-stone-800/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#C58B4B]/10 text-[#C58B4B] flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-100 text-sm">Basic Fixture Information</h3>
                        <p className="text-[11px] text-stone-400">Core product identity, title, SKU code, and editorial craft story.</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#C58B4B] bg-[#C58B4B]/10 border border-[#C58B4B]/30 px-2 py-0.5 rounded-full font-mono">
                      Required Section
                    </span>
                  </div>

                  {/* Title & SKU */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-stone-300 font-semibold text-xs">
                        Product Title <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Artisan Woven Riverbed Bamboo Pendant"
                        value={form.title}
                        onChange={(e) => {
                          setForm({ ...form, title: e.target.value });
                          if (validationErrors.title) setValidationErrors(prev => ({ ...prev, title: '' }));
                        }}
                        className={`w-full bg-[#12100E] border ${
                          validationErrors.title ? 'border-rose-500 focus:border-rose-500' : 'border-stone-800 focus:border-[#C58B4B]'
                        } rounded-xl px-3.5 py-2.5 text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-[#C58B4B]/30 transition`}
                      />
                      {validationErrors.title && (
                        <p className="text-[11px] text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {validationErrors.title}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-stone-300 font-semibold text-xs">
                          SKU Identifier <span className="text-rose-400">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateSKU}
                          className="text-[10px] text-[#C58B4B] hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Auto
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CNZ-8821"
                        value={form.sku}
                        onChange={(e) => {
                          setForm({ ...form, sku: e.target.value.toUpperCase() });
                          if (validationErrors.sku) setValidationErrors(prev => ({ ...prev, sku: '' }));
                        }}
                        className={`w-full bg-[#12100E] border ${
                          validationErrors.sku ? 'border-rose-500' : 'border-stone-800 focus:border-[#C58B4B]'
                        } rounded-xl px-3.5 py-2.5 text-stone-100 uppercase font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#C58B4B]/30 transition`}
                      />
                    </div>
                  </div>

                  {/* Short Tagline Catchphrase */}
                  <div className="space-y-1.5">
                    <label className="block text-stone-300 font-semibold text-xs">
                      Short Editorial Catchphrase <span className="text-rose-400">*</span>
                      <span className="text-[10px] text-stone-500 font-normal ml-2">(Displayed on product cards &amp; quick views)</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Handcrafted riverbed bamboo lattice with warm ambient glow"
                      value={form.shortDescription}
                      onChange={(e) => {
                        setForm({ ...form, shortDescription: e.target.value });
                        if (validationErrors.shortDescription) setValidationErrors(prev => ({ ...prev, shortDescription: '' }));
                      }}
                      className="w-full bg-[#12100E] border border-stone-800 focus:border-[#C58B4B] rounded-xl px-3.5 py-2.5 text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-[#C58B4B]/30 transition"
                    />
                  </div>

                  {/* Full Craftsmanship Story */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-stone-300 font-semibold text-xs">
                        Full Craftsmanship Story &amp; Description <span className="text-rose-400">*</span>
                      </label>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {form.description.length} chars
                      </span>
                    </div>
                    <textarea
                      rows="4"
                      required
                      placeholder="Detail the natural seasoning of the bamboo, woodcraft origins, handmade joinery, and how this architectural piece illuminates living spaces..."
                      value={form.description}
                      onChange={(e) => {
                        setForm({ ...form, description: e.target.value });
                        if (validationErrors.description) setValidationErrors(prev => ({ ...prev, description: '' }));
                      }}
                      className="w-full bg-[#12100E] border border-stone-800 focus:border-[#C58B4B] rounded-xl p-3.5 text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-[#C58B4B]/30 transition leading-relaxed"
                    />
                  </div>
                </section>
              )}

              {/* 2. PRODUCT IMAGES & MEDIA GALLERY */}
              {(activeSection === 'all' || activeSection === 'media') && (
                <section className="bg-[#1c1917] border border-stone-800/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#C58B4B]/10 text-[#C58B4B] flex items-center justify-center">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-100 text-sm">Product Photography &amp; Media Gallery</h3>
                        <p className="text-[11px] text-stone-400">High-resolution workshop photography, gallery order, and primary thumbnail cover.</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {form.images.length} {form.images.length === 1 ? 'Photo' : 'Photos'}
                    </span>
                  </div>

                  {/* Upload Dropzone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Device Upload */}
                    <div className="border-2 border-dashed border-stone-800 hover:border-[#C58B4B]/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center bg-[#12100E]/60 transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-[#C58B4B] mb-2.5 group-hover:scale-105 transition">
                        {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      </div>
                      <span className="text-xs font-semibold text-stone-200 mb-1">
                        {uploadingImage ? 'Uploading Image to Server...' : 'Upload Photos from Computer'}
                      </span>
                      <p className="text-[11px] text-stone-500 mb-3 max-w-xs">
                        Supports high-res JPG, PNG, WebP up to 10MB.
                      </p>
                      <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-[#C58B4B] text-xs font-semibold border border-stone-700 cursor-pointer transition">
                        <span>Browse Local Files</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Direct URL / Studio Asset */}
                    <div className="border border-stone-800 rounded-2xl p-5 bg-[#12100E]/40 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-stone-200 block mb-1">Add Image URL or Studio Asset</span>
                        <p className="text-[11px] text-stone-500">Provide direct asset paths or hosted web URLs.</p>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. /assets/products/woven-floor-lamp.jpg"
                          value={customImageUrl}
                          onChange={(e) => setCustomImageUrl(e.target.value)}
                          className="flex-1 bg-[#181513] border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-[#C58B4B]"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomImage}
                          className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-[#C58B4B] font-semibold text-xs border border-stone-700 transition"
                        >
                          Add URL
                        </button>
                      </div>

                      {/* Quick Picks */}
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold block mb-1.5">
                          Quick Pick From Atelier Vault:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {sampleImages.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (!form.images.includes(s.url)) {
                                  setForm(prev => ({ ...prev, images: [...prev.images, s.url] }));
                                }
                              }}
                              className="px-2 py-0.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-[10px] border border-stone-800 font-mono transition"
                            >
                              + {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gallery Visual Grid */}
                  <div className="space-y-2.5 pt-2">
                    <label className="block text-stone-300 font-semibold text-xs">
                      Attached Gallery Photos ({form.images.length})
                      <span className="text-[10px] text-stone-500 font-normal ml-2">First photo serves as live store primary thumbnail</span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                      {form.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`relative group bg-[#12100E] rounded-xl border ${
                            idx === 0 ? 'border-[#C58B4B] ring-1 ring-[#C58B4B]/30' : 'border-stone-800'
                          } overflow-hidden shadow-xs`}
                        >
                          <div className="aspect-square relative overflow-hidden bg-stone-950 flex items-center justify-center">
                            <img
                              src={imgUrl}
                              alt={`Product piece ${idx}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/assets/canzir-logo.png';
                              }}
                            />
                            {idx === 0 && (
                              <span className="absolute top-1.5 left-1.5 bg-[#C58B4B] text-stone-950 font-bold text-[9px] px-2 py-0.5 rounded shadow flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-current" /> Cover Photo
                              </span>
                            )}
                          </div>

                          <div className="p-2 bg-[#181513] border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                            {idx !== 0 ? (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="text-[10px] text-[#C58B4B] hover:underline font-medium"
                              >
                                Set as Cover
                              </button>
                            ) : (
                              <span className="text-[10px] text-stone-400 font-medium">Primary</span>
                            )}

                            {form.images.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="text-stone-500 hover:text-rose-400 p-1 transition"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* 3. PRODUCT VARIANTS & ATTRIBUTES */}
              {(activeSection === 'all' || activeSection === 'variants') && (
                <section className="bg-[#1c1917] border border-stone-800/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#C58B4B]/10 text-[#C58B4B] flex items-center justify-center">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-100 text-sm">Product Variants &amp; Finishes</h3>
                        <p className="text-[11px] text-stone-400">Customizable options like wood finishes, cord styles, and price differentials.</p>
                      </div>
                    </div>
                  </div>

                  {form.variants.map((variant, vIdx) => (
                    <div key={vIdx} className="p-4 rounded-xl bg-[#12100E] border border-stone-800 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-[#C58B4B]" />
                          <span className="text-xs font-semibold text-stone-200">
                            Variant Type: <span className="text-[#C58B4B]">{variant.name}</span>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddVariantOption(vIdx)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[#C58B4B] text-[11px] font-semibold border border-stone-700 transition"
                        >
                          <Plus className="w-3 h-3" /> Add Option
                        </button>
                      </div>

                      <div className="space-y-2">
                        {variant.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center p-2.5 rounded-lg bg-[#181513] border border-stone-800/80 text-xs"
                          >
                            <div className="sm:col-span-5">
                              <input
                                type="text"
                                placeholder="Option label (e.g. Natural Bamboo)"
                                value={opt.label}
                                onChange={(e) => handleUpdateVariantOption(vIdx, oIdx, 'label', e.target.value)}
                                className="w-full bg-[#12100E] border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-100 focus:outline-none focus:border-[#C58B4B]"
                              />
                            </div>

                            <div className="sm:col-span-4 flex items-center gap-1.5">
                              <span className="text-stone-500 text-[11px]">৳ Delta:</span>
                              <input
                                type="number"
                                placeholder="+৳0"
                                value={opt.priceAdjustment}
                                onChange={(e) => handleUpdateVariantOption(vIdx, oIdx, 'priceAdjustment', Number(e.target.value))}
                                className="w-full bg-[#12100E] border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-100 focus:outline-none focus:border-[#C58B4B]"
                              />
                            </div>

                            <div className="sm:col-span-3 flex items-center justify-between gap-2">
                              <label className="flex items-center gap-1.5 text-[11px] text-stone-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={opt.inStock}
                                  onChange={(e) => handleUpdateVariantOption(vIdx, oIdx, 'inStock', e.target.checked)}
                                  className="rounded bg-stone-900 border-stone-700 text-[#C58B4B]"
                                />
                                Available
                              </label>

                              {variant.options.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariantOption(vIdx, oIdx)}
                                  className="text-stone-500 hover:text-rose-400 p-1 transition"
                                  title="Delete option"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* 4. TECHNICAL SPECIFICATIONS & DIMENSIONS */}
              {(activeSection === 'all' || activeSection === 'specs') && (
                <section className="bg-[#1c1917] border border-stone-800/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#C58B4B]/10 text-[#C58B4B] flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-100 text-sm">Technical Specifications &amp; Dimensions</h3>
                        <p className="text-[11px] text-stone-400">Bulb standards, electrical specs, cord type, and dimensional metrics.</p>
                      </div>
                    </div>
                  </div>

                  {/* Electrical & Craft Specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-stone-300 text-xs font-semibold">Bulb Compatibility</label>
                      <input
                        type="text"
                        placeholder="e.g. E27 Warm Amber LED (Included)"
                        value={form.specifications?.bulbType || ''}
                        onChange={(e) => setForm({
                          ...form,
                          specifications: { ...form.specifications, bulbType: e.target.value }
                        })}
                        className="w-full bg-[#12100E] border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-[#C58B4B]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-stone-300 text-xs font-semibold">Power Wattage Rating</label>
                      <input
                        type="text"
                        placeholder="e.g. 5W - 9W"
                        value={form.specifications?.wattage || ''}
                        onChange={(e) => setForm({
                          ...form,
                          specifications: { ...form.specifications, wattage: e.target.value }
                        })}
                        className="w-full bg-[#12100E] border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-[#C58B4B]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-stone-300 text-xs font-semibold">Cord Type &amp; Length</label>
                      <input
                        type="text"
                        placeholder="e.g. 1.8m braided natural jute with inline switch"
                        value={form.specifications?.cordLength || ''}
                        onChange={(e) => setForm({
                          ...form,
                          specifications: { ...form.specifications, cordLength: e.target.value }
                        })}
                        className="w-full bg-[#12100E] border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-[#C58B4B]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-stone-300 text-xs font-semibold">Artisan Crafting Method</label>
                      <input
                        type="text"
                        placeholder="e.g. Hand-split riverbed bamboo, seasoned teak"
                        value={form.specifications?.craftMethod || ''}
                        onChange={(e) => setForm({
                          ...form,
                          specifications: { ...form.specifications, craftMethod: e.target.value }
                        })}
                        className="w-full bg-[#12100E] border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-[#C58B4B]"
                      />
                    </div>
                  </div>

                  {/* Physical Dimensions 4-Column Grid */}
                  <div className="pt-2 border-t border-stone-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Maximize2 className="w-3.5 h-3.5 text-[#C58B4B]" />
                      <label className="block text-stone-200 text-xs font-semibold">Physical Dimensions &amp; Weight</label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="block text-stone-400 text-[10px]">Height</label>
                        <input
                          type="text"
                          placeholder='e.g. 14"'
                          value={form.dimensions?.height || ''}
                          onChange={(e) => setForm({
                            ...form,
                            dimensions: { ...form.dimensions, height: e.target.value }
                          })}
                          className="w-full bg-[#12100E] border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-100 text-xs focus:outline-none focus:border-[#C58B4B]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-stone-400 text-[10px]">Width</label>
                        <input
                          type="text"
                          placeholder='e.g. 10"'
                          value={form.dimensions?.width || ''}
                          onChange={(e) => setForm({
                            ...form,
                            dimensions: { ...form.dimensions, width: e.target.value }
                          })}
                          className="w-full bg-[#12100E] border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-100 text-xs focus:outline-none focus:border-[#C58B4B]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-stone-400 text-[10px]">Diameter</label>
                        <input
                          type="text"
                          placeholder='e.g. 10"'
                          value={form.dimensions?.diameter || ''}
                          onChange={(e) => setForm({
                            ...form,
                            dimensions: { ...form.dimensions, diameter: e.target.value }
                          })}
                          className="w-full bg-[#12100E] border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-100 text-xs focus:outline-none focus:border-[#C58B4B]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-stone-400 text-[10px]">Weight</label>
                        <input
                          type="text"
                          placeholder="e.g. 1.2 kg"
                          value={form.dimensions?.weight || ''}
                          onChange={(e) => setForm({
                            ...form,
                            dimensions: { ...form.dimensions, weight: e.target.value }
                          })}
                          className="w-full bg-[#12100E] border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-100 text-xs focus:outline-none focus:border-[#C58B4B]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Materials & Rooms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-800">
                    <div className="space-y-1.5">
                      <label className="block text-stone-300 text-xs font-semibold">Materials (Comma-separated)</label>
                      <input
                        type="text"
                        placeholder="Natural River Bamboo, Seasoned Teak"
                        value={form.materials}
                        onChange={(e) => setForm({ ...form, materials: e.target.value })}
                        className="w-full bg-[#12100E] border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-[#C58B4B]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-stone-300 text-xs font-semibold">Recommended Rooms</label>
                      <input
                        type="text"
                        placeholder="Living Room, Bedroom, Dining"
                        value={form.roomType}
                        onChange={(e) => setForm({ ...form, roomType: e.target.value })}
                        className="w-full bg-[#12100E] border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-[#C58B4B]"
                      />
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* ============================================================ */}
            {/* RIGHT / SIDEBAR CONTROL PANEL (4 of 12 columns)              */}
            {/* ============================================================ */}
            <div className="lg:col-span-4 space-y-6">

              {/* 1. PRICING & INVENTORY COMMERCIALS CARD */}
              {(activeSection === 'all' || activeSection === 'pricing') && (
                <div className="bg-[#1c1917] border border-stone-800/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-stone-800">
                    <TrendingUp className="w-4 h-4 text-[#C58B4B]" />
                    <h4 className="font-semibold text-stone-100 text-xs uppercase tracking-wider">Pricing &amp; Commercials</h4>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="block text-stone-300 text-xs font-semibold">
                        Regular Selling Price (৳ BDT) <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xs">৳</span>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="e.g. 4500"
                          value={form.price}
                          onChange={(e) => {
                            setForm({ ...form, price: e.target.value });
                            if (validationErrors.price) setValidationErrors(prev => ({ ...prev, price: '' }));
                          }}
                          className={`w-full bg-[#12100E] border ${
                            validationErrors.price ? 'border-rose-500' : 'border-stone-800 focus:border-[#C58B4B]'
                          } rounded-xl pl-8 pr-3 py-2.5 text-stone-100 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-[#C58B4B]/30`}
                        />
                      </div>
                      {validationErrors.price && (
                        <p className="text-[11px] text-rose-400">{validationErrors.price}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-stone-400 text-xs font-medium">Compare-at / Original Price</label>
                        {hasDiscount && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xs">৳</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 5200 (optional discount)"
                          value={form.compareAtPrice}
                          onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                          className="w-full bg-[#12100E] border border-stone-800 rounded-xl pl-8 pr-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-[#C58B4B]"
                        />
                      </div>
                      {hasDiscount && (
                        <p className="text-[10px] text-stone-500">
                          Customers save ৳{discountSavings.toLocaleString()} on this piece.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stock Quantity */}
                  <div className="pt-3 border-t border-stone-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-stone-300 text-xs font-semibold">Warehouse Stock (Units)</label>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOutOfStock ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        isLowStock ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>

                    <input
                      type="number"
                      required
                      min="0"
                      value={form.stockQuantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setForm({
                          ...form,
                          stockQuantity: val,
                          inStock: val > 0
                        });
                      }}
                      className="w-full bg-[#12100E] border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-[#C58B4B]"
                    />

                    <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={form.inStock}
                        onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                        className="rounded bg-stone-900 border-stone-700 text-[#C58B4B] w-4 h-4 cursor-pointer"
                      />
                      <span>Available for immediate online orders</span>
                    </label>
                  </div>
                </div>
              )}

              {/* 2. CATEGORIZATION & ORGANIZATION CARD */}
              {(activeSection === 'all' || activeSection === 'basic') && (
                <div className="bg-[#1c1917] border border-stone-800/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-stone-800">
                    <Layers className="w-4 h-4 text-[#C58B4B]" />
                    <h4 className="font-semibold text-stone-100 text-xs uppercase tracking-wider">Classification &amp; Category</h4>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-stone-300 text-xs font-semibold">
                        Primary Category <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full bg-[#12100E] border border-stone-800 rounded-xl px-3 py-2.5 text-stone-100 text-xs focus:outline-none focus:border-[#C58B4B]"
                      >
                        {categories.map(c => (
                          <option key={c._id || c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-stone-300 text-xs font-semibold">Lighting Style Character</label>
                      <select
                        value={form.lightingStyle}
                        onChange={(e) => setForm({ ...form, lightingStyle: e.target.value })}
                        className="w-full bg-[#12100E] border border-stone-800 rounded-xl px-3 py-2.5 text-stone-100 text-xs focus:outline-none focus:border-[#C58B4B]"
                      >
                        <option value="Warm Ambient Glow">Warm Ambient Glow</option>
                        <option value="Diffused Lattice Accent">Diffused Lattice Accent</option>
                        <option value="Architectural Sculptural">Architectural Sculptural</option>
                        <option value="Direct Downlight">Direct Downlight</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. STOREFRONT MERCHANDISING BADGES */}
              {(activeSection === 'all' || activeSection === 'visibility') && (
                <div className="bg-[#1c1917] border border-stone-800/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-stone-800">
                    <Sparkles className="w-4 h-4 text-[#C58B4B]" />
                    <h4 className="font-semibold text-stone-100 text-xs uppercase tracking-wider">Storefront Merchandising</h4>
                  </div>

                  <div className="space-y-3">
                    {/* Featured */}
                    <label className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                      form.isFeatured
                        ? 'bg-[#C58B4B]/10 border-[#C58B4B]/50'
                        : 'bg-[#12100E] border-stone-800 hover:border-stone-700'
                    }`}>
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                        className="mt-0.5 rounded bg-stone-900 border-stone-700 text-[#C58B4B] w-4 h-4"
                      />
                      <div>
                        <div className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                          Featured Homepage Showcase
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">Highlight in hero carousels &amp; curated showcase.</p>
                      </div>
                    </label>

                    {/* Best Seller */}
                    <label className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                      form.isBestSeller
                        ? 'bg-[#C58B4B]/10 border-[#C58B4B]/50'
                        : 'bg-[#12100E] border-stone-800 hover:border-stone-700'
                    }`}>
                      <input
                        type="checkbox"
                        checked={form.isBestSeller}
                        onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                        className="mt-0.5 rounded bg-stone-900 border-stone-700 text-[#C58B4B] w-4 h-4"
                      />
                      <div>
                        <div className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-rose-400 fill-current" />
                          Best Seller Collection
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">Include in high-velocity best seller rankings.</p>
                      </div>
                    </label>

                    {/* New Arrival */}
                    <label className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                      form.isNewArrival
                        ? 'bg-[#C58B4B]/10 border-[#C58B4B]/50'
                        : 'bg-[#12100E] border-stone-800 hover:border-stone-700'
                    }`}>
                      <input
                        type="checkbox"
                        checked={form.isNewArrival}
                        onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                        className="mt-0.5 rounded bg-stone-900 border-stone-700 text-[#C58B4B] w-4 h-4"
                      />
                      <div>
                        <div className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-sky-400 fill-current" />
                          New Workshop Arrival
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">Badge as fresh release from recent studio batches.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <footer className="px-6 py-4 border-t border-stone-800/90 bg-[#1e1b18]/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>MongoDB Database Synchronized &bull; Live Storefront Updates</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-stone-100 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>

            {/* Save as Inactive / Draft */}
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={actionLoading}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-stone-100 text-xs font-semibold transition cursor-pointer"
            >
              Save as Draft
            </button>

            {/* Primary Publish Button */}
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={actionLoading}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C58B4B] to-[#b0793c] hover:from-[#d19655] hover:to-[#be8445] text-stone-950 text-xs font-bold shadow-md hover:shadow-[#C58B4B]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synchronizing Piece...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingProduct ? 'Update Product & Sync' : 'Create & Publish to Store'}</span>
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
