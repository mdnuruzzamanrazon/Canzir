import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Search,
  Grid3X3,
  LayoutGrid,
  ChevronDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import apiFetch from '../utils/api.js';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import ProductCard from '../components/ProductCard';

const ShopPage = ({ onQuickView }) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States from URL or defaults
  const currentCategory = searchParams.get('category') || 'All';
  const currentMaterial = searchParams.get('material') || 'All';
  const currentRoomType = searchParams.get('roomType') || 'All';
  const currentLightingStyle = searchParams.get('lightingStyle') || 'All';
  const currentSort = searchParams.get('sort') || 'featured';
  const currentSearch = searchParams.get('search') || '';
  const currentInStock = searchParams.get('inStock') === 'true';

  // Grid layout view: 3 columns vs 4 columns on large screens
  const [gridCols, setGridCols] = useState(4);

  // Load Categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await apiFetch('/products/categories');
        if (res.success) setCategories(res.categories || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products whenever search params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(searchParams);
        const res = await apiFetch(`/products?${queryParams.toString()}`);
        if (res.success) {
          setProducts(res.products || []);
          setTotalCount(res.total || 0);
        }
      } catch (err) {
        console.error('Failed to fetch filtered products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'All' || value === false || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const materialsList = ['All', 'Bamboo', 'Teak Wood', 'Cane', 'Linen'];
  const roomTypesList = ['All', 'Living Room', 'Bedroom', 'Dining', 'Reading Nook', 'Hallway'];
  const lightingStylesList = ['All', 'Warm Ambient Glow', 'Diffused Lattice', 'Architectural Accent'];

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 space-y-8">
      {/* Editorial Header Banner - Full Width */}
      <div className="bg-[#FAF6EF] border border-[#D8C0A0]/50 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D8C0A0]/40 text-[#8A5622] text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>Earth & Light Atelier</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#4A2E20] leading-tight">
            {t.shop.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#8A5D44] leading-relaxed">
            {t.shop.subtitle}
          </p>
        </div>

        {/* Quick Category Pills on Header */}
        <div className="flex flex-wrap gap-2 relative z-10 max-w-xl">
          <button
            onClick={() => updateParam('category', 'All')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              currentCategory === 'All'
                ? 'bg-[#4A2E20] text-[#FAF6EF] shadow-sm'
                : 'bg-white text-[#4A2E20] border border-[#D8C0A0]/60 hover:bg-[#D8C0A0]/20'
            }`}
          >
            All Fixtures
          </button>
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateParam('category', cat.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                currentCategory.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-[#4A2E20] text-[#FAF6EF] font-bold shadow-sm'
                  : 'bg-white text-[#4A2E20] border border-[#D8C0A0]/60 hover:bg-[#D8C0A0]/20'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Filter Bar & Controls across Full Width */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between pb-4 border-b border-[#D8C0A0]/50 gap-4">
        {/* Left: Mobile Filter Toggle & Count */}
        <div className="flex items-center justify-between lg:justify-start gap-4">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#D8C0A0]/40 text-[#4A2E20] text-xs font-semibold rounded-lg"
          >
            <SlidersHorizontal size={15} />
            <span>{t.shop.filters}</span>
          </button>

          <span className="text-xs text-[#8A5D44]">
            Showing <strong className="text-[#4A2E20]">{products.length}</strong> of{' '}
            <strong className="text-[#4A2E20]">{totalCount}</strong> fixtures
          </span>
        </div>

        {/* Right: Search, Sorting, and Grid Toggle */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-72">
            <input
              type="text"
              value={currentSearch}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Search lamps, materials, rooms..."
              className="w-full bg-white border border-[#D8C0A0]/80 rounded-lg px-3 py-2 text-xs text-[#4A2E20] placeholder-[#AA885E] focus:outline-none focus:border-[#C58B4B]"
            />
            {currentSearch && (
              <button
                onClick={() => updateParam('search', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A5D44] text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-[#4A2E20]">
            <span className="hidden sm:inline text-[#8A5D44]">{t.shop.sortBy}:</span>
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-white border border-[#D8C0A0]/80 rounded-lg px-3 py-2 text-xs text-[#4A2E20] focus:outline-none focus:border-[#C58B4B] font-medium"
            >
              <option value="featured">{t.shop.sortFeatured}</option>
              <option value="newest">{t.shop.sortNewest}</option>
              <option value="price-asc">{t.shop.sortPriceLow}</option>
              <option value="price-desc">{t.shop.sortPriceHigh}</option>
              <option value="rating">{t.shop.sortRating}</option>
            </select>
          </div>

          {/* Grid Layout Switcher (Desktop) */}
          <div className="hidden sm:flex items-center border border-[#D8C0A0]/80 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setGridCols(3)}
              className={`p-2 transition-colors ${gridCols === 3 ? 'bg-[#D8C0A0]/40 text-[#4A2E20] font-bold' : 'text-[#8A5D44] hover:text-[#4A2E20]'}`}
              title="3 Columns (Spacious)"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setGridCols(4)}
              className={`p-2 transition-colors ${gridCols === 4 ? 'bg-[#D8C0A0]/40 text-[#4A2E20] font-bold' : 'text-[#8A5D44] hover:text-[#4A2E20]'}`}
              title="4 Columns (Full Width Grid)"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(currentCategory !== 'All' || currentMaterial !== 'All' || currentRoomType !== 'All' || currentLightingStyle !== 'All' || currentInStock || currentSearch) && (
        <div className="flex items-center flex-wrap gap-2 pt-1">
          <span className="text-xs text-[#8A5D44] font-medium">Active Filters:</span>
          {currentCategory !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8C0A0]/40 text-[#4A2E20] text-xs font-medium">
              Category: {currentCategory}
              <button onClick={() => updateParam('category', 'All')} className="hover:text-red-600"><X size={12} /></button>
            </span>
          )}
          {currentMaterial !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8C0A0]/40 text-[#4A2E20] text-xs font-medium">
              Material: {currentMaterial}
              <button onClick={() => updateParam('material', 'All')} className="hover:text-red-600"><X size={12} /></button>
            </span>
          )}
          {currentRoomType !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8C0A0]/40 text-[#4A2E20] text-xs font-medium">
              Room: {currentRoomType}
              <button onClick={() => updateParam('roomType', 'All')} className="hover:text-red-600"><X size={12} /></button>
            </span>
          )}
          {currentLightingStyle !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8C0A0]/40 text-[#4A2E20] text-xs font-medium">
              Style: {currentLightingStyle}
              <button onClick={() => updateParam('lightingStyle', 'All')} className="hover:text-red-600"><X size={12} /></button>
            </span>
          )}
          {currentInStock && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8C0A0]/40 text-[#4A2E20] text-xs font-medium">
              In Stock Only
              <button onClick={() => updateParam('inStock', false)} className="hover:text-red-600"><X size={12} /></button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs text-[#C58B4B] font-bold hover:underline flex items-center gap-1 ml-2"
          >
            <RotateCcw size={12} />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Main Full-Width Body Layout: Sticky Filter Sidebar (20%) + Expansive Grid (80%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 pt-2">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-2 space-y-6 bg-white p-5 rounded-2xl border border-[#D8C0A0]/60 h-fit sticky top-28 shadow-sm">
          {/* 1. Category Filter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A2E20] mb-2.5">
              {t.shop.category}
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <button
                  onClick={() => updateParam('category', 'All')}
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-colors ${
                    currentCategory === 'All'
                      ? 'bg-[#4A2E20] text-[#FAF6EF] font-bold'
                      : 'text-[#4A2E20] hover:bg-[#D8C0A0]/20'
                  }`}
                >
                  All Fixtures
                </button>
              </li>
              {categories.map((c) => (
                <li key={c._id}>
                  <button
                    onClick={() => updateParam('category', c.name)}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-colors ${
                      currentCategory.toLowerCase() === c.name.toLowerCase()
                        ? 'bg-[#4A2E20] text-[#FAF6EF] font-bold'
                        : 'text-[#4A2E20] hover:bg-[#D8C0A0]/20'
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Material Filter */}
          <div className="pt-4 border-t border-[#D8C0A0]/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A2E20] mb-2.5">
              {t.shop.material}
            </h3>
            <div className="space-y-1 text-xs">
              {materialsList.map((mat) => (
                <button
                  key={mat}
                  onClick={() => updateParam('material', mat)}
                  className={`block w-full text-left py-1.5 px-2.5 rounded-lg transition-colors ${
                    currentMaterial === mat
                      ? 'bg-[#D8C0A0]/50 text-[#24211E] font-bold'
                      : 'text-[#4A2E20] hover:bg-[#D8C0A0]/20'
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Room Type Filter */}
          <div className="pt-4 border-t border-[#D8C0A0]/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A2E20] mb-2.5">
              {t.shop.roomType}
            </h3>
            <div className="space-y-1 text-xs">
              {roomTypesList.map((room) => (
                <button
                  key={room}
                  onClick={() => updateParam('roomType', room)}
                  className={`block w-full text-left py-1.5 px-2.5 rounded-lg transition-colors ${
                    currentRoomType === room
                      ? 'bg-[#D8C0A0]/50 text-[#24211E] font-bold'
                      : 'text-[#4A2E20] hover:bg-[#D8C0A0]/20'
                  }`}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Lighting Style */}
          <div className="pt-4 border-t border-[#D8C0A0]/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A2E20] mb-2.5">
              {t.shop.lightingStyle}
            </h3>
            <div className="space-y-1 text-xs">
              {lightingStylesList.map((style) => (
                <button
                  key={style}
                  onClick={() => updateParam('lightingStyle', style)}
                  className={`block w-full text-left py-1.5 px-2.5 rounded-lg transition-colors ${
                    currentLightingStyle === style
                      ? 'bg-[#D8C0A0]/50 text-[#24211E] font-bold'
                      : 'text-[#4A2E20] hover:bg-[#D8C0A0]/20'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* 5. In Stock Only */}
          <div className="pt-4 border-t border-[#D8C0A0]/40">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#4A2E20] font-semibold">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) => updateParam('inStock', e.target.checked)}
                className="rounded border-[#D8C0A0] text-[#C58B4B] focus:ring-[#C58B4B] w-4 h-4"
              />
              <span>{t.shop.inStockOnly}</span>
            </label>
          </div>
        </aside>

        {/* Expansive Full-Width Products Grid (80%) */}
        <div className="lg:col-span-9 xl:col-span-10">
          {loading ? (
            <div className="py-24 text-center text-xs text-[#8A5D44] space-y-2">
              <div className="w-8 h-8 border-2 border-[#C58B4B] border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Illuminating natural catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-3xl border border-[#D8C0A0]/60 space-y-4">
              <p className="font-display text-2xl font-bold text-[#4A2E20]">
                No lighting pieces match this filter selection.
              </p>
              <p className="text-xs text-[#8A5D44] max-w-sm mx-auto">
                Try resetting one or more active filters or explore our complete catalog.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-[#4A2E20] text-[#FAF6EF] text-xs font-semibold rounded-lg hover:bg-[#3D251A] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 ${
                gridCols === 4
                  ? 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4'
                  : 'lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3'
              } gap-6 sm:gap-7`}
            >
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#24211E]/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />

          <div className="relative w-4/5 max-w-sm bg-[#FAF6EF] h-full shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#D8C0A0]/40">
                <h3 className="font-display text-lg font-bold text-[#4A2E20]">Filter Catalog</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-[#4A2E20]">
                  <X size={20} />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold uppercase text-[#4A2E20] mb-2">Category</h4>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => { updateParam('category', 'All'); setMobileFilterOpen(false); }}
                    className={`block w-full text-left py-1.5 px-2 rounded ${currentCategory === 'All' ? 'bg-[#4A2E20] text-[#FAF6EF]' : 'text-[#4A2E20]'}`}
                  >
                    All Fixtures
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => { updateParam('category', c.name); setMobileFilterOpen(false); }}
                      className={`block w-full text-left py-1.5 px-2 rounded ${currentCategory.toLowerCase() === c.name.toLowerCase() ? 'bg-[#4A2E20] text-[#FAF6EF]' : 'text-[#4A2E20]'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div className="pt-4 border-t border-[#D8C0A0]/40">
                <h4 className="text-xs font-bold uppercase text-[#4A2E20] mb-2">Material</h4>
                <div className="space-y-1 text-xs">
                  {materialsList.map((m) => (
                    <button
                      key={m}
                      onClick={() => { updateParam('material', m); setMobileFilterOpen(false); }}
                      className={`block w-full text-left py-1.5 px-2 rounded ${currentMaterial === m ? 'bg-[#D8C0A0]/50 text-[#24211E] font-bold' : 'text-[#4A2E20]'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* In stock */}
              <div className="pt-4 border-t border-[#D8C0A0]/40">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#4A2E20] font-medium">
                  <input
                    type="checkbox"
                    checked={currentInStock}
                    onChange={(e) => updateParam('inStock', e.target.checked)}
                    className="rounded border-[#D8C0A0] text-[#C58B4B] w-4 h-4"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-[#D8C0A0]/40 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2 text-xs border border-[#4A2E20] text-[#4A2E20] rounded font-medium"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2 text-xs bg-[#4A2E20] text-[#FAF6EF] rounded font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
