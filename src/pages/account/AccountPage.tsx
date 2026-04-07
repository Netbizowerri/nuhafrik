import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { Bell, Heart, HelpCircle, Info, LayoutDashboard, LogOut, MapPin, Package } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export const AccountPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'My Orders', icon: Package, route: '/orders' },
    { label: 'Wishlist', icon: Heart, route: '/shop' },
    { label: 'Saved Addresses', icon: MapPin, route: '/contact' },
    { label: 'Notifications', icon: Bell, route: '/faq' },
    { label: 'Help & Support', icon: HelpCircle, route: '/contact' },
    { label: 'About Nuhafrik', icon: Info, route: '/about' },
  ];

  if (isAdmin) {
    menuItems.unshift({ label: 'Admin Dashboard', icon: LayoutDashboard, route: '/admin' });
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div className="empty-state page-shell text-[var(--color-text-secondary)]">Loading account...</div>;
  }

  return (
    <div className="page-shell page-stack">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="surface-card-dark p-8 md:p-10">
          <p className="eyebrow">My Account</p>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary)] text-2xl font-bold text-[var(--color-text-inverse)]">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="h-full w-full object-cover" />
              ) : (
                <span>{user?.displayName?.[0] || user?.email?.[0] || 'G'}</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user?.displayName || 'Guest User'}</h1>
              <p className="mt-1 text-sm text-[rgba(255,250,242,0.72)]">{user?.email || 'Sign in to manage your orders and preferences'}</p>
              {isAdmin ? <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-primary-200)]">Administrator</span> : null}
            </div>
          </div>
        </div>

        {!user ? (
          <div className="surface-card p-8 md:p-10">
            <p className="eyebrow">Guest Access</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--color-text-primary)]">Sign in to unlock your account.</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              Create an account to track orders, move through checkout faster, and keep your details in one place.
            </p>
            <Link to="/login" className="btn-base btn-primary btn-lg mt-8 inline-flex">
              Sign In / Register
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Orders', value: 'Active', icon: Package },
              { label: 'Style', value: 'Saved', icon: Heart },
              { label: 'Support', value: 'Open', icon: HelpCircle },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="surface-card p-6">
                  <span className="icon-pill">
                    <Icon size={18} />
                  </span>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="surface-card overflow-hidden">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.route}
              className={cn(
                'flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-[var(--color-primary-50)]',
                index !== menuItems.length - 1 && 'border-b border-[var(--color-border)]'
              )}
            >
              <span className="flex items-center gap-4">
                <span className="icon-pill h-11 w-11">
                  <Icon size={18} />
                </span>
                <span className="text-base font-semibold text-[var(--color-text-primary)]">{item.label}</span>
              </span>
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Open</span>
            </Link>
          );
        })}
      </section>

      {user ? (
        <button onClick={handleSignOut} className="btn-base btn-outline btn-lg w-full md:w-fit">
          <LogOut size={18} />
          Sign Out
        </button>
      ) : null}
    </div>
  );
};
