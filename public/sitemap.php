<?php
/**
 * Nuhafrik sitemap.php — dynamic sitemap generator for cPanel/LiteSpeed.
 *
 * Always emits fresh URLs for every published product plus the core static
 * pages on the correct domain. Served at /sitemap.xml via .htaccess rewrite.
 */

declare(strict_types=1);

const SITE_URL = 'https://www.nuhafrikclothings.com';
const PROJECT_ID = 'nuhafrik-clothings';
const DATABASE_ID = '(default)';

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=1800');

// Keep a small copy of the helpers here so this file is self-contained.
function firestore_request(string $method, string $endpoint): array
{
    $url = 'https://firestore.googleapis.com/v1/projects/' . PROJECT_ID . '/databases/' . urlencode(DATABASE_ID) . '/' . $endpoint;
    $options = array(
        'http' => array(
            'method' => $method,
            'header' => "Accept: application/json\r\n",
            'timeout' => 8,
            'ignore_errors' => true,
        ),
        'ssl' => array(
            'verify_peer' => true,
            'verify_peer_name' => true,
        ),
    );
    $context = stream_context_create($options);
    $response = @file_get_contents($url, false, $context);
    if ($response === false && function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt_array($ch, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => array('Accept: application/json'),
            CURLOPT_SSL_VERIFYPEER => true,
        ));
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
    return null;
}

function fetch_all_products(): array
{
    $data = firestore_request('GET', 'documents/products');
    $products = array();
    foreach ((array) ($data['documents'] ?? array()) as $doc) {
        $fields = (array) ($doc['fields'] ?? array());
        $product = array();
        foreach ($fields as $key => $value) {
            $product[$key] = decode_value($value);
        }
        if (!empty($product['slug']) && !empty($product['name'])) {
            $published = array_key_exists('published', $product) ? (bool) $product['published'] : true;
            if ($published) {
                $products[] = $product;
            }
        }
    }
    return $products;
}

function slugify(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value);
    return trim($value, '-');
}

$urls = array(
    array('loc' => SITE_URL . '/', 'lastmod' => gmdate('Y-m-d')),
    array('loc' => SITE_URL . '/shop', 'lastmod' => gmdate('Y-m-d')),
    array('loc' => SITE_URL . '/about', 'lastmod' => gmdate('Y-m-d')),
    array('loc' => SITE_URL . '/contact', 'lastmod' => gmdate('Y-m-d')),
    array('loc' => SITE_URL . '/faq', 'lastmod' => gmdate('Y-m-d')),
    array('loc' => SITE_URL . '/shipping-returns', 'lastmod' => gmdate('Y-m-d')),
);

foreach (fetch_all_products() as $product) {
    $urls[] = array(
        'loc' => SITE_URL . '/product/' . slugify((string) ($product['category_id'] ?? 'clothing')) . '/' . $product['slug'],
        'lastmod' => gmdate('Y-m-d'),
    );
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($urls as $entry) {
    echo '  <url>' . "\n";
    echo '    <loc>' . htmlspecialchars($entry['loc'], ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</loc>' . "\n";
    echo '    <lastmod>' . $entry['lastmod'] . '</lastmod>' . "\n";
    echo '  </url>' . "\n";
}
echo '</urlset>';
