import type { PostTargetRecord, SocialAccountRecord } from "../../domain.js";
import type { TargetControlItem } from "../../db/target-repository.js";
import { escapeHtml } from "../html.js";
import { platformLabel, targetStatusBadge } from "./post-components.js";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDateTime(date: Date | null): string {
  return date ? escapeHtml(date.toLocaleString("pl-PL")) : "brak";
}

export function dateTimeLocalValue(date: Date | null): string {
  if (!date) {
    return "";
  }

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  ].join("T");
}

export function accountLabel(account: SocialAccountRecord): string {
  return account.displayName ?? account.username ?? account.platformUserId ?? `Konto #${account.id}`;
}

function targetAccountLabel(target: TargetControlItem): string {
  return target.accountDisplayName ?? target.accountUsername ?? (target.socialAccountId ? `Konto #${target.socialAccountId}` : "auto");
}

export function accountSelectOptions(
  accounts: SocialAccountRecord[],
  platform: TargetControlItem["platform"],
  selectedAccountId: number | null
): string {
  const matchingAccounts = accounts.filter((account) => account.platform === platform);

  return [
    `<option value="" ${selectedAccountId === null ? "selected" : ""}>Auto / pierwsze polaczone konto</option>`,
    ...matchingAccounts.map((account) => {
      const selected = selectedAccountId === account.id ? "selected" : "";
      return `<option value="${account.id}" ${selected}>${escapeHtml(accountLabel(account))} (#${account.id})</option>`;
    })
  ].join("");
}

export function targetActionForms(target: PostTargetRecord, returnTo: string): string {
  const returnInput = `<input type="hidden" name="return_to" value="${escapeHtml(returnTo)}" />`;

  return `
    <div class="inline-actions" style="flex-wrap: wrap;">
      <form action="/targets/${target.id}/queue" method="post" style="display:inline-flex; gap: 8px; align-items: center;">
        ${returnInput}
        <button class="inline-action" type="submit">Kolejkuj teraz</button>
      </form>
      <form action="/targets/${target.id}/duplicate" method="post" style="display:inline;">
        ${returnInput}
        <button class="inline-action" type="submit">Duplikuj</button>
      </form>
      <form action="/targets/${target.id}/cancel" method="post" style="display:inline;">
        ${returnInput}
        <button class="inline-action danger" type="submit">Anuluj</button>
      </form>
    </div>
  `;
}

export function targetEditorForm(target: PostTargetRecord, accounts: SocialAccountRecord[], returnTo: string): string {
  return `
    <form class="post-form" action="/targets/${target.id}/update" method="post" style="gap: 14px;">
      <input type="hidden" name="return_to" value="${escapeHtml(returnTo)}" />
      <div class="form-grid two">
        <label>
          <span>Konto</span>
          <select name="social_account_id">
            ${accountSelectOptions(accounts, target.platform, target.socialAccountId)}
          </select>
        </label>
        <label>
          <span>Harmonogram targetu</span>
          <input name="scheduled_at" type="datetime-local" value="${dateTimeLocalValue(target.scheduledAt)}" />
        </label>
      </div>
      <div class="form-grid two">
        <label>
          <span>Tytul</span>
          <input name="platform_title" type="text" value="${escapeHtml(target.platformTitle ?? "")}" />
        </label>
        <label>
          <span>Widocznosc</span>
          <select name="privacy">
            ${["default", "private", "unlisted", "public"]
              .map((value) => {
                const selected = String(target.platformOptions.privacy ?? "default") === value ? "selected" : "";
                return `<option value="${value}" ${selected}>${value}</option>`;
              })
              .join("")}
          </select>
        </label>
      </div>
      <label>
        <span>Caption / opis</span>
        <textarea name="platform_caption" rows="4">${escapeHtml(target.platformCaption)}</textarea>
      </label>
      <label>
        <span>Hashtagi</span>
        <input name="platform_hashtags" type="text" value="${escapeHtml(target.platformHashtags ?? "")}" />
      </label>
      <div class="form-actions" style="justify-content: space-between; margin-top: 0;">
        ${targetActionForms(target, returnTo)}
        <button class="button-link" type="submit">Zapisz target</button>
      </div>
    </form>
  `;
}

export function targetControlTable(targets: TargetControlItem[], accounts: SocialAccountRecord[], returnTo: string): string {
  if (targets.length === 0) {
    return `
      <section class="empty-state">
        <h2>Brak targetow</h2>
        <p>Utworz pierwszy wpis i wybierz platformy, aby zobaczyc tu centrum publikacji.</p>
      </section>
    `;
  }

  return `
    <div class="table-wrap">
      <table class="media-table">
        <thead>
          <tr>
            <th>Target</th>
            <th>Post</th>
            <th>Konto</th>
            <th>Harmonogram</th>
            <th>Status</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          ${targets
            .map((target) => `
              <tr>
                <td>
                  <strong style="color: var(--primary);">#${target.id}</strong>
                  <span class="row-meta">${escapeHtml(platformLabel(target.platform))}</span>
                </td>
                <td>
                  <a class="row-title" href="/posts/${target.postId}">${escapeHtml(target.postTitle)}</a>
                  <span class="row-meta">Media: ${escapeHtml(target.mediaOriginalFilename ?? "brak")}</span>
                  ${
                    target.externalUrl
                      ? `<a class="text-link" href="${escapeHtml(target.externalUrl)}" target="_blank" rel="noreferrer">Otworz publikacje</a>`
                      : ""
                  }
                </td>
                <td>
                  <strong>${escapeHtml(targetAccountLabel(target))}</strong>
                  <span class="row-meta">${escapeHtml(target.accountStatus ?? "auto")}</span>
                </td>
                <td>
                  <strong>${formatDateTime(target.scheduledAt ?? target.postScheduledAt)}</strong>
                  <span class="row-meta">Job: ${target.latestJobId ? `#${target.latestJobId}` : "brak"}</span>
                </td>
                <td>
                  ${targetStatusBadge(target.status)}
                  ${
                    target.errorMessage ?? target.latestJobLastError
                      ? `<span class="row-meta" style="color: var(--danger); display:block; max-width: 260px;">${escapeHtml(target.errorMessage ?? target.latestJobLastError ?? "")}</span>`
                      : ""
                  }
                </td>
                <td>
                  ${targetActionForms(target, returnTo)}
                  <details style="margin-top: 10px;">
                    <summary class="text-link" style="cursor: pointer; font-weight: 700;">Edytuj</summary>
                    <div style="margin-top: 12px; min-width: 360px;">
                      ${targetEditorForm(target, accounts, returnTo)}
                    </div>
                  </details>
                </td>
              </tr>
            `)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}
