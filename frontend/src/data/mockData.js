// Mock data for SmartFurni

export const categories = [
  { id: 1, name: 'Sofa Set', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop', link: '/category/sofa-sets' },
  { id: 7, name: 'Recliner', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop', link: '/category/recliners' },
  { id: 2, name: 'Bedroom', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop', link: '/category/bedroom-collection' },
  { id: 3, name: 'Dining', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=400&fit=crop', link: '/category/dining-sets' },
  { id: 4, name: 'Storage', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&h=400&fit=crop', link: '/category/storage-collection' },
  { id: 5, name: 'Study & Office', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=400&fit=crop', link: '/category/study-office-collection' },
  { id: 6, name: 'Shoe Racks', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop', link: '/category/shoe-racks' },
  { id: 8, name: 'Sofa Cum Bed', image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=600&h=400&fit=crop', link: '/category/sofa-cum-bed' },
  { id: 9, name: 'Home Temples', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop', link: '/category/home-temples' },
  { id: 10, name: 'Dining Chairs', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&h=400&fit=crop', link: '/category/dining-chairs' },
  { id: 11, name: 'Coffee Tables', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&h=400&fit=crop', link: '/category/coffee-tables' },
  { id: 12, name: 'Mattresses', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop', link: '/category/mattresses-collection' }
];

export const products = [
  {
    id: 1,
    name: 'Adria 2 Seater Recliner',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 2,
    marketPrice: 82500,
    smartFurniPrice: 57990,
    discount: 29,
    category: 'Recliners'
  },
  {
    id: 2,
    name: 'Garud 3 + 2 Sofa Set Mustard Yellow',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 3,
    marketPrice: 75500,
    smartFurniPrice: 49990,
    discount: 33,
    category: 'Sofa Sets'
  },
  {
    id: 3,
    name: 'Hester Sheesham Wood Cane Bed - King Size',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 2,
    marketPrice: 45500,
    smartFurniPrice: 27990,
    discount: 38,
    category: 'Beds'
  },
  {
    id: 4,
    name: 'Olzaa 4 Seater Dining Set with Australian Onyx Marble',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=400&fit=crop',
    rating: 4.8,
    reviews: 5,
    marketPrice: 170500,
    smartFurniPrice: 99950,
    discount: 41,
    category: 'Dining'
  },
  {
    id: 5,
    name: 'Atlanta 4 Seater Dining Set with Cushion',
    image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 1,
    marketPrice: 71000,
    smartFurniPrice: 41990,
    discount: 40,
    category: 'Dining'
  },
  {
    id: 6,
    name: 'Montes 3 + 2 Seater Recliner - Brown',
    image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 1,
    marketPrice: 320500,
    smartFurniPrice: 213990,
    discount: 33,
    category: 'Recliners'
  },
  {
    id: 7,
    name: 'Barolo Dining Table with Australian Onyx - 4 Seater',
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&h=400&fit=crop',
    rating: 4.9,
    reviews: 7,
    marketPrice: 118500,
    smartFurniPrice: 64990,
    discount: 45,
    category: 'Dining'
  },
  {
    id: 8,
    name: 'Suntory Leather 2 Seater Sofa - Ocean Blue',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 1,
    marketPrice: 108500,
    smartFurniPrice: 53990,
    discount: 50,
    category: 'Sofas'
  },
  {
    id: 9,
    name: 'Milano Leatherette Sofa 3 Seater',
    image: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 4,
    marketPrice: 68500,
    smartFurniPrice: 43990,
    discount: 35,
    category: 'Sofas'
  },
  {
    id: 10,
    name: 'Tusker Sheesham Wood Bed - Queen Size',
    image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 7,
    marketPrice: 45500,
    smartFurniPrice: 27990,
    discount: 38,
    category: 'Beds'
  },
  {
    id: 11,
    name: 'Atlanta 6 Seater Dining Set with Cushion',
    image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 1,
    marketPrice: 79500,
    smartFurniPrice: 56990,
    discount: 28,
    category: 'Dining'
  },
  {
    id: 12,
    name: 'Taurus Leather 3 Seater Recliner',
    image: 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 6,
    marketPrice: 200500,
    smartFurniPrice: 99990,
    discount: 50,
    category: 'Recliners'
  },
  {
    id: 13,
    name: 'Oriel Bed in Sheesham Wood - King Size',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 23,
    marketPrice: 30500,
    smartFurniPrice: 16990,
    discount: 44,
    category: 'Beds'
  },
  {
    id: 14,
    name: 'Emilie Leatherette Sofa 3 Seater',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 1,
    marketPrice: 90500,
    smartFurniPrice: 44990,
    discount: 50,
    category: 'Sofas'
  },
  {
    id: 15,
    name: 'Adi Sheesham Wood Bed with Hydraulic Storage',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 23,
    marketPrice: 80500,
    smartFurniPrice: 47990,
    discount: 40,
    category: 'Beds'
  },
  {
    id: 16,
    name: 'Falcon Leatherette Sofa 3 Seater',
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=400&fit=crop',
    rating: 4.9,
    reviews: 3,
    marketPrice: 96500,
    smartFurniPrice: 47990,
    discount: 50,
    category: 'Sofas'
  },
  {
    id: 17,
    name: 'Asiro Sheesham Bedside Table with Single Drawer',
    image: 'https://images.unsplash.com/photo-1542452295551-789a695e7c80?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 1,
    marketPrice: 7500,
    smartFurniPrice: 4490,
    discount: 40,
    category: 'Bedside Tables'
  },
  {
    id: 18,
    name: 'Amara Lower Drawer Bedside Table in Teak Finish',
    image: 'https://images.unsplash.com/photo-1532323544230-7191fd510c59?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 1,
    marketPrice: 12500,
    smartFurniPrice: 6990,
    discount: 44,
    category: 'Bedside Tables'
  },
  {
    id: 19,
    name: 'Zoji Single Drawer Bedside Table in Walnut Finish',
    image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 1,
    marketPrice: 7500,
    smartFurniPrice: 4990,
    discount: 33,
    category: 'Bedside Tables'
  },
  {
    id: 20,
    name: 'OG Upper Drawer Bedside Table in Teak Finish',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop',
    rating: 5.0,
    reviews: 1,
    marketPrice: 9500,
    smartFurniPrice: 5990,
    discount: 36,
    category: 'Bedside Tables'
  }
];

export const features = [
  {
    id: 1,
    icon: 'Truck',
    title: 'Free Shipping',
    description: 'Apply for all orders over ₹10,000'
  },
  {
    id: 2,
    icon: 'RefreshCw',
    title: '7-Day Easy Returns',
    description: 'No questions asked'
  },
  {
    id: 3,
    icon: 'Award',
    title: 'Best Price Guarantee',
    description: 'Up to 40% lower than market price'
  },
  {
    id: 4,
    icon: 'Shield',
    title: 'Up to 5-Year Warranty',
    description: 'Peace of mind, guaranteed'
  }
];

export const navCategories = [
  { name: 'Sofa & Recliners', link: '/category/sofa-recliners' },
  { name: 'Living', link: '/category/living' },
  { name: 'Bedroom', link: '/category/bedroom' },
  { name: 'Storage', link: '/category/storage' },
  { name: 'Dining', link: '/category/dining' },
  { name: 'Reclaimed & Distressed', link: '/category/reclaimed-distressed' },
  { name: 'Mattresses', link: '/category/mattresses' },
  { name: 'Study & Office', link: '/category/study-office' },
  { name: 'Home Temple', link: '/category/home-temple' },
  { name: 'New Launch', link: '/category/new-launch' }
];

export const stores = [
  'Yelahanka (Airport Road)',
  'JP Nagar',
  'Sarjapur',
  'Banaswadi',
  'Hoodi',
  'HSR',
  'RR Nagar',
  'Varthur',
  'Marathahalli',
  'Koramangala',
  'JP Nagar Road',
  'Old Madras Road'
];
