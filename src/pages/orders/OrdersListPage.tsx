import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { Package } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { Order } from '../../types';
import { cn, formatCurrency, formatDate } from '../../lib/utils';

export const OrdersListPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'orders'), where('customer.uid', '==', auth.currentUser.uid), orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setOrders(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order)));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="empty-state page-shell text-[var(--color-text-secondary)]">Loading orders...</div>;
  }

  if (!auth.currentUser) {
    return (
      <div className="page-shell empty-state">
        <span className="icon-pill h-20 w-20">
          <Package size={34} />
        </span>
        <h1 className="section-title">Sign in to view your orders.</h1>
        <p className="section-copy text-center">Your order history becomes available once you sign in to your account.</p>
        <Link to="/account" className="text-sm font-semibold text-[var(--color-primary)] underline">
          Sign in now
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page-shell empty-state">
        <span className="icon-pill h-20 w-20">
          <Package size={34} />
        </span>
        <h1 className="section-title">No orders yet.</h1>
        <p className="section-copy text-center">Your completed purchases will appear here once you place an order.</p>
        <Link to="/shop" className="text-sm font-semibold text-[var(--color-primary)] underline">
          Start shopping
        </Link>
      </div>
    );
  }

  const statusColors = {
    confirmed: 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]',
    processing: 'bg-[var(--color-dark-50)] text-[var(--color-dark-600)]',
    shipped: 'bg-[var(--color-primary-100)] text-[var(--color-primary-800)]',
    out_for_delivery: 'bg-[var(--color-primary)] text-[var(--color-text-inverse)]',
    delivered: 'bg-[var(--color-dark)] text-[var(--color-text-inverse)]',
    cancelled: 'bg-[var(--color-dark-100)] text-[var(--color-dark-700)]',
  };

  return (
    <div className="page-shell page-stack">
      <section className="section-heading">
        <p className="eyebrow">My Orders</p>
        <h1 className="page-title">Track every Nuhafrik purchase in one place.</h1>
      </section>

      <section className="space-y-5">
        {orders.map((order) => (
          <Link key={order.id} to={`/orders/${order.id}`} className="surface-card block p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Order Number</p>
                <p className="mt-2 text-xl font-bold text-[var(--color-primary)]">{order.order_number}</p>
              </div>
              <span className={cn('rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em]', statusColors[order.status])}>
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="my-5 flex items-center gap-4 border-y border-[var(--color-border)] py-5">
              <div className="flex -space-x-3 overflow-hidden">
                {order.items.slice(0, 3).map((item, index) => (
                  <img
                    key={index}
                    src={item.image_url}
                    alt=""
                    className="inline-block h-14 w-14 rounded-full border-2 border-[var(--color-surface)] object-cover"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <div>
                <p className="text-base font-semibold text-[var(--color-text-primary)]">
                  {order.items.length} item{order.items.length === 1 ? '' : 's'}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{formatDate(order.created_at?.toDate())}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">Total amount</span>
              <span className="text-2xl font-bold tracking-tight text-[var(--color-primary)]">{formatCurrency(order.pricing.total)}</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
};
