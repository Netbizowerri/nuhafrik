import { Product } from '../types';
import { absoluteUrl } from './seo';

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getProductSlug = (product: Pick<Product, 'slug' | 'name' | 'id'>) =>
  (product.slug && product.slug.trim()) || slugify(product.name) || product.id;

export const getCategorySlug = (categoryId: string) => slugify(categoryId || '');

export const getProductPath = (product: Pick<Product, 'slug' | 'name' | 'id' | 'category_id'>) =>
  `/product/${getCategorySlug(product.category_id)}/${getProductSlug(product)}`;

export const getProductUrl = (product: Pick<Product, 'slug' | 'name' | 'id' | 'category_id'>) =>
  absoluteUrl(getProductPath(product));