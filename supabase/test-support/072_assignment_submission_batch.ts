#!/usr/bin/env -S node --experimental-strip-types --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON

import { createHash } from 'node:crypto';
import {
  createReadStream,
  existsSync,
  lstatSync,
  readdirSync,
  realpathSync,
  statSync,
} from 'node:fs';
import { open, readFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

// @ts-expect-error Direct Node type-stripped execution needs the source extension.
import { CopyError, executeCopyBatch, journalMatchesManifest, parseJournalRecord, parseManifestEntry, validateManifest } from '../../scripts/private-r2-copy-core.ts';
// @ts-expect-error Direct Node type-stripped execution needs the source extension.
import { SignedR2Destination } from '../../scripts/private-r2-copy.ts';

type CopyJournalRecord = ReturnType<typeof parseJournalRecord>;
type CopyManifestEntry = ReturnType<typeof parseManifestEntry>;

const PROJECT_REF = 'hievmwwctjjlhmssoxsu';
const ACCOUNT_ID = 'b642dee69121237ba20cc1a1bb50f1c5';
const BUCKET = 'genova-private';
const JURISDICTION = 'eu';
const EXPECTED_ITEMS = 9;
const EXPECTED_BYTES = 12815437;
const EXPECTED_MANIFEST_SHA256 = '0dd86de0c04acc0b81ced950f3283fd568c01bf1bf6f0820c0ff3c2ee5bf74c9';
const EXPECTED_DIR = '/Users/alidiyarduran/Documents/Codex/2026-09-27/genova-r2-checkpoint-072';
const EXPECTED_MANIFEST = `${EXPECTED_DIR}/batch-manifest.jsonl`;
const EXPECTED_SOURCE_DIR = `${EXPECTED_DIR}/sources`;
const EXPECTED_JOURNAL = `${EXPECTED_DIR}/batch-journal.jsonl`;
const REPOSITORY_ROOT = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '../..'));

function required(value: string | undefined, name: string) {
  if (!value) throw new CopyError(`missing-${name.toLowerCase().replaceAll('_', '-')}`);
  return value;
}

function parseArgs(argv: string[]) {
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || !value || value.startsWith('--') || values.has(key)) {
      throw new CopyError('usage');
    }
    values.set(key, value);
  }
  const allowed = new Set(['--manifest', '--source-dir', '--journal', '--confirm-target']);
  if ([...values.keys()].some((key) => !allowed.has(key))) throw new CopyError('usage');
  return {
    manifest: required(values.get('--manifest'), 'MANIFEST'),
    sourceDir: required(values.get('--source-dir'), 'SOURCE_DIR'),
    journal: required(values.get('--journal'), 'JOURNAL'),
    confirmTarget: required(values.get('--confirm-target'), 'CONFIRM_TARGET'),
  };
}

function assertOutsideRepository(realPath: string) {
  const fromRoot = relative(REPOSITORY_ROOT, realPath);
  if (fromRoot === '' || (!fromRoot.startsWith('..') && !isAbsolute(fromRoot))) {
    throw new CopyError('repository-path-refused');
  }
}

function assertPrivateExternalFile(filePath: string, expectedPath?: string) {
  if (!isAbsolute(filePath) || (expectedPath && resolve(filePath) !== expectedPath)
    || !existsSync(filePath)) throw new CopyError('invalid-private-input-path');
  const stat = lstatSync(filePath);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0) {
    throw new CopyError('private-file-permissions-required');
  }
  const realPath = realpathSync(filePath);
  assertOutsideRepository(realPath);
  return realPath;
}

function assertPrivateSourceDirectory(dirPath: string) {
  if (!isAbsolute(dirPath) || resolve(dirPath) !== EXPECTED_SOURCE_DIR || !existsSync(dirPath)) {
    throw new CopyError('invalid-source-directory');
  }
  const stat = lstatSync(dirPath);
  if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0) {
    throw new CopyError('private-directory-permissions-required');
  }
  const realPath = realpathSync(dirPath);
  if (realPath !== EXPECTED_SOURCE_DIR) throw new CopyError('invalid-source-directory');
  assertOutsideRepository(realPath);
  return realPath;
}

