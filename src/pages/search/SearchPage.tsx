import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Search, TrendingUp, X } from 'lucide-react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product } from '../../types';
import { ProductCard } from '../../components/product/ProductCard';
import { Seo } from '../../components/seo/Seo';
import { BRAND_NAME } from '../../lib/seo';

export const SearchPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const title = `Search Nuhafrik Products | ${BRAND_NAME}`;
  const description =
    'Search Nuhafrik clothing and accessories by style, category, or keyword to quickly find the pieces you want.';

  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearchQuery(q);

    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));

    try {
      const snap = await getDocs(query(collection(db, 'products'), where('published', '==', true), limit(20)));
      const filtered = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Product))
        .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase()));
      setResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell page-stack min-h-screen">
      <Seo title={title} description={description} path="/search" noindex />
      <section className="surface-card sticky top-[6.5rem] z-40 p-4 md:p-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-base btn-outline btn-sm !h-11 !w-11 !p-0">
            <ArrowLeft size={18} />
          </button>
          <div className="field-group flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder=" "
              className="field rounded-full pl-11 pr-11"
            />
            <label className="field-label left-11">Search for dresses, bags, accessories...</label>
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                <X size={18} />
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {!searchQuery && results.length === 0 ? (
        <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="surface-card p-6">
            <p className="eyebrow">Recent Searches</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {recentSearches.length > 0 ? (
                recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleSearch(search)}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)]"
                  >
                    <Clock size={14} />
                    {search}
                  </button>
                ))
              ) : (
                <p className="text-sm text-[var(--color-text-secondary)]">Your recent searches will appear here.</p>
              )}
            </div>
          </div>

          <div className="surface-card-dark p-6">
            <p className="eyebrow">Trending Searches</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {['Ankara Dress', 'Tote Bag', 'Gold Jewelry', 'Two Piece Set', 'Heels'].map((search) => (
                <button
                  key={search}
                  onClick={() => handleSearch(search)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[var(--color-text-inverse)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary-200)]"
                >
                  <TrendingUp size={14} />
                  {search}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Search Results</p>
              <h1 className="section-title text-[clamp(var(--text-3xl),3vw,var(--text-4xl))]">
                {loading ? 'Searching...' : `Results for "${searchQuery}"`}
              </h1>
            </div>
            {!loading ? <span className="status-pill status-pill-soft">{results.length} item{results.length === 1 ? '' : 's'}</span> : null}
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="surface-card aspect-[3/4] animate-pulse" />)
              : results.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

          {!loading && results.length === 0 ? (
            <div className="surface-card p-12 text-center">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">No items found</h2>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">Try a different keyword or browse the full collection.</p>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
};
