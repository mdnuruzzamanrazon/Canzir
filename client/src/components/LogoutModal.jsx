import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Universal Luxury Logout Confirmation Dialog.
 * Supports both Admin Panel (luxury noir/gold theme) and Customer Panel (warm artisan cream theme).
 * Accessible, keyboard-friendly (ESC key), focus-managed, with duplicate-click protection.
 */
export default function LogoutModal() {
  const {
    logoutModalOpen,
    logoutModalConfig,
    closeLogoutModal,
    logout,
    user,
    isAdmin
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const cancelButtonRef = useRef(null);

  // Determine whether to show the Admin theme or Customer theme
  const isAdminVariant =
    logoutModalConfig?.variant === 'admin' ||
    (logoutModalConfig?.variant === 'auto' &&
      (location.pathname.startsWith('/admin') || user?.role === 'admin' || isAdmin));

  // Handle ESC key and focus management
  useEffect(() => {
    if (!logoutModalOpen) {
      setSubmitting(false);
      return;
    }

    // Lock body scroll while modal is visible
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus Cancel button to prevent accidental logouts on Space/Enter
    const focusTimer = setTimeout(() => {
      cancelButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) {
        closeLogoutModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [logoutModalOpen, submitting, closeLogoutModal]);

  if (!logoutModalOpen) return null;

  const handleConfirmLogout = async () => {
    if (submitting) return; // Prevent duplicate requests
    setSubmitting(true);

    try {
      await logout(true);
      closeLogoutModal();
      const redirectUrl = logoutModalConfig?.redirectUrl || '/login';
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      closeLogoutModal();
      navigate('/login', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !submitting) {
      closeLogoutModal();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-desc"
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
        isAdminVariant
          ? 'bg-black/80 backdrop-blur-md'
          : 'bg-black/60 backdrop-blur-sm'
      }`}
    >
      {/* Modal Card */}
      <div
        className={`relative w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl transition-all duration-300 transform scale-100 ${
          isAdminVariant
            ? 'bg-[#181513] border border-stone-800 text-stone-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-[#C58B4B]/20'
            : 'bg-white border border-sand-300 text-walnut shadow-[0_25px_60px_-15px_rgba(74,46,32,0.25)]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={closeLogoutModal}
          disabled={submitting}
          aria-label="Close dialog"
          className={`absolute top-4 right-4 p-2 rounded-xl transition-colors disabled:opacity-40 ${
            isAdminVariant
              ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/80'
              : 'text-sand-500 hover:text-walnut hover:bg-sand-100'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center text-center">
          {/* Visual Icon Badge */}
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform ${
              isAdminVariant
                ? 'bg-gradient-to-br from-rose-500/15 via-[#C58B4B]/10 to-stone-900 border border-rose-500/30 text-rose-400 shadow-inner shadow-rose-950/40'
                : 'bg-rose-50 border border-rose-200/80 text-rose-600 shadow-xs'
            }`}
          >
            <LogOut className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          {/* Heading */}
          <h3
            id="logout-dialog-title"
            className={`text-lg sm:text-xl font-bold tracking-tight mb-2 ${
              isAdminVariant ? 'text-stone-100 font-sans' : 'text-walnut font-serif'
            }`}
          >
            Are you sure you want to sign out?
          </h3>

          {/* Supportive Subtitle */}
          <p
            id="logout-dialog-desc"
            className={`text-xs sm:text-sm leading-relaxed max-w-sm mb-6 ${
              isAdminVariant ? 'text-stone-400' : 'text-sand-600'
            }`}
          >
            {isAdminVariant
              ? 'You will be safely signed out of the Canzir Atelier Administration Console. Any unsaved drafts will need to be re-entered upon your next login.'
              : 'You are about to end your active session on Canzir. You can sign back in anytime to manage your orders, shipping details, and saved wishlist.'}
          </p>

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-3 sm:gap-4 pt-1">
            {/* Cancel Button */}
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={closeLogoutModal}
              disabled={submitting}
              className={`w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs disabled:opacity-50 ${
                isAdminVariant
                  ? 'border border-stone-700 bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 hover:text-white'
                  : 'border border-sand-300 bg-sand-100/80 hover:bg-sand-200 text-walnut'
              }`}
            >
              Cancel
            </button>

            {/* Yes, Sign Out Button */}
            <button
              type="button"
              onClick={handleConfirmLogout}
              disabled={submitting}
              className={`w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer ${
                isAdminVariant
                  ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-950/50 hover:shadow-lg hover:shadow-rose-900/40'
                  : 'bg-walnut hover:bg-walnut-700 text-cream shadow-walnut/20 hover:shadow-lg'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Yes, Sign Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
