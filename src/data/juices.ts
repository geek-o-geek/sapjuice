export type Juice = {
  id: string;
  name: string;
  description: string;
  tagline: string;
  price: number;
  emoji: string;
  imageUri: string;
};

export const juices: Juice[] = [
  {
    id: '1',
    name: 'Green Detox',
    description: 'Spinach, kale, apple, lemon',
    tagline: 'Reset & recharge • Our bestseller',
    price: 299,
    emoji: '🥬',
    imageUri: 'https://images.unsplash.com/photo-1621506283137-4c4b1638bf4e?w=200&q=80',
  },
  {
    id: '2',
    name: 'Tropical Boost',
    description: 'Mango, pineapple, orange',
    tagline: 'Sunshine in a bottle • Vitamin C packed',
    price: 249,
    emoji: '🍍',
    imageUri: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&q=80',
  },
  {
    id: '3',
    name: 'Berry Bliss',
    description: 'Strawberry, blueberry, banana',
    tagline: 'Antioxidant powerhouse • Sweet & smooth',
    price: 279,
    emoji: '🫐',
    imageUri: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=200&q=80',
  },
  {
    id: '4',
    name: 'Citrus Spark',
    description: 'Orange, grapefruit, ginger',
    tagline: 'Zingy & refreshing • Energy boost',
    price: 229,
    emoji: '🍊',
    imageUri: 'https://images.unsplash.com/photo-1600272946236-b0d34a650b60?w=200&q=80',
  },
  {
    id: '5',
    name: 'Carrot Glow',
    description: 'Carrot, apple, turmeric',
    tagline: 'Skin radiance • Beta-carotene rich',
    price: 249,
    emoji: '🥕',
    imageUri: 'https://images.unsplash.com/photo-1600272946236-b0d34a650b60?w=200&q=80',
  },
  {
    id: '6',
    name: 'Cool Cucumber',
    description: 'Cucumber, mint, lime',
    tagline: 'Ultra hydrating • Light & crisp',
    price: 199,
    emoji: '🥒',
    imageUri: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=200&q=80',
  },
];
