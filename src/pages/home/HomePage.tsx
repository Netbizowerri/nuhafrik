import React, { useEffect, useState } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { ArrowRight, CheckCircle2, Gem, Shirt, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { Product } from '../../types';
import { ProductCard } from '../../components/product/ProductCard';
import { cn } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { BRAND_NAME, BUSINESS_DETAILS, absoluteUrl } from '../../lib/seo';

const featuredTabs = ['All', 'Featured', 'Latest'] as const;

export const HomePage = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof featuredTabs)[number]>('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), limit(50));
        const snap = await getDocs(q);
        const productsData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));

        const sortedProducts = [...productsData].sort((a, b) => {
          const getTime = (val: any) => {
            if (!val) return 0;
            if (val.seconds) return val.seconds * 1000;
            if (val instanceof Date) return val.getTime();
            if (typeof val === 'string') return new Date(val).getTime();
            return 0;
          };
          return getTime(b.created_at) - getTime(a.created_at);
        });

        const featuredProducts = sortedProducts.filter((p) => p.metadata?.is_featured).slice(0, 8);
        setNewArrivals(sortedProducts.slice(0, 8));
        setFeatured(featuredProducts.length > 0 ? featuredProducts : sortedProducts.slice(0, 8));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const heroProduct = featured[0] || newArrivals[0];
