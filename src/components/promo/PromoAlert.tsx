import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Flame, Instagram, Phone, ShoppingBag, X } from 'lucide-react';

const PROMO_IMAGE_URL = 'https://i.ibb.co/GfLNCDW0/Nuhafrik-Promo-Alert.jpg';
const PROMO_IMAGE_ALT =
  'Nuhafrik Clothing Kubwa promo alert — Buy 2 get 1 FREE on Tops & T-Shirts, limited time offer';
const PROMO_DELAY_MS = 10_000;

export const PromoAlert = () => {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), PROMO_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

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
            className="relative w-full max-w-sm overflow-hidden rounded-[var(--radius-3xl)] border border-white/10 bg-[var(--color-dark)] shadow-[var(--shadow-2xl)]"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              aria-label="Close promo alert"
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(38,5,0,0.72)] text-[var(--color-text-inverse)] backdrop-blur-sm transition-[background-color,transform] duration-[var(--duration-fast)] ease-[var(--ease-smooth)] hover:bg-[var(--color-primary)] active:scale-95"
            >
              <X size={20} />
            </button>

            <div className="relative">
              <img
                src={PROMO_IMAGE_URL}
                alt={PROMO_IMAGE_ALT}
                referrerPolicy="no-referrer"
                width="800"
                height="800"
                className="max-h-60 w-full object-cover sm:max-h-64"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-dark)]" />
            </div>

            <div className="flex flex-col gap-5 px-6 pb-6 pt-1">
              <div className="space-y-3">
                <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--color-text-inverse)]">
                  <Flame size={12} />
                  Kubwa Promo Alert
                </p>
                <h2
                  id="promo-alert-title"
                  className="text-[1.7rem] font-black leading-tight tracking-tight text-[var(--color-text-inverse)]"
                >
                  Buy 2, Get 1 <span className="text-[var(--color-primary)]">FREE</span> — Tops
                  &amp; T-Shirts
                </h2>
                <p className="text-sm leading-6 text-[rgba(255,250,242,0.78)]">
                  Step up your style game with our Tops &amp; T-Shirts collection. Limited time only —
                  visit us today at Nuhafrik Clothing, Kubwa and grab your favorites before they're
                  gone.
                </p>
              </div>

              <Link
                to="/shop?category=clothing"
                onClick={close}
                className="btn-base btn-primary btn-md w-full"
              >
                <ShoppingBag size={16} />
                Shop the Offer
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
                  href="https://instagram.com/nuhafrikclothing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-[rgba(255,250,242,0.88)] transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary-200)]"
                >
                  <Instagram size={15} className="shrink-0 text-[var(--color-primary)]" />
                  Follow @nuhafrikclothing
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};
