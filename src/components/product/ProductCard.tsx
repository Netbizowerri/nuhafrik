import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { useCartStore } from '../../store/useCartStore';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const addItem = useCartStore((state) => state.addItem);
  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];
  const categoryLabel = product.category_id.replace(/[-_]/g, ' ');

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product_id: product.id,
      name: product.name,
      image_url: primaryImage?.url || '',
      color: product.variants.colors[0]?.name || 'Default',
      size: product.variants.sizes[0] || 'Free Size',
      quantity: 1,
      unit_price: product.pricing.selling_price,
      subtotal: product.pricing.selling_price,
    });
  };

  const badge = (() => {
    if (product.inventory <= 0) return { label: 'Sold Out', className: 'bg-[var(--color-dark-200)] text-[var(--color-dark)]' };
    if (product.inventory <= 5) return { label: 'Low Stock', className: 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]' };
    if (product.pricing.is_on_sale) return { label: 'Sale', className: 'bg-[var(--color-primary)] text-[var(--color-text-inverse)]' };
    if (product.metadata?.is_new_arrival) return { label: 'New', className: 'bg-[var(--color-dark)] text-[var(--color-text-inverse)]' };
    return null;
  })();

  return (
    <article
      className={cn(
        'group surface-card overflow-hidden rounded-[var(--radius-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]',
        className
      )}
    >
      <div className="relative overflow-hidden rounded-b-none rounded-t-[var(--radius-card)]">
        <Link to={`/product/${product.id}`} className="relative block aspect-[3/4] overflow-hidden bg-[var(--color-surface)]">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              className="h-full w-full object-cover transition-transform duration-500 [transition-timing-function:var(--ease-elegant)] group-hover:scale-105"
              referrerPolicy="no-referrer"
              width="800"
              height="1000"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[var(--color-primary-50)] text-sm font-medium text-[var(--color-text-muted)]">
              No image available
            </div>
          )}
        </Link>

        {badge ? (
          <span
            className={cn(
              'absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]',
              badge.className
            )}
          >
            {badge.label}
          </span>
        ) : null}

        <button
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-[rgba(255,250,242,0.88)] text-[var(--color-dark)] backdrop-blur-sm transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          aria-label="Save item"
        >
          <Heart size={18} />
        </button>

        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex translate-y-full flex-col gap-3 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            to={`/product/${product.id}`}
            className="btn-base btn-outline btn-sm justify-center border-white text-white hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]"
          >
            Quick View
          </Link>
          <button
            onClick={handleQuickAdd}
            disabled={product.inventory <= 0}
            className="btn-base btn-primary btn-sm justify-center disabled:bg-[var(--color-primary-200)]"
          >
            <ShoppingBag size={16} />
            Add to Bag
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">{categoryLabel}</p>
        <Link to={`/product/${product.id}`} className="product-title-clamp text-base font-semibold text-[var(--color-text-primary)]">
          {product.name}
        </Link>
        <div className="flex items-end gap-3">
          <span className="text-xl font-bold tracking-[var(--tracking-tight)] text-[var(--color-primary)]">
            {formatCurrency(product.pricing.selling_price)}
          </span>
          {product.pricing.is_on_sale ? (
            <span className="text-sm font-medium text-[var(--color-text-muted)] line-through">
              {formatCurrency(product.pricing.original_price)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
};
