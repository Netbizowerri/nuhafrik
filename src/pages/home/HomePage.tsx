import React, { useEffect, useState } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Gem, Pause, Play, Shirt, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { Product } from '../../types';
import { ProductCard } from '../../components/product/ProductCard';
import { cn } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { PromoAlert } from '../../components/promo/PromoAlert';
import { BRAND_NAME, BUSINESS_DETAILS, DEFAULT_OG_IMAGE_PATH, absoluteUrl } from '../../lib/seo';

const featuredTabs = ['All', 'Featured', 'Latest'] as const;
const newArrivalsLimit = 12;
const featuredLimit = 20;

const heroSlides = [
  {
    src: 'https://i.ibb.co/bgWd7htG/Nuhafrik7.jpg',
    label: 'The opening look',
    alt: 'Nuhafrik fashion look from the latest collection',
  },
  {
    src: 'https://i.ibb.co/VGn8x6z/Nuhafrik6.jpg',
    label: 'A sharper silhouette',
    alt: 'Nuhafrik clothing styled with a bold silhouette',
  },
  {
    src: 'https://i.ibb.co/kZCXj4h/Nuhafrik5.jpg',
    label: 'Colour with intention',
    alt: 'Nuhafrik fashion piece styled with considered colour',
  },
  {
    src: 'https://i.ibb.co/kVYNskCG/Nuhafrik4.jpg',
    label: 'Details that speak',
    alt: 'Nuhafrik outfit showing considered styling details',
  },
  {
    src: 'https://i.ibb.co/20pvwdGB/Nuhafrik2.jpg',
    label: 'Made for the moment',
    alt: 'Nuhafrik clothing look ready for a special occasion',
  },
  {
    src: 'https://i.ibb.co/SwnwD5hM/Nuhafrik1.jpg',
    label: 'The Nuhafrik mood',
    alt: 'Nuhafrik collection look with a distinctive fashion mood',
  },
  {
    src: 'https://i.ibb.co/DDhSPrRm/Nuhafrik.jpg',
    label: 'Everyday, elevated',
    alt: 'Nuhafrik fashion look for elevated everyday wear',
  },
] as const;