const visibleFeatured =
  activeTab === 'Latest' ? newArrivals.slice(0, 8) : activeTab === 'Featured' ? featured : (featured.length ? featured : newArrivals).slice(0, 8);
  const heroChips = [
    { label: 'New Arrivals', to: '/shop?filter=new' },
    { label: 'Clothing', to: '/shop?category=clothing' },
    { label: 'Accessories', to: '/shop?category=accessories' },
    { label: 'Featured', to: '/shop' },
  ];
  const title = `African Fashion Store in Kubwa Abuja | ${BRAND_NAME}`;
  const description =
    'Shop African-inspired clothing and accessories in Kubwa Abuja with nationwide delivery, polished styling, and dependable customer support.';
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'ClothingStore',
      name: BUSINESS_DETAILS.name,
      description: BUSINESS_DETAILS.description,
      image: absoluteUrl('/og-default.svg'),
      url: absoluteUrl('/'),
      telephone: BUSINESS_DETAILS.phone,
      email: BUSINESS_DETAILS.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS_DETAILS.streetAddress,
        addressLocality: BUSINESS_DETAILS.addressLocality,
        addressRegion: BUSINESS_DETAILS.addressRegion,
        postalCode: BUSINESS_DETAILS.postalCode,
        addressCountry: BUSINESS_DETAILS.addressCountry,
      },
      areaServed: 'NG',
      openingHours: 'Mo-Sa 09:00-18:00',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: BUSINESS_DETAILS.name,
      url: absoluteUrl('/'),
      description,
    },
  ];

  return (
    <div className="flex flex-col gap-[var(--space-12)] pb-[var(--space-20)]">
      <Seo title={title} description={description} path="/" structuredData={structuredData} />
      <section className="page-shell pb-[var(--space-12)] pt-[var(--space-4)] md:pt-[var(--space-5)]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[var(--radius-card-lg)] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,248,240,0.98),rgba(255,242,234,0.98))] shadow-[var(--shadow-lg)]">
            <div className="grid items-center gap-8 px-5 py-6 sm:px-8 md:px-10 md:py-8 lg:min-h-[30rem] lg:grid-cols-[0.92fr_1.08fr] lg:px-12">
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                <div className="inline-flex w-fit items-center rounded-full bg-[var(--color-primary-100)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-primary-700)]">
                  Enjoy The Best Prices
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-[12ch] text-[clamp(2rem,4.4vw,3.8rem)] font-[var(--fw-black)] leading-[1.05] tracking-[var(--tracking-tight)] text-[var(--color-dark)]">
                    Nuhafrik Clothing and Accessories Store
                  </h1>
                  <p className="max-w-xl text-[var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)] md:text-[var(--text-lg)]">
                    Curated looks, standout accessories, and featured staples from the Nuhafrik Clothing and Accessories Store. Shop the sale while selected pieces last.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to="/shop" className="btn-base btn-dark btn-lg px-8">
                    Buy Now
                  </Link>
                  <Link to="/shop?filter=new" className="btn-base btn-outline btn-lg px-8">
                    Shop New
                  </Link>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.65)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Featured pick: <span className="font-semibold text-[var(--color-text-primary)]">{heroProduct?.name || 'Nuhafrik Essentials'}</span>
                  </div>
                  <div className="rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.65)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    Nationwide delivery available
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 }}
                className="relative flex min-h-[18rem] items-end justify-end self-stretch overflow-hidden pt-8"
              >
                <img
                  src="https://i.ibb.co/twsDX7k9/NUHAFRIK-2-1.png"
                  alt="Model wearing signature Nuhafrik clothing and accessories"
                  className="relative z-10 max-h-[19rem] w-auto object-contain sm:max-h-[22rem] md:max-h-[25rem] lg:max-h-[28rem]"
                  referrerPolicy="no-referrer"
                  width="960"
                  height="1200"
                />
              </motion.div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {heroChips.map((chip) => (
              <Link
                key={chip.label}
                to={chip.to}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary)]"
              >
                {chip.label}
              </Link>
            ))}
            <Link
              to="/shop"
              className="ml-auto rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              View All
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Shirt,
              title: 'Refined tailoring',
              copy: 'Modern shapes with a soft sculptural line, designed to feel elevated every day.',
            },
            {
              icon: Gem,
              title: 'Statement accessories',
              copy: 'Complete every outfit with pieces that carry texture, depth, and character.',
            },
            {
              icon: CheckCircle2,
              title: 'Made to last',
              copy: 'Thoughtful finishing, durable fabrics, and styling that works beyond one season.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="surface-card p-6">
                <span className="icon-pill">
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-[var(--color-text-primary)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{item.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="page-shell section-space">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="section-heading">
            <p className="eyebrow">New Arrivals</p>
            <h2 className="section-title">Our Latest Collection</h2>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.05em] text-[var(--color-dark)]">
            Browse all pieces
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="surface-card aspect-[3/4] animate-pulse" />)
            : newArrivals.length > 0
              ? newArrivals.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)
              : (
                <div className="surface-card col-span-full p-10 text-center text-[var(--color-text-secondary)]">
                  No products available at the moment.
                </div>
              )}
        </div>
      </section>

      <section className="page-shell">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface-card-dark flex flex-col justify-between p-8 md:p-10">
            <div>
              <p className="eyebrow">Editorial Perspective</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight">Style that feels rooted, bold, and intentional.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[rgba(255,250,242,0.72)]">
                Nuhafrik balances cultural memory with contemporary styling. The result is a wardrobe that feels collected, expressive, and wearable.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {[Sparkles, Shirt, Zap].map((Icon, index) => (
                <span key={index} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Icon size={18} className="text-[var(--color-primary)]" />
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                title: 'Clothing',
                copy: 'Fluid tailoring and clean seasonal layers.',
                image: 'https://i.ibb.co/Q3KCSVLK/Nuhafrik-1.jpg',
                route: '/shop?category=clothing',
              },
              {
                title: 'Accessories',
                copy: 'Texture-rich finishing pieces with presence.',
                image: 'https://i.ibb.co/WN28jncV/Nuhafrik-2.jpg',
                route: '/shop?category=accessories',
              },
            ].map((item) => (
              <Link key={item.title} to={item.route} className="group hero-panel min-h-[22rem]">
                <img
                  src={item.image}
                  alt={`${item.title} collection preview from Nuhafrik`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  width="700"
                  height="900"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(38,5,0,0.82)] via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="eyebrow">{item.title}</p>
                  <h3 className="mt-2 text-2xl font-bold text-[var(--color-text-inverse)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[rgba(255,250,242,0.72)]">{item.copy}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell section-space">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="section-heading">
            <h2 className="section-title">Featured Collection</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {featuredTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-full border px-5 py-2 text-sm font-semibold tracking-[0.05em] transition-all',
                  activeTab === tab
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-inverse)] shadow-[var(--shadow-primary)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="surface-card aspect-[3/4] animate-pulse" />)
            : visibleFeatured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </div>
  );
};
