import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Star,
  CheckCircle,
  Play,
  Pause,
  ChevronRight,
  ShieldCheck,
  Leaf,
  Layers,
  Heart,
  Quote
} from 'lucide-react';
import apiFetch from '../utils/api.js';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import ProductCard from '../components/ProductCard';

const HomePage = ({ onOpenSearch, onOpenQuiz, onQuickView }) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Video ambient hero control
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  // Active Hotspot in "Shop the Room"
  const [activeHotspot, setActiveHotspot] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [featRes, catRes] = await Promise.all([
          apiFetch('/products/featured'),
          apiFetch('/products/categories')
        ]);

        if (featRes.success) {
          setFeaturedProducts(featRes.featured || []);
          setBestSellers(featRes.bestSellers || []);
          setNewArrivals(featRes.newArrivals || []);
        }

        if (catRes.success) {
          setCategories(catRes.categories || []);
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const hotspots = [
    {
      id: 1,
      x: '38%',
      y: '32%',
      title: 'Artisan Bell Bamboo Pendant',
      price: 4500,
      slug: 'artisan-woven-bell-bamboo-pendant',
      image: '/assets/products/bamboo-bell-pendant.jpg'
    },
    {
      id: 2,
      x: '78%',
      y: '58%',
      title: 'Aura Sculptural Floor Lamp',
      price: 8800,
      slug: 'aura-sculptural-curved-bamboo-floor-lamp',
      image: '/assets/products/woven-floor-lamp.jpg'
    },
    {
      id: 3,
      x: '18%',
      y: '65%',
      title: 'The Heritage Lattice Table Lamp',
      price: 3200,
      slug: 'heritage-lattice-bamboo-table-lamp',
      image: '/assets/products/bamboo-lattice-table-lamp.jpeg'
    }
  ];

  return (
    <div className="space-y-20 sm:space-y-28 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center bg-sand-100 overflow-hidden">
        {/* Hero Background Media: Authentic Video or Rich Ambient Photography */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover brightness-[0.88] contrast-[1.05]"
          >
            <source src="/assets/videos/hero-pendant-lights.mp4" type="video/mp4" />
          </video>
          {/* Subtle warm amber vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-charcoal/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-24 sm:py-32">
          <div className="max-w-3xl text-cream space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream/15 backdrop-blur-md border border-sand-300/30 text-sand-200 text-xs font-semibold uppercase tracking-widest animate-fade-in">
              <span className="w-2.5 h-2.5 rounded-full bg-bamboo animate-pulse" />
              <span>{t.hero.tag}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-cream leading-[1.08] drop-shadow-sm">
              {t.hero.headline}
            </h1>

            <p className="text-sand-200 text-base sm:text-lg lg:text-xl leading-relaxed font-normal max-w-2xl drop-shadow-sm">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                to="/shop"
                className="px-8 py-4 bg-bamboo hover:bg-bamboo-500 text-charcoal font-semibold text-xs sm:text-sm uppercase tracking-wider rounded shadow-glow-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>{t.hero.exploreBtn}</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/story"
                className="px-8 py-4 bg-cream/20 hover:bg-cream/30 text-cream backdrop-blur-md border border-cream/30 font-semibold text-xs sm:text-sm uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-all"
              >
                <span>{t.hero.storyBtn}</span>
              </Link>
            </div>

            {/* Quick Hero Proof Points */}
            <div className="grid grid-cols-3 gap-6 sm:gap-10 pt-8 border-t border-cream/20 max-w-xl">
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-cream">100%</p>
                <p className="text-xs text-sand-300 uppercase tracking-wider mt-1">Riverbed Bamboo</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-cream">30+ Hrs</p>
                <p className="text-xs text-sand-300 uppercase tracking-wider mt-1">Artisan Weaving</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-cream">Zero</p>
                <p className="text-xs text-sand-300 uppercase tracking-wider mt-1">Plastic Packaging</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED COLLECTIONS GRID */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">
            Architectural Curations
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-walnut mt-1">
            {t.home.featuredCollections}
          </h2>
          <p className="text-sm sm:text-base text-sand-500 mt-2">
            {t.home.featuredSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group relative h-[420px] rounded-2xl overflow-hidden shadow-card border border-sand-200/60 block"
            >
              <img
                src={cat.image || '/assets/products/bamboo-lattice-table-lamp.jpeg'}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-cream">
                <span className="text-[10px] uppercase tracking-widest text-sand-300 font-semibold">
                  Handmade Series
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-cream mt-1 group-hover:text-bamboo transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs sm:text-sm text-sand-300 line-clamp-2 mt-1.5 opacity-90">
                  {cat.description}
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-bamboo font-semibold mt-3 group-hover:translate-x-1.5 transition-transform">
                  <span>Explore Series</span>
                  <ChevronRight size={15} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. BEST-SELLING PRODUCTS (Core Catalog Showcase) */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">
              Customer Favorites
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-walnut mt-1">
              {t.home.bestSellers}
            </h2>
            <p className="text-sm sm:text-base text-sand-500 mt-1">
              {t.home.bestSellersSubtitle}
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-walnut hover:text-bamboo transition-colors"
          >
            <span>View All Creations ({bestSellers.length + newArrivals.length})</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {bestSellers.slice(0, 8).map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* 4. CRAFTSMANSHIP DEEP DIVE (Artisan Weaving & Riverbed Bamboo) */}
      <section className="bg-sand-100 py-20 sm:py-28 border-y border-sand-200">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Authentic Craft Video & Workshop Imagery */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-sand-300 aspect-[4/3] bg-charcoal">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/assets/videos/artisan-weaving.mp4" type="video/mp4" />
                </video>
                <div className="absolute top-4 left-4 bg-charcoal/70 backdrop-blur-sm text-cream px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-olive-400 animate-pulse" />
                  <span>Artisan Workshop, Sylhet</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl overflow-hidden shadow-sm aspect-video bg-sand-200 border border-sand-300">
                  <img
                    src="/assets/craftsmanship/artisan-workshop.jpeg"
                    alt="Artisan hands weaving bamboo lampshades"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-xl overflow-hidden shadow-sm aspect-video bg-sand-200 border border-sand-300">
                  <img
                    src="/assets/products/cottage-bamboo-wall-sconce.jpeg"
                    alt="Cottage bamboo fixture"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Right: Editorial Craft Steps */}
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">
                  The Canzir Difference
                </span>
                <h2 className="font-display text-3xl sm:text-5xl font-bold text-walnut mt-1 leading-tight">
                  {t.home.craftsmanshipTitle}
                </h2>
                <p className="text-xs sm:text-sm text-sand-500 mt-3 leading-relaxed">
                  {t.home.craftsmanshipSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="p-4 bg-cream rounded-xl border border-sand-200 shadow-sm">
                  <span className="text-xs font-bold text-bamboo font-serif">01. {t.home.craftStep1}</span>
                  <p className="text-xs text-sand-500 mt-1">{t.home.craftStep1Desc}</p>
                </div>
                <div className="p-4 bg-cream rounded-xl border border-sand-200 shadow-sm">
                  <span className="text-xs font-bold text-bamboo font-serif">02. {t.home.craftStep2}</span>
                  <p className="text-xs text-sand-500 mt-1">{t.home.craftStep2Desc}</p>
                </div>
                <div className="p-4 bg-cream rounded-xl border border-sand-200 shadow-sm">
                  <span className="text-xs font-bold text-bamboo font-serif">03. {t.home.craftStep3}</span>
                  <p className="text-xs text-sand-500 mt-1">{t.home.craftStep3Desc}</p>
                </div>
                <div className="p-4 bg-cream rounded-xl border border-sand-200 shadow-sm">
                  <span className="text-xs font-bold text-bamboo font-serif">04. {t.home.craftStep4}</span>
                  <p className="text-xs text-sand-500 mt-1">{t.home.craftStep4Desc}</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/story"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-walnut text-cream hover:bg-walnut-700 text-xs font-semibold uppercase tracking-wider rounded transition-colors"
                >
                  <span>Read The Full Craft Journal</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE "SHOP THE ROOM" (Living Room Hotspots) */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">
            Interactive Interior
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-walnut mt-1">
            {t.home.shopTheRoom}
          </h2>
          <p className="text-sm sm:text-base text-sand-500 mt-1">
            {t.home.shopTheRoomSubtitle}
          </p>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-sand-300 aspect-[16/9] lg:aspect-[21/9] xl:aspect-[24/10] bg-charcoal">
          {/* Room Lifestyle Image */}
          <img
            src="/assets/products/bamboo-bell-pendant.jpg"
            alt="Living Room with Canzir bamboo lighting fixtures"
            className="w-full h-full object-cover brightness-95"
          />

          {/* Interactive Hotspot Pins */}
          {hotspots.map((pin) => (
            <div
              key={pin.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ left: pin.x, top: pin.y }}
            >
              <button
                onClick={() => setActiveHotspot(activeHotspot?.id === pin.id ? null : pin)}
                className="relative group p-2 focus:outline-none"
                aria-label={`View ${pin.title}`}
              >
                <span className="absolute inset-0 rounded-full bg-bamboo/40 animate-ping" />
                <span className="relative w-8 h-8 rounded-full bg-cream text-walnut border-2 border-bamboo flex items-center justify-center font-bold text-sm shadow-lg transition-transform group-hover:scale-110">
                  +
                </span>
              </button>

              {/* Hotspot Card Overlay */}
              {activeHotspot?.id === pin.id && (
                <div className="absolute left-10 top-0 w-72 bg-cream/95 backdrop-blur-md p-4 rounded-2xl border border-sand-300 shadow-2xl z-30 animate-fade-in text-left">
                  <div className="flex gap-3">
                    <img
                      src={pin.image}
                      alt={pin.title}
                      className="w-18 h-18 rounded-lg object-cover bg-sand-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-walnut truncate">{pin.title}</h4>
                      <p className="text-xs sm:text-sm font-semibold text-bamboo mt-0.5">{formatPrice(pin.price)}</p>
                      <Link
                        to={`/product/${pin.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs text-walnut-700 hover:text-bamboo font-medium mt-2 underline"
                      >
                        <span>View Product</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. FIND YOUR PERFECT LIGHT (Interactive Quiz Callout) */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="bg-gradient-to-r from-walnut to-charcoal text-cream rounded-3xl p-8 sm:p-14 lg:p-16 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">
              Custom Space Consult
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-cream">
              {t.home.lightingQuizTitle}
            </h2>
            <p className="text-sm sm:text-base text-sand-300 leading-relaxed max-w-xl">
              {t.home.lightingQuizSubtitle}
            </p>
            <div className="pt-3">
              <button
                onClick={onOpenQuiz}
                className="px-8 py-4 bg-bamboo hover:bg-bamboo-500 text-charcoal font-semibold text-xs sm:text-sm uppercase tracking-wider rounded shadow-glow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles size={16} />
                <span>{t.home.lightingQuizBtn}</span>
              </button>
            </div>
          </div>

          <div className="relative z-10 w-full max-w-sm aspect-square rounded-2xl overflow-hidden border border-sand-400/30 shadow-2xl">
            <img
              src="/assets/products/bamboo-lattice-table-lamp.jpeg"
              alt="Find your light"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Decorative ambient ring */}
          <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-bamboo/15 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* 7. CUSTOM DESIGN & BESPOKE INQUIRY CALLOUT */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center bg-sand-50 p-8 sm:p-14 lg:p-16 rounded-3xl border border-sand-200">
          <div className="space-y-5">
            <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">
              Bespoke Commission
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-walnut">
              Have a Unique Vision in Mind?
            </h2>
            <p className="text-sm sm:text-base text-sand-500 leading-relaxed">
              Whether you are an architect designing an eco-resort or a homeowner seeking a custom-dimension chandelier, our master craftsmen collaborate with you to create one-of-a-kind lighting fixtures tailored to your space.
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-walnut-700 pt-2">
              <li className="flex items-center gap-2.5">
                <CheckCircle size={18} className="text-olive-500 flex-shrink-0" />
                <span>Choice of seasoned river bamboo, teak hardwood, or cane</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle size={18} className="text-olive-500 flex-shrink-0" />
                <span>Custom wire lengths, brass canopies, and voltage ratings</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle size={18} className="text-olive-500 flex-shrink-0" />
                <span>Direct quotation and timeline from our master artisans</span>
              </li>
            </ul>
            <div className="pt-4">
              <Link
                to="/custom-designs"
                className="px-8 py-4 bg-walnut hover:bg-walnut-700 text-cream text-xs sm:text-sm font-semibold uppercase tracking-wider rounded transition-colors inline-flex items-center gap-2"
              >
                <span>Request Custom Order Inquiry</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-lg border border-sand-300">
            <img
              src="/assets/products/woven-floor-lamp.jpg"
              alt="Custom lighting design"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 8. VERIFIED CUSTOMER REVIEWS */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">
            Honest Endorsements
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-walnut mt-1">
            {t.home.testimonialsTitle}
          </h2>
          <p className="text-sm sm:text-base text-sand-500 mt-1">
            {t.home.testimonialsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              name: 'Dr. Tanvir Hossain',
              city: 'Gulshan, Dhaka',
              product: 'The Heritage Lattice Lamp',
              text: 'The craftsmanship on this lamp is unbelievable. The way the amber light filters through the thin bamboo slits turns my study into a peaceful retreat after 12-hour hospital shifts.',
              rating: 5
            },
            {
              name: 'Ayesha Rahman',
              city: 'Banani DOHS',
              product: 'Artisan Bell Pendant',
              text: 'Hung two over our 8-seater dining table. Everyone who visits stops to touch the bamboo texture and asks if it came from Denmark or Japan. Proud to say it was crafted right here in Bangladesh.',
              rating: 5
            },
            {
              name: 'Farhan Kabir',
              city: 'Sylhet Sadar',
              product: 'Cottage Wall Sconce',
              text: 'The rustic cottage roof design is so nostalgic yet modern. Safe packaging, eco-friendly box with zero plastic, and arrived in pristine condition.',
              rating: 5
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-8 bg-cream rounded-2xl border border-sand-200 shadow-card flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-current" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-walnut-700 italic leading-relaxed">
                  "{item.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-sand-200">
                <p className="text-sm font-bold text-walnut">{item.name}</p>
                <p className="text-xs text-sand-500">{item.city} • Verified Buyer</p>
                <p className="text-xs text-bamboo-600 font-medium mt-1">Purchased: {item.product}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. INSTAGRAM / LIFESTYLE GALLERY */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="text-center max-w-md mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest font-semibold text-bamboo">
            #CanzirLiving
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-walnut mt-1">
            {t.home.instagramTitle}
          </h2>
          <p className="text-xs sm:text-sm text-sand-500 mt-1">
            {t.home.instagramSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {[
            '/assets/products/bamboo-lattice-table-lamp.jpeg',
            '/assets/products/cottage-bamboo-wall-sconce.jpeg',
            '/assets/products/bamboo-bell-pendant.jpg',
            '/assets/products/woven-floor-lamp.jpg'
          ].map((src, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm bg-sand-200"
            >
              <img
                src={src}
                alt="Canzir lifestyle"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-cream text-xs sm:text-sm font-semibold">
                <span>@canzir.decor</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
