import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Product } from './models/Product.js';
import { Category } from './models/Category.js';
import { Coupon } from './models/Coupon.js';
import { Setting } from './models/Setting.js';
import { Review } from './models/Review.js';

dotenv.config();

const seedData = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/canzir';
    await mongoose.connect(connUri);
    console.log('[Seed] Connected to database');

    // Clear existing
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Coupon.deleteMany({});
    await Setting.deleteMany({});
    await Review.deleteMany({});

    // 1. Seed Users
    const adminUser = await User.create({
      name: 'Canzir Master Administrator',
      email: 'admin@canzir.com',
      password: 'admin123456',
      role: 'admin',
      phone: '+880 1712-345678',
      addresses: [{
        label: 'Studio',
        street: 'Artisan Studio, Road 11',
        city: 'Banani',
        district: 'Dhaka',
        postalCode: '1213',
        isDefault: true
      }]
    });

    const customerUser = await User.create({
      name: 'Nuzhat Chowdhury',
      email: 'customer@canzir.com',
      password: 'customer123456',
      role: 'customer',
      phone: '+880 1819-876543',
      addresses: [{
        label: 'Home',
        street: 'House 42, Road 7, Dhanmondi',
        city: 'Dhaka',
        district: 'Dhaka',
        postalCode: '1205',
        isDefault: true
      }]
    });

    console.log('[Seed] Users created: admin@canzir.com, customer@canzir.com');

    // 2. Seed Categories
    const categories = await Category.insertMany([
      {
        name: 'Bamboo Table Lamps',
        slug: 'bamboo-table-lamps',
        description: 'Intricately woven bamboo table fixtures casting tranquil ambient warmth over your surfaces.',
        image: '/assets/products/bamboo-lattice-table-lamp.jpeg',
        featured: true,
        displayOrder: 1
      },
      {
        name: 'Wooden Wall Lamps',
        slug: 'wooden-wall-lamps',
        description: 'Architectural wall sconces crafted from seasoned timber and bamboo accents.',
        image: '/assets/products/cottage-bamboo-wall-sconce.jpeg',
        featured: true,
        displayOrder: 2
      },
      {
        name: 'Bamboo Pendant Lights',
        slug: 'bamboo-pendant-lights',
        description: 'Suspended organic sculptures that become the radiant focal point of any dining or living room.',
        image: '/assets/products/bamboo-bell-pendant.jpg',
        featured: true,
        displayOrder: 3
      },
      {
        name: 'Floor Lamps',
        slug: 'floor-lamps',
        description: 'Statuesque floor lighting combining graceful bent-bamboo silhouettes with grounding wooden bases.',
        image: '/assets/products/woven-floor-lamp.jpg',
        featured: true,
        displayOrder: 4
      },
      {
        name: 'Wooden Table Lamps',
        slug: 'wooden-table-lamps',
        description: 'Hand-turned solid teak and walnut table lights with artisanal linen accents.',
        image: '/assets/products/minimalist-wooden-lamp.jpg',
        featured: true,
        displayOrder: 5
      },
      {
        name: 'Decorative Ambient Lights',
        slug: 'decorative-ambient-lights',
        description: 'Subtle halo sconces and accent lamps designed to cultivate relaxation and calm.',
        image: '/assets/products/organic-ambient-sconce.jpg',
        featured: true,
        displayOrder: 6
      },
      {
        name: 'Handmade Lampshades',
        slug: 'handmade-lampshades',
        description: 'Modular artisan woven shades to refresh existing fixtures with natural texture.',
        image: '/assets/craftsmanship/artisan-workshop.jpeg',
        featured: true,
        displayOrder: 7
      },
      {
        name: 'Custom Handmade Designs',
        slug: 'custom-handmade-designs',
        description: 'Bespoke commissioned lighting built to your exact spatial and architectural specifications.',
        image: '/assets/products/bamboo-lattice-table-lamp.jpeg',
        featured: true,
        displayOrder: 8
      }
    ]);

    console.log(`[Seed] ${categories.length} Categories created`);

    // 3. Seed Products
    const productsData = [
      {
        title: 'The Heritage Lattice Bamboo Table Lamp',
        slug: 'heritage-lattice-bamboo-table-lamp',
        sku: 'CNZ-TBL-001',
        category: 'Bamboo Table Lamps',
        price: 3200,
        compareAtPrice: 3800,
        rating: 4.9,
        reviewCount: 38,
        inStock: true,
        stockQuantity: 18,
        shortDescription: 'Masterfully hand-split bamboo strips woven into an organic diamond lattice, casting hypnotic warm amber shadows across bedside or living spaces.',
        description: 'The Heritage Lattice Lamp is the soul of Canzir craftsmanship. Each lamp begins with sustainably harvested mature bamboo from the riverbanks of Sylhet, seasoned for 60 days to prevent warping. Master artisans then hand-split each bamboo reed into razor-thin, pliable strips before intertwining them into a gentle barrel silhouette. Emitting a tranquil, golden ambient glow, this lamp transforms any room into a sanctuary of warmth and peace.',
        images: [
          '/assets/products/bamboo-lattice-table-lamp.jpeg',
          '/assets/products/bamboo-bell-pendant.jpg',
          '/assets/craftsmanship/artisan-workshop.jpeg'
        ],
        materials: ['Sustainably Harvested River Bamboo', 'Solid Seasoned Teak Base', 'Braided Jute Cord'],
        dimensions: {
          height: '14.5"',
          width: '9.5"',
          diameter: '9.5"',
          weight: '1.1 kg'
        },
        specifications: {
          bulbType: 'E27 Warm Amber 2200K LED (Included)',
          wattage: '6W Energy Saver',
          voltage: '220V - 240V AC',
          cordLength: '2.0 meters braided natural jute with inline brass switch',
          craftMethod: 'Double-warp diamond weave, organic cold-pressed oil seal'
        },
        variants: [
          {
            name: 'Finish',
            options: [
              { label: 'Natural Golden Bamboo', priceAdjustment: 0, inStock: true },
              { label: 'Smoked Walnut Bamboo', priceAdjustment: 300, inStock: true }
            ]
          },
          {
            name: 'Size',
            options: [
              { label: 'Medium (14.5" Height)', priceAdjustment: 0, inStock: true },
              { label: 'Grand (19" Height)', priceAdjustment: 800, inStock: true }
            ]
          }
        ],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        roomType: ['Living Room', 'Bedroom', 'Study'],
        lightingStyle: 'Warm Ambient Glow'
      },
      {
        title: 'Cottage Slatted Bamboo Wall Sconce',
        slug: 'cottage-slatted-bamboo-wall-sconce',
        sku: 'CNZ-WLL-002',
        category: 'Wooden Wall Lamps',
        price: 2600,
        compareAtPrice: 3100,
        rating: 4.8,
        reviewCount: 24,
        inStock: true,
        stockQuantity: 14,
        shortDescription: 'Architectural cottage-roof silhouette crafted from solid seasoned timber and cylindrical vertical bamboo slats, evoking rustic warmth and nostalgic charm.',
        description: 'Inspired by traditional Bengali thatched village cottages, the Cottage Slatted Wall Sconce combines solid hand-carved mahogany wall mounts with a cantilevered roof and vertical bamboo cylinder. Warm light escapes through each slatted opening, bathing your hallway, dining alcove, or entryway in a calming downward and forward wash of light.',
        images: [
          '/assets/products/cottage-bamboo-wall-sconce.jpeg',
          '/assets/products/bamboo-lattice-table-lamp.jpeg'
        ],
        materials: ['Hand-Carved Mahogany Backplate', 'Vertical Seasoned Bamboo Slats', 'Brass Hanging Hardware'],
        dimensions: {
          height: '16"',
          width: '8.5"',
          diameter: '7"',
          weight: '1.4 kg'
        },
        specifications: {
          bulbType: 'E27 Filament Edison LED (Included)',
          wattage: '4W Vintage Glow',
          voltage: '220V - 240V AC',
          cordLength: 'Hardwired wall-mount with optional plug-in conversion kit',
          craftMethod: 'Joinery mortise & tenon with charred bamboo roof accents'
        },
        variants: [
          {
            name: 'Finish',
            options: [
              { label: 'Rustic Antique Mahogany', priceAdjustment: 0, inStock: true },
              { label: 'Raw Blonde Bamboo', priceAdjustment: 0, inStock: true }
            ]
          }
        ],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        roomType: ['Living Room', 'Hallway', 'Balcony', 'Dining'],
        lightingStyle: 'Diffused Lattice'
      },
      {
        title: 'Artisan Woven Bell Bamboo Pendant',
        slug: 'artisan-woven-bell-bamboo-pendant',
        sku: 'CNZ-PEN-003',
        category: 'Bamboo Pendant Lights',
        price: 4500,
        compareAtPrice: 5200,
        rating: 5.0,
        reviewCount: 19,
        inStock: true,
        stockQuantity: 12,
        shortDescription: 'Generously proportioned bell-shaped hanging pendant light woven by hand, casting mesmerizing lattice patterns over dining tables and kitchen islands.',
        description: 'A striking statement piece that commands admiration, the Artisan Woven Bell Pendant brings organic luxury to modern Scandinavian and Japandi interiors. Handcrafted over 4 days by master weavers, its open lattice allows ample light down onto your dining table while gently filtering ambient warmth throughout the room.',
        images: [
          '/assets/products/bamboo-bell-pendant.jpg',
          '/assets/products/woven-floor-lamp.jpg'
        ],
        materials: ['Fine Slit Natural Bamboo', 'Hand-Forged Antique Brass Canopy', 'Braided Natural Hemp Cable'],
        dimensions: {
          height: '18"',
          width: '20"',
          diameter: '20"',
          weight: '1.8 kg'
        },
        specifications: {
          bulbType: 'E27 LED Globe Warm 2700K (Included)',
          wattage: '9W High-Lumen Ambient',
          voltage: '220V - 240V AC',
          cordLength: '1.5m adjustable suspension cable with ceiling canopy',
          craftMethod: 'Interlocking honeycomb weave, double-reinforced rim'
        },
        variants: [
          {
            name: 'Diameter',
            options: [
              { label: 'Medium 16"', priceAdjustment: 0, inStock: true },
              { label: 'Large 20"', priceAdjustment: 700, inStock: true }
            ]
          },
          {
            name: 'Canopy Finish',
            options: [
              { label: 'Antique Brushed Brass', priceAdjustment: 0, inStock: true },
              { label: 'Matte Charcoal Black', priceAdjustment: 0, inStock: true }
            ]
          }
        ],
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        roomType: ['Dining', 'Living Room', 'Kitchen Island'],
        lightingStyle: 'Warm Ambient Glow'
      },
      {
        title: 'Aura Sculptural Curved Bamboo Floor Lamp',
        slug: 'aura-sculptural-curved-bamboo-floor-lamp',
        sku: 'CNZ-FLR-004',
        category: 'Floor Lamps',
        price: 8800,
        compareAtPrice: 10500,
        rating: 4.9,
        reviewCount: 15,
        inStock: true,
        stockQuantity: 8,
        shortDescription: 'An architectural floor-standing lighting sculpture featuring an elegant crescent bamboo arch anchored in solid turned teak wood.',
        description: 'The Aura Floor Lamp blurs the boundary between functional lighting and fine sculpture. Rising like an arching bamboo reed in the evening breeze, its curved internal bamboo ribs shield a warm diffused light column that washes softly across your favorite reading chair. Grounded on a substantial solid turned teak base, it provides rock-solid stability with effortless elegance.',
        images: [
          '/assets/products/woven-floor-lamp.jpg',
          '/assets/products/bamboo-lattice-table-lamp.jpeg'
        ],
        materials: ['Steam-Bent River Bamboo', 'Solid Turned Teak Base', 'Warm Diffusion Core'],
        dimensions: {
          height: '62"',
          width: '16"',
          diameter: '12" Base',
          weight: '4.8 kg'
        },
        specifications: {
          bulbType: 'Integrated High-CRI 90+ Warm LED Strip (2400K)',
          wattage: '16W Dimmable',
          voltage: '220V - 240V AC',
          cordLength: '2.5 meters with solid brass floor foot switch',
          craftMethod: 'Heat-assisted curve bending, seamless micro-slat assembly'
        },
        variants: [
          {
            name: 'Finish',
            options: [
              { label: 'Natural Bamboo & Teak', priceAdjustment: 0, inStock: true },
              { label: 'Smoked Walnut & Dark Ash', priceAdjustment: 600, inStock: true }
            ]
          }
        ],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        roomType: ['Living Room', 'Reading Nook', 'Bedroom'],
        lightingStyle: 'Architectural Accent'
      },
      {
        title: 'Nordic Fluted Teak Wood Table Lamp',
        slug: 'nordic-fluted-teak-wood-table-lamp',
        sku: 'CNZ-TBL-005',
        category: 'Wooden Table Lamps',
        price: 3600,
        compareAtPrice: 4200,
        rating: 4.9,
        reviewCount: 29,
        inStock: true,
        stockQuantity: 15,
        shortDescription: 'Fluted solid teak pillar base crowned with an organic pleated natural linen lampshade, offering classic minimalism and soothing, glare-free radiance.',
        description: 'Expertly turned from responsibly reclaimed Chittagong teak, each lamp column features hand-carved vertical flutes that highlight the natural grain and richness of seasoned hardwood. Paired with a tailored accordion pleated shade crafted from unbleached linen, this piece is an instant classic for bedside tables and console credenzas.',
        images: [
          '/assets/products/minimalist-wooden-lamp.jpg',
          '/assets/products/bamboo-lattice-table-lamp.jpeg'
        ],
        materials: ['Solid Chittagong Teak Wood', 'Organic Unbleached Pleated Linen', 'Solid Brass Finial'],
        dimensions: {
          height: '17"',
          width: '11"',
          diameter: '11"',
          weight: '1.9 kg'
        },
        specifications: {
          bulbType: 'E27 Warm White LED (Included)',
          wattage: '7W Warm Ambient',
          voltage: '220V - 240V AC',
          cordLength: '1.8m braided black fabric cord with inline thumb roll switch',
          craftMethod: 'Hand-lathed timber, precision fluted grooves, beeswax polish'
        },
        variants: [
          {
            name: 'Wood Shade',
            options: [
              { label: 'Golden Teak Wood', priceAdjustment: 0, inStock: true },
              { label: 'Smoked Espresso Walnut', priceAdjustment: 400, inStock: true }
            ]
          },
          {
            name: 'Linen Color',
            options: [
              { label: 'Natural Oatmeal Cream', priceAdjustment: 0, inStock: true },
              { label: 'Muted Terracotta', priceAdjustment: 200, inStock: true }
            ]
          }
        ],
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        roomType: ['Bedroom', 'Living Room', 'Study'],
        lightingStyle: 'Warm Ambient Glow'
      },
      {
        title: 'Zen Wave Layered Bamboo Sconce',
        slug: 'zen-wave-layered-bamboo-sconce',
        sku: 'CNZ-WLL-006',
        category: 'Decorative Ambient Lights',
        price: 2900,
        compareAtPrice: 3400,
        rating: 4.8,
        reviewCount: 16,
        inStock: true,
        stockQuantity: 20,
        shortDescription: 'Sculptural curved layers of wafer-thin bamboo veneer that wrap around a concealed warm light source, projecting a gentle biophilic halo.',
        description: 'The Zen Wave sconce transforms plain walls into architectural art. Curved ribbons of flexible natural bamboo overlap in an organic swirling wave, hiding the light source while projecting dramatic ambient light cascades upward and downward. Perfect for modern corridors, dining backdrops, or headboard lighting.',
        images: [
          '/assets/products/organic-ambient-sconce.jpg',
          '/assets/products/cottage-bamboo-wall-sconce.jpeg'
        ],
        materials: ['Multi-ply Flexible Bamboo Veneer', 'Brushed Brass Wall Bracket', 'Internal Diffuser'],
        dimensions: {
          height: '15"',
          width: '7"',
          diameter: '5.5"',
          weight: '0.9 kg'
        },
        specifications: {
          bulbType: 'Integrated Warm Ambient LED Module (2700K)',
          wattage: '8W Eye-Comfort',
          voltage: '220V - 240V AC',
          cordLength: 'Direct wall junction or 2m plug-in cord option',
          craftMethod: 'Veneer steam-molding, organic oil finish'
        },
        variants: [
          {
            name: 'Mounting Style',
            options: [
              { label: 'Direct Wall Hardwire', priceAdjustment: 0, inStock: true },
              { label: 'Plug-in Cord with Brass Switch', priceAdjustment: 250, inStock: true }
            ]
          }
        ],
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
        roomType: ['Hallway', 'Bedroom', 'Living Room'],
        lightingStyle: 'Architectural Accent'
      }
    ];

    const products = await Product.insertMany(productsData);
    console.log(`[Seed] ${products.length} Products created`);

    // 4. Seed Reviews for Products
    const reviewsData = [
      {
        product: products[0]._id,
        userName: 'Tanvir Hossain',
        userEmail: 'tanvir@gmail.com',
        rating: 5,
        comment: 'The craftsmanship on this Heritage Lattice lamp is remarkable! When switched on at night, the shadows on my bedroom wall feel like a luxury resort in Bali or Sylhet. Absolutely worth every taka.',
        verifiedPurchase: true,
        status: 'approved'
      },
      {
        product: products[0]._id,
        userName: 'Ayesha Rahman',
        userEmail: 'ayesha.r@outlook.com',
        rating: 5,
        comment: 'Packaging was 100% plastic-free and arrived safely within 24 hours in Gulshan. Beautiful warm light, solid base, and feels authentic.',
        verifiedPurchase: true,
        status: 'approved'
      },
      {
        product: products[1]._id,
        userName: 'Farhan Kabir',
        userEmail: 'farhan.k@gmail.com',
        rating: 5,
        comment: 'The cottage wall sconce has so much personality! Put two in our dining corridor. Everyone visiting our home asks where we got them.',
        verifiedPurchase: true,
        status: 'approved'
      },
      {
        product: products[2]._id,
        userName: 'Sabrina Mostafa',
        userEmail: 'sabrina.m@gmail.com',
        rating: 5,
        comment: 'The bell pendant above our 6-seater dining table is the showstopper of our new apartment. Truly world-class quality from Canzir.',
        verifiedPurchase: true,
        status: 'approved'
      }
    ];
    await Review.insertMany(reviewsData);
    console.log('[Seed] Reviews created');

    // 5. Seed Coupons
    await Coupon.insertMany([
      {
        code: 'CANZIR10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 2000,
        maxDiscountAmount: 1000,
        isActive: true
      },
      {
        code: 'NATUREWARMTH',
        discountType: 'percentage',
        discountValue: 15,
        minOrderAmount: 3500,
        maxDiscountAmount: 1500,
        isActive: true
      },
      {
        code: 'WELCOME500',
        discountType: 'fixed',
        discountValue: 500,
        minOrderAmount: 4000,
        isActive: true
      }
    ]);
    console.log('[Seed] Coupons created: CANZIR10, NATUREWARMTH, WELCOME500');

    // 6. Seed Settings
    await Setting.create({
      key: 'announcementBar',
      value: {
        enabled: true,
        textEn: "🌿 Celebrating Handcrafted Elegance — Free Delivery Across Bangladesh on Orders Over ৳5,000",
        textBn: "🌿 হস্তশিল্পের মহিমায় সাজুক আপনার ঘর — ৫,০০০ টাকার বেশি অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি"
      }
    });

    console.log('[Seed] Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
