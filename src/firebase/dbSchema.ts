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
import { db, isConfiguredAdminEmail } from './config';
import { Product, Order, UserProfile } from '../types';

/**
 * Collection References
 */
const productsRef = collection(db, 'products') as CollectionReference<Product>;
const ordersRef = collection(db, 'orders') as CollectionReference<Order>;
const usersRef = collection(db, 'users') as CollectionReference<UserProfile>;

const ensureProductPayload = (data: Partial<Product>) => {
  if (!data.name?.trim()) {
    throw new Error('Product name is required.');
  }

  if (!data.description?.trim()) {
    throw new Error('Product description is required.');
  }

  if (!data.category_id?.trim()) {
    throw new Error('Product category is required.');
  }

  if (!Array.isArray(data.images)) {
    throw new Error('Product images must be provided as an array.');
  }
};

const ensureProductUpdatePayload = (data: Partial<Product>) => {
  if ('name' in data && !data.name?.trim()) {
    throw new Error('Product name cannot be empty.');
  }

  if ('description' in data && !data.description?.trim()) {
    throw new Error('Product description cannot be empty.');
  }

  if ('category_id' in data && !data.category_id?.trim()) {
    throw new Error('Product category cannot be empty.');
  }

  if ('images' in data && !Array.isArray(data.images)) {
    throw new Error('Product images must be provided as an array.');
  }
};

const ensureOrderPayload = (data: Partial<Order>) => {
  if (!data.customer?.uid?.trim()) {
    throw new Error('Order customer uid is required.');
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('Order items are required.');
  }
};

const normalizeUserProfile = (
  uid: string,
  data: Partial<UserProfile> & Pick<UserProfile, 'email'>
): UserProfile => {
  const displayName = data.displayName?.trim() || data.name?.trim() || data.email.split('@')[0];

  return {
    uid,
    email: data.email.trim().toLowerCase(),
    displayName,
    name: displayName,
    phone: data.phone?.trim() || '',
    photoURL: data.photoURL || null,
    role: data.role === 'admin' || isConfiguredAdminEmail(data.email) ? 'admin' : 'customer',
  };
};

/**
 * Product CRUD Helpers
 */
export const createProduct = async (data: Omit<Product, 'id' | 'created_at'>) => {
  ensureProductPayload(data);
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
  ensureProductUpdatePayload(data);
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
  ensureOrderPayload(data);
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
  await setDoc(docRef, normalizeUserProfile(uid, data), { merge: true });
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

export const syncUserProfileDocument = async (
  uid: string,
  data: Partial<UserProfile> & Pick<UserProfile, 'email'>
) => {
  const docRef = doc(db, 'users', uid);
  await setDoc(
    docRef,
    {
      ...normalizeUserProfile(uid, data),
      updated_at: serverTimestamp(),
    } as any,
    { merge: true }
  );
};
