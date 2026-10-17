import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    announcement: "🌿 Celebrating Handcrafted Elegance — Free Delivery Across Bangladesh on Orders Over ৳5,000",
    nav: {
      shop: "Shop",
      collections: "Collections",
      ourStory: "Our Story",
      customDesigns: "Custom Designs",
      trackOrder: "Track Order",
      account: "Account",
      cart: "Cart",
      wishlist: "Wishlist",
      searchPlaceholder: "Search lamps, pendant lights, materials..."
    },
    hero: {
      tag: "Handcrafted Luxury Lighting",
      headline: "Bring Nature's Warmth Into Your Home.",
      subtitle: "Masterfully hand-split riverbed bamboo and seasoned timber, transformed by Bangladeshi artisans into radiant ambient lighting for mindful living.",
      exploreBtn: "Explore Collection",
      storyBtn: "Discover Our Story",
      soundOn: "Ambient Sound: On",
      soundOff: "Ambient Sound: Off"
    },
    home: {
      featuredCollections: "Curated Collections",
      featuredSubtitle: "Sculptural forms woven from earth, designed to illuminate your sacred spaces.",
      bestSellers: "Bestselling Fixtures",
      bestSellersSubtitle: "The pieces most cherished by architects, interior designers, and discerning homeowners.",
      craftsmanshipTitle: "Honoring The Artisan Heritage",
      craftsmanshipSubtitle: "Every Canzir lamp represents over 30 hours of meticulous hand-weaving, zero plastic, and sustainable river bamboo harvesting.",
      craftStep1: "Ethical Harvest",
      craftStep1Desc: "Mature 3-year bamboo harvested from Sylhet riverbeds during dry seasons.",
      craftStep2: "Natural Seasoning",
      craftStep2Desc: "Smoked & sun-cured for 60 days to prevent pest infestation without chemicals.",
      craftStep3: "Artisan Weaving",
      craftStep3Desc: "Hand-split into millimeter-thin strands and interlaced by master weavers.",
      craftStep4: "Cold-Pressed Polish",
      craftStep4Desc: "Finished with pure organic linseed oil and beeswax to seal natural moisture.",
      shopTheRoom: "Interactive Living Room",
      shopTheRoomSubtitle: "Click on any fixture to see details and bring the warmth into your space.",
      lightingQuizTitle: "Find Your Perfect Light",
      lightingQuizSubtitle: "Not sure which light fits your room? Answer 3 quick questions for tailored recommendations.",
      lightingQuizBtn: "Start Lighting Quiz",
      testimonialsTitle: "Voices of Warmth",
      testimonialsSubtitle: "How Canzir fixtures transform living rooms, bedrooms, and retreats across Bangladesh.",
      instagramTitle: "Canzir in Mindful Spaces",
      instagramSubtitle: "Tag @canzir.decor to have your home featured in our journal.",
      newsletterTitle: "Enter the World of Warmth",
      newsletterSubtitle: "Receive architectural lighting insights, craft journal entries, and 10% off your first commission.",
      subscribeBtn: "Subscribe",
      subscribedSuccess: "Welcome to Canzir. Use code CANZIR10 at checkout."
    },
    shop: {
      title: "Artisanal Lighting Catalog",
      subtitle: "Each piece is handwoven to order or available in limited small batches.",
      filters: "Filter by",
      category: "Category",
      material: "Material",
      lightingStyle: "Lighting Style",
      roomType: "Room Type",
      priceRange: "Price Range",
      inStockOnly: "In Stock Only",
      resetFilters: "Clear Filters",
      sortBy: "Sort by",
      sortFeatured: "Featured",
      sortNewest: "Newest Arrivals",
      sortPriceLow: "Price: Low to High",
      sortPriceHigh: "Price: High to Low",
      sortRating: "Customer Rating",
      quickView: "Quick View",
      addToCart: "Add to Cart",
      outOfStock: "Sold Out"
    },
    product: {
      inStock: "In Stock & Ready to Ship",
      lowStock: "Only {count} Remaining in Small Batch",
      outOfStock: "Currently Made to Order",
      sku: "SKU",
      category: "Category",
      selectVariant: "Select Variant",
      quantity: "Quantity",
      addToCart: "Add to Bag",
      buyNow: "Buy Now",
      addedToCart: "Added to your shopping bag!",
      deliveryNotice: "Standard delivery: 24-48 hours in Dhaka | 3-5 days nationwide",
      craftWarranty: "100% natural materials with lifetime craft structural guarantee",
      materialsDetails: "Materials & Craftsmanship",
      specifications: "Technical Specifications",
      customerReviews: "Customer Reviews",
      writeReview: "Write a Review",
      relatedProducts: "You May Also Love"
    },
    cart: {
      title: "Your Shopping Bag",
      empty: "Your bag is currently empty.",
      emptySubtitle: "Explore our collection of handcrafted bamboo lights.",
      continueShopping: "Continue Shopping",
      subtotal: "Subtotal",
      shipping: "Estimated Shipping",
      shippingCalculated: "Calculated at checkout",
      freeShippingThreshold: "Free shipping unlocked!",
      freeShippingRemaining: "Add {amount} more for free nationwide delivery",
      couponPlaceholder: "Enter promo code (e.g. CANZIR10)",
      applyCoupon: "Apply",
      discount: "Promo Discount",
      total: "Total",
      checkoutBtn: "Proceed to Checkout"
    },
    checkout: {
      title: "Secure Checkout",
      contactInfo: "Delivery & Contact Details",
      fullName: "Full Name",
      phone: "Phone Number (for courier updates)",
      email: "Email Address (optional)",
      address: "Street Address, House/Apartment",
      city: "City / Area",
      district: "District",
      deliveryNotes: "Special Delivery Instructions",
      paymentMethod: "Payment Method",
      cod: "Cash on Delivery",
      codDesc: "Pay in cash when your artisanal fixture arrives at your door.",
      bkash: "bKash Payment",
      bkashDesc: "Send money to Canzir merchant wallet and submit the transaction ID.",
      nagad: "Nagad Payment",
      nagadDesc: "Fast and secure transfer via Nagad wallet.",
      placeOrder: "Place Order Now",
      orderSummary: "Order Summary"
    }
  },
  bn: {
    announcement: "🌿 হস্তশিল্পের মহিমায় সাজুক আপনার ঘর — ৫,০০০ টাকার বেশি অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি",
    nav: {
      shop: "শপ",
      collections: "কালেকশন",
      ourStory: "আমাদের গল্প",
      customDesigns: "কাস্টম ডিজাইন",
      trackOrder: "অর্ডার ট্র্যাক",
      account: "অ্যাকাউন্ট",
      cart: "কার্ট",
      wishlist: "উইশলিস্ট",
      searchPlaceholder: "ল্যাম্প, পেন্ডেন্ট লাইট, ম্যাটেরিয়াল খুঁজুন..."
    },
    hero: {
      tag: "হস্তনির্মিত লাক্সারি লাইটিং",
      headline: "প্রকৃতির উষ্ণতা ছুঁয়ে যাক আপনার ঘরে।",
      subtitle: "সিলেটের নদীমাতৃক বাঁশ ও সেগুন কাঠের মেলবন্ধনে বাংলাদেশি কারিগরদের নিখুঁত হাতে বোনা অ্যাম্বিয়েন্ট লাইটিং।",
      exploreBtn: "কালেকশন দেখুন",
      storyBtn: "আমাদের গল্প জানুন",
      soundOn: "প্রকৃতির সুর: চালু",
      soundOff: "প্রকৃতির সুর: বন্ধ"
    },
    home: {
      featuredCollections: "বিশেষ কালেকশন",
      featuredSubtitle: "প্রাকৃতিক উপাদানে বোনা শিল্পরূপ, যা আপনার ঘরে এনে দেবে স্বর্গীয় প্রশান্তি।",
      bestSellers: "সবচেয়ে জনপ্রিয় ল্যাম্প",
      bestSellersSubtitle: "আর্কিটেক্ট ও ইন্টেরিয়র ডিজাইনারদের প্রথম পছন্দ ক্যানজিরের বিশেষ সৃষ্টিসমূহ।",
      craftsmanshipTitle: "ঐতিহ্যবাহী কারুশিল্পের প্রতি শ্রদ্ধা",
      craftsmanshipSubtitle: "প্রতিটি ক্যানজির ল্যাম্প তৈরিতে ৩০ ঘণ্টারও বেশি হাতের কাজ, সম্পূর্ণ প্লাস্টিকমুক্ত প্রক্রিয়া।",
      craftStep1: "টেকসই সংগ্রহ",
      craftStep1Desc: "সিলেটের নদী উপকূল থেকে পরিপক্ক ৩ বছরের বাঁশ বাছাই করে সংগ্রহ।",
      craftStep2: "প্রাকৃতিক প্রক্রিয়াজাতকরণ",
      craftStep2Desc: "কোনোরূপ ক্ষতিকর কেমিক্যাল ছাড়াই ৬০ দিন ধোঁয়া ও রোদে কিউরিং।",
      craftStep3: "হাতে সূক্ষ্ম বুনন",
      craftStep3Desc: "মিলিমিটার মাপের পাতলা চটায় রূপান্তর ও অভিজ্ঞ তাঁতিদের নিখুঁত বুনন।",
      craftStep4: "অর্গানিক পলিশ",
      craftStep4Desc: "বিশুদ্ধ তিসির তেল ও মোম দিয়ে পরিবেশবান্ধব প্রাকৃতিক ফিনিশিং।",
      shopTheRoom: "ইন্টারেক্টিভ লিভিং রুম",
      shopTheRoomSubtitle: "পছন্দের ল্যাম্পটিতে ক্লিক করে বিস্তারিত দেখুন।",
      lightingQuizTitle: "আপনার ঘরের উপযোগী আলো খুঁজুন",
      lightingQuizSubtitle: "কোন ল্যাম্পটি আপনার ঘরের জন্য সেরা? ৩টি সহজ প্রশ্নের উত্তর দিয়ে জেনে নিন।",
      lightingQuizBtn: "কুইজ শুরু করুন",
      testimonialsTitle: "গ্রাহকদের প্রতিক্রিয়া",
      testimonialsSubtitle: "ক্যানজির ল্যাম্পে যেভাবে আলোকিত হচ্ছে সারা দেশের হাজারো নান্দনিক গৃহকোণ।",
      instagramTitle: "ক্যানজির লাইফস্টাইল",
      instagramSubtitle: "আপনার ঘরের ছবিতে @canzir.decor ট্যাগ করে যুক্ত হোন আমাদের জার্নালে।",
      newsletterTitle: "ক্যানজির পরিবারে স্বাগতম",
      newsletterSubtitle: "ইন্টেরিয়র ডিজাইন টিপস ও নতুন কালেকশনের খবরের সাথে পান প্রথম অর্ডারে ১০% ছাড়।",
      subscribeBtn: "সাবস্ক্রাইব",
      subscribedSuccess: "স্বাগতম! চেকআউটে CANZIR10 কোড ব্যবহার করুন।"
    },
    shop: {
      title: "হস্তনির্মিত লাইটিং ক্যাটালগ",
      subtitle: "প্রতিটি পিস যত্ন সহকারে সীমিত সংখ্যায় অথবা প্রি-অর্ডারে তৈরি হয়।",
      filters: "ফিল্টার",
      category: "ক্যাটাগরি",
      material: "উপাদান",
      lightingStyle: "লাইটিং ধরন",
      roomType: "ঘরের ধরন",
      priceRange: "মূল্য পরিসীমা",
      inStockOnly: "স্টকে আছে এমন",
      resetFilters: "ফিল্টার মুছুন",
      sortBy: "সাজান",
      sortFeatured: "নির্বাচিত",
      sortNewest: "নতুন আগমন",
      sortPriceLow: "দাম: কম থেকে বেশি",
      sortPriceHigh: "দাম: বেশি থেকে কম",
      sortRating: "গ্রাহক রেটিং",
      quickView: "একঝলক দেখুন",
      addToCart: "কার্টে যোগ করুন",
      outOfStock: "স্টক শেষ"
    },
    product: {
      inStock: "স্টকে আছে — দ্রুত ডেলিভারি",
      lowStock: "মাত্র {count}টি অবশিষ্ট আছে",
      outOfStock: "প্রি-অর্ডার অনুযায়ী তৈরি হবে",
      sku: "এসকেইউ",
      category: "ক্যাটাগরি",
      selectVariant: "ভেরিয়েন্ট বেছে নিন",
      quantity: "পরিমাণ",
      addToCart: "ব্যাগে যোগ করুন",
      buyNow: "এখনই কিনুন",
      addedToCart: "আপনার ব্যাগে যোগ করা হয়েছে!",
      deliveryNotice: "ঢাকায় ২৪-৪৮ ঘণ্টা | সারাদেশে ৩-৫ কার্যদিবস",
      craftWarranty: "১০০% প্রাকৃতিক উপাদানে নির্মিত দীর্ঘস্থায়ী হস্তশিল্প",
      materialsDetails: "উপাদান ও কারুকাজ",
      specifications: "টেকনিক্যাল বিবরণ",
      customerReviews: "গ্রাহকদের রিভিউ",
      writeReview: "রিভিউ লিখুন",
      relatedProducts: "আরও পছন্দ হতে পারে"
    },
    cart: {
      title: "আপনার শপিং ব্যাগ",
      empty: "আপনার ব্যাগটি বর্তমানে খালি।",
      emptySubtitle: "আমাদের প্রাকৃতিক হস্তশিল্প লাইটিং কালেকশন ঘুরে দেখুন।",
      continueShopping: "শপিং চালিয়ে যান",
      subtotal: "সাবটোটাল",
      shipping: "আনুমানিক ডেলিভারি চার্জ",
      shippingCalculated: "চেকআউটে নির্ধারিত হবে",
      freeShippingThreshold: "ফ্রি ডেলিভারি আনলক হয়েছে!",
      freeShippingRemaining: "ফ্রি ডেলিভারি পেতে আরও {amount} টাকার অর্ডার করুন",
      couponPlaceholder: "প্রোমো কোড দিন (যেমন CANZIR10)",
      applyCoupon: "প্রয়োগ করুন",
      discount: "প্রোমো ডিসকাউন্ট",
      total: "সর্বমোট",
      checkoutBtn: "চেকআউটে যান"
    },
    checkout: {
      title: "নিরাপদ চেকআউট",
      contactInfo: "যোগাযোগ ও ডেলিভারি তথ্য",
      fullName: "পূর্ণ নাম",
      phone: "মোবাইল নম্বর",
      email: "ইমেইল (ঐচ্ছিক)",
      address: "সম্পূর্ণ ঠিকানা, বাসা/ফ্ল্যাট নম্বর",
      city: "শহর / এলাকা",
      district: "জেলা",
      deliveryNotes: "ডেলিভারি সংক্রান্ত নির্দেশনা",
      paymentMethod: "পেমেন্ট পদ্ধতি",
      cod: "ক্যাশ অন ডেলিভারি (COD)",
      codDesc: "পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।",
      bkash: "বিকাশ পেমেন্ট",
      bkashDesc: "ক্যানজির মার্চেন্ট ওয়ালেটে পেমেন্ট করে ট্রানজেকশন আইডি দিন।",
      nagad: "নগদ পেমেন্ট",
      nagadDesc: "নগদ অ্যাকাউন্টের মাধ্যমে সহজ ও নিরাপদ পেমেন্ট।",
      placeOrder: "অর্ডার নিশ্চিত করুন",
      orderSummary: "অর্ডার সারাংশ"
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('canzir_lang') || 'en');

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'bn' : 'en';
    setLang(nextLang);
    localStorage.setItem('canzir_lang', nextLang);
  };

  const t = translations[lang] || translations.en;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
