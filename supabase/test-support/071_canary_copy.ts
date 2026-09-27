#!/usr/bin/env -S node --experimental-strip-types --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON

import { createHash } from 'node:crypto';
import { createReadStream, existsSync, lstatSync, realpathSync, statSync } from 'node:fs';
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
const EXPECTED_BYTES = 32484;
const EXPECTED_MANIFEST_SHA256 = '6ebc14f727cf05c10344900422901a92927ca4c6d22c3d729536ea79f4e183d5';
const EXPECTED_DIR = '/Users/alidiyarduran/Documents/Codex/2026-09-27/genova-r2-checkpoint-071';
const EXPECTED_MANIFEST = `${EXPECTED_DIR}/canary-manifest.jsonl`;
const EXPECTED_JOURNAL = `${EXPECTED_DIR}/canary-journal.jsonl`;
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
  const allowed = new Set(['--manifest', '--source-file', '--journal', '--confirm-target']);
  if ([...values.keys()].some((key) => !allowed.has(key))) throw new CopyError('usage');
  return {
    manifest: required(values.get('--manifest'), 'MANIFEST'),
    sourceFile: required(values.get('--source-file'), 'SOURCE_FILE'),
    journal: required(values.get('--journal'), 'JOURNAL'),
    confirmTarget: required(values.get('--confirm-target'), 'CONFIRM_TARGET'),
  };
}

function assertPrivateExternalFile(filePath: string, expectedPath?: string) {
  if (!isAbsolute(filePath) || (expectedPath && resolve(filePath) !== expectedPath)
    || !existsSync(filePath)) throw new CopyError('invalid-private-input-path');
  const stat = lstatSync(filePath);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0) {
    throw new CopyError('private-file-permissions-required');
  }
  const realPath = realpathSync(filePath);
  const fromRoot = relative(REPOSITORY_ROOT, realPath);
  if (fromRoot === '' || (!fromRoot.startsWith('..') && !isAbsolute(fromRoot))) {
    throw new CopyError('repository-path-refused');
  }
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

async function readCanaryManifest(filePath: string) {
  const text = await readFile(filePath, 'utf8');
  if (createHash('sha256').update(text).digest('hex') !== EXPECTED_MANIFEST_SHA256) {
    throw new CopyError('unexpected-canary-manifest');
  }
  const lines = text.split(/\r?\n/u).filter((line) => line.trim());
  if (lines.length !== 1) throw new CopyError('unexpected-canary-count');
  const entry = parseManifestEntry(JSON.parse(lines[0]));
  const summary = validateManifest([entry]);
  if (summary.projectRef !== PROJECT_REF || entry.destination.bucket !== BUCKET
    || entry.family !== 'assignment-submission' || entry.expected.mimeType !== 'application/pdf'
    || entry.expected.contentLength !== EXPECTED_BYTES) {
    throw new CopyError('unexpected-canary-entry');
  }
  return entry;
}

async function loadJournal(filePath: string, entry: CopyManifestEntry) {
  const latest = new Map<string, CopyJournalRecord>();
  const attempts = new Map<string, number>();
  if (!existsSync(filePath) || statSync(filePath).size === 0) return { latest, attempts };
  const text = await readFile(filePath, 'utf8');
  for (const line of text.split(/\r?\n/u).filter((value) => value.trim())) {
    const record = parseJournalRecord(JSON.parse(line));
    if (record.itemId !== entry.itemId || !journalMatchesManifest(record, entry)) {
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
  const sourcePath = assertPrivateExternalFile(options.sourceFile);
  if (dirname(sourcePath) !== EXPECTED_DIR || statSync(sourcePath).size !== EXPECTED_BYTES) {
    throw new CopyError('unexpected-canary-source');
  }
  const journalPath = assertJournalPath(options.journal);
  const entry = await readCanaryManifest(manifestPath);
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
  const { latest, attempts } = await loadJournal(journalPath, entry);
  const result = await executeCopyBatch({
    entries: [entry], latest, attempts, maxItems: 1, maxTotalBytes: EXPECTED_BYTES,
    ports: {
      async getSourceMetadata(fileId) {
        return {
          fileId,
          name: entry.expected.fileName,
          mimeType: entry.expected.mimeType,
          contentLength: EXPECTED_BYTES,
          trashed: false,
          googleNative: false,
        };
      },
      async getSource() {
        const stream = Readable.toWeb(createReadStream(sourcePath)) as ReadableStream<Uint8Array>;
        return new Response(stream, {
          status: 200,
          headers: {
            'Content-Type': entry.expected.mimeType,
            'Content-Length': String(EXPECTED_BYTES),
          },
        });
      },
      headDestination: (value, signal) => destination.head(value, signal),
      putDestination: (value, body, signal) => destination.put(value, body, signal),
      getDestination: (value, signal) => destination.get(value, signal),
      now: () => new Date(),
    },
    append: (record) => appendJournal(journalPath, record),
  });
  const verified = latest.get(entry.itemId);
  if (verified?.status !== 'verified' || !verified.sha256Hex) {
    throw new CopyError('canary-not-verified');
  }
  process.stdout.write(`${JSON.stringify({
    status: 'canary-verified',
    processed: result.processed,
    bytes: result.bytes,
    remaining: result.remaining,
    action: verified.action,
    sha256Hex: verified.sha256Hex,
    manifestSha256Hex: EXPECTED_MANIFEST_SHA256,
  })}\n`);
}

main().catch((error) => {
  const code = error instanceof CopyError ? error.code : 'unexpected-canary-failure';
  process.stderr.write(`${JSON.stringify({ status: 'failed', errorCode: code })}\n`);
  process.exitCode = 1;
});
