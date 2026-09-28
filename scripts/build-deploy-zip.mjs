import { deflateRawSync } from 'zlib';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const distDir = path.join(repoRoot, 'dist');
const outputPath = path.join(repoRoot, 'Nuhafrik-deploy.zip');

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  return table;
})();

const crc32 = (buffer) => {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buffer[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
};

const collectFiles = (dir, base = dir) => {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectFiles(full, base);
      if (!entry.isFile()) return [];
      return [{ full, name: path.relative(base, full).split(path.sep).join('/') }];
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

if (!existsSync(distDir)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const files = collectFiles(distDir);
if (files.length === 0) {
  console.error('dist/ is empty. Nothing to package.');
  process.exit(1);
}

const localParts = [];
const centralParts = [];
let offset = 0;

for (const file of files) {
  const nameBuffer = Buffer.from(file.name, 'utf8');
  const content = readFileSync(file.full);
  const deflated = deflateRawSync(content, { level: 9 });
  const useDeflate = deflated.length < content.length;
  const payload = useDeflate ? deflated : content;
  const method = useDeflate ? 8 : 0;
  const checksum = crc32(content);
  const modified = statSync(file.full).mtime;

  const localHeader = Buffer.alloc(30);
  localHeader.writeUInt32LE(0x04034b50, 0);
  localHeader.writeUInt16LE(20, 4);
  localHeader.writeUInt16LE(0x0800, 6);
  localHeader.writeUInt16LE(method, 8);
  localHeader.writeUInt16LE(toDosTime(modified), 10);
  localHeader.writeUInt16LE(toDosDate(modified), 12);
  localHeader.writeUInt32LE(checksum, 14);
  localHeader.writeUInt32LE(payload.length, 18);
  localHeader.writeUInt32LE(content.length, 22);
  localHeader.writeUInt16LE(nameBuffer.length, 26);
  localHeader.writeUInt16LE(0, 28);

  localParts.push(localHeader, nameBuffer, payload);

  const centralHeader = Buffer.alloc(46);
  centralHeader.writeUInt32LE(0x02014b50, 0);
  centralHeader.writeUInt16LE(20, 4);
  centralHeader.writeUInt16LE(20, 6);
  centralHeader.writeUInt16LE(0x0800, 8);
  centralHeader.writeUInt16LE(method, 10);
  centralHeader.writeUInt16LE(toDosTime(modified), 12);
  centralHeader.writeUInt16LE(toDosDate(modified), 14);
  centralHeader.writeUInt32LE(checksum, 16);
  centralHeader.writeUInt32LE(payload.length, 20);
  centralHeader.writeUInt32LE(content.length, 24);
  centralHeader.writeUInt16LE(nameBuffer.length, 28);
  centralHeader.writeUInt16LE(0, 30);
  centralHeader.writeUInt16LE(0, 32);
  centralHeader.writeUInt16LE(0, 34);
  centralHeader.writeUInt16LE(0, 36);
  centralHeader.writeUInt32LE(0, 38);
  centralHeader.writeUInt32LE(offset, 42);

  centralParts.push(centralHeader, nameBuffer);
  offset += localHeader.length + nameBuffer.length + payload.length;
}

const centralDirectory = Buffer.concat(centralParts);
const endRecord = Buffer.alloc(22);
endRecord.writeUInt32LE(0x06054b50, 0);
endRecord.writeUInt16LE(0, 4);
endRecord.writeUInt16LE(0, 6);
endRecord.writeUInt16LE(files.length, 8);
endRecord.writeUInt16LE(files.length, 10);
endRecord.writeUInt32LE(centralDirectory.length, 12);
endRecord.writeUInt32LE(offset, 16);
endRecord.writeUInt16LE(0, 20);

writeFileSync(outputPath, Buffer.concat([...localParts, centralDirectory, endRecord]));

function toDosTime(date) {
  return (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
}

function toDosDate(date) {
  const year = Math.max(1980, date.getFullYear());
  return ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
}

console.log(`Packaged ${files.length} files -> Nuhafrik-deploy.zip`);
for (const file of files) console.log(`  ${file.name}`);
