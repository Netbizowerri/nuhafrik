import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin using the same pattern as the server
if (!getApps().length) {
  try {
    initializeApp();
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    process.exit(1);
  }
}

const db = getFirestore();
const productsCollection = db.collection('products');

const products = [
  {
    name: 'Organza Poker dot Top',
    slug: 'organza-poker-dot-top',
    description: 'Beautiful Organza Poker dot Top for a stylish look.',
    category_id: 'Clothing',
    subcategory_id: 'Tops',
    tags: ['organza', 'poker-dot', 'top'],
    images: [
      {
        url: 'https://i.ibb.co/MygMrM7Y/Organza-Poker-Dot-Top.jpg',
        alt: 'Organza Poker dot Top',
        is_primary: true
      }
    ],
    pricing: {
      original_price: 12000,
      selling_price: 12000,
      is_on_sale: false
    },
    variants: {
      sizes: ['L'],
      colors: []
    },
    metadata: {
      is_featured: true,
      is_new_arrival: true,
      is_best_seller: false
    },
    inventory: 10,
    published: true
  },
  {
    name: 'Cotton Tops',
    slug: 'cotton-tops',
    description: 'Comfortable Cotton Tops available in multiple colors.',
    category_id: 'Clothing',
    subcategory_id: 'Tops',
    tags: ['cotton', 'top', 'casual'],
    images: [
      {
        url: 'https://i.ibb.co/wrx1CXnC/Ladies-Wears3.jpg',
        alt: 'Cotton Tops',
        is_primary: true
      }
    ],
    pricing: {
      original_price: 16000,
      selling_price: 16000,
      is_on_sale: false
    },
    variants: {
      sizes: ['XL', 'XXL'],
      colors: [
        { id: 'red', name: 'Red', hex: '#FF0000' },
        { id: 'white', name: 'White', hex: '#FFFFFF' },
        { id: 'blue', name: 'Blue', hex: '#0000FF' }
      ]
    },
    metadata: {
      is_featured: true,
      is_new_arrival: true,
      is_best_seller: false
    },
    inventory: 15,
    published: true
  },
  {
    name: 'Silk Top',
    slug: 'silk-top',
    description: 'Elegant Silk Top for special occasions.',
    category_id: 'Clothing',
    subcategory_id: 'Tops',
    tags: ['silk', 'top', 'elegant'],
    images: [
      {
        url: 'https://i.ibb.co/FkVM81FG/Whats-App-Image-2026-04-07-at-2-00-39-AM.jpg',
        alt: 'Silk Top',
        is_primary: true
      }
    ],
    pricing: {
      original_price: 16000,
      selling_price: 16000,
      is_on_sale: false
    },
    variants: {
      sizes: ['2XL'],
      colors: []
    },
    metadata: {
      is_featured: true,
      is_new_arrival: true,
      is_best_seller: false
    },
    inventory: 12,
    published: true
  },
  {
    name: 'Long Top',
    slug: 'long-top',
    description: 'Stylish Long Top for a modern look.',
    category_id: 'Clothing',
    subcategory_id: 'Tops',
    tags: ['long', 'top', 'modern'],
    images: [
      {
        url: 'https://i.ibb.co/XZ4Yz8TX/Whats-App-Image-2026-04-07-at-2-02-16-AM.jpg',
        alt: 'Long Top',
        is_primary: true
      }
    ],
    pricing: {
      original_price: 12000,
      selling_price: 12000,
      is_on_sale: false
    },
    variants: {
      sizes: ['XL'],
      colors: []
    },
    metadata: {
      is_featured: true,
      is_new_arrival: true,
      is_best_seller: false
    },
    inventory: 8,
    published: true
  },
  {
    name: 'Chiffon Top',
    slug: 'chiffon-top',
    description: 'Lightweight Chiffon Top available in vibrant colors.',
    category_id: 'Clothing',
    subcategory_id: 'Tops',
    tags: ['chiffon', 'top', 'colorful'],
    images: [
      {
        url: 'https://i.ibb.co/1xJYqCb/Ladies-Wears5.jpg',
        alt: 'Chiffon Top',
        is_primary: true
      }
    ],
    pricing: {
      original_price: 20000,
      selling_price: 20000,
      is_on_sale: false
    },
    variants: {
      sizes: ['2XL'],
      colors: [
        { id: 'red', name: 'Red', hex: '#FF0000' },
        { id: 'white', name: 'White', hex: '#FFFFFF' },
        { id: 'pink', name: 'Pink', hex: '#FFC0CB' }
      ]
    },
    metadata: {
      is_featured: true,
      is_new_arrival: true,
      is_best_seller: false
    },
    inventory: 20,
    published: true
  }
];

async function addProducts() {
  console.log('Starting to add products with admin SDK...');
  for (const product of products) {
    try {
      await productsCollection.doc(product.slug).set({
        ...product,
        created_at: FieldValue.serverTimestamp()
      });
      console.log(`Product "${product.name}" added/updated successfully.`);
    } catch (e) {
      console.error(`Error adding product "${product.name}":`, e);
    }
  }
  console.log('Finished adding products.');
  process.exit(0);
}

addProducts();
