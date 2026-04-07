import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { MobileMenu } from './MobileMenu';
import { cn } from '../../lib/utils';

const navLinks = [
  { label: 'Shop', to: '/shop' },
  { label: 'New Arrivals', to: '/shop?filter=new' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
];

export const TopBar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const cartCount = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 48);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50">
        <div className="mb-2 flex h-10 items-center justify-center bg-[var(--color-primary)] px-4 text-center text-sm font-medium tracking-[0.025em] text-[var(--color-text-inverse)] md:mb-0">
          Deliveries Nationwide
        </div>
        <div
          className={cn(
            'transition-all duration-300',
            isScrolled ? 'glass-bar shadow-[var(--shadow-sm)]' : 'border-b border-[var(--color-border)] bg-[var(--color-surface)]'
          )}
        >
          <div className="page-shell flex h-[60px] items-center justify-between gap-4 md:h-[72px]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-dark)] md:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <Link to="/" className="flex items-center">
                <img
                  src="https://i.ibb.co/SX4954mw/Nuhafrik-3.png"
                  alt="NUHAFRIK"
                  className="w-[136px] max-w-none object-contain"
                  referrerPolicy="no-referrer"
                />
              </Link>
            </div>

            <nav className="hidden items-center justify-center gap-8 md:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'border-b-2 border-transparent pb-1 text-sm font-medium tracking-[0.05em] text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-primary)]',
                      isActive && 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => navigate('/search')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-dark)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              <Link
                to="/account"
                className="hidden h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-dark)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] md:inline-flex"
                aria-label="Account"
              >
                <User size={18} />
              </Link>
              <Link
                to="/cart"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-dark)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                aria-label="Cart"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-semibold text-[var(--color-text-inverse)]">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
        </div>
      </header>
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};
