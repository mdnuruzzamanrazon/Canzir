import { Question } from '../models/Question.js';
import { Product } from '../models/Product.js';

export const getProductQuestions = async (req, res) => {
  try {
    const questions = await Question.find({
      product: req.params.productId,
      status: 'published'
    }).sort({ createdAt: -1 });
    return res.json({ success: true, count: questions.length, questions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find({})
      .populate('product', 'title slug images')
      .sort({ createdAt: -1 });
    return res.json({ success: true, count: questions.length, questions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { productId, question, customerName, customerEmail, customerPhone } = req.body;
    if (!productId || !question) {
      return res.status(400).json({ message: 'Product and question text are required' });
    }

    const newQuestion = await Question.create({
      product: productId,
      customerName: customerName || (req.user ? req.user.name : 'Customer'),
      customerEmail: customerEmail || (req.user ? req.user.email : ''),
      customerPhone: customerPhone || (req.user ? req.user.phone : ''),
      question,
      status: 'pending'
    });

    return res.status(201).json({ success: true, question: newQuestion });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const answerQuestion = async (req, res) => {
  try {
    const { answer, status = 'published' } = req.body;
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });

    q.answer = answer;
    q.answeredBy = req.user?.name || 'Canzir Concierge';
    q.status = status;
    await q.save();

    return res.json({ success: true, question: q });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const q = await Question.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    return res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
