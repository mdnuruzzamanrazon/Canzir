import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Eye, ShoppingBag } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, onQuickView }) => {
  const { formatPrice } = useCurrency();
  const { isInWishlist, toggleWishlist } = useAuth();
  const { addToCart } = useCart();

  const isFavorited = isInWishlist(product._id);
  const primaryImage = product.images?.[0] || '/assets/products/bamboo-lattice-table-lamp.jpeg';
  const secondaryImage = product.images?.[1] || primaryImage;

  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.variants && product.variants.length > 0) {
      if (onQuickView) onQuickView(product);
    } else {
      addToCart(product, 1, {});
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#D8C0A0]/60 hover:border-[#C58B4B] shadow-sm hover:shadow-md transition-all duration-300">
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F5EEE4]">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-[#C58B4B] text-[#FAF6EF] text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm">
              Save {discountPercent}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-[#4A2E20] text-[#FAF6EF] text-[10px] font-medium px-2.5 py-0.5 rounded shadow-sm">
              Bestseller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-[#D8C0A0] text-[#24211E] text-[10px] font-semibold px-2.5 py-0.5 rounded shadow-sm">
              New Craft
            </span>
          )}
          {!product.inStock && (
            <span className="bg-[#24211E] text-[#FAF6EF] text-[10px] font-semibold px-2.5 py-0.5 rounded shadow-sm">
              Made to Order
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product._id);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 z-10 ${
            isFavorited
              ? 'bg-[#C58B4B] text-[#FAF6EF] shadow-md'
              : 'bg-[#FAF6EF]/85 backdrop-blur-sm text-[#4A2E20] hover:text-[#C58B4B] hover:bg-white shadow-sm'
          }`}
          aria-label="Save to Wishlist"
        >
          <Heart size={16} className={isFavorited ? 'fill-current' : ''} />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onQuickView) onQuickView(product);
            }}
            className="flex-1 py-2.5 px-3 bg-[#FAF6EF]/95 backdrop-blur-sm hover:bg-white text-[#4A2E20] text-xs font-semibold rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye size={14} />
            <span>Quick View</span>
          </button>
          <button
            onClick={handleQuickAdd}
            className="p-2.5 bg-[#4A2E20] hover:bg-[#3D251A] text-[#FAF6EF] rounded-lg shadow-md transition-colors"
            title="Quick Add to Bag"
          >
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#8A5D44] mb-1.5">
            <span className="uppercase tracking-wider font-semibold">{product.category}</span>
            {product.rating > 0 && (
              <span className="flex items-center gap-1 text-[#C58B4B] font-bold">
                <Star size={12} className="fill-[#C58B4B] text-[#C58B4B]" />
                {product.rating} <span className="text-[#8A5D44] font-normal">({product.reviewCount || 0})</span>
              </span>
            )}
          </div>

          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-display text-base sm:text-lg font-semibold text-[#4A2E20] hover:text-[#C58B4B] transition-colors line-clamp-2 min-h-[2.8rem] leading-snug">
              {product.title}
            </h3>
          </Link>

          <p className="text-xs text-[#8A5D44] line-clamp-2 mt-1.5 font-normal leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-[#D8C0A0]/40 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-bold text-[#4A2E20] font-sans">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-[#AA885E] line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            className="text-xs font-semibold text-[#C58B4B] hover:text-[#8A5622] underline underline-offset-4 transition-colors whitespace-nowrap"
          >
            {product.variants?.length ? 'Choose Options' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
