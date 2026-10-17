import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  User as UserIcon,
  Menu,
  X,
  Volume2,
  VolumeX,
  Globe,
  DollarSign,
  ShieldCheck,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';

const Navbar = ({ onOpenSearch, onOpenQuiz }) => {
  const { lang, toggleLanguage, t } = useLanguage();
  const { currency, toggleCurrency } = useCurrency();
  const { totalItemCount, setIsCartOpen } = useCart();
  const { user, wishlist, logout, isAdmin } = useAuth();
  const { isPlaying, toggleSound } = useAudio();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* 1. Full-Width Announcement Bar */}
      {announcementVisible && (
        <div className="w-full bg-[#4A2E20] text-[#FAF6EF] text-xs py-2 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 transition-all border-b border-[#D8C0A0]/20">
          <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between">
            <div className="hidden md:flex items-center gap-2 text-[#D8C0A0] font-medium text-[11px] uppercase tracking-wider">
              <span className="inline-block w-2 h-2 rounded-full bg-[#C58B4B] animate-pulse"></span>
              <span>Heritage Craftsmanship • Sylhet, Bangladesh</span>
            </div>
            <div className="flex-1 text-center font-normal tracking-wide text-[11px] sm:text-xs">
              {t.announcement}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onOpenQuiz}
                className="hidden sm:flex items-center gap-1.5 text-[#D8C0A0] hover:text-[#FAF6EF] text-[11px] font-medium underline underline-offset-4 transition-colors"
              >
                <Sparkles size={12} className="text-[#C58B4B]" />
                <span>Find Your Light Quiz</span>
              </button>
              <button
                onClick={() => setAnnouncementVisible(false)}
                className="text-[#D8C0A0]/80 hover:text-white text-xs ml-2"
                aria-label="Close Announcement"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Full-Width Main Navigation Bar */}
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAF6EF]/95 backdrop-blur-md shadow-sm border-b border-[#D8C0A0]/40 py-3.5'
            : 'bg-[#FAF6EF]/90 backdrop-blur-sm border-b border-[#D8C0A0]/30 py-4 sm:py-5'
        }`}
      >
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-[#4A2E20] hover:text-[#C58B4B] transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu size={24} />
          </button>

          {/* Left Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-8 xl:space-x-10 text-sm font-medium tracking-wide text-[#4A2E20]">
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `hover:text-[#C58B4B] transition-colors ${isActive ? 'text-[#C58B4B] font-bold border-b-2 border-[#C58B4B] pb-1' : ''}`
              }
            >
              {t.nav.shop}
            </NavLink>
            <NavLink
              to="/collections"
              className={({ isActive }) =>
                `hover:text-[#C58B4B] transition-colors ${isActive ? 'text-[#C58B4B] font-bold border-b-2 border-[#C58B4B] pb-1' : ''}`
              }
            >
              {t.nav.collections}
            </NavLink>
            <NavLink
              to="/custom-designs"
              className={({ isActive }) =>
                `hover:text-[#C58B4B] transition-colors flex items-center gap-1.5 ${isActive ? 'text-[#C58B4B] font-bold border-b-2 border-[#C58B4B] pb-1' : ''}`
              }
            >
              <span>{t.nav.customDesigns}</span>
              <span className="text-[10px] bg-[#D8C0A0]/40 text-[#4A2E20] px-2 py-0.5 rounded-full font-serif italic font-semibold">Bespoke</span>
            </NavLink>
            <NavLink
              to="/story"
              className={({ isActive }) =>
                `hover:text-[#C58B4B] transition-colors ${isActive ? 'text-[#C58B4B] font-bold border-b-2 border-[#C58B4B] pb-1' : ''}`
              }
            >
              {t.nav.ourStory}
            </NavLink>
            <NavLink
              to="/track-order"
              className={({ isActive }) =>
                `hover:text-[#C58B4B] transition-colors ${isActive ? 'text-[#C58B4B] font-bold border-b-2 border-[#C58B4B] pb-1' : ''}`
              }
            >
              {t.nav.trackOrder}
            </NavLink>
          </div>

          {/* Center Brand Identity (Logo) */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none py-1">
            <img
              src="/assets/canzir-logo.png"
              alt="Canzir"
              className="h-10 sm:h-12 xl:h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-display text-2xl sm:text-3xl xl:text-4xl font-bold tracking-widest text-[#4A2E20] uppercase">
                CANZIR
              </span>
              <span className="text-[9px] xl:text-[10px] uppercase tracking-[0.28em] text-[#AA885E] -mt-1 font-sans font-medium">
                Handmade Lighting
              </span>
            </div>
          </Link>

          {/* Right Action Icons & Utilities */}
          <div className="flex items-center space-x-2 sm:space-x-4 xl:space-x-5">
            {/* Ambient Nature Soundscape Toggle */}
            <button
              onClick={toggleSound}
              title={isPlaying ? t.hero.soundOn : t.hero.soundOff}
              className={`p-2 xl:px-3 rounded-full transition-all duration-300 hidden sm:flex items-center gap-2 text-xs ${
                isPlaying
                  ? 'bg-[#C58B4B]/20 text-[#8A5622] font-semibold ring-1 ring-[#C58B4B]/40 shadow-sm'
                  : 'text-[#4A2E20] hover:text-[#C58B4B] hover:bg-[#D8C0A0]/20'
              }`}
            >
              {isPlaying ? (
                <>
                  <Volume2 size={16} className="text-[#C58B4B] animate-pulse" />
                  <span className="text-[11px] font-serif hidden xl:inline">Sound of Nature</span>
                </>
              ) : (
                <>
                  <VolumeX size={16} />
                  <span className="text-[11px] font-serif hidden xl:inline">Play Ambience</span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider text-[#4A2E20] hover:text-[#C58B4B] hover:bg-[#D8C0A0]/20 transition-colors flex items-center gap-1.5 border border-[#D8C0A0]/30"
              title="Toggle Language (English / বাংলা)"
            >
              <Globe size={14} className="text-[#AA885E]" />
              <span>{lang === 'en' ? 'বাংলা' : 'ENG'}</span>
            </button>

            {/* Currency Switcher */}
            <button
              onClick={toggleCurrency}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#4A2E20] hover:text-[#C58B4B] hover:bg-[#D8C0A0]/20 transition-colors border border-[#D8C0A0]/30"
              title="Toggle Currency (BDT / USD)"
            >
              {currency}
            </button>

            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2.5 text-[#4A2E20] hover:text-[#C58B4B] hover:bg-[#D8C0A0]/20 rounded-lg transition-colors"
              aria-label="Search Catalog"
            >
              <Search size={20} />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/account?tab=wishlist"
              className="p-2.5 text-[#4A2E20] hover:text-[#C58B4B] hover:bg-[#D8C0A0]/20 rounded-lg transition-colors relative hidden sm:block"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-[#C58B4B] text-[#FAF6EF] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* User Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="p-2 text-[#4A2E20] hover:text-[#C58B4B] hover:bg-[#D8C0A0]/20 rounded-lg transition-colors flex items-center gap-1.5"
                aria-label="User Account"
              >
                <UserIcon size={20} />
                {user && <span className="text-xs font-medium max-w-[90px] truncate hidden md:inline">{user.name.split(' ')[0]}</span>}
                <ChevronDown size={13} className="hidden md:inline text-[#AA885E]" />
              </button>

              {userDropdownOpen && (
                <div
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-60 bg-[#FAF6EF] border border-[#D8C0A0] rounded-xl shadow-lg py-2 z-50 animate-fade-in"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2.5 border-b border-[#D8C0A0]/30 bg-[#FAF6EF]">
                        <p className="text-[11px] text-[#8A5D44]">Signed in as</p>
                        <p className="text-sm font-semibold text-[#4A2E20] truncate">{user.name}</p>
                        <p className="text-xs text-[#8A5D44] truncate">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#8A5622] font-bold hover:bg-[#D8C0A0]/20 transition-colors"
                        >
                          <ShieldCheck size={16} />
                          <span>Admin Control Center</span>
                        </Link>
                      )}

                      <Link
                        to="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-[#4A2E20] hover:bg-[#D8C0A0]/20 transition-colors"
                      >
                        Customer Dashboard
                      </Link>
                      <Link
                        to="/account?tab=orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-[#4A2E20] hover:bg-[#D8C0A0]/20 transition-colors"
                      >
                        Order History
                      </Link>
                      <Link
                        to="/track-order"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-[#4A2E20] hover:bg-[#D8C0A0]/20 transition-colors"
                      >
                        Track Order Status
                      </Link>

                      <div className="border-t border-[#D8C0A0]/30 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                            navigate('/');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-700 hover:bg-red-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2.5 text-xs font-semibold text-[#4A2E20] hover:bg-[#D8C0A0]/20 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-[#8A5D44] hover:bg-[#D8C0A0]/20 transition-colors"
                      >
                        Create Customer Account
                      </Link>
                      <Link
                        to="/track-order"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-[#8A5D44] hover:bg-[#D8C0A0]/20 transition-colors border-t border-[#D8C0A0]/30 mt-1"
                      >
                        Track Guest Order
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 text-[#4A2E20] hover:text-[#C58B4B] hover:bg-[#D8C0A0]/20 rounded-lg transition-colors relative flex items-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={22} />
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C58B4B] text-[#FAF6EF] text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse-subtle">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#24211E]/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-sm bg-[#FAF6EF] h-full shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#D8C0A0]/40">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <img src="/assets/canzir-logo.png" alt="Canzir" className="h-8 w-auto" />
                  <span className="font-display text-xl font-bold tracking-widest text-[#4A2E20] uppercase">
                    CANZIR
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#4A2E20] hover:text-[#C58B4B]"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="py-6 space-y-4 text-base font-medium text-[#4A2E20]">
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-[#C58B4B] py-2 border-b border-[#D8C0A0]/30"
                >
                  {t.nav.shop}
                </Link>
                <Link
                  to="/collections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-[#C58B4B] py-2 border-b border-[#D8C0A0]/30"
                >
                  {t.nav.collections}
                </Link>
                <Link
                  to="/custom-designs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between hover:text-[#C58B4B] py-2 border-b border-[#D8C0A0]/30"
                >
                  <span>{t.nav.customDesigns}</span>
                  <span className="text-xs bg-[#C58B4B]/20 text-[#8A5622] px-2 py-0.5 rounded-full font-semibold">Bespoke</span>
                </Link>
                <Link
                  to="/story"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-[#C58B4B] py-2 border-b border-[#D8C0A0]/30"
                >
                  {t.nav.ourStory}
                </Link>
                <Link
                  to="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-[#C58B4B] py-2 border-b border-[#D8C0A0]/30"
                >
                  {t.nav.trackOrder}
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-[#C58B4B] py-2 border-b border-[#D8C0A0]/30"
                >
                  Contact & Concierge
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-[#D8C0A0]/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8A5D44]">Language</span>
                <button
                  onClick={toggleLanguage}
                  className="px-3 py-1 bg-[#D8C0A0]/30 rounded text-xs font-semibold text-[#4A2E20]"
                >
                  {lang === 'en' ? 'বাংলা' : 'English'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8A5D44]">Currency</span>
                <button
                  onClick={toggleCurrency}
                  className="px-3 py-1 bg-[#D8C0A0]/30 rounded text-xs font-semibold text-[#4A2E20]"
                >
                  {currency}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8A5D44]">Nature Sound</span>
                <button
                  onClick={toggleSound}
                  className="px-3 py-1 bg-[#D8C0A0]/30 rounded text-xs font-semibold text-[#4A2E20] flex items-center gap-1"
                >
                  {isPlaying ? <Volume2 size={14} className="text-[#C58B4B]" /> : <VolumeX size={14} />}
                  <span>{isPlaying ? 'Playing' : 'Muted'}</span>
                </button>
              </div>

              {user ? (
                <div className="pt-2">
                  <p className="text-xs text-[#8A5D44]">Signed in as {user.name}</p>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full mt-2 py-2 text-xs bg-[#D8C0A0]/40 text-[#4A2E20] rounded font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 text-xs bg-[#4A2E20] text-[#FAF6EF] rounded font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 text-xs border border-[#4A2E20] text-[#4A2E20] rounded font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
