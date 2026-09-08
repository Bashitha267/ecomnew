// Carlton Valley Luxury Apparel Data Store & Types

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "2XL";

export interface ProductColorVariant {
  id: string;
  name: string;
  hex?: string;
  swatchImage: string;
  images: string[]; // Up to 6 images for this specific colorway
}

export interface ProductDescription {
  header: string;
  description: string;
  fit: string;
  fabric: string;
  details: string;
}

export interface ShippingSection {
  header: string;
  points: string[];
}

export interface ProductReview {
  id: string;
  reviewerName: string;
  verified: boolean;
  date: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  itemSize?: string;
  itemColor?: string;
  mediaType?: "photo" | "video";
  mediaUrl?: string;
  mediaThumbnail?: string;
  status?: "approved" | "pending" | "rejected";
}

export interface FullProduct {
  id: string;
  name: string;
  priceAUD: number;
  category: string;
  badge?: string;
  inStock: boolean;
  preOrder: boolean;
  targetCountries?: string[];
  sizes: ProductSize[];
  colors: ProductColorVariant[];
  descriptionSection: ProductDescription;
  shippingSections: ShippingSection[];
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  isNewArrival?: boolean;
  isComingSoon?: boolean;
  createdAt: string;
}

// Backward compatibility Product type
export interface Product {
  id: string;
  name: string;
  priceAUD: number;
  primaryImage: string;
  secondaryImage: string;
  rating: number;
  reviewCount: number;
  category: string;
  badge?: string;
  targetCountries?: string[];
  isNewArrival?: boolean;
  isComingSoon?: boolean;
}

export interface Category {
  id: string;
  title: string;
  buttonText: string;
  image: string;
  link: string;
  itemCount?: number;
  description?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  priceAUD: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  totalAUD: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: OrderItem[];
  shippingAddress: string;
  country?: string;
  district?: string;
  paymentMethod: string;
  trackingNumber?: string;
}

export interface EditorialBanner {
  id: string;
  subtitle: string;
  headline: string;
  image: string;
}

export interface CommunitySpotlight {
  id: string;
  username: string;
  image: string;
  productTagged?: string;
}

// Seed default shipping rules matching reference UI screenshot (media_1787103558286.png)
export const DEFAULT_SHIPPING_SECTIONS: ShippingSection[] = [
  {
    header: "Shipping",
    points: [
      "Orders ship from Sydney, Australia",
      "Please allow 1–2 business days for processing",
      "Orders placed before 2pm AEST dispatch same business day (excluding launch days)",
      "Tracking details sent once your order ships",
    ],
  },
  {
    header: "Australia",
    points: [
      "Free standard shipping on orders over $200 AUD",
      "Standard shipping (2–5 business days): $10 AUD",
      "Express Shipping (1–2 business days): $15 AUD",
    ],
  },
];

