import { Setting } from '../models/Setting.js';

export const getSettings = async (req, res) => {
  try {
    const settingsList = await Setting.find({});
    const settings = {};
    settingsList.forEach(s => {
      settings[s.key] = s.value;
    });

    // Defaults if empty
    const defaults = {
      announcementBar: {
        enabled: true,
        textEn: "🌿 Celebrating Handcrafted Elegance — Free Delivery Across Bangladesh on Orders Over ৳5,000",
        textBn: "🌿 হস্তশিল্পের মহিমায় সাজুক আপনার ঘর — ৫,০০০ টাকার বেশি অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি"
      },
      shipping: {
        insideDhaka: 80,
        outsideDhaka: 150,
        freeThreshold: 5000
      },
      contact: {
        phone: "+880 1712-345678",
        email: "concierge@canzir.com",
        address: "Artisan Studio, Road 11, Banani, Dhaka 1213",
        whatsapp: "+8801712345678"
      },
      paymentGateways: {
        cod: true,
        bkash: true,
        nagad: true,
        card: true,
        bkashNumber: "01712-345678 (Merchant)",
        nagadNumber: "01712-345678 (Merchant)"
      }
    };

    return res.json({ success: true, settings: { ...defaults, ...settings } });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ message: 'Setting key is required' });

    let setting = await Setting.findOne({ key });
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Setting.create({ key, value });
    }

    return res.json({ success: true, setting });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
