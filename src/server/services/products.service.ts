import { CollectionReference, getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp } from 'firebase-admin/app';
import { Product } from '../../types';
import { readFileSync } from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(readFileSync(configPath, 'utf-8'));

if (!getApps().length) {
  try {
    initializeApp({
      projectId: firebaseConfig.projectId,
    });
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
  }
}

const db = getFirestore();
const productsCollection = db.collection('products') as CollectionReference<Product>;

export class ProductsService {
  static async getAll() {
    const snapshot = await productsCollection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id: string) {
    const doc = await productsCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async create(data: Partial<Product>) {
    const docRef = await productsCollection.add({
      ...data,
      created_at: new Date().toISOString(),
    } as any);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  }

  static async update(id: string, data: Partial<Product>) {
    await productsCollection.doc(id).update(data as any);
    const doc = await productsCollection.doc(id).get();
    return { id: doc.id, ...doc.data() };
  }

  static async delete(id: string) {
    await productsCollection.doc(id).delete();
    return true;
  }
}
