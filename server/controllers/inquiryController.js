import { Inquiry } from '../models/Inquiry.js';

export const createInquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    const inquiry = await Inquiry.create({ name, email, phone, subject, message });
    return res.status(201).json({ success: true, message: 'Message sent successfully. We will be in touch shortly!', inquiry });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, count: inquiries.length, inquiries });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    inquiry.status = status;
    await inquiry.save();
    return res.json({ success: true, inquiry });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
