import React from 'react';
import { motion } from 'motion/react';
import { Heart, Rocket, Shield, Sparkles, Users } from 'lucide-react';
import { Seo } from '../../components/seo/Seo';
import { BRAND_NAME, BUSINESS_DETAILS, absoluteUrl } from '../../lib/seo';

export const AboutPage = () => {
  const missionPoints = [
    {
      icon: Sparkles,
      text: 'To deliver premium clothing and accessories that combine African creativity with modern fashion.',
    },
    {
      icon: Shield,
      text: 'To provide an exceptional shopping experience built on trust, respect, and customer satisfaction.',
    },
    {
      icon: Users,
      text: 'To support local artisans and designers, promoting sustainable and ethical fashion practices.',
    },
    {
      icon: Heart,
      text: 'To inspire confidence and self-expression in every customer we serve.',
    },
  ];
  const title = `About Nuhafrik | ${BRAND_NAME}`;
  const description =
    'Learn how Nuhafrik in Kubwa Abuja blends African heritage, modern style, and quality finishing into a confident fashion experience.';
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: title,
      description,
      url: absoluteUrl('/about'),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ClothingStore',
      name: BUSINESS_DETAILS.name,
      description: BUSINESS_DETAILS.description,
      url: absoluteUrl('/'),
      image: absoluteUrl('/og-default.svg'),
    },
  ];

  return (
    <div className="page-stack">
      <Seo title={title} description={description} path="/about" structuredData={structuredData} />
      <section className="page-shell">
        <div className="hero-panel grid gap-8 overflow-hidden lg:grid-cols-[1fr_0.9fr]">
          <div className="flex flex-col justify-center gap-5 px-6 py-10 md:px-10 md:py-14">
            <p className="eyebrow">About Nuhafrik</p>
            <h1 className="page-title">A modern fashion house shaped by heritage and confidence.</h1>
            <p className="section-copy">
              Nuhafrik Clothing and Accessories Store Kubwa is a contemporary fashion destination celebrating African identity through elevated everyday style.
            </p>
          </div>
          <div className="relative min-h-[24rem]">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
              alt="Curated African-inspired fashion styling from Nuhafrik"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              width="2070"
              height="1380"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(38,5,0,0.82)] via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card p-8 md:p-10">
          <p className="eyebrow">Our Story</p>
          <h2 className="mt-4 text-3xl font-bold text-[var(--color-text-primary)]">Fashion that feels rooted and globally fluent.</h2>
          <p className="mt-5 text-sm leading-8 text-[var(--color-text-secondary)]">
            Located in Kubwa, Abuja, Nuhafrik blends tradition with contemporary styling. We focus on strong silhouettes, high-quality finishing, and a customer experience that feels warm, intentional, and polished.
          </p>
        </div>

        <div className="surface-card-dark p-8 md:p-10">
          <span className="icon-pill bg-white/10 text-[var(--color-primary)] border-white/10">
            <Rocket size={18} />
          </span>
          <p className="eyebrow mt-6">Vision</p>
          <p className="mt-4 text-2xl font-bold leading-tight">
            To become the leading African-inspired fashion destination in Nigeria and beyond.
          </p>
        </div>
      </section>

      <section className="page-shell">
        <div className="section-heading">
          <p className="eyebrow">Mission</p>
          <h2 className="section-title">What we are building through every collection.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {missionPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="surface-card p-6">
                <span className="icon-pill">
                  <Icon size={18} />
                </span>
                <p className="mt-5 text-sm leading-7 text-[var(--color-text-secondary)]">{point.text}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
