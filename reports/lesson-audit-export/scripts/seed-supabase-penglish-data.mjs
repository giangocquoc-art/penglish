import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const previewPath = join(rootDir, 'reports', 'supabase-seed-payload-preview.json');
const summaryPath = join(rootDir, 'reports', 'supabase-seed-summary.md');

const seedName = 'penglish_learning_data';
const seedVersion = '2026-05-29';
const schemaMissingMessage = 'Supabase schema is missing. Run npx.cmd supabase db push first, then rerun this seed script.';
const requiredEnv = ['VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const anonKeyEnv = 'VITE_SUPABASE_ANON_KEY';

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function getEnvPresence() {
  return {
    VITE_SUPABASE_URL: Boolean(process.env.VITE_SUPABASE_URL),
    VITE_SUPABASE_ANON_KEY: Boolean(process.env.VITE_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY),
  };
}

async function writeSummary({ status, dryRun, counts, missing, touchedTables, note }) {
  await mkdir(dirname(summaryPath), { recursive: true });
  const envPresence = getEnvPresence();
  const lines = [
    '# P-English Supabase seed summary',
    '',
    `- Status: ${status}`,
    `- Dry run: ${dryRun ? 'yes' : 'no'}`,
    `- Seed name: ${seedName}`,
    `- Seed version: ${seedVersion}`,
    `- Payload preview: reports/supabase-seed-payload-preview.json`,
    `- Migration: supabase/migrations/202605290001_penglish_core_schema.sql`,
    `- Tables intended/touched: ${touchedTables.join(', ')}`,
    `- Missing required environment variables: ${missing.length ? missing.join(', ') : 'none'}`,
    `- Frontend Supabase URL present locally: ${envPresence.VITE_SUPABASE_URL ? 'yes' : 'no'}`,
    `- Frontend Supabase anon key present locally: ${envPresence.VITE_SUPABASE_ANON_KEY ? 'yes' : 'no'}`,
    `- Service role key present locally: ${envPresence.SUPABASE_SERVICE_ROLE_KEY ? 'yes' : 'no'}`,
    `- Gemini key present locally: ${envPresence.GEMINI_API_KEY ? 'yes' : 'no'}`,
    '',
    '## Counts',
    '',
    ...Object.entries(counts).map(([table, count]) => `- ${table}: ${count}`),
    '',
    '## Safety notes',
    '',
    '- Seed payload contains app-authored learning data only.',
    '- No `.env` values, tokens, screenshots, reports, build outputs, node_modules, local user data, or private files are uploaded.',
    '- Script performs idempotent upserts only; it does not create, alter, or delete Supabase schema/data outside the target rows.',
    '- Runtime app remains local-first; Supabase runtime reads were not made mandatory.',
    '',
    '## Required command order',
    '',
    '1. `npx.cmd supabase link --project-ref <PROJECT_REF>`',
    '2. `npx.cmd supabase db push`',
    '3. `node scripts/seed-supabase-penglish-data.mjs`',
    '',
    '## Note',
    '',
    note,
    '',
  ];
  await writeFile(summaryPath, `${lines.join('\n')}\n`, 'utf8');
}

async function postgrest(url, serviceKey, path, options = {}) {
  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 404 || /Could not find the table|schema cache|PGRST205|PGRST204/i.test(body)) {
      throw new Error(schemaMissingMessage);
    }
    throw new Error(`Supabase request failed for ${path}: HTTP ${response.status} ${body}`);
  }
}

async function seedTable(url, serviceKey, table, rows, chunkSize = 500) {
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    await postgrest(url, serviceKey, `${table}?on_conflict=id`, {
      method: 'POST',
      body: JSON.stringify(chunk),
    });
  }
}

async function buildSeedPayload() {
  execSync('npx.cmd tsx scripts/export-penglish-learning-data.ts', {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
  });

  return JSON.parse(await readFile(previewPath, 'utf8'));
}

async function main() {
  const dryRun = hasFlag('--dry-run');
  const payload = await buildSeedPayload();
  await mkdir(dirname(previewPath), { recursive: true });
  await writeFile(previewPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const touchedTables = Object.keys(payload.tables);
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (!process.env[anonKeyEnv]) missing.push(anonKeyEnv);

  if (dryRun) {
    await writeSummary({
      status: missing.length ? 'dry-run-ok-env-missing' : 'dry-run-ok',
      dryRun,
      counts: payload.counts,
      missing,
      touchedTables,
      note: missing.length
        ? 'Dry-run succeeded and payload was generated. Real seed is skipped until required Supabase environment variables are available.'
        : 'Dry-run succeeded. Real seed can proceed.',
    });
    console.log('Dry-run completed. Payload preview and summary written.');
    console.log(`Counts: ${JSON.stringify(payload.counts)}`);
    if (missing.length) console.log(`Missing required environment variables: ${missing.join(', ')}`);
    return;
  }

  if (missing.length) {
    await writeSummary({
      status: 'skipped-env-missing',
      dryRun,
      counts: payload.counts,
      missing,
      touchedTables,
      note: 'Real seed skipped because required Supabase environment variables are missing. No Supabase data was modified.',
    });
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    for (const [table, rows] of Object.entries(payload.tables)) {
      await seedTable(url, serviceKey, table, rows);
    }

    await postgrest(url, serviceKey, 'penglish_seed_runs?on_conflict=id', {
      method: 'POST',
      body: JSON.stringify([
        {
          id: randomUUID(),
          seed_name: seedName,
          seed_version: seedVersion,
          dry_run: false,
          counts: payload.counts,
          status: 'success',
          note: 'Seeded app-authored P-English learning data by idempotent upsert.',
        },
      ]),
    });
  } catch (error) {
    if (error instanceof Error && error.message === schemaMissingMessage) {
      await writeSummary({
        status: 'skipped-schema-missing',
        dryRun,
        counts: payload.counts,
        missing,
        touchedTables,
        note: error.message,
      });
    }
    throw error;
  }

  await writeSummary({
    status: 'success',
    dryRun,
    counts: payload.counts,
    missing,
    touchedTables,
    note: 'Real seed completed successfully using idempotent upserts. Existing unrelated data was not deleted.',
  });

  console.log('Supabase seed completed successfully.');
  console.log(`Counts: ${JSON.stringify(payload.counts)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
