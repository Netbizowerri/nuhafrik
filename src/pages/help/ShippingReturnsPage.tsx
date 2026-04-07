import React from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, Package, RefreshCw, ShieldCheck, Truck } from 'lucide-react';

export const ShippingReturnsPage = () => {
  const shippingInfo = [
    {
      icon: MapPin,
      title: 'Abuja Delivery',
      desc: 'Flat-rate delivery within Abuja. Orders are typically delivered within 24 to 48 hours of confirmation.',
    },
    {
      icon: Truck,
      title: 'Nationwide Shipping',
      desc: 'We ship across Nigeria using reliable courier services. Delivery usually takes 3 to 5 business days.',
    },
    {
      icon: Package,
      title: 'Store Pickup',
      desc: 'Order online and collect your items for free at our Kubwa store when ready.',
    },
  ];

  const returnInfo = [
    {
      icon: Clock,
      title: '7-Day Return Window',
      desc: 'Items can be returned or exchanged within 7 days of delivery if unworn and still tagged.',
    },
    {
      icon: RefreshCw,
      title: 'Easy Exchanges',
      desc: 'Need another size? We offer easy exchanges subject to item availability.',
    },
    {
      icon: ShieldCheck,
      title: 'Quality Guarantee',
      desc: 'If you receive a defective or incorrect item, we will replace it or issue a refund.',
    },
  ];

  return (
    <div className="page-shell page-stack">
      <section className="hero-panel px-6 py-10 md:px-10 md:py-14">
        <p className="eyebrow">Shipping & Returns</p>
        <h1 className="page-title mt-4">Clear delivery timelines and a straightforward returns policy.</h1>
        <p className="section-copy mt-5">
          Everything you need to know about getting your order delivered and what to expect if you need an exchange or return.
        </p>
      </section>

      <section>
        <div className="section-heading">
          <p className="eyebrow">Delivery Information</p>
          <h2 className="section-title">How we get your order to you.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {shippingInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <motion.div key={info.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="surface-card p-6">
                <span className="icon-pill">
                  <Icon size={18} />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-[var(--color-text-primary)]">{info.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{info.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <p className="eyebrow">Returns & Exchanges</p>
          <h2 className="section-title">Support that stays practical after purchase.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {returnInfo.map((info) => {
            const Icon = info.icon;
            return (
              <div key={info.title} className="surface-card p-6">
                <span className="icon-pill">
                  <Icon size={18} />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-[var(--color-text-primary)]">{info.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{info.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
