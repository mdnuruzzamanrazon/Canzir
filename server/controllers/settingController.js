import { Setting } from '../models/Setting.js';

export const getSettings = async (req, res) => {
  try {
    const settingsList = await Setting.find({});
    const settings = {};
    settingsList.forEach(s => {
      settings[s.key] = s.value;
    });

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
      deliveryRules: {
        insideDhakaFee: 80,
        outsideDhakaFee: 150,
        freeDeliveryThreshold: 5000,
        insideDhakaEst: '1 to 2 business days',
        outsideDhakaEst: '3 to 5 business days'
      },
      contact: {
        phone: "+880 1712-345678",
        email: "concierge@canzir.com",
        address: "Artisan Studio, Road 11, Banani, Dhaka 1213",
        whatsapp: "+8801712345678"
      },
      paymentChannels: [
        {
          id: 'cod',
          name: 'Cash On Delivery',
          provider: 'Cash on Delivery',
          serviceBank: 'Courier Cash Collection',
          operation: 'Cash on Delivery',
          account: 'Courier Collection at Doorstep',
          status: 'Active',
          instructions: 'Pay in cash upon doorstep delivery after inspecting the artisan packaging.'
        },
        {
          id: 'bkash',
          name: 'bKash Merchant Pay',
          provider: 'bKash',
          serviceBank: 'bKash Merchant Portal',
          operation: 'Merchant Payment / Send Money',
          account: '01712-345678',
          status: 'Active',
          instructions: 'Dial *247# or open bKash App, choose Make Payment to 01712-345678, enter Order Number as Reference.'
        },
        {
          id: 'nagad',
          name: 'Nagad Direct Wallet',
          provider: 'Nagad',
          serviceBank: 'Nagad Islamic / General',
          operation: 'Merchant Payment',
          account: '01712-345678',
          status: 'Active',
          instructions: 'Pay via Nagad App to official Canzir atelier merchant wallet and save the Transaction ID.'
        },
        {
          id: 'rocket',
          name: 'Rocket DBBL',
          provider: 'Rocket',
          serviceBank: 'Dutch-Bangla Bank',
          operation: 'Personal Wallet',
          account: '01712-345678-4',
          status: 'Active',
          instructions: 'Rocket mobile banking payment to official studio line.'
        },
        {
          id: 'bank',
          name: 'BRAC Bank Corporate',
          provider: 'Bank Transfer',
          serviceBank: 'BRAC Bank Ltd',
          operation: 'Direct Deposit / BEFTN / NPSB',
          account: '1501204892001 (Banani Branch)',
          status: 'Active',
          instructions: 'Account Name: Canzir Atelier Ltd | Branch: Banani | Routing: 060260489'
        }
      ],
      emailSettings: {
        storeEmail: 'concierge@canzir.com',
        claimExpiryDays: 90,
        notifyOnNewOrder: true,
        notifyOnShipped: true,
        notifyOnDelivery: true,
        supportPhone: '+880 1712-345678'
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
