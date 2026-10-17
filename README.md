# Canzir — Premium Handmade Lighting & Home Decor E-Commerce Platform

> **"Bring Nature's Warmth Into Your Home."**

Canzir is an artisanal e-commerce web platform and luxury interior lighting atelier specializing in handcrafted riverbed bamboo lamps, solid seasoned teak fixtures, woven ambient lampshades, and bespoke architectural commissions.

---

## 🌿 Brand Identity & Design System

- **Brand Name**: Canzir
- **Brand Positioning**: Nature-inspired, sustainable, artisanal lighting and home decor.
- **Palette**:
  - Deep Walnut Brown (`#4A2E20`)
  - Warm Sand (`#D8C0A0`)
  - Natural Bamboo (`#C58B4B`)
  - Cream White (`#FAF6EF`)
  - Charcoal Black (`#24211E`)
  - Muted Olive Green (`#73795A`)
- **Typography**: Editorial serif headings (`Cormorant Garamond`) paired with modern clean sans-serif (`Plus Jakarta Sans`) and Bengali font support (`Hind Siliguri`).
- **Official Brand Mark**: Features the authentic woven bamboo bird emblem carrying a pendant in its beak with hand-carved Canzir logotype.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **State & Contexts**:
  - `LanguageContext`: Seamless English & Bengali (বাংলা) internationalization
  - `CurrencyContext`: BDT (`৳`) and USD (`$`) dynamic conversion
  - `CartContext`: Variant-aware shopping bag, stock validation, auto-shipping, coupon discounts
  - `AuthContext`: JWT-based customer and admin authentication
  - `AudioContext`: Ambient bamboo nature soundscape player
- **Backend**: Node.js, Express.js REST API
- **Database**: MongoDB with Mongoose (Local `127.0.0.1:27017/canzir` + Atlas URI support in `.env`)
- **Security**: JWT tokens, bcryptjs password hashing, role-based authorization, rate limiting & sanitized inputs

---

## 📁 Project Architecture

```
d:/Ai Project/Canzir/
├── client/                     # Vite + React Frontend
│   ├── public/
│   │   └── assets/
│   │       ├── canzir-logo.png # Official brand mark
│   │       ├── products/       # Authentic WhatsApp reference photos & editorial renders
│   │       ├── craftsmanship/  # Artisan workshop weaving imagery
│   │       ├── videos/         # Looping hero pendant & weaving video footage
│   │       └── audio/          # Woven light & bamboo bloom ambient audio tracks
│   ├── src/
│   │   ├── components/         # Navbar, Footer, CartDrawer, SearchModal, QuickView, ProductCard
│   │   ├── context/            # Language, Currency, Auth, Cart, Audio contexts
│   │   ├── pages/              # Home, Shop, Collections, ProductDetail, CustomDesigns, Cart, Checkout, etc.
│   │   │   └── admin/          # Admin Dashboard & Inventory Manager
│   │   ├── utils/api.js        # Universal API fetcher with token injector
│   │   ├── App.jsx             # Master router & modal shell
│   │   └── index.css           # Canzir design system tokens
├── server/                     # Node.js + Express Backend
│   ├── config/db.js            # MongoDB Mongoose connection
│   ├── models/                 # Product, Order, User, Category, CustomDesign, Review, Coupon, Setting
│   ├── controllers/            # REST API business logic & inventory calculations
│   ├── routes/                 # Express route handlers
│   ├── middleware/             # JWT auth protector, admin checker, Multer file upload
│   ├── seed.js                 # Database seeder with authentic products and demo accounts
│   ├── server.js               # Main Express HTTP server
│   └── .env                    # Environment variables
└── package.json                # Project root script launcher
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** (running on `mongodb://127.0.0.1:27017/canzir` or MongoDB Atlas URI)

### 2. Running the Servers
The backend and frontend are already running and configured:
- **Client (Frontend)**: [http://localhost:5173](http://localhost:5173)
- **Server (Backend API)**: [http://localhost:5000](http://localhost:5000)

To start them manually:
```bash
# In server directory:
cd server
npm start

# In client directory:
cd client
npm run dev
```

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Master Admin** | `admin@canzir.com` | `admin123456` |
| **Customer** | `customer@canzir.com` | `customer123456` |

---

## 🛒 Available Promo Codes
- `CANZIR10` — 10% Off Orders over ৳2,000
- `NATUREWARMTH` — 15% Off Orders over ৳3,500
- `WELCOME500` — ৳500 Flat Off Orders over ৳4,000
