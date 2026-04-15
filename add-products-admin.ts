import { readFileSync } from 'fs';
import { initializeApp as initializeAdminApp, getApps as getAdminApps } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp as initializeClientApp, getApps as getClientApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getFirestore as getClientFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

type FirebaseAppletConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  firestoreDatabaseId?: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

type ProductSeed = {
  name: string;
  slug: string;
  description: string;
  category_id: string;
  subcategory_id: string;
  tags: string[];
  images: Array<{
    url: string;
    alt: string;
    is_primary: boolean;
  }>;
  pricing: {
    original_price: number;
    selling_price: number;
    is_on_sale: boolean;
  };
  variants: {
    sizes: string[];
    colors: Array<{
      id: string;
      name: string;
      hex: string;
    }>;
  };
  metadata: {
    is_featured: boolean;
    is_new_arrival: boolean;
    is_best_seller: boolean;
  };
  inventory: number;
  published: boolean;
};

const firebaseConfig = JSON.parse(
  readFileSync('./firebase-applet-config.json', 'utf-8')
) as FirebaseAppletConfig;

const products: ProductSeed[] = [
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

const restoreWithAdminSdk = async () => {
  if (!getAdminApps().length) {
    initializeAdminApp({
      projectId: firebaseConfig.projectId,
    });
  }

  const db = getAdminFirestore();
  const productsCollection = db.collection('products');

  console.log('Restoring products with Firebase Admin SDK...');
  for (const product of products) {
    await productsCollection.doc(product.slug).set({
      ...product,
      created_at: FieldValue.serverTimestamp(),
    });
    console.log(`Restored via Admin SDK: ${product.name}`);
  }
};

const restoreWithClientAuth = async () => {
  const email = process.env.NUHAFRIK_ADMIN_EMAIL;
  const password = process.env.NUHAFRIK_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Firebase Admin credentials are unavailable, and client fallback is missing NUHAFRIK_ADMIN_EMAIL or NUHAFRIK_ADMIN_PASSWORD.'
    );
  }

  const clientApp =
    getClientApps().find((app) => app.name === 'product-restore-client') ||
    initializeClientApp(firebaseConfig, 'product-restore-client');
  const auth = getAuth(clientApp);
  const db = getClientFirestore(clientApp, firebaseConfig.firestoreDatabaseId || '(default)');

  console.log(`Signing in as ${email} for product restore...`);
  const credential = await signInWithEmailAndPassword(auth, email, password);

  await setDoc(
    doc(db, 'users', credential.user.uid),
    {
      uid: credential.user.uid,
      email: credential.user.email?.trim().toLowerCase() || email,
      displayName: credential.user.displayName || 'Nuhafrik Owner',
      name: credential.user.displayName || 'Nuhafrik Owner',
      phone: '',
      photoURL: credential.user.photoURL || null,
      role: 'admin',
      updated_at: serverTimestamp(),
    },
    { merge: true }
  );
  console.log('Ensured admin profile exists for the signed-in owner account.');

  console.log('Restoring products with authenticated client SDK fallback...');
  for (const product of products) {
    await setDoc(
      doc(db, 'products', product.slug),
      {
        ...product,
        created_at: serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`Restored via client auth: ${product.name}`);
  }
};

async function addProducts() {
  try {
    await restoreWithAdminSdk();
    console.log(`Finished restoring ${products.length} products with Firebase Admin SDK.`);
    process.exit(0);
  } catch (adminError) {
    console.warn('Firebase Admin SDK restore failed. Falling back to authenticated client restore.');
    console.warn(adminError);
  }

  try {
    await restoreWithClientAuth();
    console.log(`Finished restoring ${products.length} products with authenticated client restore.`);
    process.exit(0);
  } catch (clientError) {
    console.error('Product restore failed for both Admin SDK and client fallback:', clientError);
    process.exit(1);
  }
}

addProducts();
