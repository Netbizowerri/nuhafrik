/**
 * Vercel Routing Middleware — framework-agnostic (works with the Vite SPA build).
 *
 * Serves full, professional HTML meta tags (Open Graph, Twitter Card, canonical,
 * Product JSON-LD) to social media crawlers and search-engine bots so that when a
 * Nuhafrik URL is shared on Facebook, WhatsApp, LinkedIn, Telegram, etc., the rich
 * preview (title + description + product image) appears. Real browsers pass through
 * untouched to the SPA shell.
 */
import firebaseConfig from './firebase-applet-config.json';

const SITE_URL = 'https://www.nuhafrikclothings.com';
const PROJECT_ID = firebaseConfig.projectId;
const DATABASE_ID = firebaseConfig.firestoreDatabaseId || '(default)';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${encodeURIComponent(DATABASE_ID)}`;

const CRAWLER_PATTERN =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Discordbot|Slackbot|Pinterest|Googlebot|bingbot|Baiduspider|YandexBot|DuckDuckBot|Applebot|W3C_Validator|vkShare|embedly|redditbot|SkypeUriPreview|MicroMessenger|curl|python-requests|Google-InspectionTool|MegaIndex|ia_archiver|Snapchat|Line|Viber|Wechat|TencentTraveler/i;

const BRAND_NAME = 'Nuhafrik Clothing and Accessories Store';
const BRAND_SHORT = 'Nuhafrik';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

const STATIC_PAGES: Record<string, { title: string; description: string; image?: string }> = {
  '/': {
    title: 'Nuhafrik Clothing and Accessories Store | African-Inspired Fashion in Nigeria',
    description:
      'Shop Nuhafrik clothing and accessories — Ankara tops, Aso-Oke sets, dresses, bags, gele, and more with fast nationwide delivery across Nigeria.',
  },
  '/shop': {
    title: 'Shop Clothing and Accessories | Nuhafrik',
    description:
      'Browse Nuhafrik clothing and accessories with curated African-inspired style, reliable delivery, and quality finishing for everyday wear.',
  },
  '/about': {
    title: 'About Nuhafrik | African Heritage, Global Style',
    description:
      'Nuhafrik is a modern fashion store in Kubwa, Abuja celebrating African heritage while embracing global style with premium clothing and accessories.',
  },
  '/contact': {
    title: 'Contact Nuhafrik | Customer Care',
    description:
      'Get in touch with Nuhafrik for orders, delivery, and support. Visit our store in Kubwa, Abuja or message us via phone and WhatsApp.',
  },
  '/faq': {
    title: 'Frequently Asked Questions | Nuhafrik',
    description:
      'Answers to common questions about Nuhafrik products, ordering, payment, sizes, and delivery across Nigeria.',
  },
  '/shipping-returns': {
    title: 'Shipping & Returns | Nuhafrik',
    description:
      'Nuhafrik nationwide delivery details, delivery timelines, and our returns and exchange policy for Nigeria.',
  },
};

interface Product {
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  category_id: string;
  sku?: string;
  images?: { url: string; is_primary?: boolean; alt?: string }[];
  pricing?: { selling_price?: number };
  inventory?: number;
}

function readValue(value: any): any {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number.parseInt(value.integerValue, 10);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('mapValue' in value) {
    const out: Record<string, any> = {};
    for (const [key, item] of Object.entries(value.mapValue?.fields || {})) {
      out[key] = readValue(item);
    }
    return out;
  }
  if ('arrayValue' in value) {
    return (value.arrayValue?.values || []).map((item: any) => readValue(item));
  }
  if ('referenceValue' in value) return value.referenceValue;
  return undefined;
}

function fieldsToProduct(fields: Record<string, any>): Product | null {
  if (!fields) return null;
  const raw = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, readValue(v)]));
  if (!raw.name || !raw.slug) return null;
  return {
    name: String(raw.name),
    slug: String(raw.slug),
    description: String(raw.description || ''),
    short_description: raw.short_description ? String(raw.short_description) : undefined,
    category_id: String(raw.category_id || 'clothing'),
    sku: raw.sku ? String(raw.sku) : undefined,
    images: Array.isArray(raw.images) ? raw.images : [],
    pricing: raw.pricing || {},
    inventory: typeof raw.inventory === 'number' ? raw.inventory : 0,
  };
}

async function firestoreFetch(path: string, init?: RequestInit): Promise<any> {
  const url = `${FIRESTORE_BASE}/${path}`;
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`Firestore ${response.status}`);
  return response.json();
}

async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const body = {
      structuredQuery: {
        from: [{ collectionId: 'products' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'slug' },
            op: 'EQUAL',
            value: { stringValue: slug },
          },
        },
        limit: 1,
      },
    };
    const data = await firestoreFetch('documents:runQuery', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (Array.isArray(data) && data[0]?.document?.fields) {
      return fieldsToProduct(data[0].document.fields);
    }
    return null;
  } catch (error) {
    console.error('getProductBySlug failed:', error);
    return null;
  }
}

async function getAllProducts(): Promise<Product[]> {
  try {
    const data = await firestoreFetch('documents/products');
    const docs = Array.isArray(data?.documents) ? data.documents : [];
    return docs
      .map((doc: any) => (doc?.fields ? fieldsToProduct(doc.fields) : null))
      .filter((product: Product | null): product is Product => product !== null);
  } catch (error) {
    console.error('getAllProducts failed:', error);
    return [];
  }
}

async function getProductByDocId(id: string): Promise<Product | null> {
  try {
    const data = await firestoreFetch(`documents/products/${encodeURIComponent(id)}`);
    if (data?.fields) return fieldsToProduct(data.fields);
    return null;
  } catch {
    return null;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function absoluteImage(image?: string): string {
  if (!image) return DEFAULT_IMAGE;
  return /^https?:\/\//i.test(image) ? image : `${SITE_URL}${image}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function renderHtml(input: {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  schema?: Record<string, unknown>;
}): Response {
  const title = escapeHtml(input.title);
  const description = escapeHtml(input.description);
  const image = escapeHtml(absoluteImage(input.image));
  const canonical = escapeHtml(input.url);
  const robots = input.noindex ? 'noindex, nofollow' : 'index, follow';
  const type = input.type || 'website';
  const schema = input.schema ? `<script type="application/ld+json">${JSON.stringify(input.schema)}</script>` : '';

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta name="robots" content="${robots}" />
<link rel="canonical" href="${canonical}" />
<meta property="og:locale" content="en_NG" />
<meta property="og:site_name" content="${BRAND_NAME}" />
<meta property="og:type" content="${type}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:alt" content="${title}" />
<meta property="og:url" content="${canonical}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@nuhafrik" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
${schema}
</head>
<body>
<main>
  <img src="${image}" alt="${title}" />
  <h1>${title}</h1>
  <p>${description}</p>
  <a href="${canonical}">${BRAND_SHORT}</a>
</main>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      'x-nuhafrik-seo': 'social-prerender',
    },
  });
}

