import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';

interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface)] font-sans text-[var(--color-text-primary)]">
      <TopBar />
      <main className="flex-1 pb-[5.5rem] md:pb-0">{children ?? <Outlet />}</main>
      <Footer />
      <BottomNav />
    </div>
  );
};
