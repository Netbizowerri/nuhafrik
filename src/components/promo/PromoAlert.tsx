import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Instagram, PartyPopper, Phone, ShoppingBag, X } from 'lucide-react';

const PROMO_SLIDES = [
  {
    src: 'https://i.ibb.co/CKMnN1gp/Nuhafrik-Anniversary-Sale-1.jpg',
    alt: 'NUHAFRIK 11-Year Anniversary Sale banner — 11% off everything, tops, dresses, shoes, bags and accessories',
  },
  {
    src: 'https://i.ibb.co/0RMPtvJk/Nuhafrik-Anniversary-Sale.jpg',
    alt: 'NUHAFRIK 11-Year Anniversary Sale banner — 11% off the entire collection, Oct 1st to 11th',
  },
] as const;

const PROMO_SLIDE_INTERVAL_MS = 6_000;
const PROMO_SLIDE_FADE_SECONDS = 0.7;
const PROMO_DELAY_MS = 10_000;

export const PromoAlert = () => {
  const [open, setOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  const slidesPaused = hoverPaused || tabHidden;
  const activeSlide = PROMO_SLIDES[slideIndex];

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), PROMO_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    if (open) setSlideIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open || slidesPaused) return;
    const timer = window.setTimeout(() => {
      setSlideIndex((current) => (current + 1) % PROMO_SLIDES.length);
    }, PROMO_SLIDE_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [open, slidesPaused, slideIndex]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  const cardTransition = reduceMotion
    ? { duration: 0.2, ease: 'easeOut' as const }
    : { type: 'spring' as const, duration: 0.6, bounce: 0.22 };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            aria-label="Dismiss promo alert"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="absolute inset-0 cursor-default bg-[var(--color-surface-overlay)]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-alert-title"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, transform: 'scale(0.92) translateY(14px)' }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, transform: 'scale(1) translateY(0)' }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, transform: 'scale(0.95) translateY(10px)' }
            }
            transition={cardTransition}
            className="relative max-h-[calc(100vh-2rem)] w-full max-w-md overflow-hidden rounded-[var(--radius-3xl)] border border-white/10 bg-[var(--color-dark)] shadow-[var(--shadow-2xl)]"
          >
            <div className="max-h-[calc(100vh-2rem)] overflow-y-auto overscroll-contain">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label="Close promo alert"
                className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(38,5,0,0.72)] text-[var(--color-text-inverse)] backdrop-blur-sm transition-[background-color,transform] duration-[var(--duration-fast)] ease-[var(--ease-smooth)] hover:bg-[var(--color-primary)] active:scale-95"
              >
                <X size={20} />
              </button>

              <div
                className="relative h-64 w-full sm:h-72"
                onMouseEnter={() => setHoverPaused(true)}
                onMouseLeave={() => setHoverPaused(false)}
              >
                <AnimatePresence initial={false}>
                  <motion.img
                    key={activeSlide.src}
                    src={activeSlide.src}
                    alt={activeSlide.alt}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: reduceMotion ? 0.15 : PROMO_SLIDE_FADE_SECONDS,
                      ease: 'easeInOut',
                    }}
                  />
                </AnimatePresence>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-dark)]" />

                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                  {PROMO_SLIDES.map((slide, index) => (
                    <button
                      key={slide.src}
                      type="button"
                      onClick={() => setSlideIndex(index)}
                      aria-label={`Show anniversary banner ${index + 1} of ${PROMO_SLIDES.length}`}
                      aria-current={index === slideIndex}
                      className={`h-1.5 rounded-full transition-[width,background-color] duration-[var(--duration-fast)] ease-[var(--ease-smooth)] ${
                        index === slideIndex
                          ? 'w-6 bg-[var(--color-primary)]'
                          : 'w-1.5 bg-white/45 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-5 px-6 pb-6 pt-1">
                <div className="space-y-3">
                  <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--color-text-inverse)]">
                    <PartyPopper size={12} />
                    11-Year Anniversary Sale
                  </p>
                  <h2
                    id="promo-alert-title"
                    className="text-[1.7rem] font-black leading-tight tracking-tight text-[var(--color-text-inverse)]"
                  >
                    <span className="text-[var(--color-primary)]">11% OFF</span> Everything
                  </h2>
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[var(--color-primary-200)]">
                    Tops &middot; Dresses &middot; Shoes &middot; Bags &middot; Accessories
                  </p>
                  <p className="text-sm leading-6 text-[rgba(255,250,242,0.78)]">
                    Celebrate 11 years of style and trust with NUHAFRIK! We&rsquo;re giving back to our
                    loyal fashion lovers with 11% off our entire collection — tops, dresses, pants,
                    shoes, bags, and more. Whether you&rsquo;re hunting for that perfect ankara piece,
                    statement heels, or everyday essentials, now&rsquo;s your moment to upgrade your
                    wardrobe at unbeatable prices. This anniversary celebration runs Oct 1st–11th
                    only — don&rsquo;t miss out!
                  </p>
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[var(--color-primary-300)]">
                    Ends Oct 11th
                  </p>
                </div>

                <Link to="/shop" onClick={close} className="btn-base btn-primary btn-md w-full">
                  <ShoppingBag size={16} />
                  Shop the Sale
                </Link>

                <div className="grid gap-2 border-t border-white/10 pt-4 text-sm">
                  <a
                    href="tel:+2348143649301"
                    className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-[rgba(255,250,242,0.88)] transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary-200)]"
                  >
                    <Phone size={15} className="shrink-0 text-[var(--color-primary)]" />
                    +234 814 364 9301
                  </a>
                  <a
                    href="https://instagram.com/Nuhafrik_clothing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-[rgba(255,250,242,0.88)] transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary-200)]"
                  >
                    <Instagram size={15} className="shrink-0 text-[var(--color-primary)]" />
                    Follow @Nuhafrik_clothing
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};
