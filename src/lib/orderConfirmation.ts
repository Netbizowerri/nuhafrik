import { CartItem, Order } from '../types';

const ORDER_CONFIRMATION_STORAGE_KEY = 'nuhafrik:last-order-confirmation';

export interface StoredOrderConfirmation {
  id: string;
  order_number: string;
  customer: Order['customer'];
  items: CartItem[];
  pricing: Order['pricing'];
  delivery: Order['delivery'];
  payment_method: string;
  status: Order['status'];
  created_at: string;
}

export const saveOrderConfirmation = (order: StoredOrderConfirmation) => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(ORDER_CONFIRMATION_STORAGE_KEY, JSON.stringify(order));
};

export const getStoredOrderConfirmation = (orderId?: string | null) => {
  if (typeof window === 'undefined') return null;

  const raw = window.sessionStorage.getItem(ORDER_CONFIRMATION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredOrderConfirmation;
    if (!orderId || parsed.id === orderId) {
      return parsed;
    }
  } catch (error) {
    console.error('Failed to parse stored order confirmation:', error);
  }

  return null;
};
