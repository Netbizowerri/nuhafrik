<?php
/**
 * Nuhafrik social-meta.php — cPanel/LiteSpeed prerender.
 *
 * Serves full, professional HTML meta tags (Open Graph, Twitter Card, canonical,
 * Product JSON-LD) to social media crawlers (Facebook, WhatsApp, LinkedIn,
 * Telegram, etc.) and search-engine bots. Real browsers pass through to the SPA
 * via .htaccess. This file is dispatched from .htaccess when the User-Agent
 * matches a known crawler.
 *
 * Requires: PHP 7.4+, outbound HTTPS (file_get_contents with ssl context).
 */

declare(strict_types=1);

const SITE_URL = 'https://www.nuhafrikclothings.com';
const PROJECT_ID = 'nuhafrik-clothings';
const DATABASE_ID = '(default)';
const BRAND_NAME = 'Nuhafrik Clothing and Accessories Store';
const BRAND_SHORT = 'Nuhafrik';
const DEFAULT_IMAGE = SITE_URL . '/og-default.png';

// Keep crawlers out of cached CDN layers and give Firestore a short TTL.
header('Cache-Control: public, max-age=600');
header('X-Nuhafrik-SEO: social-prerender');

$requestUri = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '/';
$path = (string) parse_url($requestUri, PHP_URL_PATH);
$path = rtrim($path, '/');
if ($path === '') {
    $path = '/';
}

$staticPages = array(
    '/' => array(
        'title' => 'Nuhafrik Clothing and Accessories Store | African-Inspired Fashion in Nigeria',
        'description' => 'Shop Nuhafrik clothing and accessories — Ankara tops, Aso-Oke sets, dresses, bags, gele, and more with fast nationwide delivery across Nigeria.',
    ),
    '/shop' => array(
        'title' => 'Shop Clothing and Accessories | Nuhafrik',
        'description' => 'Browse Nuhafrik clothing and accessories with curated African-inspired style, reliable delivery, and quality finishing for everyday wear.',
    ),
    '/about' => array(
        'title' => 'About Nuhafrik | African Heritage, Global Style',
        'description' => 'Nuhafrik is a modern fashion store in Kubwa, Abuja celebrating African heritage while embracing global style with premium clothing and accessories.',
    ),
    '/contact' => array(
        'title' => 'Contact Nuhafrik | Customer Care',
        'description' => 'Get in touch with Nuhafrik for orders, delivery, and support. Visit our store in Kubwa, Abuja or message us via phone and WhatsApp.',
    ),
    '/faq' => array(
        'title' => 'Frequently Asked Questions | Nuhafrik',
        'description' => 'Answers to common questions about Nuhafrik products, ordering, payment, sizes, and delivery across Nigeria.',
    ),
    '/shipping-returns' => array(
        'title' => 'Shipping & Returns | Nuhafrik',
        'description' => 'Nuhafrik nationwide delivery details, delivery timelines, and our returns and exchange policy for Nigeria.',
    ),
);

// ---------------------------------------------------------------- Firestore

function firestore_request(string $method, string $endpoint, array $body = array()): array
{
    $url = 'https://firestore.googleapis.com/v1/projects/' . PROJECT_ID . '/databases/' . urlencode(DATABASE_ID) . '/' . $endpoint;
    $options = array(
        'http' => array(
            'method' => $method,
            'header' => "Content-Type: application/json\r\nAccept: application/json\r\n",
            'timeout' => 8,
            'ignore_errors' => true,
        ),
        'ssl' => array(
            'verify_peer' => true,
            'verify_peer_name' => true,
        ),
    );
    if (!empty($body)) {
        $options['http']['content'] = json_encode($body);
    }
    $context = stream_context_create($options);
    $response = @file_get_contents($url, false, $context);
    if ($response === false && function_exists('curl_init')) {
        // Fallback for hosts with allow_url_fopen disabled.
        $ch = curl_init();
        curl_setopt_array($ch, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => array('Content-Type: application/json', 'Accept: application/json'),
            CURLOPT_SSL_VERIFYPEER => true,
        ));
        if (!empty($body)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }
        $response = curl_exec($ch);
        curl_close($ch);
    }
    if ($response === false) {
        return array();
    }
    $data = json_decode($response, true);
    return is_array($data) ? $data : array();
}

