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
      inStock,
      isFeatured,
      isBestSeller,
      isNewArrival,
      roomType,
      lightingStyle,
      sku: userSku
    } = req.body;

    if (!title || !category || price === undefined) {
      return res.status(400).json({ message: 'Title, category, and price are required' });
    }

    // Ensure unique slug
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    let slug = baseSlug || 'artisan-lamp';
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Ensure unique SKU
    let baseSku = userSku ? userSku.toUpperCase().trim() : `CNZ-${Math.floor(1000 + Math.random() * 9000)}`;
    let sku = baseSku;
    let skuCounter = 1;
    while (await Product.findOne({ sku })) {
      sku = `${baseSku}-${skuCounter}`;
      skuCounter++;
    }

    const qty = Number(stockQuantity) >= 0 ? Number(stockQuantity) : 10;
    const available = inStock !== undefined ? Boolean(inStock) : qty > 0;

    const product = await Product.create({
      title: title.trim(),
      slug,
      sku,
      category: category.trim(),
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      shortDescription: shortDescription || 'Artisan handcrafted lighting fixture from Canzir Atelier',
      description: description || 'Handcrafted using natural riverbed bamboo and seasoned timber for a warm, tranquil ambient glow.',
      images: Array.isArray(images) && images.length ? images : ['/assets/products/bamboo-lattice-table-lamp.jpeg'],
      materials: Array.isArray(materials)
        ? materials
        : (typeof materials === 'string' ? materials.split(',').map(s => s.trim()).filter(Boolean) : ['Natural River Bamboo']),
      dimensions: dimensions || { height: '14"', width: '10"', diameter: '10"', weight: '1.2 kg' },
      specifications: specifications || {
        bulbType: 'E27 Warm Amber LED (Included)',
        wattage: '5W - 9W',
        voltage: '220V - 240V AC',
        cordLength: '1.8 meters woven braided cord with inline switch',
        craftMethod: 'Hand-split bamboo lattice, artisan woven'
      },
      variants: variants || [
        {
          name: 'Finish',
          options: [
            { label: 'Natural Riverbed Bamboo', priceAdjustment: 0, inStock: true },
            { label: 'Smoked Walnut Heat Cure', priceAdjustment: 350, inStock: true }
          ]
        }
      ],
      stockQuantity: qty,
      inStock: available,
      isFeatured: Boolean(isFeatured),
      isBestSeller: Boolean(isBestSeller),
      isNewArrival: Boolean(isNewArrival),
      roomType: Array.isArray(roomType)
        ? roomType
        : (typeof roomType === 'string' ? roomType.split(',').map(s => s.trim()).filter(Boolean) : ['Living Room', 'Dining']),
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

    if (req.body.title !== undefined) product.title = req.body.title.trim();
    if (req.body.category !== undefined) product.category = req.body.category.trim();
    if (req.body.price !== undefined) product.price = Number(req.body.price);
    if (req.body.compareAtPrice !== undefined) {
      product.compareAtPrice = req.body.compareAtPrice ? Number(req.body.compareAtPrice) : null;
    }
    if (req.body.stockQuantity !== undefined) {
      product.stockQuantity = Math.max(0, Number(req.body.stockQuantity));
      if (req.body.inStock === undefined) {
        product.inStock = product.stockQuantity > 0;
      }
    }
    if (req.body.inStock !== undefined) product.inStock = Boolean(req.body.inStock);
    if (req.body.shortDescription !== undefined) product.shortDescription = req.body.shortDescription;
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.images !== undefined) {
      product.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }
    if (req.body.materials !== undefined) {
      product.materials = Array.isArray(req.body.materials)
        ? req.body.materials
        : (typeof req.body.materials === 'string' ? req.body.materials.split(',').map(s => s.trim()).filter(Boolean) : []);
    }
    if (req.body.dimensions !== undefined) {
      product.dimensions = { ...product.dimensions, ...req.body.dimensions };
    }
    if (req.body.specifications !== undefined) {
      product.specifications = { ...product.specifications, ...req.body.specifications };
    }
    if (req.body.variants !== undefined) product.variants = req.body.variants;
    if (req.body.roomType !== undefined) {
      product.roomType = Array.isArray(req.body.roomType)
        ? req.body.roomType
        : (typeof req.body.roomType === 'string' ? req.body.roomType.split(',').map(s => s.trim()).filter(Boolean) : []);
    }
    if (req.body.lightingStyle !== undefined) product.lightingStyle = req.body.lightingStyle;
    if (req.body.isFeatured !== undefined) product.isFeatured = Boolean(req.body.isFeatured);
    if (req.body.isBestSeller !== undefined) product.isBestSeller = Boolean(req.body.isBestSeller);
    if (req.body.isNewArrival !== undefined) product.isNewArrival = Boolean(req.body.isNewArrival);
    if (req.body.sku !== undefined && req.body.sku.trim()) product.sku = req.body.sku.toUpperCase().trim();

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
    return res.json({ success: true, message: `Product "${product.title}" deleted successfully` });
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
    const { name, description, image, displayOrder } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const category = await Category.create({ name, slug, description, image, displayOrder: displayOrder || 0 });
    return res.status(201).json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description, image, displayOrder, isActive } = req.body;
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    if (name) {
      cat.name = name;
      cat.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (description !== undefined) cat.description = description;
    if (image !== undefined) cat.image = image;
    if (displayOrder !== undefined) cat.displayOrder = displayOrder;
    if (isActive !== undefined) cat.isActive = isActive;
    await cat.save();
    return res.json({ success: true, category: cat });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const quickUpdateStock = async (req, res) => {
  try {
    const { stockQuantity, delta } = req.body;
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ message: 'Product not found' });

    if (delta !== undefined) {
      prod.stockQuantity = Math.max(0, prod.stockQuantity + Number(delta));
    } else if (stockQuantity !== undefined) {
      prod.stockQuantity = Math.max(0, Number(stockQuantity));
    }
    prod.inStock = prod.stockQuantity > 0;
    await prod.save();
    return res.json({ success: true, product: prod });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

