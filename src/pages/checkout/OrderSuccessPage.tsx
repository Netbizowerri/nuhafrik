import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, CreditCard, Package, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Seo } from '../../components/seo/Seo';
import { BRAND_NAME } from '../../lib/seo';
import { getStoredOrderConfirmation, StoredOrderConfirmation } from '../../lib/orderConfirmation';
import { formatCurrency } from '../../lib/utils';

export const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const title = `Order Confirmation | ${BRAND_NAME}`;
  const description = 'Your Nuhafrik order is confirmed. Review your order reference and next delivery steps.';

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Order reference missing.');
        setLoading(false);
        return;
      }

      const storedOrder = getStoredOrderConfirmation(orderId);
      if (storedOrder) {
        setOrder(storedOrder);
        setLoading(false);
      }

      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
          setError(null);
        } else {
          setError(storedOrder ? null : 'Order not found.');
        }
      } catch (err: any) {
        console.error('Error fetching order:', err);
        if (!storedOrder) {
          setError(err.message?.includes('insufficient permissions') ? 'You do not have permission to view this order.' : 'Failed to load order details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    window.scrollTo(0, 0);
  }, [orderId]);

  if (loading) {
    return (
      <div className="empty-state page-shell text-[var(--color-text-secondary)]">
        <Seo title={title} description={description} path={orderId ? `/checkout/success/${orderId}` : '/checkout/success'} noindex />
        Loading your confirmation...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell empty-state">
        <Seo title={title} description={description} path={orderId ? `/checkout/success/${orderId}` : '/checkout/success'} noindex />
        <h1 className="section-title">Something went wrong.</h1>
        <p className="section-copy text-center">{error}</p>
        <Link to="/shop" className="text-sm font-semibold text-[var(--color-primary)] underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const confirmationOrder = order as StoredOrderConfirmation | null;
  const customerFirstName = confirmationOrder?.customer?.name?.split(' ')[0];
  const paymentLabel = confirmationOrder?.payment_method
    ? confirmationOrder.payment_method.replace(/_/g, ' ')
    : 'Selected method';
  const deliveryLabel = confirmationOrder?.delivery?.method
    ? confirmationOrder.delivery.method.replace(/_/g, ' ')
    : 'Delivery option';

  return (
    <div className="page-shell page-stack min-h-[80vh] items-center justify-center text-center">
      <Seo title={title} description={description} path={orderId ? `/checkout/success/${orderId}` : '/checkout/success'} noindex />
      <motion.div initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="surface-card flex max-w-2xl flex-col items-center p-10 md:p-14">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)]">
          <CheckCircle2 size={52} />
        </div>
        <p className="eyebrow mt-8">Order Confirmed</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-[var(--color-text-primary)]">
          {customerFirstName ? `Thank you, ${customerFirstName}.` : 'Thank you for your order.'}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">
          Your Nuhafrik order has been received successfully. We'll update you as soon as your items move into processing and dispatch.
        </p>

        <div className="mt-8 grid w-full gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Order Reference</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-[var(--color-primary)]">
              #{confirmationOrder?.order_number || orderId?.slice(-8).toUpperCase()}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] bg-[var(--color-primary-50)] p-4">
              <div className="flex items-start gap-3">
                <Package size={18} className="mt-0.5 text-[var(--color-primary)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">Preparing your order</p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {confirmationOrder?.items?.length || 0} item(s) confirmed for fulfillment.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] bg-[var(--color-primary-50)] p-4">
              <div className="flex items-start gap-3">
                <Truck size={18} className="mt-0.5 text-[var(--color-primary)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">Delivery option</p>
                  <p className="mt-1 text-sm capitalize text-[var(--color-text-secondary)]">{deliveryLabel}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] bg-[var(--color-primary-50)] p-4">
              <div className="flex items-start gap-3">
                <CreditCard size={18} className="mt-0.5 text-[var(--color-primary)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">Payment method</p>
                  <p className="mt-1 text-sm capitalize text-[var(--color-text-secondary)]">{paymentLabel}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] bg-[var(--color-primary-50)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Order total</p>
              <p className="mt-2 text-xl font-black tracking-tight text-[var(--color-primary)]">
                {confirmationOrder?.pricing ? formatCurrency(confirmationOrder.pricing.total) : 'Pending'}
              </p>
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
