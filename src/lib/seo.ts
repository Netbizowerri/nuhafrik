export const BRAND_NAME = 'Nuhafrik Clothing and Accessories Store';
export const DEFAULT_SITE_URL = 'https://nuhafrik.vercel.app';
export const DEFAULT_OG_IMAGE_PATH = '/og-default.svg';

export const BUSINESS_DETAILS = {
  name: BRAND_NAME,
  shortName: 'Nuhafrik',
  description:
    'Nuhafrik Clothing and Accessories Store Kubwa is a modern fashion hub dedicated to celebrating African heritage while embracing global style.',
  phone: '+234 802 373 6786',
  email: 'hello@nuhafrik.com',
  streetAddress: 'Nuhafrik Store, Kubwa',
  addressLocality: 'Abuja',
  addressRegion: 'FCT',
  postalCode: '901101',
  addressCountry: 'NG',
};

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export const getSiteUrl = () => {
  const envUrl = import.meta.env.VITE_SITE_URL?.trim();

  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return DEFAULT_SITE_URL;
};

export const normalizePath = (path = '/') => {
  if (!path || path === '/') {
    return '/';
  }

  return `/${path.replace(/^\/+/, '')}`;
};

export const absoluteUrl = (pathOrUrl = '/') => {
  if (ABSOLUTE_URL_PATTERN.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return new URL(normalizePath(pathOrUrl), `${getSiteUrl()}/`).toString();
};

export const sanitizeDescription = (description: string) => description.replace(/\s+/g, ' ').trim();

export const truncateDescription = (description: string, maxLength = 160) => {
  const cleanDescription = sanitizeDescription(description);

  if (cleanDescription.length <= maxLength) {
    return cleanDescription;
  }

  return `${cleanDescription.slice(0, maxLength - 3).trimEnd()}...`;
};

export const getMetaImage = (imagePath = DEFAULT_OG_IMAGE_PATH) => absoluteUrl(imagePath);
