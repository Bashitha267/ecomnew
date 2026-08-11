// Data store parameters prepared for seamless Supabase database integration
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
  isNewArrival?: boolean;
  isComingSoon?: boolean;
}

export interface Category {
  id: string;
  title: string;
  buttonText: string;
  image: string;
  link: string;
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

export const PRODUCTS_DATA: Product[] = [
  {
    id: "prod-1",
    name: "Relaxed Twill TENCEL™ Shirt",
    priceAUD: 220,
    primaryImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop",
    rating: 5.0,
    reviewCount: 12,
    category: "Shirts",
    badge: "New Arrival",
    isNewArrival: true,
  },
  {
    id: "prod-2",
    name: "Pinstripe Boxy Shirt",
    priceAUD: 180,
    primaryImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop",
    rating: 5.0,
    reviewCount: 8,
    category: "Shirts",
    badge: "Bestseller",
    isNewArrival: true,
  },
  {
    id: "prod-3",
    name: "Pinstripe Boxy Shirt",
    priceAUD: 180,
    primaryImage: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1000&auto=format&fit=crop",
    rating: 5.0,
    reviewCount: 15,
    category: "Shirts",
    badge: "New Arrival",
    isNewArrival: true,
  },
  {
    id: "prod-4",
    name: "Resort Collar Linen Shirt",
    priceAUD: 195,
    primaryImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop",
    rating: 4.9,
    reviewCount: 6,
    category: "Shirts",
    badge: "Limited Drop",
    isNewArrival: true,
  },
  {
    id: "prod-5",
    name: "Oversized Structured Wool Shirt",
    priceAUD: 240,
    primaryImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    rating: 5.0,
    reviewCount: 10,
    category: "Shirts",
    isNewArrival: true,
  },
  {
    id: "prod-6",
    name: "Minimalist Poplin Overshirt",
    priceAUD: 210,
    primaryImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1000&auto=format&fit=crop",
    rating: 5.0,
    reviewCount: 9,
    category: "Shirts",
    badge: "New Arrival",
    isNewArrival: true,
  },
];

export const COMING_SOON_DATA: Product[] = [
  {
    id: "cs-1",
    name: "Double-Breasted Wool Trench",
    priceAUD: 380,
    primaryImage: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop",
    rating: 5.0,
    reviewCount: 4,
    category: "Outwear",
    badge: "Coming Soon",
    isComingSoon: true,
  },
  {
    id: "cs-2",
    name: "Sculpted Cashmere Knit",
    priceAUD: 290,
    primaryImage: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=1000&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop",
    rating: 5.0,
    reviewCount: 2,
    category: "Knits",
    badge: "Next Drop",
    isComingSoon: true,
  },
  {
    id: "cs-3",
    name: "Architectural Pleated Trouser",
    priceAUD: 260,
    primaryImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1000&auto=format&fit=crop",
    rating: 5.0,
    reviewCount: 5,
    category: "Trousers",
    badge: "Coming Soon",
    isComingSoon: true,
  },
  {
    id: "cs-4",
    name: "Raw Denim Structured Jacket",
    priceAUD: 310,
    primaryImage: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1000&auto=format&fit=crop",
    rating: 4.9,
    reviewCount: 3,
    category: "Jackets",
    badge: "Next Drop",
    isComingSoon: true,
  },
  {
    id: "cs-5",
    name: "Silk Minimalist Slip Dress",
    priceAUD: 340,
    primaryImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop",
    rating: 5.0,
    reviewCount: 7,
    category: "Dresses",
    badge: "Coming Soon",
    isComingSoon: true,
  },
  {
    id: "cs-6",
    name: "Structured Oversized Blazer",
    priceAUD: 410,
    primaryImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop",
    rating: 5.0,
    reviewCount: 6,
    category: "Blazers",
    badge: "Coming Soon",
    isComingSoon: true,
  },
  {
    id: "cs-7",
    name: "Heavyweight Boxy Tee",
    priceAUD: 140,
    primaryImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop",
    rating: 4.8,
    reviewCount: 3,
    category: "Tees",
    badge: "Next Drop",
    isComingSoon: true,
  },
  {
    id: "cs-8",
    name: "Tailored Wide Shorts",
    priceAUD: 185,
    primaryImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop",
    secondaryImage: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop",
    rating: 5.0,
    reviewCount: 5,
    category: "Shorts",
    badge: "Coming Soon",
    isComingSoon: true,
  },
];

export const CATEGORIES_DATA: Category[] = [
  {
    id: "cat-1",
    title: "All Products",
    buttonText: "SHOP ALL",
    image: "/images/cat_shop_all.jpg",
    link: "shop",
  },
  {
    id: "cat-2",
    title: "Tops & Shirts",
    buttonText: "SHOP TOPS",
    image: "/images/cat_shop_tops.jpg",
    link: "shop",
  },
  {
    id: "cat-3",
    title: "Bottoms & Trousers",
    buttonText: "SHOP BOTTOMS",
    image: "/images/cat_shop_bottoms.jpg",
    link: "shop",
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
  // Replace with Supabase later: await supabase.from('community_spotlight').select('*');
  return COMMUNITY_SPOTLIGHT_DATA;
}
