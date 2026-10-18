import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { LanguageProvider } from './context/LanguageContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AudioProvider } from './context/AudioContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import SearchModal from './components/SearchModal';
import QuickViewModal from './components/QuickViewModal';
import LightingQuizModal from './components/LightingQuizModal';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CollectionsPage from './pages/CollectionsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CustomDesignsPage from './pages/CustomDesignsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import TrackOrderPage from './pages/TrackOrderPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import LogoutModal from './components/LogoutModal';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const [searchOpen, setSearchOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const handleOpenQuickView = (product) => {
    setQuickViewProduct(product);
  };

  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
  };

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#12100E] text-[#fafaf9] font-body antialiased selection:bg-[#C58B4B]/30 selection:text-white">
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
        <LogoutModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal font-body antialiased">
      {/* Primary Sticky Navbar */}
      <Navbar
        onOpenSearch={() => setSearchOpen(true)}
        onOpenQuiz={() => setQuizOpen(true)}
      />

      {/* Main Page Routing */}
      <main className="flex-1">

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onOpenSearch={() => setSearchOpen(true)}
                onOpenQuiz={() => setQuizOpen(true)}
                onQuickView={handleOpenQuickView}
              />
            }
          />
          <Route path="/shop" element={<ShopPage onQuickView={handleOpenQuickView} />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage onQuickView={handleOpenQuickView} />} />
          <Route path="/custom-designs" element={<CustomDesignsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/story" element={<AboutPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage onQuickView={handleOpenQuickView} />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </main>

      {/* Luxury Footer */}
      <Footer />

      {/* Interactive Global Slide-overs & Modals */}
      <CartDrawer />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <LightingQuizModal isOpen={quizOpen} onClose={() => setQuizOpen(false)} />
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={handleCloseQuickView}
      />
      <LogoutModal />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <AuthProvider>
          <CartProvider>
            <AudioProvider>
              <AppContent />
            </AudioProvider>
          </CartProvider>
        </AuthProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}
