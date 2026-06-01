import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool, closeDatabase } from "./client.js";

const currentFile = fileURLToPath(import.meta.url);
const migrationsDir = path.resolve(path.dirname(currentFile), "../../migrations");

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    create table if not exists schema_migrations (
      id bigserial primary key,
      migration text not null unique,
      executed_at timestamptz not null default now()
    )
  `);
}

async function getExecutedMigrations(): Promise<Set<string>> {
  const result = await pool.query<{ migration: string }>(
    "select migration from schema_migrations order by migration asc"
  );
  return new Set(result.rows.map((row) => row.migration));
}

async function runMigration(fileName: string): Promise<void> {
  const sql = await readFile(path.join(migrationsDir, fileName), "utf8");
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query(sql);
    await client.query("insert into schema_migrations (migration) values ($1)", [fileName]);
    await client.query("commit");
    console.log(`migrated ${fileName}`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function main(): Promise<void> {
  await ensureMigrationsTable();
  const executed = await getExecutedMigrations();
  const files = (await readdir(migrationsDir))
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();

  for (const fileName of files) {
    if (!executed.has(fileName)) {
      await runMigration(fileName);
    }
  }

  if (files.every((fileName) => executed.has(fileName))) {
    console.log("database already up to date");
  }
}

try {
  await main();
} finally {
  await closeDatabase();
}
