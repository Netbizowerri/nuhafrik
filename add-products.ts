import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
    published: true,
    created_at: serverTimestamp()
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
    published: true,
    created_at: serverTimestamp()
  },
  {
    name: 'Silk Top',
    slug: 'silk-top',
    description: 'Elegant Silk Top for a sophisticated look.',
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
      sizes: ['XXL'],
      colors: []
    },
    metadata: {
      is_featured: true,
      is_new_arrival: true,
      is_best_seller: false
    },
    inventory: 10,
    published: true,
    created_at: serverTimestamp()
  },
  {
    name: 'Long Top',
    slug: 'long-top',
    description: 'Trendy Long Top for a casual yet stylish appearance.',
    category_id: 'Clothing',
    subcategory_id: 'Tops',
    tags: ['long', 'top', 'trendy'],
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
    inventory: 10,
    published: true,
    created_at: serverTimestamp()
  },
  {
    name: 'Chiffon Top',
    slug: 'chiffon-top',
    description: 'Lightweight Chiffon Top available in vibrant colors.',
    category_id: 'Clothing',
    subcategory_id: 'Tops',
    tags: ['chiffon', 'top', 'vibrant'],
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
      sizes: ['XXL'],
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
    inventory: 12,
    published: true,
    created_at: serverTimestamp()
  }
];

async function addProducts() {
  console.log('Starting to add products...');
  for (const product of products) {
    try {
      await setDoc(doc(db, 'products', product.slug), product);
      console.log(`Product "${product.name}" added/updated successfully.`);
    } catch (e) {
      console.error(`Error adding product "${product.name}":`, e);
    }
  }
  console.log('Finished adding products.');
  process.exit(0);
}

addProducts();
