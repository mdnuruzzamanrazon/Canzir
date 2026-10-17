import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Review } from '../models/Review.js';

export const getProducts = async (req, res) => {
  try {
    const {
      category,
      material,
      roomType,
      lightingStyle,
      minPrice,
      maxPrice,
      inStock,
      search,
      sort = 'featured',
      page = 1,
      limit = 24
    } = req.query;

    const query = {};

    if (category && category !== 'All' && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (material && material !== 'All') {
      query.materials = { $in: [new RegExp(material, 'i')] };
    }

    if (roomType && roomType !== 'All') {
      query.roomType = { $in: [new RegExp(roomType, 'i')] };
    }

    if (lightingStyle && lightingStyle !== 'All') {
      query.lightingStyle = { $regex: new RegExp(lightingStyle, 'i') };
    }

    if (inStock === 'true') {
      query.inStock = true;
      query.stockQuantity = { $gt: 0 };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { shortDescription: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { materials: searchRegex }
      ];
    }

    let sortOptions = { isFeatured: -1, createdAt: -1 };
    if (sort === 'newest') sortOptions = { createdAt: -1 };
    else if (sort === 'price-asc') sortOptions = { price: 1 };
    else if (sort === 'price-desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const featured = await Product.find({ isFeatured: true }).limit(8);
    const bestSellers = await Product.find({ isBestSeller: true }).limit(8);
    const newArrivals = await Product.find({ isNewArrival: true }).limit(8);

    return res.json({
      success: true,
      featured,
      bestSellers,
      newArrivals
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug.toLowerCase() });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await Review.find({ product: product._id, status: 'approved' }).sort({ createdAt: -1 });

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4);

    return res.json({
      success: true,
      product,
      reviews,
      related
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      title,
      category,
      price,
      compareAtPrice,
      shortDescription,
      description,
      images,
      materials,
      dimensions,
      specifications,
      variants,
      stockQuantity,
      isFeatured,
      isBestSeller,
      isNewArrival,
      roomType,
      lightingStyle
    } = req.body;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const sku = `CNZ-${Math.floor(1000 + Math.random() * 9000)}`;

    const product = await Product.create({
      title,
      slug,
      sku,
      category,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      shortDescription,
      description,
      images: Array.isArray(images) ? images : [images],
      materials: Array.isArray(materials) ? materials : (materials ? [materials] : []),
      dimensions: dimensions || {},
      specifications: specifications || {},
      variants: variants || [],
      stockQuantity: Number(stockQuantity) || 10,
      inStock: (Number(stockQuantity) || 10) > 0,
      isFeatured: Boolean(isFeatured),
      isBestSeller: Boolean(isBestSeller),
      isNewArrival: Boolean(isNewArrival),
      roomType: Array.isArray(roomType) ? roomType : (roomType ? [roomType] : ['Living Room']),
      lightingStyle: lightingStyle || 'Warm Ambient Glow'
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    Object.assign(product, req.body);
    if (req.body.stockQuantity !== undefined) {
      product.inStock = Number(req.body.stockQuantity) > 0;
    }

    const updated = await product.save();
    return res.json({ success: true, product: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await Product.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ displayOrder: 1 });
    return res.json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const category = await Category.create({ name, slug, description, image });
    return res.status(201).json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
