import { pool } from "./client.js";

interface SettingRow {
  key: string;
  value: string | null;
}

export async function getSettingValues(keys: string[]): Promise<Map<string, string | null>> {
  if (keys.length === 0) {
    return new Map();
  }

  const result = await pool.query<SettingRow>(
    `
      select key, value
      from settings
      where key = any($1::text[])
    `,
    [keys]
  );

  return new Map(result.rows.map((row) => [row.key, row.value]));
}

export async function setSettingValue(key: string, value: string): Promise<void> {
  await pool.query(
    `
      insert into settings (key, value)
      values ($1, $2)
      on conflict (key)
      do update set
        value = excluded.value,
        updated_at = now()
    `,
    [key, value]
  );
}
