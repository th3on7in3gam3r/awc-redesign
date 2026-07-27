export type StoreMinistry = 'youth' | 'men' | 'women';

export type StoreColor = {
  id: string;
  name: string;
  hex: string;
};

export type StoreProduct = {
  id: string;
  ministry: StoreMinistry;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  sizes: string[];
  colors: StoreColor[];
  /** Optional per-color product photos; falls back to imageUrl */
  colorImages?: Partial<Record<string, string>>;
};

export const STORE_MINISTRIES: {
  id: StoreMinistry;
  name: string;
  tagline: string;
  imageUrl: string;
  comingSoon?: boolean;
}[] = [
  {
    id: 'youth',
    name: "Youth's Ministry",
    tagline: 'Bold faith apparel for the next generation.',
    imageUrl: '/images/store/youth-ministry-store.png',
  },
  {
    id: 'men',
    name: "Men's Ministry",
    tagline: 'Brotherhood wear built for strength and service.',
    imageUrl: '/images/store/mens-ministry-store.png',
    comingSoon: true,
  },
  {
    id: 'women',
    name: "Women's Ministry",
    tagline: 'Grace-filled styles for sisters in Christ.',
    imageUrl: '/images/store/womens-ministry-store.png',
    comingSoon: true,
  },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export const STORE_COLORS = {
  burgundy: { id: 'burgundy', name: 'Burgundy', hex: '#4A0404' },
  black: { id: 'black', name: 'Black', hex: '#1a1a1a' },
  white: { id: 'white', name: 'White', hex: '#f5f5f5' },
  navy: { id: 'navy', name: 'Navy', hex: '#1e3a5f' },
  gold: { id: 'gold', name: 'Gold', hex: '#D4AF37' },
  pink: { id: 'pink', name: 'Pink', hex: '#E8A0BF' },
  charcoal: { id: 'charcoal', name: 'Charcoal', hex: '#36454F' },
  heather: { id: 'heather', name: 'Heather Grey', hex: '#9CA3AF' },
  cream: { id: 'cream', name: 'Cream', hex: '#F5E6D3' },
  forest: { id: 'forest', name: 'Forest', hex: '#2D4A3E' },
} as const;

/** Youth + Women: includes pink and cream */
const FEMININE_APPAREL_COLORS: StoreColor[] = [
  STORE_COLORS.burgundy,
  STORE_COLORS.black,
  STORE_COLORS.white,
  STORE_COLORS.navy,
  STORE_COLORS.pink,
  STORE_COLORS.cream,
  STORE_COLORS.heather,
  STORE_COLORS.charcoal,
];

/** Men's apparel: deeper tones, no pink */
const MENS_APPAREL_COLORS: StoreColor[] = [
  STORE_COLORS.burgundy,
  STORE_COLORS.black,
  STORE_COLORS.white,
  STORE_COLORS.navy,
  STORE_COLORS.charcoal,
  STORE_COLORS.forest,
  STORE_COLORS.heather,
];

const CAP_COLORS: StoreColor[] = [
  STORE_COLORS.burgundy,
  STORE_COLORS.black,
  STORE_COLORS.navy,
  STORE_COLORS.gold,
  STORE_COLORS.charcoal,
  STORE_COLORS.forest,
];

const YOUTH_CAP_COLORS: StoreColor[] = [
  STORE_COLORS.burgundy,
  STORE_COLORS.black,
  STORE_COLORS.navy,
  STORE_COLORS.gold,
  STORE_COLORS.pink,
  STORE_COLORS.charcoal,
];

const TOTE_COLORS: StoreColor[] = [
  STORE_COLORS.burgundy,
  STORE_COLORS.black,
  STORE_COLORS.navy,
  STORE_COLORS.pink,
  STORE_COLORS.cream,
  STORE_COLORS.forest,
];

export const STORE_PRODUCTS: StoreProduct[] = [
  // Youth
  {
    id: 'youth-tee-classic',
    ministry: 'youth',
    name: 'Youth Classic Tee',
    description: 'Soft cotton tee with the AWC Youth mark. Everyday comfort for worship, small groups, and hangouts.',
    priceCents: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
    sizes: SIZES,
    colors: FEMININE_APPAREL_COLORS,
    colorImages: {
      burgundy: '/images/store/youth-tee-classic-burgundy.png',
      black: '/images/store/youth-tee-classic-black.png',
      pink: '/images/store/youth-tee-classic-pink.png',
      navy: '/images/store/youth-tee-classic-navy.png',
    },
  },
  {
    id: 'youth-hoodie',
    ministry: 'youth',
    name: 'Youth Faith Hoodie',
    description: 'Cozy midweight hoodie with burgundy accents. Perfect for retreats and Friday night hangouts.',
    priceCents: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
    sizes: SIZES,
    colors: FEMININE_APPAREL_COLORS,
  },
  {
    id: 'youth-cap',
    ministry: 'youth',
    name: 'Youth Snapback',
    description: 'Adjustable snapback with embroidered Youth Ministry crest.',
    priceCents: 2200,
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800',
    sizes: ['One Size'],
    colors: YOUTH_CAP_COLORS,
  },
  {
    id: 'youth-longsleeve',
    ministry: 'youth',
    name: 'Youth Long Sleeve',
    description: 'Breathable long sleeve with subtle gold lettering down the sleeve.',
    priceCents: 3200,
    imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800',
    sizes: SIZES,
    colors: FEMININE_APPAREL_COLORS,
  },
  // Men
  {
    id: 'men-tee-shield',
    ministry: 'men',
    name: "Men's Shield Tee",
    description: 'Heavyweight cotton tee featuring the Men’s Ministry shield. Built for brotherhood gatherings.',
    priceCents: 2800,
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
    sizes: SIZES,
    colors: MENS_APPAREL_COLORS,
    colorImages: {
      burgundy: '/images/store/men-tee-shield-burgundy.png',
      black: '/images/store/men-tee-shield-black.png',
      navy: '/images/store/men-tee-shield-navy.png',
    },
  },
  {
    id: 'men-hoodie',
    ministry: 'men',
    name: "Men's Brotherhood Hoodie",
    description: 'Premium fleece hoodie for mornings of prayer, leadership, and service.',
    priceCents: 4800,
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800',
    sizes: SIZES,
    colors: MENS_APPAREL_COLORS,
  },
  {
    id: 'men-polo',
    ministry: 'men',
    name: "Men's Ministry Polo",
    description: 'Clean burgundy polo with gold crest — sharp enough for Sundays and outreach.',
    priceCents: 3800,
    imageUrl: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc167c?auto=format&fit=crop&q=80&w=800',
    sizes: SIZES,
    colors: MENS_APPAREL_COLORS,
  },
  {
    id: 'men-cap',
    ministry: 'men',
    name: "Men's Dad Cap",
    description: 'Low-profile cap with tonal embroidery. One size fits most.',
    priceCents: 2400,
    imageUrl: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&q=80&w=800',
    sizes: ['One Size'],
    colors: CAP_COLORS,
  },
  // Women
  {
    id: 'women-tee-grace',
    ministry: 'women',
    name: "Women's Grace Tee",
    description: 'Relaxed-fit tee with soft hand-feel and Women’s Ministry wordmark.',
    priceCents: 2600,
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800',
    sizes: SIZES,
    colors: FEMININE_APPAREL_COLORS,
    colorImages: {
      pink: '/images/store/women-tee-grace-pink.png',
      navy: '/images/store/women-tee-grace-navy.png',
    },
  },
  {
    id: 'women-hoodie',
    ministry: 'women',
    name: "Women's Sisterhood Hoodie",
    description: 'Soft fleece hoodie for conferences, prayer nights, and coffee meetups.',
    priceCents: 4600,
    imageUrl: 'https://images.unsplash.com/photo-1578587018452-892baccfd552?auto=format&fit=crop&q=80&w=800',
    sizes: SIZES,
    colors: FEMININE_APPAREL_COLORS,
  },
  {
    id: 'women-tote',
    ministry: 'women',
    name: "Women's Canvas Tote",
    description: 'Sturdy canvas tote with gold print — great for Bibles, journals, and Sunday essentials.',
    priceCents: 2000,
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a67478e?auto=format&fit=crop&q=80&w=800',
    sizes: ['One Size'],
    colors: TOTE_COLORS,
  },
  {
    id: 'women-longsleeve',
    ministry: 'women',
    name: "Women's Long Sleeve",
    description: 'Flattering long sleeve with delicate ministry crest at the chest.',
    priceCents: 3400,
    imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800',
    sizes: SIZES,
    colors: FEMININE_APPAREL_COLORS,
  },
];

export function getProductsByMinistry(ministry: StoreMinistry): StoreProduct[] {
  return STORE_PRODUCTS.filter((p) => p.ministry === ministry);
}

export function getProductById(id: string): StoreProduct | undefined {
  return STORE_PRODUCTS.find((p) => p.id === id);
}

export function getMinistryMeta(id: string) {
  return STORE_MINISTRIES.find((m) => m.id === id);
}

export function getProductColor(product: StoreProduct, colorId: string): StoreColor | undefined {
  return product.colors.find((c) => c.id === colorId);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function isStoreMinistry(value: string): value is StoreMinistry {
  return value === 'youth' || value === 'men' || value === 'women';
}