export const HomePage = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof featuredTabs)[number]>('All');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHoveringSlider, setIsHoveringSlider] = useState(false);
  const [isPlayPaused, setIsPlayPaused] = useState(false);
  const reduceMotion = useReducedMotion();

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

         const featuredProducts = sortedProducts.filter((p) => p.metadata?.is_featured).slice(0, featuredLimit);
         setNewArrivals(sortedProducts.slice(0, newArrivalsLimit));
         setFeatured(featuredProducts.length > 0 ? featuredProducts : sortedProducts.slice(-featuredLimit).reverse());
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (isHoveringSlider || isPlayPaused || reduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [activeSlide, isHoveringSlider, isPlayPaused, reduceMotion]);

  const goToSlide = (index: number) => {
    setActiveSlide((index + heroSlides.length) % heroSlides.length);
  };

  const showNextSlide = () => {
    setActiveSlide((current) => (current + 1) % heroSlides.length);
  };

  const showPreviousSlide = () => {
    setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleHeroKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showNextSlide();
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPreviousSlide();
    }
  };

  const activeHeroSlide = heroSlides[activeSlide];

  const visibleFeatured =
    activeTab === 'Latest'
      ? newArrivals.slice(0, newArrivalsLimit)
      : activeTab === 'Featured'
        ? featured.slice(0, featuredLimit)
        : (featured.length ? featured : newArrivals).slice(0, featuredLimit);
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
      image: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
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
      <PromoAlert />
      <section className="page-shell max-md:px-0 pb-[var(--space-12)] pt-[var(--space-4)] md:pt-[var(--space-5)]">
        <div className="space-y-4">
          <div className="relative isolate overflow-hidden rounded-[var(--radius-3xl)] border border-white/10 bg-[#1a0804] shadow-[0_24px_80px_rgba(38,5,0,0.24)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,250,242,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,250,242,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-primary)]/20 blur-3xl" />

            <div className="relative grid lg:grid-cols-[0.82fr_1.18fr]">
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(18px)' }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }}
                transition={{ duration: reduceMotion ? 0.2 : 0.7, ease: [0.23, 1, 0.32, 1] }}
                className="flex min-h-[29rem] flex-col justify-between p-6 sm:p-9 lg:min-h-[38rem] lg:p-12"
              >
                <div className="relative z-10 max-w-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-300)]">
                    Nuhafrik / Kubwa, Abuja
                  </p>
                  <h1 className="mt-7 max-w-[8ch] text-[clamp(3.2rem,7vw,6.4rem)] font-[var(--fw-black)] leading-[0.94] tracking-[-0.06em] text-[var(--color-text-inverse)]">
                    Wear your story.
                  </h1>
                  <p className="mt-6 max-w-md text-base leading-7 text-[rgba(255,250,242,0.72)] sm:text-lg">
                    African-inspired clothing and accessories for every version of you. Designed for presence, delivered nationwide.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4 sm:gap-3">
                    <Link
                      to="/shop"
                      className="btn-base btn-primary btn-lg px-7 transition-[background-color,transform] active:scale-[0.98]"
                    >
                       SHOP NOW
                       <ArrowRight size={17} />
                     </Link>
                     <Link
                       to="/contact"
                       className="inline-flex min-h-[3.25rem] items-center justify-center border border-white/20 px-7 text-base font-semibold tracking-[0.025em] text-[var(--color-text-inverse)] transition-[background-color,border-color,color,transform] duration-200 hover:border-white/50 hover:bg-white/10 active:scale-[0.98]"
                     >
                       CONTACT US
                    </Link>
                  </div>
                </div>

                <div className="relative z-10 mt-10 flex items-center gap-3 border-t border-white/15 pt-5 text-xs font-medium text-[rgba(255,250,242,0.58)]">
                  <span className="h-px w-8 bg-[var(--color-primary)]" />
                  <span>Curated clothing and accessories</span>
                </div>
              </motion.div>

              <div
                role="region"
                aria-roledescription="carousel"
                aria-label="Nuhafrik collection highlights"
                tabIndex={0}
                onKeyDown={handleHeroKeyDown}
                onMouseEnter={() => setIsHoveringSlider(true)}
                onMouseLeave={() => setIsHoveringSlider(false)}
                className="relative min-h-[28rem] overflow-hidden bg-[#260500] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--color-primary)] lg:min-h-[38rem]"
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={activeHeroSlide.src}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'scale(1.045)' }}
                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, transform: 'scale(1)' }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.985)' }}
                    transition={{ duration: reduceMotion ? 0.2 : 0.85, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute inset-0"
                  >
                    <img
                      src={activeHeroSlide.src}
                      alt={activeHeroSlide.alt}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      width="1200"
                      height="1500"
                      loading={activeSlide === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(26,8,4,0.12),transparent_38%,rgba(26,8,4,0.88))]" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(26,8,4,0.38),transparent_35%,rgba(26,8,4,0.12))]" />

                <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-4 sm:left-7 sm:right-7 sm:top-7">
                  <div className="flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/75">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_0_4px_rgba(255,110,25,0.18)]" />
                    <span>Visual study</span>
                  </div>
                  <span className="font-mono text-xs tracking-[0.16em] text-white/70">
                    {String(activeSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
                  </span>
                </div>

                <div className="absolute right-5 top-1/2 flex -translate-y-1/2 flex-col gap-2 sm:right-7">
                  <button
                    type="button"
                    onClick={showPreviousSlide}
                    aria-label="Previous hero image"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#260500]/55 text-white/85 backdrop-blur-md transition-[background-color,border-color,transform] duration-200 hover:border-white/60 hover:bg-[#260500]/85 active:scale-95"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={showNextSlide}
                    aria-label="Next hero image"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#260500]/55 text-white/85 backdrop-blur-md transition-[background-color,border-color,transform] duration-200 hover:border-white/60 hover:bg-[#260500]/85 active:scale-95"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-200)]">
                        {activeHeroSlide.label}
                      </p>
                      <p className="mt-1 text-sm text-white/65">Move through the collection</p>
                    </div>
                    {!reduceMotion ? (
                      <button
                        type="button"
                        onClick={() => setIsPlayPaused((current) => !current)}
                        aria-label={isPlayPaused ? 'Play hero slideshow' : 'Pause hero slideshow'}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[#260500]/55 text-white/85 backdrop-blur-md transition-[background-color,border-color,transform] duration-200 hover:border-white/60 hover:bg-[#260500]/85 active:scale-95"
                      >
                        {isPlayPaused ? <Play size={15} fill="currentColor" /> : <Pause size={15} fill="currentColor" />}
                      </button>
                    ) : null}
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" aria-label="Choose a hero image">
                    {heroSlides.map((slide, index) => (
                      <button
                        key={slide.src}
                        type="button"
                        onClick={() => goToSlide(index)}
                        aria-label={`Show ${slide.label}`}
                        aria-pressed={index === activeSlide}
                        className={cn(
                          'group relative h-14 w-11 shrink-0 overflow-hidden rounded-[var(--radius-md)] border transition-[border-color,opacity,transform] duration-200 active:scale-95',
                          index === activeSlide ? 'border-[var(--color-primary)] opacity-100' : 'border-white/20 opacity-55 hover:opacity-90'
                        )}
                      >
                        <img
                          src={slide.src}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                          width="120"
                          height="150"
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="absolute inset-0 bg-[#260500]/20 transition-colors duration-200 group-hover:bg-transparent" />
                      </button>
                    ))}
                  </div>
                </div>

                <span className="sr-only" aria-live="polite">
                  Showing {activeHeroSlide.label}, image {activeSlide + 1} of {heroSlides.length}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[var(--color-border)] pb-4 text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Browse by</span>
            {heroChips.map((chip) => (
              <Link
                key={chip.label}
                to={chip.to}
                className="font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
              >
                {chip.label}
              </Link>
            ))}
            <Link
              to="/shop"
              className="ml-auto inline-flex items-center gap-2 font-semibold text-[var(--color-dark)] transition-colors hover:text-[var(--color-primary)]"
            >
              View all
              <ArrowRight size={15} />
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
             ? Array.from({ length: newArrivalsLimit }).map((_, index) => <div key={index} className="surface-card aspect-[3/4] animate-pulse" />)
             : newArrivals.length > 0
               ? newArrivals.slice(0, newArrivalsLimit).map((product) => <ProductCard key={product.id} product={product} />)
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
             ? Array.from({ length: featuredLimit }).map((_, index) => <div key={index} className="surface-card aspect-[3/4] animate-pulse" />)
             : visibleFeatured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </div>
  );
};
