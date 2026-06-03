import type { PostTargetRecord, SocialAccountRecord } from "../../domain.js";
import type { TargetControlItem } from "../../db/target-repository.js";
import { formatAppDateTime, formatDateTimeLocalInput } from "../../date-time.js";
import { escapeHtml } from "../html.js";
import { platformBadge } from "./platform-meta.js";
import { targetStatusBadge } from "./status-meta.js";

export function formatDateTime(date: Date | null): string {
  return date ? escapeHtml(formatAppDateTime(date)) : "brak";
}

export function dateTimeLocalValue(date: Date | null): string {
  return formatDateTimeLocalInput(date);
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
    `<option value="" ${selectedAccountId === null ? "selected" : ""}>Auto / pierwsze połączone konto</option>`,
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

export function targetRowActions(target: TargetControlItem, accounts: SocialAccountRecord[], returnTo: string): string {
  const returnInput = `<input type="hidden" name="return_to" value="${escapeHtml(returnTo)}" />`;

  return `
    <div class="row-actions-bar">
      <!-- Edit Toggle (Details summary) -->
      <details class="inline-editor-details">
        <summary class="action-btn-secondary">Edytuj</summary>
        <div class="inline-editor-popover">
          ${targetEditorForm(target, accounts, returnTo)}
        </div>
      </details>

      <!-- Dropdown Actions -->
      <details class="actions-dropdown">
        <summary class="actions-dropdown-trigger" title="Więcej akcji">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 14px; height: 14px; display: block;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </summary>
        <div class="actions-dropdown-menu">
          <form action="/targets/${target.id}/queue" method="post" style="margin: 0;">
            ${returnInput}
            <button type="submit" class="dropdown-item">Kolejkuj teraz</button>
          </form>
          <form action="/targets/${target.id}/duplicate" method="post" style="margin: 0;">
            ${returnInput}
            <button type="submit" class="dropdown-item">Duplikuj target</button>
          </form>
          <form action="/targets/${target.id}/cancel" method="post" style="margin: 0;">
            ${returnInput}
            <button type="submit" class="dropdown-item danger">Anuluj target</button>
          </form>
        </div>
      </details>
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
          <span>Tytuł</span>
          <input name="platform_title" type="text" value="${escapeHtml(target.platformTitle ?? "")}" />
        </label>
        <label>
          <span>Widoczność</span>
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
        <h2>Brak targetów</h2>
        <p>Utwórz pierwszy wpis i wybierz platformy, aby zobaczyć tu centrum publikacji.</p>
      </section>
    `;
  }

  const rows = targets
    .map((target) => `
      <tr>
        <td>
          <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
            ${platformBadge(target.platform, true)}
            <strong style="color: var(--primary); font-size: 0.85rem;">#${target.id}</strong>
          </div>
        </td>
        <td>
          <a class="row-title" href="/posts/${target.postId}">${escapeHtml(target.postTitle)}</a>
          <span class="row-meta">Media: ${escapeHtml(target.mediaOriginalFilename ?? "brak")}</span>
          ${
            target.externalUrl
              ? `<a class="text-link" href="${escapeHtml(target.externalUrl)}" target="_blank" rel="noreferrer">Otwórz publikację</a>`
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
              ? `
                <div class="error-block" style="margin-top: 8px;">
                  <div class="error-block-title">
                    <svg style="width: 12px; height: 12px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z" />
                    </svg>
                    <span>Błąd publikacji</span>
                  </div>
                  <div class="error-block-text">
                    ${escapeHtml(target.errorMessage ?? target.latestJobLastError ?? "Nieznany błąd")}
                  </div>
                </div>
              `
              : ""
          }
        </td>
        <td>
          ${targetRowActions(target, accounts, returnTo)}
        </td>
      </tr>
    `)
    .join("");

  const cards = targets
    .map((target) => `
      <article class="mobile-card">
        <div class="mobile-card-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${platformBadge(target.platform, true)}
            <strong style="color: var(--primary);">#${target.id}</strong>
          </div>
          ${targetStatusBadge(target.status)}
        </div>
        <div class="mobile-card-content">
          <div class="mobile-card-row">
            <span>Wpis</span>
            <strong>
              <a class="text-link" href="/posts/${target.postId}">${escapeHtml(target.postTitle)}</a>
            </strong>
          </div>
          <div class="mobile-card-row">
            <span>Media</span>
            <strong style="font-size: 0.8rem; font-weight: 500;">${escapeHtml(target.mediaOriginalFilename ?? "brak")}</strong>
          </div>
          <div class="mobile-card-row">
            <span>Konto</span>
            <strong>${escapeHtml(targetAccountLabel(target))} <span class="row-meta">(${escapeHtml(target.accountStatus ?? "auto")})</span></strong>
          </div>
          <div class="mobile-card-row">
            <span>Harmonogram</span>
            <strong>${formatDateTime(target.scheduledAt ?? target.postScheduledAt)}</strong>
          </div>
          <div class="mobile-card-row">
            <span>Zlecenie (Job)</span>
            <strong>${target.latestJobId ? `#${target.latestJobId}` : "brak"}</strong>
          </div>
          ${
            target.externalUrl
              ? `<div class="mobile-card-row">
                   <span>Link</span>
                   <strong><a class="text-link" href="${escapeHtml(target.externalUrl)}" target="_blank" rel="noreferrer">Otwórz publikację</a></strong>
                 </div>`
              : ""
          }
          ${
            target.errorMessage ?? target.latestJobLastError
              ? `
                <div class="error-block">
                  <div class="error-block-title">
                    <svg style="width: 14px; height: 14px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z" />
                    </svg>
                    <span>Błąd publikacji</span>
                  </div>
                  <div class="error-block-text">
                    ${escapeHtml(target.errorMessage ?? target.latestJobLastError ?? "Nieznany błąd")}
                  </div>
                </div>
              `
              : ""
          }
        </div>
        <div style="border-top: 1px solid var(--line); padding-top: 10px; margin-top: 4px;">
          ${targetRowActions(target, accounts, returnTo)}
        </div>
      </article>
    `)
    .join("");

  return `
    <!-- Desktop View -->
    <div class="desktop-only table-wrap control-table-wrap">
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
          ${rows}
        </tbody>
      </table>
    </div>

    <!-- Mobile View -->
    <div class="mobile-only mobile-cards-list">
      ${cards}
    </div>
  `;
}
