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
}

export const Seo: React.FC<SeoProps> = ({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  noindex = false,
  structuredData,
}) => {
  const canonicalUrl = absoluteUrl(path);
  const metaDescription = truncateDescription(description);
  const metaImage = getMetaImage(image);
  const robots = noindex ? 'noindex, nofollow' : 'index, follow';
  const schemaList = structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:locale" content="en_NG" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={canonicalUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {schemaList.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
