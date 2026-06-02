import type { PoolClient } from "pg";
import { pool } from "./client.js";
import type { OAuthTokenRecord, Platform, SocialAccountRecord, SocialAccountStatus } from "../domain.js";

type Queryable = Pick<PoolClient, "query">;

interface SocialAccountRow {
  id: string;
  platform: Platform;
  platform_user_id: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  account_type: string | null;
  status: SocialAccountStatus;
  metadata_json: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

interface OAuthTokenRow {
  id: string;
  social_account_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  expires_at: Date | null;
  scopes: string[];
  token_type: string | null;
  metadata_json: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface OAuthTokenInput {
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string | null;
  expiresAt: Date | null;
  scopes: string[];
  tokenType: string | null;
  metadata: Record<string, unknown>;
}

export interface UpsertSocialAccountInput {
  platform: Platform;
  platformUserId: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  accountType: string | null;
  status: SocialAccountStatus;
  metadata: Record<string, unknown>;
  token: OAuthTokenInput;
}

export interface UpsertSocialAccountOutput {
  account: SocialAccountRecord;
  token: OAuthTokenRecord;
}

function toSocialAccount(row: SocialAccountRow): SocialAccountRecord {
  return {
    id: Number(row.id),
    platform: row.platform,
    platformUserId: row.platform_user_id,
    displayName: row.display_name,
    username: row.username,
    avatarUrl: row.avatar_url,
    accountType: row.account_type,
    status: row.status,
    metadata: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toOAuthToken(row: OAuthTokenRow): OAuthTokenRecord {
  return {
    id: Number(row.id),
    socialAccountId: Number(row.social_account_id),
    accessTokenEncrypted: row.access_token_encrypted,
    refreshTokenEncrypted: row.refresh_token_encrypted,
    expiresAt: row.expires_at,
    scopes: row.scopes,
    tokenType: row.token_type,
    metadata: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getLatestOAuthTokenWithClient(
  socialAccountId: number,
  client: Queryable
): Promise<OAuthTokenRecord | null> {
  const result = await client.query<OAuthTokenRow>(
    `
      select *
      from oauth_tokens
      where social_account_id = $1
      order by updated_at desc, id desc
      limit 1
    `,
    [socialAccountId]
  );

  return result.rows[0] ? toOAuthToken(result.rows[0]) : null;
}

async function writeOAuthToken(
  socialAccountId: number,
  input: OAuthTokenInput,
  client: Queryable
): Promise<OAuthTokenRecord> {
  const existingToken = await getLatestOAuthTokenWithClient(socialAccountId, client);
  const refreshTokenEncrypted = input.refreshTokenEncrypted ?? existingToken?.refreshTokenEncrypted ?? null;

  if (existingToken) {
    const result = await client.query<OAuthTokenRow>(
      `
        update oauth_tokens
        set
          access_token_encrypted = $2,
          refresh_token_encrypted = $3,
          expires_at = $4,
          scopes = $5,
          token_type = $6,
          metadata_json = $7,
          updated_at = now()
        where id = $1
        returning *
      `,
      [
        existingToken.id,
        input.accessTokenEncrypted,
        refreshTokenEncrypted,
        input.expiresAt,
        input.scopes,
        input.tokenType,
        JSON.stringify(input.metadata)
      ]
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error("Failed to update OAuth token.");
    }

    return toOAuthToken(row);
  }

  const result = await client.query<OAuthTokenRow>(
    `
      insert into oauth_tokens (
        social_account_id,
        access_token_encrypted,
        refresh_token_encrypted,
        expires_at,
        scopes,
        token_type,
        metadata_json
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      returning *
    `,
    [
      socialAccountId,
      input.accessTokenEncrypted,
      refreshTokenEncrypted,
      input.expiresAt,
      input.scopes,
      input.tokenType,
      JSON.stringify(input.metadata)
    ]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to create OAuth token.");
  }

  return toOAuthToken(row);
}

export async function listSocialAccounts(): Promise<SocialAccountRecord[]> {
  const result = await pool.query<SocialAccountRow>(
    `
      select *
      from social_accounts
      order by platform asc, display_name asc nulls last, id asc
    `
  );

  return result.rows.map(toSocialAccount);
}

export async function getSocialAccountById(id: number): Promise<SocialAccountRecord | null> {
  const result = await pool.query<SocialAccountRow>("select * from social_accounts where id = $1 limit 1", [id]);

  return result.rows[0] ? toSocialAccount(result.rows[0]) : null;
}

export async function getConnectedSocialAccount(platform: Platform): Promise<SocialAccountRecord | null> {
  const result = await pool.query<SocialAccountRow>(
    `
      select *
      from social_accounts
      where platform = $1
        and status = 'connected'
      order by updated_at desc, id asc
      limit 1
    `,
    [platform]
  );

  return result.rows[0] ? toSocialAccount(result.rows[0]) : null;
}

export async function getLatestOAuthToken(socialAccountId: number): Promise<OAuthTokenRecord | null> {
  return getLatestOAuthTokenWithClient(socialAccountId, pool);
}

export async function updateOAuthToken(
  socialAccountId: number,
  input: OAuthTokenInput
): Promise<OAuthTokenRecord> {
  return writeOAuthToken(socialAccountId, input, pool);
}

export async function upsertSocialAccountWithToken(
  input: UpsertSocialAccountInput
): Promise<UpsertSocialAccountOutput> {
  const client = await pool.connect();

  try {
    await client.query("begin");

    const accountResult = await client.query<SocialAccountRow>(
      `
        insert into social_accounts (
          platform,
          platform_user_id,
          display_name,
          username,
          avatar_url,
          account_type,
          status,
          metadata_json
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8)
        on conflict (platform, platform_user_id)
        do update set
          display_name = excluded.display_name,
          username = excluded.username,
          avatar_url = excluded.avatar_url,
          account_type = excluded.account_type,
          status = excluded.status,
          metadata_json = excluded.metadata_json,
          updated_at = now()
        returning *
      `,
      [
        input.platform,
        input.platformUserId,
        input.displayName,
        input.username,
        input.avatarUrl,
        input.accountType,
        input.status,
        JSON.stringify(input.metadata)
      ]
    );

    const accountRow = accountResult.rows[0];
    if (!accountRow) {
      throw new Error("Failed to upsert social account.");
    }

    const account = toSocialAccount(accountRow);
    const token = await writeOAuthToken(account.id, input.token, client);

    await client.query("commit");
    return { account, token };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
