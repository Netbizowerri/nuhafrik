import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { Product } from '../../types';
import { ProductCard } from '../../components/product/ProductCard';
import { Seo } from '../../components/seo/Seo';
import { BRAND_NAME, absoluteUrl } from '../../lib/seo';

export const ShopPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'products'));

        if (categoryFilter) {
          q = query(q, where('category_id', '==', categoryFilter));
        }

        const snap = await getDocs(q);
        setProducts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter]);

  const visibleProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(term))
    );
  }, [products, searchTerm]);

  const title = categoryFilter ? categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1) : 'All Collections';
  const pageTitle = `${title === 'All Collections' ? 'Shop Clothing and Accessories' : `${title} Collection`} | ${BRAND_NAME}`;
  const description = categoryFilter
    ? `Browse ${title.toLowerCase()} at Nuhafrik with African-inspired styling, dependable quality, and nationwide delivery across Nigeria.`
    : 'Browse Nuhafrik clothing and accessories with curated African-inspired style, reliable delivery, and quality finishing for everyday wear.';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: absoluteUrl(categoryFilter ? `/shop?category=${categoryFilter}` : '/shop'),
  };

  return (
    <div className="page-shell page-stack">
      <Seo
        title={pageTitle}
        description={description}
        path={categoryFilter ? `/shop?category=${categoryFilter}` : '/shop'}
        structuredData={structuredData}
      />
      <section className="hero-panel overflow-hidden">
        <div className="grid gap-8 px-6 py-10 md:px-10 md:py-12 lg:grid-cols-[1fr_0.7fr]">
          <div className="space-y-5">
            <p className="eyebrow">Shop Nuhafrik</p>
            <h1 className="page-title">{title}</h1>
            <p className="section-copy">
              Discover premium clothing and accessories with strong silhouettes, warm tonal depth, and a refined African-inspired visual language.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Guranteed Quality', value: 'Yes' },
              { label: 'Fast delivery', value: 'NG' },
              { label: 'Crafted finish', value: 'Yes' },
            ].map((item) => (
              <div key={item.label} className="surface-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">{item.label}</p>
                <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-primary)]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, materials, or tags"
              className="field w-full rounded-full pl-11 pr-4 placeholder:text-transparent"
            />
            <span className="field-label left-11">Search products</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="btn-base btn-outline btn-sm">
              <Filter size={16} />
              Filter
            </button>
            <button className="btn-base btn-dark btn-sm">
              <SlidersHorizontal size={16} />
              Sort
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
          <span>{visibleProducts.length} pieces available</span>
          {categoryFilter ? <span className="status-pill status-pill-soft">Category: {categoryFilter}</span> : null}
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => <div key={index} className="surface-card aspect-[3/4] animate-pulse" />)
            : visibleProducts.length > 0
              ? visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)
              : (
                <div className="surface-card col-span-full p-12 text-center">
                  <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">No products found</h2>
                  <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                    Try a different search term or browse another category.
                  </p>
                </div>
              )}
        </div>
      </section>
    </div>
  );
};
