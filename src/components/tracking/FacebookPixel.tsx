import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const FacebookPixel = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.fbq?.('track', 'PageView');
  }, [pathname, search]);

  return null;
};