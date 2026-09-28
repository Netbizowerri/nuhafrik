import React from 'react';
import { Helmet } from 'react-helmet-async';
import { absoluteUrl, getMetaImage, truncateDescription } from '../../lib/seo';

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
  product?: {
    price?: string | number;
    currency?: string;
    availability?: string;
  };
}

export const Seo: React.FC<SeoProps> = ({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  noindex = false,
  structuredData,
  product,
}) => {
  const canonicalUrl = absoluteUrl(path);
  const metaDescription = truncateDescription(description);
  const metaImage = getMetaImage(image);
  const robots = noindex ? 'noindex, nofollow' : 'index, follow';
  const schemaList = structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : [];
  const isProduct = type === 'product';

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:locale" content="en_NG" />
      <meta property="og:site_name" content="Nuhafrik Clothing and Accessories Store" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={canonicalUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@nuhafrik" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {isProduct && product ? (
        <>
          <meta property="product:price:amount" content={String(product.price ?? '')} />
          <meta property="product:price:currency" content={product.currency ?? 'NGN'} />
          <meta property="product:availability" content={product.availability ?? 'in stock'} />
          <meta property="og:price:amount" content={String(product.price ?? '')} />
          <meta property="og:price:currency" content={product.currency ?? 'NGN'} />
        </>
      ) : null}

      {schemaList.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};