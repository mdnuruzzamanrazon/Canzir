import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Shield,
  Truck,
  Leaf
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-charcoal text-sand-100 pt-16 pb-12 border-t border-sand-400/20">
      {/* Brand Pillars Bar */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 pb-12 mb-12 border-b border-sand-400/15">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-walnut-800 rounded-lg text-bamboo">
              <Leaf size={24} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-cream uppercase tracking-wider">100% River Bamboo</h4>
              <p className="text-xs text-sand-300 mt-1">Sustainably harvested from Sylhet riverbeds, chemical-free curing.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-walnut-800 rounded-lg text-bamboo">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-cream uppercase tracking-wider">Artisan Handcrafted</h4>
              <p className="text-xs text-sand-300 mt-1">Over 30 hours of meticulous hand-weaving per fixture by master crafters.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-walnut-800 rounded-lg text-bamboo">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-cream uppercase tracking-wider">Safe Nationwide Delivery</h4>
              <p className="text-xs text-sand-300 mt-1">Double-reinforced biodegradable packaging with zero breakage guarantee.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-walnut-800 rounded-lg text-bamboo">
              <Shield size={24} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-cream uppercase tracking-wider">Craft Guarantee</h4>
              <p className="text-xs text-sand-300 mt-1">Lifetime structural support and certified electrical safety components.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-sand-400/15">
          {/* Column 1: Brand Info & Emblem */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex flex-col items-start gap-1 group">
              <img
                src="/assets/canzir-logo.png"
                alt="Canzir Logo"
                className="h-14 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8C0A0] font-sans font-medium">
                Handmade Lighting Atelier
              </span>
            </Link>
            <p className="text-xs text-sand-300 leading-relaxed max-w-sm">
              Canzir is an artisanal lighting atelier dedicated to bringing the warmth, peace, and organic beauty of natural bamboo and seasoned hardwood into modern living spaces.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/8801712345678"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-olive-500/20 text-olive-200 border border-olive-500/40 text-xs hover:bg-olive-500/30 transition-colors"
              >
                <MessageCircle size={15} className="text-olive-300" />
                <span>WhatsApp Concierge</span>
              </a>
              <span className="text-xs text-sand-400">Response within 15 mins</span>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-sand-200 mb-4">Collections</h4>
            <ul className="space-y-2 text-xs text-sand-300">
              <li><Link to="/shop?category=Bamboo Table Lamps" className="hover:text-bamboo transition-colors">Bamboo Table Lamps</Link></li>
              <li><Link to="/shop?category=Wooden Wall Lamps" className="hover:text-bamboo transition-colors">Wooden Wall Lamps</Link></li>
              <li><Link to="/shop?category=Bamboo Pendant Lights" className="hover:text-bamboo transition-colors">Bamboo Pendant Lights</Link></li>
              <li><Link to="/shop?category=Floor Lamps" className="hover:text-bamboo transition-colors">Sculptural Floor Lamps</Link></li>
              <li><Link to="/shop?category=Decorative Ambient Lights" className="hover:text-bamboo transition-colors">Decorative Ambient Lights</Link></li>
              <li><Link to="/custom-designs" className="hover:text-bamboo transition-colors text-bamboo font-medium">Bespoke Custom Orders</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Policies */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-sand-200 mb-4">Customer Care</h4>
            <ul className="space-y-2 text-xs text-sand-300">
              <li><Link to="/track-order" className="hover:text-bamboo transition-colors">Track Your Order</Link></li>
              <li><Link to="/story" className="hover:text-bamboo transition-colors">Artisan Craft Heritage</Link></li>
              <li><Link to="/contact#shipping" className="hover:text-bamboo transition-colors">Shipping & Delivery Policies</Link></li>
              <li><Link to="/contact#returns" className="hover:text-bamboo transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/contact#care" className="hover:text-bamboo transition-colors">Bamboo Care & Maintenance</Link></li>
              <li><Link to="/contact" className="hover:text-bamboo transition-colors">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-sand-200 mb-4">Newsletter</h4>
            <p className="text-xs text-sand-300 mb-3">
              Subscribe for private previews, interior design editorials, and 10% off your first order.
            </p>
            {subscribed ? (
              <div className="bg-walnut-800 p-3 rounded text-xs text-bamboo flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Thank you! Use promo code <strong>CANZIR10</strong>.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="w-full bg-walnut-800/80 border border-sand-400/30 rounded px-3 py-2 text-xs text-cream placeholder-sand-400 focus:outline-none focus:border-bamboo"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-2.5 bg-bamboo hover:bg-bamboo-500 text-charcoal rounded text-xs transition-colors flex items-center justify-center"
                    aria-label="Subscribe to newsletter"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
                <p className="text-[10px] text-sand-400">No spam. Only warm natural aesthetics.</p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-sand-400 gap-4">
          <p>© {new Date().getFullYear()} Canzir Craft Atelier. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Payment Options:</span>
            <div className="flex items-center gap-2 text-sand-200 font-semibold text-[11px]">
              <span className="px-2 py-0.5 bg-walnut-800 rounded">bKash</span>
              <span className="px-2 py-0.5 bg-walnut-800 rounded">Nagad</span>
              <span className="px-2 py-0.5 bg-walnut-800 rounded">Visa / Card</span>
              <span className="px-2 py-0.5 bg-walnut-800 rounded">Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
