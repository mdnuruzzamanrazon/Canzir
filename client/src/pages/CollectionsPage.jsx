import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import apiFetch from '../utils/api.js';

const CollectionsPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await apiFetch('/products/categories');
        if (res.success) setCategories(res.categories || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-10 sm:py-16 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">
          Artisanal Series
        </span>
        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-walnut">
          Canzir Lighting Collections
        </h1>
        <p className="text-sm sm:text-base text-sand-500 leading-relaxed max-w-2xl mx-auto">
          Explore curated groupings of handcrafted lighting, designed to harmonize living spaces with organic texture and peaceful luminescence.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-sm text-sand-500">Loading collections...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group relative h-[420px] rounded-3xl overflow-hidden shadow-card border border-sand-200 block"
            >
              <img
                src={cat.image || '/assets/products/bamboo-lattice-table-lamp.jpeg'}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
                <span className="text-[10px] uppercase tracking-widest text-sand-300 font-semibold">
                  Handcrafted Collection
                </span>
                <h3 className="font-display text-2xl font-bold text-cream mt-1 group-hover:text-bamboo transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-sand-300 line-clamp-2 mt-1 opacity-90">
                  {cat.description}
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-bamboo font-semibold mt-4 group-hover:translate-x-1 transition-transform">
                  <span>Explore Products</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
