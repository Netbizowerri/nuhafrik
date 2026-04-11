import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Home,
  ShoppingBag,
  Info,
  Phone,
  User,
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  Shirt,
  Gem,
  Briefcase,
  Footprints,
} from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { name: 'CLOTHING', icon: Shirt, slug: 'clothing' },
  { name: 'ACCESSORIES', icon: Gem, slug: 'accessories' },
  { name: 'FOOTWEARS', icon: Footprints, slug: 'shoes' },
];

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<'main' | 'shop'>('main');
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Shop', icon: ShoppingBag, path: '/shop', hasSubmenu: true },
    { label: 'About', icon: Info, path: '/about' },
    { label: 'Contact', icon: Phone, path: '/contact' },
    { label: 'Account', icon: User, path: '/account' },
    { label: 'FAQ', icon: HelpCircle, path: '/faq' },
  ];

  const handleItemClick = (item: (typeof menuItems)[number]) => {
    if (item.hasSubmenu) {
      setView('shop');
      return;
    }
    onClose();
    navigate(item.path);
  };

  const handleClose = () => {
    setView('main');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-[var(--color-surface-overlay)]"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
            className="fixed inset-y-0 left-0 z-[70] flex w-full max-w-full flex-col overflow-hidden bg-[var(--color-dark)] text-[var(--color-text-inverse)] shadow-[var(--shadow-2xl)]"
          >
            <div className="flex items-center justify-between px-6 pb-5 pt-6">
              <Link to="/" onClick={handleClose}>
                <img
                  src="https://i.ibb.co/SX4954mw/Nuhafrik-3.png"
                  alt="Nuhafrik Clothing and Accessories Store logo"
                  className="w-[136px] max-w-none object-contain"
                  referrerPolicy="no-referrer"
                  width="136"
                  height="40"
                />
              </Link>
              <button
                onClick={handleClose}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--color-text-inverse)]"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="brand-divider bg-white/10" />

            <div className="relative min-h-0 flex-1 overflow-hidden">
              <motion.div
                animate={{ x: view === 'main' ? 0 : '-100%' }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col overflow-y-auto px-6 py-8 no-scrollbar"
              >
                <p className="eyebrow text-[var(--color-primary-200)]">Wear Your Heritage</p>
                <div className="mt-8 flex flex-col gap-3">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleItemClick(item)}
                        className="flex items-center justify-between rounded-[var(--radius-xl)] border border-white/10 bg-white/5 px-5 py-4 text-left transition-colors hover:border-[var(--color-primary)] hover:bg-white/10"
                      >
                        <span className="flex items-center gap-4">
                          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)]">
                            <Icon size={18} />
                          </span>
                          <span className="text-base font-semibold">{item.label}</span>
                        </span>
                        {item.hasSubmenu ? <ChevronRight size={18} className="text-[var(--color-primary-200)]" /> : null}
                      </motion.button>
                    );
                  })}
                </div>
                <div className="mt-auto">
                  <div className="surface-card-dark p-6">
                    <p className="eyebrow">Fresh Drop</p>
                    <p className="mt-3 text-2xl font-bold tracking-tight">Nuhafrik Clothing and Accessories Store Kubwa is a modern fashion hub dedicated to celebrating African heritage while embracing global style.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: view === 'shop' ? 0 : '100%' }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col overflow-y-auto px-6 py-8 no-scrollbar"
              >
                <button
                  onClick={() => setView('main')}
                  className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-semibold tracking-[0.05em] text-[var(--color-primary-200)]"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <p className="eyebrow">Shop Categories</p>
                <div className="mt-6 flex flex-col gap-3">
                  {categories.map((cat, index) => {
                    const Icon = cat.icon;
                    return (
                      <motion.button
                        key={cat.slug}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          handleClose();
                          navigate(`/shop?category=${cat.slug}`);
                        }}
                        className="flex items-center justify-between rounded-[var(--radius-xl)] border border-white/10 bg-white/5 px-5 py-4 text-left transition-colors hover:border-[var(--color-primary)] hover:bg-white/10"
                      >
                        <span className="flex items-center gap-4">
                          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[var(--color-primary)]">
                            <Icon size={18} />
                          </span>
                          <span>
                            <span className="block text-base font-semibold">{cat.name}</span>
                            <span className="mt-1 block text-xs uppercase tracking-[0.1em] text-white/50">Explore collection</span>
                          </span>
                        </span>
                        <ChevronRight size={18} className="text-[var(--color-primary-200)]" />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};
