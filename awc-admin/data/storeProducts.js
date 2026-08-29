/**
 * Product catalog for server-side price + color validation.
 * Keep in sync with src/data/storeProducts.ts
 */
export const STORE_PRODUCTS = [
  { id: 'youth-tee-classic', name: 'Youth Classic Tee', priceCents: 2500, colors: ['burgundy', 'black', 'white', 'navy', 'pink', 'cream', 'heather', 'charcoal'] },
  { id: 'youth-hoodie', name: 'Youth Faith Hoodie', priceCents: 4500, colors: ['burgundy', 'black', 'white', 'navy', 'pink', 'cream', 'heather', 'charcoal'] },
  { id: 'youth-cap', name: 'Youth Snapback', priceCents: 2200, colors: ['burgundy', 'black', 'navy', 'gold', 'pink', 'charcoal'] },
  { id: 'youth-longsleeve', name: 'Youth Long Sleeve', priceCents: 3200, colors: ['burgundy', 'black', 'white', 'navy', 'pink', 'cream', 'heather', 'charcoal'] },
  { id: 'men-tee-shield', name: "Men's Shield Tee", priceCents: 2800, colors: ['burgundy', 'black', 'white', 'navy', 'charcoal', 'forest', 'heather'] },
  { id: 'men-hoodie', name: "Men's Brotherhood Hoodie", priceCents: 4800, colors: ['burgundy', 'black', 'white', 'navy', 'charcoal', 'forest', 'heather'] },
  { id: 'men-polo', name: "Men's Ministry Polo", priceCents: 3800, colors: ['burgundy', 'black', 'white', 'navy', 'charcoal', 'forest', 'heather'] },
  { id: 'men-cap', name: "Men's Dad Cap", priceCents: 2400, colors: ['burgundy', 'black', 'navy', 'gold', 'charcoal', 'forest'] },
  { id: 'women-tee-grace', name: "Women's Grace Tee", priceCents: 2600, colors: ['burgundy', 'black', 'white', 'navy', 'pink', 'cream', 'heather', 'charcoal'] },
  { id: 'women-hoodie', name: "Women's Sisterhood Hoodie", priceCents: 4600, colors: ['burgundy', 'black', 'white', 'navy', 'pink', 'cream', 'heather', 'charcoal'] },
  { id: 'women-tote', name: "Women's Canvas Tote", priceCents: 2000, colors: ['burgundy', 'black', 'navy', 'pink', 'cream', 'forest'] },
  { id: 'women-longsleeve', name: "Women's Long Sleeve", priceCents: 3400, colors: ['burgundy', 'black', 'white', 'navy', 'pink', 'cream', 'heather', 'charcoal'] },
];

export const PRODUCT_MAP = Object.fromEntries(
  STORE_PRODUCTS.map((p) => [p.id, p])
);

export const COLOR_NAMES = {
  burgundy: 'Burgundy',
  black: 'Black',
  white: 'White',
  navy: 'Navy',
  gold: 'Gold',
  pink: 'Pink',
  charcoal: 'Charcoal',
  heather: 'Heather Grey',
  cream: 'Cream',
  forest: 'Forest',
};
