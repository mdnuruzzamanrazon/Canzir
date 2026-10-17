import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingBag, Check, Shield, Truck, Heart } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useAuth();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setQuantity(1);
      setAddedSuccess(false);

      // Default first options for each variant
      const initialVariants = {};
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach(variant => {
          if (variant.options && variant.options.length > 0) {
            initialVariants[variant.name] = variant.options[0].label;
          }
        });
      }
      setSelectedVariants(initialVariants);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Calculate adjusted price based on selected variants
  let currentPrice = product.price;
  if (product.variants && selectedVariants) {
    Object.entries(selectedVariants).forEach(([varName, optLabel]) => {
      const variant = product.variants.find(v => v.name.toLowerCase() === varName.toLowerCase());
      if (variant) {
        const opt = variant.options.find(o => o.label === optLabel);
        if (opt && opt.priceAdjustment) {
          currentPrice += opt.priceAdjustment;
        }
      }
    });
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariants);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  const isFavorited = isInWishlist(product._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-cream border border-sand-300 rounded-2xl shadow-2xl overflow-hidden my-8 animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-cream/80 hover:bg-cream rounded-full text-walnut transition-colors shadow-sm"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-sand-100 border border-sand-200 shadow-inner">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-bamboo shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details & Variant Picker */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-semibold text-bamboo-600">
                  {product.category}
                </span>
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className="flex items-center gap-1 text-xs text-walnut hover:text-bamboo transition-colors"
                >
                  <Heart size={16} className={isFavorited ? 'fill-bamboo text-bamboo' : ''} />
                  <span>{isFavorited ? 'Saved' : 'Wishlist'}</span>
                </button>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-walnut leading-snug">
                {product.title}
              </h2>

              {/* Rating & Stock */}
              <div className="flex items-center gap-4 text-xs">
                {product.rating > 0 && (
                  <div className="flex items-center gap-1 text-amber-700 font-bold">
                    <Star size={14} className="fill-amber-500 text-amber-500" />
                    <span>{product.rating}</span>
                    <span className="text-sand-500 font-normal">({product.reviewCount} verified reviews)</span>
                  </div>
                )}
                <span className="text-sand-300">|</span>
                <span className={product.inStock ? 'text-olive-600 font-medium' : 'text-amber-700 font-medium'}>
                  {product.inStock ? `In Stock (${product.stockQuantity} available)` : 'Made to Order'}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-bold text-walnut">
                  {formatPrice(currentPrice)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                  <span className="text-sm text-sand-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <p className="text-xs text-sand-500 leading-relaxed pt-2">
                {product.shortDescription}
              </p>

              {/* Variant Selectors */}
              {product.variants && product.variants.map((variant) => (
                <div key={variant.name} className="pt-2">
                  <div className="flex justify-between text-xs font-semibold text-walnut mb-1.5">
                    <span>{variant.name}:</span>
                    <span className="text-bamboo font-medium">{selectedVariants[variant.name]}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option) => {
                      const isSelected = selectedVariants[variant.name] === option.label;
                      return (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: option.label }))}
                          className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                            isSelected
                              ? 'border-bamboo bg-sand-200 text-walnut shadow-sm'
                              : 'border-sand-300 bg-white text-walnut-700 hover:border-sand-400'
                          }`}
                        >
                          {option.label}
                          {option.priceAdjustment > 0 && ` (+${formatPrice(option.priceAdjustment)})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="space-y-4 pt-4 border-t border-sand-200">
              <div className="flex items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center border border-sand-300 rounded bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-walnut hover:bg-sand-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-semibold text-walnut">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity || 10, quantity + 1))}
                    className="px-3 py-2 text-walnut hover:bg-sand-100 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={addedSuccess}
                  className="flex-1 py-3 px-6 bg-walnut hover:bg-walnut-700 text-cream rounded font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm disabled:bg-olive-600"
                >
                  {addedSuccess ? (
                    <>
                      <Check size={16} />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-bamboo font-medium hover:underline underline-offset-4"
                >
                  View Full Specifications & Artisan Story →
                </Link>
                <span className="text-sand-400">SKU: {product.sku}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
