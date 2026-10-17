import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Leaf,
  Check,
  ChevronRight,
  Share2,
  Sparkles,
  Info
} from 'lucide-react';
import apiFetch from '../utils/api.js';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const ProductDetailPage = ({ onQuickView }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { addToCart, setIsCartOpen } = useCart();
  const { user, isInWishlist, toggleWishlist } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  // Variant selections
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'craft' | 'specs' | 'reviews' | 'shipping'

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/products/${slug}`);
        if (res.success && res.product) {
          setProduct(res.product);
          setReviews(res.reviews || []);
          setRelated(res.related || []);

          // Initialize default variants
          const defaults = {};
          if (res.product.variants) {
            res.product.variants.forEach(v => {
              if (v.options?.length) {
                defaults[v.name] = v.options[0].label;
              }
            });
          }
          setSelectedVariants(defaults);
          setActiveImage(0);
          setQuantity(1);

          // Save to recently viewed
          const recent = JSON.parse(localStorage.getItem('canzir_recent') || '[]');
          const filtered = [res.product._id, ...recent.filter(id => id !== res.product._id)].slice(0, 6);
          localStorage.setItem('canzir_recent', JSON.stringify(filtered));
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-2 border-bamboo border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-sand-500">Unveiling handcrafted fixture...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4 px-4">
        <h2 className="font-display text-2xl font-bold text-walnut">Lighting Piece Not Found</h2>
        <p className="text-xs text-sand-500">This creation may have retired or the link is incorrect.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 bg-walnut text-cream text-xs font-semibold rounded">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Calculate dynamic variant price
  let dynamicPrice = product.price;
  if (product.variants && selectedVariants) {
    Object.entries(selectedVariants).forEach(([varName, optLabel]) => {
      const variant = product.variants.find(v => v.name.toLowerCase() === varName.toLowerCase());
      if (variant) {
        const opt = variant.options.find(o => o.label === optLabel);
        if (opt && opt.priceAdjustment) {
          dynamicPrice += opt.priceAdjustment;
        }
      }
    });
  }

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariants);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariants);
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      const res = await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          productId: product._id,
          rating: reviewRating,
          comment: reviewComment,
          userName: reviewName || (user ? user.name : 'Verified Customer')
        })
      });
      if (res.success) {
        setReviews([res.review, ...reviews]);
        setReviewComment('');
        setReviewSuccess(true);
      }
    } catch (err) {
      console.error('Review failed:', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const isFavorited = isInWishlist(product._id);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-14 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-sand-500">
        <Link to="/" className="hover:text-walnut">Home</Link>
        <ChevronRight size={12} />
        <Link to="/shop" className="hover:text-walnut">Shop</Link>
        <ChevronRight size={12} />
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-walnut">
          {product.category}
        </Link>
        <ChevronRight size={12} />
        <span className="text-walnut font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: Gallery with Zoom & Thumbnails */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-5">
          <div
            className="relative aspect-square w-full rounded-3xl overflow-hidden bg-sand-100 border border-sand-200/90 shadow-md cursor-crosshair"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={product.images[activeImage] || product.images[0]}
              alt={product.title}
              className={`w-full h-full object-cover transition-transform duration-200 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              style={
                isZoomed
                  ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                  : undefined
              }
            />

            {/* In-Stock Badge */}
            <div className="absolute top-5 left-5 z-10">
              <span className="bg-cream/90 backdrop-blur-sm text-walnut text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm border border-sand-300">
                {product.inStock ? 'Ready to Ship' : 'Handcrafted to Order'}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === idx
                      ? 'border-bamboo shadow-md scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-sand-200 text-center">
            <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200">
              <Leaf size={20} className="text-olive-500 mx-auto mb-1.5" />
              <p className="text-xs font-semibold uppercase text-walnut">100% Organic</p>
              <p className="text-[10px] text-sand-500">Natural Riverbed Bamboo</p>
            </div>
            <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200">
              <ShieldCheck size={20} className="text-bamboo mx-auto mb-1.5" />
              <p className="text-xs font-semibold uppercase text-walnut">Safety Tested</p>
              <p className="text-[10px] text-sand-500">220V - 240V Certified</p>
            </div>
            <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200">
              <Truck size={20} className="text-walnut mx-auto mb-1.5" />
              <p className="text-xs font-semibold uppercase text-walnut">Free Shipping</p>
              <p className="text-[10px] text-sand-500">Orders over ৳5,000</p>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Variants, Actions */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-6 sticky top-28">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-bamboo">
                {product.category}
              </span>
              <button
                onClick={() => toggleWishlist(product._id)}
                className="flex items-center gap-1.5 text-xs text-walnut hover:text-bamboo transition-colors"
              >
                <Heart size={16} className={isFavorited ? 'fill-bamboo text-bamboo' : ''} />
                <span>{isFavorited ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-walnut leading-tight">
              {product.title}
            </h1>

            {/* Rating & SKU */}
            <div className="flex items-center gap-4 text-xs pt-1">
              {product.rating > 0 && (
                <div className="flex items-center gap-1 text-amber-700 font-bold">
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  <span>{product.rating}</span>
                  <span className="text-sand-500 font-normal">({product.reviewCount} customer reviews)</span>
                </div>
              )}
              <span className="text-sand-300">•</span>
              <span className="text-sand-400">SKU: {product.sku}</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-sand-100/70 rounded-xl border border-sand-200/80 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-walnut">
              {formatPrice(dynamicPrice)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > dynamicPrice && (
              <>
                <span className="text-sm text-sand-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="text-xs bg-bamboo text-cream px-2 py-0.5 rounded font-bold">
                  Save {Math.round(((product.compareAtPrice - dynamicPrice) / product.compareAtPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          <p className="text-xs sm:text-sm text-sand-500 leading-relaxed font-normal">
            {product.shortDescription}
          </p>

          {/* Variant Selectors (Finish, Size, Cord) */}
          {product.variants && product.variants.map((variant) => (
            <div key={variant.name} className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-semibold text-walnut">
                <span>Select {variant.name}:</span>
                <span className="text-bamboo font-medium">{selectedVariants[variant.name]}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {variant.options.map((opt) => {
                  const isSelected = selectedVariants[variant.name] === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: opt.label }))}
                      className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'border-bamboo bg-sand-200 text-walnut font-bold shadow-sm'
                          : 'border-sand-300 bg-white text-walnut-700 hover:border-sand-400'
                      }`}
                    >
                      {opt.label}
                      {opt.priceAdjustment > 0 && ` (+${formatPrice(opt.priceAdjustment)})`}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-4 border-t border-sand-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-sand-300 rounded-lg bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2.5 text-walnut hover:bg-sand-100 transition-colors font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2.5 text-xs font-bold text-walnut">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity || 10, quantity + 1))}
                  className="px-4 py-2.5 text-walnut hover:bg-sand-100 transition-colors font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 bg-walnut hover:bg-walnut-700 text-cream font-semibold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <ShoppingBag size={16} />
                <span>Add to Shopping Bag</span>
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 px-6 bg-bamboo hover:bg-bamboo-500 text-charcoal font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-glow-sm"
            >
              Buy It Now with 1-Click
            </button>
          </div>

          {/* Delivery & Assurance Notes */}
          <div className="p-4 bg-sand-50 rounded-xl border border-sand-200 space-y-2 text-xs text-walnut-700">
            <div className="flex items-center gap-2">
              <Truck size={15} className="text-bamboo flex-shrink-0" />
              <span>
                <strong>Estimated Delivery:</strong> 24-48 hours inside Dhaka | 3-5 days across all 64 districts.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-olive-500 flex-shrink-0" />
              <span>
                <strong>Zero Breakage Guarantee:</strong> Tested shockproof wooden & craft paper packaging.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications, Craft Story, Reviews, Shipping */}
      <div className="pt-10 border-t border-sand-300">
        <div className="flex gap-4 sm:gap-8 border-b border-sand-300 overflow-x-auto text-xs sm:text-sm font-semibold">
          {[
            { id: 'overview', label: 'Detailed Description' },
            { id: 'specs', label: 'Technical Specifications' },
            { id: 'craft', label: 'Artisan Heritage' },
            { id: 'reviews', label: `Reviews (${reviews.length})` },
            { id: 'shipping', label: 'Shipping & Care' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-bamboo text-walnut font-bold'
                  : 'border-transparent text-sand-500 hover:text-walnut'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'overview' && (
          <div className="py-8 space-y-4 max-w-5xl text-xs sm:text-base text-sand-500 leading-relaxed font-normal">
            <p className="text-lg text-walnut font-medium">{product.description}</p>
            <p>
              Each Canzir lamp is an ode to the slow craft movement. Created using non-toxic natural adhesives and cold-pressed linseed oils, it respects the environment and purifies the atmosphere of your interior living spaces.
            </p>
          </div>
        )}

        {/* Tab 2: Specifications Table */}
        {activeTab === 'specs' && (
          <div className="py-8 max-w-4xl">
            <table className="w-full text-xs sm:text-sm text-left border border-sand-200 rounded-2xl overflow-hidden shadow-sm">
              <tbody className="divide-y divide-sand-200">
                <tr className="bg-sand-50">
                  <td className="p-4 font-semibold text-walnut w-1/3">Bulb Compatibility</td>
                  <td className="p-4 text-sand-500">{product.specifications?.bulbType || 'E27 Warm Amber LED'}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-walnut">Wattage</td>
                  <td className="p-4 text-sand-500">{product.specifications?.wattage || '5W - 9W'}</td>
                </tr>
                <tr className="bg-sand-50">
                  <td className="p-4 font-semibold text-walnut">Voltage Range</td>
                  <td className="p-4 text-sand-500">{product.specifications?.voltage || '220V - 240V AC'}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-walnut">Dimensions (H × W)</td>
                  <td className="p-4 text-sand-500">{product.dimensions?.height} × {product.dimensions?.width}</td>
                </tr>
                <tr className="bg-sand-50">
                  <td className="p-4 font-semibold text-walnut">Weight</td>
                  <td className="p-4 text-sand-500">{product.dimensions?.weight}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-walnut">Cord & Switch</td>
                  <td className="p-4 text-sand-500">{product.specifications?.cordLength}</td>
                </tr>
                <tr className="bg-sand-50">
                  <td className="p-4 font-semibold text-walnut">Craft Technique</td>
                  <td className="p-4 text-sand-500">{product.specifications?.craftMethod}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Craft Story */}
        {activeTab === 'craft' && (
          <div className="py-8 max-w-5xl space-y-5 text-xs sm:text-base text-sand-500 leading-relaxed">
            <h3 className="font-display text-2xl font-bold text-walnut">
              Woven by Master Hands along the Surma River
            </h3>
            <p>
              Bamboo is not wood; it is a miracle grass that absorbs twice the carbon of standard trees. In our artisan clusters in Sylhet, mature reeds are harvested by generational artisans who know the exact month when bamboo sap is lowest to ensure lifelong durability.
            </p>
            <p>
              Every strip is hand-planed with traditional curved knives, yielding a silky, splinter-free surface. It is then woven into geometric diamond lattices that soften intense light into a gentle amber embrace.
            </p>
          </div>
        )}

        {/* Tab 4: Customer Reviews & Submission */}
        {activeTab === 'reviews' && (
          <div className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-4">
              {reviews.length === 0 ? (
                <p className="text-sm text-sand-500 italic">No reviews yet. Be the first to share your thoughts on this lamp!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="p-6 bg-sand-50 rounded-2xl border border-sand-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-walnut">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] bg-olive-100 text-olive-700 px-2 py-0.5 rounded font-semibold">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={14} className="fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-walnut-700 leading-relaxed font-normal">{rev.comment}</p>
                    <span className="text-xs text-sand-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Submit a Review Form */}
            <div className="lg:col-span-5 p-8 bg-cream rounded-2xl border border-sand-300 shadow-card space-y-4">
              <h4 className="font-display text-xl font-bold text-walnut">Write a Customer Review</h4>
              {reviewSuccess ? (
                <div className="p-4 bg-olive-100 text-olive-800 text-sm rounded-xl">
                  Thank you! Your verified review has been published.
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-walnut mb-1.5">Your Rating</label>
                    <div className="flex gap-2 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star size={24} className={star <= reviewRating ? 'fill-current' : 'text-sand-300'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-walnut mb-1.5">Your Name</label>
                    <input
                      type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="e.g. Nuzhat C."
                      className="w-full bg-white border border-sand-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-walnut focus:outline-none focus:border-bamboo"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-walnut mb-1.5">Your Feedback</label>
                    <textarea
                      rows={4}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="How has this lighting piece enhanced your room?"
                      className="w-full bg-white border border-sand-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-walnut focus:outline-none focus:border-bamboo"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full py-3.5 bg-walnut hover:bg-walnut-700 text-cream text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Shipping & Care */}
        {activeTab === 'shipping' && (
          <div className="py-8 max-w-5xl space-y-5 text-xs sm:text-base text-sand-500 leading-relaxed">
            <h4 className="font-semibold text-walnut text-lg">Delivery Timelines</h4>
            <p>
              Dhaka City: Same day to 48 hours via specialized courier. Nationwide: 3 to 5 business days across all districts with bubble-pack and bamboo guard frame.
            </p>
            <h4 className="font-semibold text-walnut text-lg pt-2">Bamboo Care Guide</h4>
            <p>
              Dust gently with a soft dry brush or microfiber cloth. Avoid placing directly under continuous high-pressure rain. Natural bamboo thrives in well-ventilated spaces and will gracefully deepen in warm golden hue over the years.
            </p>
          </div>
        )}
      </div>

      {/* Related Products Carousel */}
      {related.length > 0 && (
        <div className="pt-12 border-t border-sand-300 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-walnut">
              Complementary Fixtures
            </h2>
            <Link to="/shop" className="text-xs font-semibold text-bamboo hover:underline">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((relProduct) => (
              <ProductCard
                key={relProduct._id}
                product={relProduct}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
