import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Star } from 'lucide-react';
import apiFetch from '../utils/api.js';
import { useCurrency } from '../context/CurrencyContext';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/products?search=${encodeURIComponent(searchTerm.trim())}&limit=6`);
        if (res.success) {
          setResults(res.products || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  const popularSearches = [
    'Heritage Lattice',
    'Cottage Sconce',
    'Bell Pendant',
    'Aura Floor Lamp',
    'Teak Wood',
    'Warm Ambient'
  ];

  const handleSelectProduct = (slug) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-charcoal/70 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-3xl bg-cream border border-sand-300 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 border-b border-sand-300 flex items-center gap-3">
          <Search size={22} className="text-sand-500" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by fixture name, category, or natural material..."
            className="flex-1 bg-transparent text-sm sm:text-base text-walnut placeholder-sand-400 focus:outline-none font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-sand-400 hover:text-walnut text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-sand-500 hover:text-walnut hover:bg-sand-200 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Popular Tags */}
        {!searchTerm && (
          <div className="p-6">
            <p className="text-xs font-semibold text-sand-500 uppercase tracking-wider mb-3">
              Popular Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-3 py-1.5 rounded-full text-xs bg-sand-200 text-walnut hover:bg-sand-300 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Container */}
        {searchTerm && (
          <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-3">
            {loading ? (
              <div className="py-12 text-center text-xs text-sand-500">Searching natural fixtures...</div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center text-xs text-sand-500">
                No lighting pieces found matching "{searchTerm}". Try exploring our collections.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleSelectProduct(product.slug)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-sand-200 hover:border-bamboo hover:bg-sand-100/50 cursor-pointer transition-all group"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded bg-sand-100 flex-shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-bamboo-600 font-semibold uppercase tracking-wider">
                        {product.category}
                      </p>
                      <h4 className="text-xs font-semibold text-walnut truncate group-hover:text-bamboo transition-colors">
                        {product.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-walnut">{formatPrice(product.price)}</span>
                        {product.rating && (
                          <span className="flex items-center text-[10px] text-amber-600 font-semibold">
                            <Star size={10} className="fill-amber-500 text-amber-500 mr-0.5" />
                            {product.rating}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-sand-400 group-hover:text-bamboo group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