function decode_value($value)
{
    if (!is_array($value)) {
        return null;
    }
    if (array_key_exists('stringValue', $value)) {
        return (string) $value['stringValue'];
    }
    if (array_key_exists('integerValue', $value)) {
        return (int) $value['integerValue'];
    }
    if (array_key_exists('doubleValue', $value)) {
        return (float) $value['doubleValue'];
    }
    if (array_key_exists('booleanValue', $value)) {
        return (bool) $value['booleanValue'];
    }
    if (array_key_exists('nullValue', $value)) {
        return null;
    }
    if (array_key_exists('timestampValue', $value)) {
        return (string) $value['timestampValue'];
    }
    if (array_key_exists('mapValue', $value)) {
        $out = array();
        foreach ((array) ($value['mapValue']['fields'] ?? array()) as $key => $item) {
            $out[$key] = decode_value($item);
        }
        return $out;
    }
    if (array_key_exists('arrayValue', $value)) {
        $out = array();
        foreach ((array) ($value['arrayValue']['values'] ?? array()) as $item) {
            $out[] = decode_value($item);
        }
        return $out;
    }
    if (array_key_exists('referenceValue', $value)) {
        return (string) $value['referenceValue'];
    }
    return null;
}

function fields_to_product(array $fields): ?array
{
    if (empty($fields)) {
        return null;
    }
    $product = array();
    foreach ($fields as $key => $value) {
        $product[$key] = decode_value($value);
    }
    if (empty($product['name']) || empty($product['slug'])) {
        return null;
    }
    return $product;
}

function fetch_product_by_slug(string $slug): ?array
{
    $data = firestore_request('POST', 'documents:runQuery', array(
        'structuredQuery' => array(
            'from' => array(array('collectionId' => 'products')),
            'where' => array(
                'fieldFilter' => array(
                    'field' => array('fieldPath' => 'slug'),
                    'op' => 'EQUAL',
                    'value' => array('stringValue' => $slug),
                ),
            ),
            'limit' => 1,
        ),
    ));
    if (isset($data[0]['document']['fields'])) {
        return fields_to_product($data[0]['document']['fields']);
    }
    return null;
}

function fetch_product_by_id(string $id): ?array
{
    $data = firestore_request('GET', 'documents/products/' . rawurlencode($id));
    if (isset($data['fields'])) {
        return fields_to_product($data['fields']);
    }
    return null;
}

function fetch_all_products(): array
{
    $data = firestore_request('GET', 'documents/products');
    $products = array();
    foreach ((array) ($data['documents'] ?? array()) as $doc) {
        $product = fields_to_product((array) ($doc['fields'] ?? array()));
        if ($product !== null) {
            $products[] = $product;
        }
    }
    return $products;
}

// ---------------------------------------------------------------- Helpers

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function absolute_image(?string $image): string
{
    if ($image === null || $image === '') {
        return DEFAULT_IMAGE;
    }
    if (preg_match('#^https?://#i', $image)) {
        return $image;
    }
    return SITE_URL . $image;
}

function slugify(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value);
    return trim($value, '-');
}

function product_primary_image(array $product): ?string
{
    $images = (array) ($product['images'] ?? array());
    foreach ($images as $image) {
        if (!empty($image['is_primary'])) {
            return (string) ($image['url'] ?? '');
        }
    }
    if (isset($images[0]['url'])) {
        return (string) $images[0]['url'];
    }
    return null;
}

function render_html(string $title, string $description, string $url, ?string $image, string $type = 'website', bool $noindex = false, array $schema = array()): void
{
    $titleEsc = e($title);
    $descEsc = e($description);
    $imageAbs = absolute_image($image);
    $imageEsc = e($imageAbs);
    $urlEsc = e($url);
    $robots = $noindex ? 'noindex, nofollow' : 'index, follow';
    $schemaBlock = $schema ? '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' : '';

    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html>' . "\n";
    echo '<html lang="en">' . "\n";
    echo '<head>' . "\n";
    echo '<meta charset="UTF-8" />' . "\n";
    echo '<meta name="viewport" content="width=device-width, initial-scale=1.0" />' . "\n";
    echo '<title>' . $titleEsc . '</title>' . "\n";
    echo '<meta name="description" content="' . $descEsc . '" />' . "\n";
    echo '<meta name="robots" content="' . $robots . '" />' . "\n";
    echo '<link rel="canonical" href="' . $urlEsc . '" />' . "\n";
    echo '<meta property="og:locale" content="en_NG" />' . "\n";
    echo '<meta property="og:site_name" content="' . e(BRAND_NAME) . '" />' . "\n";
    echo '<meta property="og:type" content="' . $type . '" />' . "\n";
    echo '<meta property="og:title" content="' . $titleEsc . '" />' . "\n";
    echo '<meta property="og:description" content="' . $descEsc . '" />' . "\n";
    echo '<meta property="og:image" content="' . $imageEsc . '" />' . "\n";
    echo '<meta property="og:image:alt" content="' . $titleEsc . '" />' . "\n";
    echo '<meta property="og:url" content="' . $urlEsc . '" />' . "\n";
    echo '<meta name="twitter:card" content="summary_large_image" />' . "\n";
    echo '<meta name="twitter:site" content="@nuhafrik" />' . "\n";
    echo '<meta name="twitter:title" content="' . $titleEsc . '" />' . "\n";
    echo '<meta name="twitter:description" content="' . $descEsc . '" />' . "\n";
    echo '<meta name="twitter:image" content="' . $imageEsc . '" />' . "\n";
    echo $schemaBlock . "\n";
    echo '</head>' . "\n";
    echo '<body><main>' . "\n";
    echo '<img src="' . $imageEsc . '" alt="' . $titleEsc . '" />' . "\n";
    echo '<h1>' . $titleEsc . '</h1>' . "\n";
    echo '<p>' . $descEsc . '</p>' . "\n";
    echo '<a href="' . $urlEsc . '">' . e(BRAND_SHORT) . '</a>' . "\n";
    echo '</main></body>' . "\n";
    echo '</html>';
    exit;
}

