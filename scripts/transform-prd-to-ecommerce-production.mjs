#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const runAudit = args.includes('--audit');
const cwd = process.cwd();

const requiredFiles = [
  'src/App.tsx',
  'src/main.tsx',
  'src/index.css',
  'src/components/seo/Seo.tsx',
  'src/lib/seo.ts',
  'public/robots.txt',
  'public/sitemap.xml',
];

const deploymentFiles = ['vercel.json', 'public/_redirects', '.htaccess'];

const requiredSnippets = [
  { file: 'src/App.tsx', includes: ['BrowserRouter'] },
  { file: 'src/main.tsx', includes: ['HelmetProvider'] },
];

const hasFile = (relativePath) => fs.existsSync(path.join(cwd, relativePath));

const readSafe = (relativePath) => {
  const absolutePath = path.join(cwd, relativePath);
  if (!fs.existsSync(absolutePath)) return '';
  return fs.readFileSync(absolutePath, 'utf8');
};

const log = (message = '') => process.stdout.write(`${message}\n`);

if (!runAudit) {
  log('TRANSFORM PRD TO E-COMMERCE PRODUCTION');
  log('');
  log('Workflow file: docs/TRANSFORM_PRD_TO_ECOMMERCE_PRODUCTION.md');
  log('Memory snapshot: docs/NUHAFRIK_PRODUCTION_MEMORY_SNAPSHOT.md');
  log('');
  log('Suggested execution phases:');
  log('1. Foundation and route architecture');
  log('2. Design system and app shell');
  log('3. Commerce flows (shop, product, cart, checkout)');
  log('4. Admin auth and management pages');
  log('5. SEO metadata and sitemap/robots');
  log('6. Security and deployment hardening');
  log('7. Build, lint, and production verification');
  log('');
  log('Run `npm run transform:prd:audit` to check baseline readiness in this project.');
  process.exit(0);
}

let failures = 0;

log('Running e-commerce production baseline audit...');
log('');

for (const file of requiredFiles) {
  if (hasFile(file)) {
    log(`[PASS] ${file}`);
  } else {
    log(`[FAIL] ${file} (missing)`);
    failures += 1;
  }
}

const hasDeploymentFallback = deploymentFiles.some((file) => hasFile(file));
if (hasDeploymentFallback) {
  const found = deploymentFiles.filter((file) => hasFile(file)).join(', ');
  log(`[PASS] deployment fallback config found (${found})`);
} else {
  log('[FAIL] deployment fallback config missing (expected one of vercel.json, public/_redirects, .htaccess)');
  failures += 1;
}

for (const rule of requiredSnippets) {
  const body = readSafe(rule.file);
  for (const token of rule.includes) {
    if (body.includes(token)) {
      log(`[PASS] ${rule.file} contains "${token}"`);
    } else {
      log(`[FAIL] ${rule.file} missing "${token}"`);
      failures += 1;
    }
  }
}

log('');
if (failures === 0) {
  log('Audit passed: baseline production prerequisites are present.');
  process.exit(0);
}

log(`Audit failed with ${failures} issue(s).`);
process.exit(1);