// Rich default products with up to 6 images per color, sizes XS-2XL, structured descriptions & media reviews
export const INITIAL_FULL_PRODUCTS: FullProduct[] = [
  {
    id: "prod-1",
    name: "Relaxed Twill TENCEL™ Shirt",
    priceAUD: 220,
    category: "Shirts",
    badge: "New Arrival",
    inStock: true,
    preOrder: true,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: [
      {
        id: "col-black",
        name: "Black",
        hex: "#111111",
        swatchImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=300&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
        ],
      },
      {
        id: "col-white",
        name: "Bone White",
        hex: "#F4F2EC",
        swatchImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=1200&auto=format&fit=crop",
        ],
      },
      {
        id: "col-pinstripe",
        name: "Pinstripe Check",
        hex: "#2B3545",
        swatchImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=300&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop",
        ],
      },
    ],
    descriptionSection: {
      header: "Relaxed Twill TENCEL™ Shirt",
      description: "Cut for a relaxed boxy drape, this modern silhouette is crafted from high-density botanical TENCEL™ lyocell twill. Features a fluid handfeel, subtle sheen, and effortless drop shoulder.",
      fit: "Boxy relaxed drape. Designed to sit effortlessly over casual or tailored trousers. Fits true to size for an oversized look.",
      fabric: "100% sustainable TENCEL™ Lyocell, 185 GSM high-twist twill weave.",
      details: "Genuine mother-of-pearl hardware buttons, convertible camp collar, single patch chest pocket, split side gussets, straight tailored hem.",
    },
    shippingSections: DEFAULT_SHIPPING_SECTIONS,
    rating: 5.0,
    reviewCount: 22,
    reviews: [
      {
        id: "rev-1",
        reviewerName: "Darius H.",
        verified: true,
        date: "3/24/2026",
        rating: 5,
        title: "Exceptional quality and drape",
        comment: "Loved the shirt! Has a nice silk like feel. Very light weight especially for summer weather (e.g. 30 degree weather). Defo would wear at the beach and in the city vibes. Wished there was one in black as well!",
        itemSize: "S",
        itemColor: "Black",
        mediaType: "video",
        mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-the-sun-in-a-field-42861-large.mp4",
        mediaThumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=500&auto=format&fit=crop",
        status: "approved",
      },
      {
        id: "rev-2",
        reviewerName: "Marcus K.",
        verified: true,
        date: "3/18/2026",
        rating: 5,
        title: "Perfection in craftsmanship",
        comment: "The TENCEL fabric is unlike anything else on the market. Heavy enough to drape with structure, yet breathes completely in humidity. Customer service was also very responsive.",
        itemSize: "M",
        itemColor: "Bone White",
        mediaType: "photo",
        mediaUrl: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop",
        mediaThumbnail: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=500&auto=format&fit=crop",
        status: "approved",
      },
      {
        id: "rev-3",
        reviewerName: "Julian V.",
        verified: true,
        date: "3/10/2026",
        rating: 5,
        title: "Great everyday luxury piece",
        comment: "Wore this to an art gallery opening in Melbourne and got constant compliments. Highly recommend.",
        itemSize: "L",
        itemColor: "Black",
        status: "approved",
      },
    ],
    isNewArrival: true,
    createdAt: "2026-03-01",
  },
  {
    id: "prod-2",
    name: "Pinstripe Boxy Shirt",
    priceAUD: 180,
    category: "Shirts",
    badge: "Bestseller",
    inStock: true,
    preOrder: false,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      {
        id: "col-navy-stripe",
        name: "Navy Pinstripe",
        hex: "#1A2535",
        swatchImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=300&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1200&auto=format&fit=crop",
        ],
      },
    ],
    descriptionSection: {
      header: "Pinstripe Boxy Shirt",
      description: "Tailored from crisp Japanese cotton poplin with fine architectural pinstripes. Features a modern squared chest and relaxed elbow-length short sleeve.",
      fit: "Relaxed boxy cut with dropped shoulders.",
      fabric: "100% Japanese Cotton Poplin, 160 GSM.",
      details: "Reinforced collar stand, engraved dark horn buttons, clean hidden placket.",
    },
    shippingSections: DEFAULT_SHIPPING_SECTIONS,
    rating: 5.0,
    reviewCount: 8,
    reviews: [
      {
        id: "rev-201",
        reviewerName: "Liam T.",
        verified: true,
        date: "3/20/2026",
        rating: 5,
        comment: "Crisp cotton with fantastic structure. Looks very sharp paired with relaxed trousers.",
        itemSize: "M",
        itemColor: "Navy Pinstripe",
        status: "approved",
      },
    ],
    isNewArrival: true,
    createdAt: "2026-03-05",
  },
  {
    id: "prod-3",
    name: "Resort Collar Linen Shirt",
    priceAUD: 195,
    category: "Shirts",
    badge: "Limited Drop",
    inStock: true,
    preOrder: false,
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: [
      {
        id: "col-linen-sand",
        name: "Sand Beige",
        hex: "#D6C7B2",
        swatchImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop",
        ],
      },
    ],
    descriptionSection: {
      header: "Resort Collar Linen Shirt",
      description: "Airy Normandy flax linen garment-washed for a super soft lived-in feel. Ideal for coastal escapes and high-summer evenings.",
      fit: "Relaxed silhouette with open resort collar.",
      fabric: "100% French Normandy Flax Linen, pre-washed.",
      details: "Notch lapel collar, sustainable wood buttons, straight vent hem.",
    },
    shippingSections: DEFAULT_SHIPPING_SECTIONS,
    rating: 4.9,
    reviewCount: 6,
    reviews: [],
    isNewArrival: true,
    createdAt: "2026-03-08",
  },
  {
    id: "prod-4",
    name: "Architectural Pleated Trouser",
    priceAUD: 260,
    category: "Bottoms & Trousers",
    badge: "New Arrival",
    inStock: true,
    preOrder: false,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      {
        id: "col-charcoal",
        name: "Charcoal Slate",
        hex: "#33373D",
        swatchImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=300&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1200&auto=format&fit=crop",
        ],
      },
    ],
    descriptionSection: {
      header: "Architectural Pleated Trouser",
      description: "Double forward pleats with a dramatic wide taper. Tailored in an all-season wool blend with clean fluid drape.",
      fit: "High rise with deep pleats and sweeping wide leg profile.",
      fabric: "65% Virgin Wool, 35% Lyocell blend.",
      details: "Extended waistband with hook-and-bar closure, rear welt pockets, blind stitched hem.",
    },
    shippingSections: DEFAULT_SHIPPING_SECTIONS,
    rating: 5.0,
    reviewCount: 14,
    reviews: [],
    isNewArrival: true,
    createdAt: "2026-03-02",
  },
  {
    id: "prod-5",
    name: "Oversized Structured Wool Shirt",
    priceAUD: 240,
    category: "Shirts",
    badge: "Bestseller",
    inStock: true,
    preOrder: false,
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: [
      {
        id: "col-olive-wool",
        name: "Deep Olive",
        hex: "#3B4136",
        swatchImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=300&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
        ],
      },
    ],
    descriptionSection: {
      header: "Oversized Structured Wool Shirt",
      description: "Mid-weight merino wool overshirt designed to be worn standalone or layered over fine knitwear.",
      fit: "Structured boxy fit with generous body volume.",
      fabric: "100% Merino Wool, 260 GSM brushed twill.",
      details: "Matte metal snap buttons, dual chest patch pockets with flap, locker loop.",
    },
    shippingSections: DEFAULT_SHIPPING_SECTIONS,
    rating: 5.0,
    reviewCount: 10,
    reviews: [],
    isNewArrival: true,
    createdAt: "2026-03-04",
  },
  {
    id: "prod-6",
    name: "Minimalist Poplin Overshirt",
    priceAUD: 210,
    category: "Shirts",
    badge: "New Arrival",
    inStock: true,
    preOrder: false,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      {
        id: "col-taupe",
        name: "Warm Taupe",
        hex: "#8C8275",
        swatchImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=300&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop",
        ],
      },
    ],
    descriptionSection: {
      header: "Minimalist Poplin Overshirt",
      description: "Clean lines and concealed front placket make this minimalist overshirt a modern wardrobe staple.",
      fit: "Regular straight fit.",
      fabric: "100% Organic Egyptian Cotton Poplin.",
      details: "Concealed front button placket, buttoned cuffs, curved hemline.",
    },
    shippingSections: DEFAULT_SHIPPING_SECTIONS,
    rating: 5.0,
    reviewCount: 9,
    reviews: [],
    isNewArrival: true,
    createdAt: "2026-03-06",
  },
  {
    id: "cs-1",
    name: "Double-Breasted Wool Trench",
    priceAUD: 380,
    category: "Outerwear",
    badge: "Coming Soon",
    inStock: false,
    preOrder: true,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      {
        id: "col-camel",
        name: "Camel",
        hex: "#C19A6B",
        swatchImage: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=300&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop",
        ],
      },
    ],
    descriptionSection: {
      header: "Double-Breasted Wool Trench",
      description: "An iconic statement trench coat featuring a sharp wide lapel, storm flap, and belted waist.",
      fit: "Oversized longline silhouette with raglan sleeves.",
      fabric: "80% Virgin Wool, 20% Cashmere blend.",
      details: "Horn buttons, storm flap, removable tie belt, fully lined with cupro silk.",
    },
    shippingSections: DEFAULT_SHIPPING_SECTIONS,
    rating: 5.0,
    reviewCount: 4,
    reviews: [],
    isComingSoon: true,
    createdAt: "2026-03-10",
  },
  {
    id: "cs-2",
    name: "Sculpted Cashmere Knit",
    priceAUD: 290,
    category: "Knits",
    badge: "Next Drop",
    inStock: false,
    preOrder: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      {
        id: "col-cream-knit",
        name: "Alabaster Cream",
        hex: "#EFECE6",
        swatchImage: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=300&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1200&auto=format&fit=crop",
        ],
      },
    ],
    descriptionSection: {
      header: "Sculpted Cashmere Knit",
      description: "Pure Mongolian cashmere spun into a ribbed crewneck with architectural volume sleeves.",
      fit: "Sculpted relaxed fit.",
      fabric: "100% Grade-A Mongolian Cashmere, 7-gauge knit.",
      details: "Ribbed neckline, drop shoulder contour, seamless tubular cuffs.",
    },
    shippingSections: DEFAULT_SHIPPING_SECTIONS,
    rating: 5.0,
    reviewCount: 2,
    reviews: [],
    isComingSoon: true,
    createdAt: "2026-03-12",
  },
];

