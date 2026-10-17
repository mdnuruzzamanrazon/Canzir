import { CustomDesign } from '../models/CustomDesign.js';

export const createCustomInquiry = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      productType,
      material,
      finish,
      dimensions,
      budgetRange,
      referenceImage,
      instructions
    } = req.body;

    if (!name || !phone || !instructions) {
      return res.status(400).json({ message: 'Name, phone number and instructions are required' });
    }

    const inquiryNumber = `CD-${Math.floor(1000 + Math.random() * 9000)}`;

    const inquiry = await CustomDesign.create({
      inquiryNumber,
      name,
      phone,
      email: email || '',
      productType: productType || 'Table Lamp',
      material: material || 'Natural River Bamboo',
      finish: finish || 'Natural Matt Linen Oil',
      dimensions: dimensions || '',
      budgetRange: budgetRange || '৳2,500 - ৳5,000',
      referenceImage: referenceImage || '',
      instructions,
      status: 'Pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Your custom lighting inquiry has been submitted! Our master craft consultant will contact you shortly.',
      inquiry
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCustomInquiries = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;

    const inquiries = await CustomDesign.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, count: inquiries.length, inquiries });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCustomInquiry = async (req, res) => {
  try {
    const { status, quotedPrice, adminNotes } = req.body;
    const inquiry = await CustomDesign.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    if (status) inquiry.status = status;
    if (quotedPrice !== undefined) inquiry.quotedPrice = Number(quotedPrice);
    if (adminNotes !== undefined) inquiry.adminNotes = adminNotes;

    await inquiry.save();
    return res.json({ success: true, inquiry });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
