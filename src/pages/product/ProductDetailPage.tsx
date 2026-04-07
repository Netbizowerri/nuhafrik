import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, limit, query } from 'firebase/firestore';
import { ChevronLeft, Heart, Phone, Share2, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { cn, formatCurrency } from '../../lib/utils';
import { useCartStore } from '../../store/useCartStore';
import { ProductCard } from '../../components/product/ProductCard';

export const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const snap = await getDoc(doc(db, 'products', productId));
        if (snap.exists()) {
          const data = snap.data() as Product;
          setProduct({ id: snap.id, ...data });
          setSelectedSize(data.variants.sizes[0] || '');
          setSelectedColor(data.variants.colors[0]?.name || '');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;

      try {
        const snap = await getDocs(query(collection(db, 'products'), limit(20)));
        const latestProducts = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Product))
          .filter((item) => item.id !== product.id && item.published);

        const getTime = (val: any) => {
          if (!val) return 0;
          if (val.seconds) return val.seconds * 1000;
          if (val instanceof Date) return val.getTime();
          if (typeof val === 'string') return new Date(val).getTime();
          return 0;
        };

        const sortedProducts = [...latestProducts].sort((a, b) => getTime(b.created_at) - getTime(a.created_at));
        const sameCategory = sortedProducts.filter((item) => item.category_id === product.category_id);
        const fallback = sortedProducts.filter((item) => item.category_id !== product.category_id);

        setRelatedProducts([...sameCategory, ...fallback].slice(0, 4));
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  if (loading) {
    return <div className="empty-state page-shell text-[var(--color-text-secondary)]">Loading product details...</div>;
  }

  if (!product) {
    return <div className="empty-state page-shell text-[var(--color-text-secondary)]">Product not found.</div>;
  }

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      image_url: product.images[activeImage]?.url || '',
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
      unit_price: product.pricing.selling_price,
      subtotal: product.pricing.selling_price,
    });
  };

  return (
    <div className="page-shell page-stack">
      <section className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <button onClick={() => navigate(-1)} className="btn-base btn-outline btn-sm">
          <ChevronLeft size={16} />
          Back
        </button>
        <div className="flex gap-3">
          <button className="btn-base btn-outline btn-sm !h-11 !w-11 !p-0" aria-label="Share product">
            <Share2 size={18} />
          </button>
          <button className="btn-base btn-outline btn-sm !h-11 !w-11 !p-0" aria-label="Save product">
            <Heart size={18} />
          </button>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_0.95fr]">
        <div className="space-y-5">
          <div className="hero-panel aspect-[4/5] overflow-hidden">
            <motion.img
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={product.images[activeImage]?.url}
              alt={product.name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={cn(
                  'overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--color-surface-raised)] transition-all',
                  activeImage === index
                    ? 'border-[var(--color-primary)] shadow-[var(--shadow-primary)]'
                    : 'border-[var(--color-border)] opacity-75 hover:opacity-100'
                )}
              >
                <img src={img.url} alt="" className="aspect-square h-full w-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="status-pill status-pill-soft">
                <Star size={12} fill="currentColor" strokeWidth={0} />
                4.8 rating
              </span>
              <span className={cn('status-pill', product.inventory > 0 ? 'status-pill-dark' : 'status-pill-soft')}>
                {product.inventory > 0 ? `${product.inventory} in stock` : 'Sold out'}
              </span>
            </div>
            <h1 className="page-title text-[clamp(var(--text-4xl),4vw,var(--text-5xl))]">{product.name}</h1>
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-4xl font-black tracking-[var(--tracking-tight)] text-[var(--color-primary)]">
                {formatCurrency(product.pricing.selling_price)}
              </span>
              {product.pricing.is_on_sale ? (
                <span className="text-lg font-medium text-[var(--color-text-muted)] line-through">
                  {formatCurrency(product.pricing.original_price)}
                </span>
              ) : null}
            </div>
            <p className="section-copy max-w-none">{product.description}</p>
            <div className="flex flex-wrap gap-2">
              {product.tags?.map((tag) => (
                <span key={tag} className="rounded-full border border-[var(--color-border)] bg-[var(--color-primary-50)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-primary-700)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="surface-card p-6 md:p-7">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Select color</p>
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">{selectedColor}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {product.variants.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.name)}
                      className={cn(
                        'relative h-11 w-11 rounded-full border-2 transition-all',
                        selectedColor === color.name
                          ? 'border-[var(--color-primary)] shadow-[var(--shadow-primary)]'
                          : 'border-[var(--color-border)]'
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColor === color.name ? (
                        <span className="absolute inset-0 rounded-full ring-2 ring-[rgba(255,250,242,0.8)] ring-inset" />
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Select size</p>
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">{selectedSize}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {product.variants.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'rounded-full border px-5 py-3 text-sm font-semibold tracking-[0.05em] transition-all',
                        selectedSize === size
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-inverse)] shadow-[var(--shadow-primary)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => {
                  handleAddToCart();
                  navigate('/checkout');
                }}
                size="lg"
                className="flex-1"
              >
                Order Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="sm:w-[11rem]"
                onClick={() => {
                  handleAddToCart();
                }}
              >
                <ShoppingBag size={18} />
                Add to Bag
              </Button>
            </div>

            <a
              href={`https://wa.me/2348023736786?text=${encodeURIComponent(
                `Hello Nuhafrik. I will like to order ${product.name} priced at ${formatCurrency(product.pricing.selling_price)}. Please how can I get it?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-base btn-dark btn-lg justify-center"
            >
              <Phone size={18} />
              Order on WhatsApp
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Truck, title: 'Fast delivery', copy: 'Nationwide shipping from Abuja.' },
              { icon: ShieldCheck, title: 'Secure checkout', copy: 'Protected order and payment flow.' },
              { icon: Heart, title: 'Styled to last', copy: 'Pieces designed for repeat wear.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="surface-card p-5">
                  <span className="icon-pill">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-[var(--color-text-primary)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{item.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="space-y-6">
          <div className="section-heading">
            <p className="eyebrow">You May Also Like</p>
            <h2 className="section-title text-[clamp(var(--text-3xl),3vw,var(--text-4xl))]">More From The Same Category</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