// Helper to bridge FullProduct to legacy Product interface
export function mapFullToLegacyProduct(fp: FullProduct): Product {
  const firstColor = fp.colors[0];
  const primary = firstColor?.images[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000";
  const secondary = firstColor?.images[1] || primary;

  return {
    id: fp.id,
    name: fp.name,
    priceAUD: fp.priceAUD,
    primaryImage: primary,
    secondaryImage: secondary,
    rating: fp.rating,
    reviewCount: fp.reviewCount,
    category: fp.category,
    badge: fp.badge,
    isNewArrival: fp.isNewArrival,
    isComingSoon: fp.isComingSoon,
  };
}

export const PRODUCTS_DATA: Product[] = INITIAL_FULL_PRODUCTS.filter(p => !p.isComingSoon).map(mapFullToLegacyProduct);
export const COMING_SOON_DATA: Product[] = INITIAL_FULL_PRODUCTS.filter(p => p.isComingSoon).map(mapFullToLegacyProduct);

export const CATEGORIES_DATA: Category[] = [
  {
    id: "cat-1",
    title: "All Products",
    buttonText: "SHOP ALL",
    image: "/images/cat_shop_all.jpg",
    link: "/shop",
    itemCount: 12,
    description: "Explore the full Carlton Valley seasonal collection.",
  },
  {
    id: "cat-2",
    title: "Tops & Shirts",
    buttonText: "SHOP TOPS",
    image: "/images/cat_shop_tops.jpg",
    link: "/shop?category=Shirts",
    itemCount: 8,
    description: "Relaxed silhouettes, botanical twills, and crisp cotton poplin.",
  },
  {
    id: "cat-3",
    title: "Bottoms & Trousers",
    buttonText: "SHOP BOTTOMS",
    image: "/images/cat_shop_bottoms.jpg",
    link: "/shop?category=Bottoms & Trousers",
    itemCount: 4,
    description: "Architectural pleats, tailored wide legs, and luxury drapery.",
  },
  {
    id: "cat-4",
    title: "Outerwear & Knits",
    buttonText: "SHOP OUTERWEAR",
    image: "/images/editorial_banner.jpg",
    link: "/shop?category=Outerwear",
    itemCount: 3,
    description: "Cashmere knits, structured trenches, and virgin wool layers.",
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-9482",
    customerName: "Ethan Vance",
    customerEmail: "ethan.vance@example.com",
    customerPhone: "+61 412 345 678",
    date: "2026-03-24 14:32",
    totalAUD: 440,
    status: "Processing",
    paymentMethod: "Afterpay",
    shippingAddress: "42 Crown Street, Surry Hills NSW 2010, Australia",
    items: [
      {
        productId: "prod-1",
        productName: "Relaxed Twill TENCEL™ Shirt",
        color: "Black",
        size: "M",
        quantity: 2,
        priceAUD: 220,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=300",
      },
    ],
  },
  {
    id: "ORD-9481",
    customerName: "Chloe Davenport",
    customerEmail: "chloe.d@example.com",
    customerPhone: "+61 488 912 340",
    date: "2026-03-24 11:15",
    totalAUD: 260,
    status: "Shipped",
    paymentMethod: "Credit Card (Stripe)",
    trackingNumber: "AUS-992384102AU",
    shippingAddress: "18 Flinders Lane, Melbourne VIC 3000, Australia",
    items: [
      {
        productId: "prod-4",
        productName: "Architectural Pleated Trouser",
        color: "Charcoal Slate",
        size: "S",
        quantity: 1,
        priceAUD: 260,
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=300",
      },
    ],
  },
  {
    id: "ORD-9480",
    customerName: "Liam Takahashi",
    customerEmail: "liam.t@tokyo-mode.jp",
    date: "2026-03-23 18:40",
    totalAUD: 400,
    status: "Delivered",
    paymentMethod: "PayPal",
    trackingNumber: "DHL-8472910398",
    shippingAddress: "3-12-8 Minami-Aoyama, Minato-ku, Tokyo 107-0062, Japan",
    items: [
      {
        productId: "prod-1",
        productName: "Relaxed Twill TENCEL™ Shirt",
        color: "Bone White",
        size: "L",
        quantity: 1,
        priceAUD: 220,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300",
      },
      {
        productId: "prod-2",
        productName: "Pinstripe Boxy Shirt",
        color: "Navy Pinstripe",
        size: "L",
        quantity: 1,
        priceAUD: 180,
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=300",
      },
    ],
  },
  {
    id: "ORD-9479",
    customerName: "Sienna Rossi",
    customerEmail: "sienna.rossi@studio.com",
    date: "2026-03-22 09:20",
    totalAUD: 180,
    status: "Pending",
    paymentMethod: "Apple Pay",
    shippingAddress: "77 Ocean Ave, Double Bay NSW 2028, Australia",
    items: [
      {
        productId: "prod-2",
        productName: "Pinstripe Boxy Shirt",
        color: "Navy Pinstripe",
        size: "XS",
        quantity: 1,
        priceAUD: 180,
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=300",
      },
    ],
  },
];

export const EDITORIAL_BANNER_DATA: EditorialBanner = {
  id: "banner-1",
  subtitle: "A world already in motion. Start where it's loudest.",
  headline: "Complete the architecture of your style.",
  image: "/images/editorial_banner.jpg",
};

export const COMMUNITY_SPOTLIGHT_DATA: CommunitySpotlight[] = [
  {
    id: "spot-1",
    username: "@alex.carlton",
    image: "/images/community_1.jpg",
    productTagged: "Relaxed Twill TENCEL™ Shirt",
  },
  {
    id: "spot-2",
    username: "@marcus.style",
    image: "/images/community_2.jpg",
    productTagged: "Pinstripe Boxy Shirt",
  },
  {
    id: "spot-3",
    username: "@elena.noir",
    image: "/images/community_3.jpg",
    productTagged: "Architectural Pleated Trouser",
  },
  {
    id: "spot-4",
    username: "@julian.v",
    image: "/images/community_4.jpg",
    productTagged: "Resort Collar Linen Shirt",
  },
  {
    id: "spot-5",
    username: "@sophia.mode",
    image: "/images/community_5.jpg",
    productTagged: "Oversized Structured Wool Shirt",
  },
  {
    id: "spot-6",
    username: "@david.luxe",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop",
    productTagged: "Minimalist Poplin Overshirt",
  },
];

// Helper functions to simulate Supabase API calls
export async function fetchNewArrivals(): Promise<Product[]> {
  return PRODUCTS_DATA.filter((item) => item.isNewArrival);
}

export async function fetchComingSoon(): Promise<Product[]> {
  return COMING_SOON_DATA;
}

export async function fetchCategories(): Promise<Category[]> {
  return CATEGORIES_DATA;
}

export async function fetchEditorialBanner(): Promise<EditorialBanner> {
  return EDITORIAL_BANNER_DATA;
}

export async function fetchCommunitySpotlight(): Promise<CommunitySpotlight[]> {
  return COMMUNITY_SPOTLIGHT_DATA;
}