function product_schema(array $product, string $url): array
{
    $categoryLabel = str_replace(array('-', '_'), ' ', (string) ($product['category_id'] ?? ''));
    $imageUrls = array();
    foreach ((array) ($product['images'] ?? array()) as $image) {
        if (!empty($image['url'])) {
            $imageUrls[] = $image['url'];
        }
    }
    $sellingPrice = isset($product['pricing']['selling_price']) ? (float) $product['pricing']['selling_price'] : 0;
    $inventory = isset($product['inventory']) ? (int) $product['inventory'] : 0;

    return array(
        '@context' => 'https://schema.org',
        '@type' => 'Product',
        'name' => (string) $product['name'],
        'description' => (string) ($product['short_description'] ?? $product['description'] ?? ''),
        'image' => $imageUrls,
        'sku' => (string) ($product['sku'] ?? $product['slug']),
        'category' => $categoryLabel,
        'brand' => array('@type' => 'Brand', 'name' => 'Nuhafrik'),
        'offers' => array(
            '@type' => 'Offer',
            'url' => $url,
            'priceCurrency' => 'NGN',
            'price' => $sellingPrice,
            'availability' => $inventory > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            'itemCondition' => 'https://schema.org/NewCondition',
        ),
    );
}

// ---------------------------------------------------------------- Routing

// Product: /product/:category/:slug (new canonical URLs)
if (preg_match('#^/product/([^/]+)/([^/]+)$#', $path, $matches)) {
    $slug = $matches[2];
    $product = fetch_product_by_slug($slug);
    if ($product !== null) {
        $categorySlug = slugify((string) ($product['category_id'] ?? 'clothing'));
        $canonical = SITE_URL . '/product/' . $categorySlug . '/' . $product['slug'];
        $primaryImage = product_primary_image($product);
        $categoryLabel = str_replace(array('-', '_'), ' ', (string) ($product['category_id'] ?? ''));
        $title = $product['name'] . ' | ' . BRAND_NAME;
        $description = $product['name'] . ' at Nuhafrik with ' . $categoryLabel . ' styling, quality finishing, and delivery across Nigeria. Shop sizes, colors, and current pricing online.';
        render_html($title, $description, $canonical, $primaryImage, 'product', false, product_schema($product, $canonical));
    }
    render_html(BRAND_NAME . ' | ' . BRAND_SHORT, 'The requested Nuhafrik product could not be found.', SITE_URL . $path, null, 'website', true);
}

// Product (legacy): /product/:id — serve preview and point to canonical URL
if (preg_match('#^/product/([^/]+)$#', $path, $matches)) {
    $id = $matches[1];
    $product = fetch_product_by_id($id);
    if ($product === null) {
        $product = fetch_product_by_slug($id);
    }
    if ($product !== null) {
        $categorySlug = slugify((string) ($product['category_id'] ?? 'clothing'));
        $canonical = SITE_URL . '/product/' . $categorySlug . '/' . $product['slug'];
        $primaryImage = product_primary_image($product);
        $categoryLabel = str_replace(array('-', '_'), ' ', (string) ($product['category_id'] ?? ''));
        $title = $product['name'] . ' | ' . BRAND_NAME;
        $description = $product['name'] . ' at Nuhafrik with ' . $categoryLabel . ' styling, quality finishing, and delivery across Nigeria. Shop sizes, colors, and current pricing online.';
        render_html($title, $description, $canonical, $primaryImage, 'product', false, product_schema($product, $canonical));
    }
    render_html(BRAND_NAME . ' | ' . BRAND_SHORT, 'The requested Nuhafrik product could not be found.', SITE_URL . $path, null, 'website', true);
}

// Static pages
if (isset($staticPages[$path])) {
    $page = $staticPages[$path];
    render_html($page['title'], $page['description'], SITE_URL . $path, null, 'website');
}

// Fallback for any other path
render_html(BRAND_NAME . ' | ' . BRAND_SHORT, 'Shop premium African-inspired clothing and accessories with fast nationwide delivery across Nigeria.', SITE_URL . $path, null, 'website', true);
