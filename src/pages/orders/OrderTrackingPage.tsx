import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { CheckCircle2, ChevronLeft, Clock, MapPin, Package, Phone, Truck } from 'lucide-react';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { BRAND_NAME } from '../../lib/seo';

export const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const title = `Track Your Order | ${BRAND_NAME}`;
  const description = 'Track the current delivery stage of your Nuhafrik order and view key order details.';

  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() } as Order);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return <div className="empty-state page-shell text-[var(--color-text-secondary)]">Loading order status...</div>;
  }

  if (!order) {
    return <div className="empty-state page-shell text-[var(--color-text-secondary)]">Order not found.</div>;
  }

  const stages = [
    { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2, desc: "We've received your order." },
    { id: 'processing', label: 'Processing', icon: Clock, desc: "We're preparing your items." },
    { id: 'shipped', label: 'Shipped', icon: Package, desc: 'Your order is on the way.' },
    { id: 'out_for_delivery', label: 'Out for delivery', icon: Truck, desc: 'Your package is close.' },
    { id: 'delivered', label: 'Delivered', icon: MapPin, desc: 'Your order has arrived.' },
  ];

  const currentStageIndex = stages.findIndex((stage) => stage.id === order.status);

  return (
    <div className="page-shell page-stack">
      <Seo title={title} description={description} path={orderId ? `/orders/${orderId}` : '/orders'} noindex />
      <section className="flex items-center gap-4">
        <button onClick={() => navigate('/orders')} className="btn-base btn-outline btn-sm">
          <ChevronLeft size={16} />
          Back to Orders
        </button>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="surface-card p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
            <div>
              <p className="eyebrow">Track Order</p>
              <h1 className="mt-3 text-3xl font-bold text-[var(--color-text-primary)]">{order.order_number}</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--color-text-secondary)]">Total paid</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-primary)]">{formatCurrency(order.pricing.total)}</p>
            </div>
          </div>

          <div className="mt-8 space-y-8">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isCompleted = index <= currentStageIndex;
              const isCurrent = index === currentStageIndex;

              return (
                <div key={stage.id} className="relative flex gap-4">
                  {index !== stages.length - 1 ? (
                    <div className={cn('absolute left-5 top-11 h-10 w-0.5', index < currentStageIndex ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]')} />
                  ) : null}
                  <div
                    className={cn(
                      'relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      isCompleted ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)]' : 'bg-[var(--color-primary-50)] text-[var(--color-text-muted)]',
                      isCurrent && 'ring-4 ring-[rgba(255,110,25,0.18)]'
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className={cn('text-base font-semibold', isCompleted ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]')}>
                      {stage.label}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{stage.desc}</p>
                    {isCurrent ? <span className="mt-2 inline-flex text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">Current status</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="surface-card p-6">
            <p className="eyebrow">Delivery</p>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 text-[var(--color-primary)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">Address</p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{order.delivery.address || 'Store pickup'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="mt-1 text-[var(--color-primary)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">Phone</p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{order.customer.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <a href="https://wa.me/2348023736786" target="_blank" rel="noopener noreferrer" className="btn-base btn-dark btn-lg w-full justify-center">
            <Phone size={18} />
            Contact Support
          </a>
        </aside>
      </section>
    </div>
  );
};
