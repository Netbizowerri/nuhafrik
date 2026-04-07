import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          setOrder(orderDoc.data());
        } else {
          setError('Order not found.');
        }
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.message?.includes('insufficient permissions') ? 'You do not have permission to view this order.' : 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    window.scrollTo(0, 0);
  }, [orderId]);

  if (loading) {
    return <div className="empty-state page-shell text-[var(--color-text-secondary)]">Loading your confirmation...</div>;
  }

  if (error) {
    return (
      <div className="page-shell empty-state">
        <h1 className="section-title">Something went wrong.</h1>
        <p className="section-copy text-center">{error}</p>
        <Link to="/shop" className="text-sm font-semibold text-[var(--color-primary)] underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell page-stack min-h-[80vh] items-center justify-center text-center">
      <motion.div initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="surface-card flex max-w-2xl flex-col items-center p-10 md:p-14">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)]">
          <CheckCircle2 size={52} />
        </div>
        <p className="eyebrow mt-8">Order Confirmed</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-[var(--color-text-primary)]">
          {order?.customer?.name ? `Thank you, ${order.customer.name.split(' ')[0]}.` : 'Thank you for your order.'}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">
          Your Nuhafrik order has been received successfully. We'll update you as soon as your items move into processing and dispatch.
        </p>

        <div className="mt-8 w-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Order Reference</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-[var(--color-primary)]">
            #{order?.order_number || orderId?.slice(-8).toUpperCase()}
          </p>
          <div className="mt-5 flex items-start gap-3 rounded-[var(--radius-lg)] bg-[var(--color-primary-50)] p-4">
            <Package size={18} className="mt-0.5 text-[var(--color-primary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Preparing your order</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">We'll notify you once your package is ready for delivery or pickup.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
          <Link to={`/orders/${orderId}`} className="btn-base btn-primary btn-lg flex-1 justify-center">
            Track My Order
          </Link>
          <Link to="/shop" className="btn-base btn-outline btn-lg flex-1 justify-center">
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
