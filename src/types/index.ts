export interface Product {
  id: string;
  sku?: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  category_id: string;
  subcategory_id: string;
  tags: string[];
  images: ProductImage[];
  pricing: {
    original_price: number;
    selling_price: number;
    is_on_sale: boolean;
    discount_percentage?: number;
  };
  variants: {
    sizes: string[];
    colors: ProductColor[];
  };
  metadata: {
    is_featured: boolean;
    is_new_arrival: boolean;
    is_best_seller: boolean;
  };
  inventory: number;
  published: boolean;
  created_at: any;
}

export interface ProductImage {
  url: string;
  alt: string;
  is_primary: boolean;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  image_url: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer: {
    uid: string;
    name: string;
    phone: string;
    email?: string;
  };
  items: CartItem[];
  pricing: {
    subtotal: number;
    delivery_fee: number;
    discount: number;
    total: number;
    currency: string;
  };
  delivery: {
    method: string;
    address?: string;
    estimated_date: any;
  };
  status: 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  created_at: any;
}

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  role: 'customer' | 'admin';
}
