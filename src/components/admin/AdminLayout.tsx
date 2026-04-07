import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
  { icon: Users, label: 'Customers', path: '/admin/customers' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A]">
      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        ) : null}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-[#1E1E1E] text-white transition-all duration-300 ease-in-out lg:translate-x-0',
          isSidebarOpen ? 'w-64' : 'w-20',
          isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-20 items-center justify-between px-6">
          {(isSidebarOpen || isMobileMenuOpen) ? (
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tighter text-white">NUHAFRIK</span>
              <span className="rounded bg-primary px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">Admin</span>
            </Link>
          ) : null}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden rounded-lg p-1.5 hover:bg-white/10 lg:block">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-1.5 hover:bg-white/10 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive ? 'bg-primary text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon size={20} className={cn(isActive ? 'text-white' : 'text-white/60 group-hover:text-white')} />
                {(isSidebarOpen || isMobileMenuOpen) ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={20} />
            {(isSidebarOpen || isMobileMenuOpen) ? <span>Logout</span> : null}
          </button>
        </div>
      </aside>

      <div className={cn('flex flex-1 flex-col transition-all duration-300 ease-in-out', isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20', 'pl-0')}>
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold tracking-tight lg:text-xl">
              {menuItems.find((item) => item.path === location.pathname)?.label || 'Admin'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="h-10 w-64 rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100">
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200">
              <img src="https://picsum.photos/seed/admin/100/100" alt="Admin" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children ?? <Outlet />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
