import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiFetch from '../utils/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Synchronously hydrate initial user and token from localStorage to prevent auth flashes on refresh
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('canzir_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('canzir_token'));
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const savedUser = localStorage.getItem('canzir_user');
      const u = savedUser ? JSON.parse(savedUser) : null;
      return u?.wishlist?.map(item => item._id || item) || [];
    } catch {
      return [];
    }
  });

  // Explicit Logout function
  const logout = useCallback(async (callServer = true) => {
    if (callServer) {
      try {
        await apiFetch('/auth/logout', { method: 'POST' });
      } catch (err) {
        // Silently catch network errors during logout
      }
    }
    localStorage.removeItem('canzir_token');
    localStorage.removeItem('canzir_user');
    setToken(null);
    setUser(null);
    setWishlist([]);
  }, []);

  // Update user profile and keep localStorage in sync
  const updateUser = useCallback((updatedUserData) => {
    setUser(updatedUserData);
    try {
      localStorage.setItem('canzir_user', JSON.stringify(updatedUserData));
    } catch (e) {
      console.error('Failed to cache user profile in localStorage:', e);
    }
  }, []);

  // Session verification on app boot / page refresh
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const storedToken = localStorage.getItem('canzir_token');
      const storedUser = localStorage.getItem('canzir_user');

      // Check with backend if there is any stored token, cached user, or browser cookie
      if (storedToken || storedUser) {
        try {
          const res = await apiFetch('/auth/profile');
          if (!isMounted) return;

          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('canzir_user', JSON.stringify(res.user));
            if (res.token) {
              localStorage.setItem('canzir_token', res.token);
              setToken(res.token);
            }
            setWishlist(res.user.wishlist?.map(item => item._id || item) || []);
          } else {
            // Invalid session response
            await logout(false);
          }
        } catch (err) {
          if (!isMounted) return;

          // Only clear session if server explicitly returned 401 Unauthorized or 403 Forbidden
          if (err.status === 401 || err.status === 403) {
            console.warn('[Auth] Session expired or unauthorized (HTTP 401/403). Resetting session.');
            await logout(false);
          } else {
            // Retain cached session on transient offline / network failures
            console.warn('[Auth] Network issue verifying session. Retaining local session state:', err.message);
          }
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    verifySession();

    // Listen for global 401 session expiration events from apiFetch
    const handleSessionExpired = () => {
      console.warn('[Auth] Received global session expired event.');
      logout(false);
    };

    window.addEventListener('canzir_session_expired', handleSessionExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('canzir_session_expired', handleSessionExpired);
    };
  }, [logout]);

  const login = async (email, password) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (res.success && res.user) {
      if (res.token) {
        localStorage.setItem('canzir_token', res.token);
        setToken(res.token);
      }
      localStorage.setItem('canzir_user', JSON.stringify(res.user));
      setUser(res.user);
      setWishlist(res.user.wishlist?.map(item => item._id || item) || []);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, email, password, phone) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone })
    });

    if (res.success && res.user) {
      if (res.token) {
        localStorage.setItem('canzir_token', res.token);
        setToken(res.token);
      }
      localStorage.setItem('canzir_user', JSON.stringify(res.user));
      setUser(res.user);
      setWishlist(res.user.wishlist?.map(item => item._id || item) || []);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      // Offline fallback wishlist for guests
      setWishlist(prev => {
        const exists = prev.includes(productId);
        const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
        localStorage.setItem('canzir_guest_wishlist', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      const res = await apiFetch('/auth/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId })
      });
      if (res.success) {
        setWishlist(res.wishlist?.map(p => p._id || p) || []);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthReady: !loading,
      isAdmin,
      login,
      register,
      logout,
      updateUser,
      wishlist,
      toggleWishlist,
      isInWishlist,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

