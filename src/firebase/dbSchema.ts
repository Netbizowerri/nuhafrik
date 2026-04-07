import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  DocumentData,
  CollectionReference
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Order, UserProfile } from '../types';

/**
 * Collection References
 */
const productsRef = collection(db, 'products') as CollectionReference<Product>;
const ordersRef = collection(db, 'orders') as CollectionReference<Order>;
const usersRef = collection(db, 'users') as CollectionReference<UserProfile>;

/**
 * Product CRUD Helpers
 */
export const createProduct = async (data: Omit<Product, 'id' | 'created_at'>) => {
  // Ensure image fields are Base64 strings (handled by UI before calling this)
  const docRef = await addDoc(productsRef, {
    ...data,
    created_at: serverTimestamp()
  } as any);
  return docRef.id;
};

export const getProduct = async (id: string) => {
  const docSnap = await getDoc(doc(db, 'products', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  }
  return null;
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, data as any);
};

export const deleteProduct = async (id: string) => {
  const docRef = doc(db, 'products', id);
  await deleteDoc(docRef);
};

export const listProducts = async (category?: string) => {
  let q = query(productsRef, orderBy('created_at', 'desc'));
  if (category) {
    q = query(q, where('category_id', '==', category));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

/**
 * Order CRUD Helpers
 */
export const createOrder = async (data: Omit<Order, 'id' | 'created_at'>) => {
  const docRef = await addDoc(ordersRef, {
    ...data,
    created_at: serverTimestamp()
  } as any);
  return docRef.id;
};

export const getOrder = async (id: string) => {
  const docSnap = await getDoc(doc(db, 'orders', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Order;
  }
  return null;
};

export const listUserOrders = async (uid: string) => {
  const q = query(ordersRef, where('customer.uid', '==', uid), orderBy('created_at', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

/**
 * User Profile CRUD Helpers
 */
export const createUserProfile = async (uid: string, data: Omit<UserProfile, 'uid'>) => {
  const docRef = doc(db, 'users', uid);
  await setDoc(docRef, { ...data, uid });
};

export const getUserProfile = async (uid: string) => {
  const docSnap = await getDoc(doc(db, 'users', uid));
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, data as any);
};
