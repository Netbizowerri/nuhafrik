import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Grid3X3, Package, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCartStore } from '../../store/useCartStore';

export const BottomNav = () => {
  const location = useLocation();
  const cartCount = useCartStore((state) => state.getTotalItems());

  const navItems = [
    { label: 'Home', icon: Home, route: '/' },
    { label: 'Shop', icon: Grid3X3, route: '/shop' },
    { label: 'Cart', icon: ShoppingBag, route: '/cart', badge: cartCount },
    { label: 'Orders', icon: Package, route: '/orders' },
    { label: 'Chat', icon: MessageCircle, route: 'https://wa.me/2348023736786', isExternal: true },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="flex items-center justify-around border-t border-[var(--color-border)] bg-[rgba(255,250,242,0.98)] px-2 py-2 shadow-[0_-8px_24px_rgba(38,5,0,0.08)] backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.route;
          const Icon = item.icon;

          if (item.isExternal) {
            return (
              <a
                key={item.label}
                href={item.route}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex min-w-[4.5rem] flex-col items-center justify-center gap-1 rounded-full px-3 py-2 text-[var(--color-text-secondary)]"
              >
                <Icon size={20} strokeWidth={2} />
                <span className="text-[11px] font-medium">{item.label}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.route}
              to={item.route}
              className={cn(
                'relative flex min-w-[4.5rem] flex-col items-center justify-center gap-1 rounded-full px-3 py-2 transition-all',
                isActive
                  ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] shadow-[var(--shadow-primary)]'
                  : 'text-[var(--color-text-secondary)]'
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[11px] font-medium">{item.label}</span>
              {item.badge ? (
                <span className="absolute right-2 top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-dark)] px-1 text-[9px] font-semibold text-[var(--color-text-inverse)]">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