function productSchema(product: Product, url: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description || product.description,
    image: (product.images || []).map((image) => image.url),
    sku: product.sku || product.slug,
    category: (product.category_id || '').replace(/[-_]/g, ' '),
    brand: { '@type': 'Brand', name: 'Nuhafrik' },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'NGN',
      price: product.pricing?.selling_price ?? 0,
      availability:
        (product.inventory ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

async function renderSitemap(): Promise<Response> {
  const staticPaths = ['/', '/shop', '/about', '/contact', '/faq', '/shipping-returns'];
  const urls = staticPaths.map((path) => `${SITE_URL}${path === '/' ? '/' : path}`);
  const products = await getAllProducts();
  for (const product of products) {
    urls.push(`${SITE_URL}/product/${slugify(product.category_id || 'clothing')}/${product.slug}`);
  }
  const today = new Date().toISOString().slice(0, 10);
  const entries = urls
    .map(
      (loc) =>
        `  <url>\n    <loc>${escapeHtml(loc)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=1800',
      'x-nuhafrik-seo': 'dynamic-sitemap',
    },
  });
}

export async function middleware(request: Request): Promise<Response | undefined> {
  console.log('NUHAFRIK_MIDDLEWARE_V3 marker', request.url);
  return new Response('MW_RESPONSE_OK', { status: 200, headers: { 'x-nuhafrik-seo': 'marker-test' } });
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  // Static assets pass through untouched.
  if (/\.(?:js|css|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|eot|map|txt|json|php|html)$/i.test(pathname)) {
    return undefined;
  }

  // Sitemap: serve fresh product URLs to everyone (not just crawlers).
  if (pathname === '/sitemap.xml') {
    return renderSitemap();
  }

  const userAgent = request.headers.get('user-agent') || '';
  if (!CRAWLER_PATTERN.test(userAgent)) return undefined;

  // Product pages: /product/:category/:slug (new) and /product/:id (legacy)
  const productMatch = pathname.match(/^\/product\/([^/]+)\/([^/]+)$/);
  const legacyMatch = !productMatch ? pathname.match(/^\/product\/([^/]+)$/) : null;

  let product: Product | null = null;
  if (productMatch) {
    const [, , slug] = productMatch;
    product = await getProductBySlug(slug);
  } else if (legacyMatch) {
    const id = legacyMatch[1];
    product = (await getProductByDocId(id)) || (await getProductBySlug(id));
  }

  if (product) {
    const categorySlug = slugify(product.category_id || 'clothing');
    const canonical = `${SITE_URL}/product/${categorySlug}/${product.slug}`;
    const primaryImage = (product.images || []).find((image) => image.is_primary) || (product.images || [])[0];
    const categoryLabel = (product.category_id || '').replace(/[-_]/g, ' ');
    const title = `${product.name} | ${BRAND_NAME}`;
    const description = `${product.name} at Nuhafrik with ${categoryLabel} styling, quality finishing, and delivery across Nigeria. Shop sizes, colors, and current pricing online.`;

    return renderHtml({
      title,
      description,
      url: canonical,
      image: primaryImage?.url,
      type: 'product',
      schema: productSchema(product, canonical),
    });
  }

  // Static pages
  if (STATIC_PAGES[pathname]) {
    const page = STATIC_PAGES[pathname];
    return renderHtml({
      title: page.title,
      description: page.description,
      url: `${SITE_URL}${pathname}`,
      image: page.image,
    });
  }

  // Fallback for any other path: brand defaults (noindex)
  return renderHtml({
    title: `${BRAND_NAME} | ${BRAND_SHORT}`,
    description: 'Shop premium African-inspired clothing and accessories with fast nationwide delivery across Nigeria.',
    url: `${SITE_URL}${pathname}`,
    noindex: true,
  });
}

export const config = {
  matcher: ['/:path*'],
};
