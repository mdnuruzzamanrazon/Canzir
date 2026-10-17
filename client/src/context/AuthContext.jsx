import React, { createContext, useContext, useState, useEffect } from 'react';
import apiFetch from '../utils/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('canzir_token'));
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await apiFetch('/auth/profile');
          if (res.success && res.user) {
            setUser(res.user);
            setWishlist(res.user.wishlist?.map(item => item._id || item) || []);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or network issue:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.success && res.token) {
      localStorage.setItem('canzir_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setWishlist(res.user.wishlist || []);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, email, password, phone) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone })
    });
    if (res.success && res.token) {
      localStorage.setItem('canzir_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setWishlist(res.user.wishlist || []);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('canzir_token');
    setToken(null);
    setUser(null);
    setWishlist([]);
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
      isAdmin,
      login,
      register,
      logout,
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