function assertJournalPath(filePath: string) {
  if (!isAbsolute(filePath) || resolve(filePath) !== EXPECTED_JOURNAL) {
    throw new CopyError('invalid-journal-path');
  }
  if (existsSync(filePath)) assertPrivateExternalFile(filePath, EXPECTED_JOURNAL);
  else if (realpathSync(dirname(filePath)) !== EXPECTED_DIR) throw new CopyError('invalid-journal-path');
  return filePath;
}

function sourceFileName(index: number, mimeType: string) {
  const extension = mimeType === 'application/pdf' ? 'pdf' : mimeType === 'video/mp4' ? 'mp4' : null;
  if (!extension) throw new CopyError('unexpected-batch-mime');
  return `${String(index + 1).padStart(3, '0')}.${extension}`;
}

async function readBatchManifest(filePath: string) {
  const text = await readFile(filePath, 'utf8');
  if (createHash('sha256').update(text).digest('hex') !== EXPECTED_MANIFEST_SHA256) {
    throw new CopyError('unexpected-batch-manifest');
  }
  const entries = text.split(/\r?\n/u).filter((line) => line.trim())
    .map((line) => parseManifestEntry(JSON.parse(line)));
  const summary = validateManifest(entries);
  const mimeCounts = entries.reduce((counts, entry) => {
    counts.set(entry.expected.mimeType, (counts.get(entry.expected.mimeType) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
  if (summary.projectRef !== PROJECT_REF || summary.itemCount !== EXPECTED_ITEMS
    || summary.totalBytes !== EXPECTED_BYTES
    || entries.some((entry) => entry.destination.bucket !== BUCKET
      || entry.family !== 'assignment-submission')
    || mimeCounts.size !== 2 || mimeCounts.get('application/pdf') !== 6
    || mimeCounts.get('video/mp4') !== 3) {
    throw new CopyError('unexpected-batch-entries');
  }
  return entries;
}

function loadSourceFiles(sourceDir: string, entries: CopyManifestEntry[]) {
  const expectedNames = entries.map((entry, index) => sourceFileName(index, entry.expected.mimeType));
  const actualNames = readdirSync(sourceDir).sort();
  if (actualNames.length !== expectedNames.length
    || actualNames.some((name, index) => name !== [...expectedNames].sort()[index])) {
    throw new CopyError('unexpected-source-files');
  }
  return new Map(entries.map((entry, index) => {
    const filePath = assertPrivateExternalFile(resolve(sourceDir, expectedNames[index]));
    if (dirname(filePath) !== EXPECTED_SOURCE_DIR
      || statSync(filePath).size !== entry.expected.contentLength) {
      throw new CopyError('unexpected-source-file');
    }
    return [entry.itemId, filePath];
  }));
}

async function loadJournal(filePath: string, entries: CopyManifestEntry[]) {
  const latest = new Map<string, CopyJournalRecord>();
  const attempts = new Map<string, number>();
  if (!existsSync(filePath) || statSync(filePath).size === 0) return { latest, attempts };
  const byItemId = new Map(entries.map((entry) => [entry.itemId, entry]));
  const text = await readFile(filePath, 'utf8');
  for (const line of text.split(/\r?\n/u).filter((value) => value.trim())) {
    const record = parseJournalRecord(JSON.parse(line));
    const entry = byItemId.get(record.itemId);
    if (!entry || !journalMatchesManifest(record, entry)) {
      throw new CopyError('journal-manifest-conflict');
    }
    const previous = attempts.get(record.itemId) ?? 0;
    if (record.attempt !== previous + 1) throw new CopyError('journal-attempt-sequence-invalid');
    attempts.set(record.itemId, record.attempt);
    latest.set(record.itemId, record);
  }
  return { latest, attempts };
}

async function appendJournal(filePath: string, record: CopyJournalRecord) {
  const handle = await open(filePath, 'a', 0o600);
  try {
    await handle.appendFile(`${JSON.stringify(record)}\n`, 'utf8');
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const manifestPath = assertPrivateExternalFile(options.manifest, EXPECTED_MANIFEST);
  const sourceDir = assertPrivateSourceDirectory(options.sourceDir);
  const journalPath = assertJournalPath(options.journal);
  const entries = await readBatchManifest(manifestPath);
  const sourceFiles = loadSourceFiles(sourceDir, entries);
  const entriesByFileId = new Map(entries.map((entry) => [entry.source.legacyFileId, entry]));
  const exactTarget = `${PROJECT_REF}/${ACCOUNT_ID}/${BUCKET}/${JURISDICTION}`;
  if (options.confirmTarget !== exactTarget
    || process.env.GENOVA_PRIVATE_R2_COPY_APPROVED !== exactTarget) {
    throw new CopyError('target-confirmation-required');
  }
  const accessKeyId = required(process.env.R2_ACCESS_KEY_ID, 'R2_ACCESS_KEY_ID');
  const secretAccessKey = required(process.env.R2_SECRET_ACCESS_KEY, 'R2_SECRET_ACCESS_KEY');
  const destination = new SignedR2Destination({
    accountId: ACCOUNT_ID,
    jurisdiction: JURISDICTION,
    bucket: BUCKET,
    accessKeyId,
    secretAccessKey,
  });
  if (!existsSync(journalPath)) {
    const handle = await open(journalPath, 'wx', 0o600);
    await handle.close();
  }
  const { latest, attempts } = await loadJournal(journalPath, entries);
  const result = await executeCopyBatch({
    entries,
    latest,
    attempts,
    maxItems: EXPECTED_ITEMS,
    maxTotalBytes: EXPECTED_BYTES,
    ports: {
      async getSourceMetadata(fileId) {
        const entry = entriesByFileId.get(fileId);
        if (!entry) throw new CopyError('unexpected-source-id');
        return {
          fileId,
          name: entry.expected.fileName,
          mimeType: entry.expected.mimeType,
          contentLength: entry.expected.contentLength,
          trashed: false,
          googleNative: false,
        };
      },
      async getSource(fileId) {
        const entry = entriesByFileId.get(fileId);
        const filePath = entry && sourceFiles.get(entry.itemId);
        if (!entry || !filePath) throw new CopyError('unexpected-source-id');
        const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream<Uint8Array>;
        return new Response(stream, {
          status: 200,
          headers: {
            'Content-Type': entry.expected.mimeType,
            'Content-Length': String(entry.expected.contentLength),
          },
        });
      },
      headDestination: (entry, signal) => destination.head(entry, signal),
      putDestination: (entry, body, signal) => destination.put(entry, body, signal),
      getDestination: (entry, signal) => destination.get(entry, signal),
      now: () => new Date(),
    },
    append: (record) => appendJournal(journalPath, record),
  });
  const verified = entries.map((entry) => latest.get(entry.itemId));
  if (verified.some((record) => record?.status !== 'verified' || !record.sha256Hex)) {
    throw new CopyError('batch-not-verified');
  }
  const actions = verified.reduce((counts, record) => {
    const action = record?.action ?? 'unknown';
    counts[action] = (counts[action] ?? 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  const aggregateSha256Hex = createHash('sha256')
    .update(verified.map((record) => record?.sha256Hex).join('\n'))
    .digest('hex');
  process.stdout.write(`${JSON.stringify({
    status: 'batch-verified',
    processed: result.processed,
    bytes: result.bytes,
    remaining: result.remaining,
    verified: verified.length,
    actions,
    aggregateSha256Hex,
    manifestSha256Hex: EXPECTED_MANIFEST_SHA256,
  })}\n`);
}

main().catch((error) => {
  const code = error instanceof CopyError ? error.code : 'unexpected-batch-failure';
  process.stderr.write(`${JSON.stringify({ status: 'failed', errorCode: code })}\n`);
  process.exitCode = 1;
});
