import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[var(--color-surface-dark)] text-[var(--color-text-inverse)]">
      <div className="page-shell py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-6">
            <img
              src="https://i.ibb.co/SX4954mw/Nuhafrik-3.png"
              alt="Nuhafrik Clothing and Accessories Store logo"
              className="w-[136px] max-w-none object-contain"
              referrerPolicy="no-referrer"
              width="136"
              height="40"
            />
            <p className="max-w-md text-sm leading-7 text-[rgba(255,250,242,0.72)]">
              Nuhafrik crafts contemporary African fashion with confident silhouettes, tactile detail, and an editorial approach to everyday dressing.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--color-text-inverse)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <p className="eyebrow text-[var(--color-primary-200)]">Shop</p>
            <div className="flex flex-col gap-3 text-sm text-[rgba(255,250,242,0.72)]">
              <Link to="/shop">Shop All</Link>
              <Link to="/shop?category=clothing">Clothing</Link>
              <Link to="/shop?category=accessories">Accessories</Link>
              <Link to="/shop?filter=new">New Arrivals</Link>
            </div>
          </div>

          <div className="space-y-5">
            <p className="eyebrow text-[var(--color-primary-200)]">Support</p>
            <div className="flex flex-col gap-3 text-sm text-[rgba(255,250,242,0.72)]">
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/shipping-returns">Shipping & Returns</Link>
              <Link to="/faq">FAQ</Link>
            </div>
          </div>

          <div className="space-y-5">
            <p className="eyebrow text-[var(--color-primary-200)]">Visit</p>
            <div className="space-y-4 text-sm text-[rgba(255,250,242,0.72)]">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-[var(--color-primary)]" />
                <span>Nuhafrik Store, Kubwa, Abuja, Nigeria</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[var(--color-primary)]" />
                <span>+234 802 373 6786</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[var(--color-primary)]" />
                <span>hello@nuhafrik.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.08em] text-[rgba(255,250,242,0.45)] md:flex-row md:items-center md:justify-between">
          <p>&copy; {currentYear} Nuhafrik Clothing and Accessories Store.</p>
          <div className="flex gap-5">
            <Link to="/contact">Privacy Policy</Link>
            <Link to="/contact">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
