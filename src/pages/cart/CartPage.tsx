import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { formatCurrency } from '../../lib/utils';

export const CartPage = () => {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <div className="page-shell empty-state">
        <span className="icon-pill h-20 w-20">
          <ShoppingBag size={34} />
        </span>
        <h1 className="section-title">Your bag is empty.</h1>
        <p className="section-copy text-center">Discover signature Nuhafrik pieces and build a wardrobe with texture, confidence, and movement.</p>
        <Link to="/shop" className="btn-base btn-primary btn-lg">
          Start Shopping
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell page-stack">
      <section className="section-heading">
        <p className="eyebrow">Your Bag</p>
        <h1 className="page-title">Selected pieces ready for checkout.</h1>
        <p className="section-copy">You currently have {items.length} item{items.length > 1 ? 's' : ''} in your shopping bag.</p>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-5">
          {items.map((item) => (
            <div key={`${item.product_id}-${item.size}-${item.color}`} className="surface-card grid gap-5 p-5 md:grid-cols-[7rem_1fr] md:p-6">
              <div className="overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)]">
                <img src={item.image_url} alt={item.name} className="aspect-[3/4] h-full w-full object-cover" referrerPolicy="no-referrer" />
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{item.name}</h2>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                      {item.size} / {item.color}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product_id, item.size, item.color)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.color, Math.max(1, item.quantity - 1))}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary)]"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-10 text-center text-base font-semibold text-[var(--color-text-primary)]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary)]"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-2xl font-bold tracking-tight text-[var(--color-primary)]">{formatCurrency(item.subtotal)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="surface-card summary-card">
          <div>
            <p className="eyebrow">Order Summary</p>
            <h2 className="mt-3 text-2xl font-bold text-[var(--color-text-primary)]">Bag total</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
              <span>Subtotal</span>
              <span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
              <span>Delivery</span>
              <span className="font-semibold text-[var(--color-primary)]">Calculated at checkout</span>
            </div>
            <div className="brand-divider" />
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-[var(--color-text-primary)]">Total</span>
              <span className="text-3xl font-black tracking-tight text-[var(--color-primary)]">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <Link to="/checkout" className="btn-base btn-primary btn-lg w-full justify-center">
            Proceed to Checkout
            <ArrowRight size={18} />
          </Link>

          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            Taxes and delivery fees are calculated at checkout based on your selected delivery method.
          </p>
        </aside>
      </section>
    </div>
  );
};
