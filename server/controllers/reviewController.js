import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';

export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment, userName, userEmail } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Product ID, rating and comment are required' });
    }

    const review = await Review.create({
      product: productId,
      userName: userName || (req.user ? req.user.name : 'Verified Customer'),
      userEmail: userEmail || (req.user ? req.user.email : ''),
      rating: Number(rating),
      comment,
      status: 'approved'
    });

    // Update product rating and review count
    const allReviews = await Review.find({ product: productId, status: 'approved' });
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(productId, {
      rating: Number(avgRating.toFixed(1)),
      reviewCount: allReviews.length
    });

    return res.status(201).json({ success: true, review });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, status: 'approved' }).sort({ createdAt: -1 });
    return res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).populate('product', 'title slug images').sort({ createdAt: -1 });
    return res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.status = status;
    await review.save();
    return res.json({ success: true, review });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
