import { createSign } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const serviceAccountPath = path.join(__dirname, 'service-account.json');
const rulesPath = path.join(repoRoot, 'firestore.rules');

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
const rulesSource = readFileSync(rulesPath, 'utf-8');

const projectId = serviceAccount.project_id;
const releaseName = `projects/${projectId}/releases/cloud.firestore`;

const toBase64Url = (value) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const createSignedJwt = () => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: serviceAccount.token_uri,
    scope: 'https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/cloud-platform',
    iat: issuedAt,
    exp: issuedAt + 3600,
  };

  const unsignedToken = `${toBase64Url(JSON.stringify(header))}.${toBase64Url(JSON.stringify(payload))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();

  const signature = signer.sign(serviceAccount.private_key);
  return `${unsignedToken}.${signature
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')}`;
};

const getAccessToken = async () => {
  const assertion = createSignedJwt();
  const response = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token;
};

const callRulesApi = async (accessToken, pathname, options = {}) => {
  const response = await fetch(`https://firebaserules.googleapis.com/v1/${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Rules API request failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
};

const main = async () => {
  const accessToken = await getAccessToken();

  const ruleset = await callRulesApi(accessToken, `projects/${projectId}/rulesets`, {
    method: 'POST',
    body: JSON.stringify({
      source: {
        files: [
          {
            name: 'firestore.rules',
            content: rulesSource,
          },
        ],
      },
    }),
  });

  console.log(`Created ruleset: ${ruleset.name}`);

  try {
    const release = await callRulesApi(
      accessToken,
      releaseName,
      {
        method: 'PATCH',
        body: JSON.stringify({
          release: {
            name: releaseName,
            rulesetName: ruleset.name,
          },
          updateMask: 'rulesetName',
        }),
      }
    );

    console.log(`Updated release: ${release.name}`);
  } catch (error) {
    if (!String(error.message).includes('404')) {
      throw error;
    }

    const release = await callRulesApi(accessToken, `projects/${projectId}/releases`, {
      method: 'POST',
      body: JSON.stringify({
        name: releaseName,
        rulesetName: ruleset.name,
      }),
    });

    console.log(`Created release: ${release.name}`);
  }

  console.log('Firestore rules deployed successfully.');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
