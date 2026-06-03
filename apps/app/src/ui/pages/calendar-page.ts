import type { CalendarPageData } from "../../services/target-service.js";
import type { TargetControlItem } from "../../db/target-repository.js";
import { escapeHtml } from "../html.js";
import { layout } from "../layout.js";
import { formatDateTime } from "../components/target-control-components.js";
import { platformIcon, platformLabel, platformBadge } from "../components/platform-meta.js";
import { targetStatusMeta, targetStatusBadge } from "../components/status-meta.js";

interface CalendarPageOptions extends CalendarPageData {
  notice?: string;
  error?: string;
}

function messageBanner(type: "notice" | "error", message: string | undefined): string {
  return message ? `<div class="message ${type}">${escapeHtml(message)}</div>` : "";
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function targetDate(target: TargetControlItem): Date {
  return target.scheduledAt ?? target.postScheduledAt ?? target.createdAt;
}

function calendarDays(monthStart: Date): Date[] {
  const first = new Date(monthStart);
  const offset = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - offset);

  return Array.from({ length: 42 }, (_value, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function targetCalendarLabel(target: TargetControlItem): string {
  if (target.status === "draft") {
    return "Szkic";
  }

  const date = target.scheduledAt ?? target.postScheduledAt;
  if (date) {
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  const meta = targetStatusMeta[target.status];
  return meta ? meta.label : target.status;
}

function targetPill(target: TargetControlItem): string {
  const meta = targetStatusMeta[target.status];
  const colorClass = meta ? meta.colorClass : "status-gray";
  const title = escapeHtml(target.postTitle);
  const platformName = platformLabel(target.platform);
  const statusLabel = meta ? meta.label : target.status;
  const timeStr = formatDateTime(target.scheduledAt ?? target.postScheduledAt ?? target.createdAt);
  const label = escapeHtml(targetCalendarLabel(target));

  return `
    <a class="calendar-target-pill platform-${target.platform} status-${target.status}" 
       href="/posts/${target.postId}" 
       title="${title} (${platformName} - ${statusLabel} o ${timeStr})">
      <span class="platform-dot-icon">${platformIcon(target.platform, 12, 12)}</span>
      <span class="target-title">${label}</span>
      <span class="status-dot-indicator ${colorClass}"></span>
    </a>
  `;
}

function calendarGrid(options: CalendarPageOptions): string {
  const targetsByDay = new Map<string, TargetControlItem[]>();

  for (const target of options.targets) {
    const key = dayKey(targetDate(target));
    const bucket = targetsByDay.get(key) ?? [];
    bucket.push(target);
    targetsByDay.set(key, bucket);
  }

  return `
    <div class="calendar-scroll-hint">Przesuń w bok ↔</div>
    <div class="calendar-scroll-wrapper">
      <div class="calendar-scroll-inner">
        <div class="calendar-weekdays">
          ${["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"].map((label) => `<span>${label}</span>`).join("")}
        </div>
        <div class="calendar-grid">
          ${calendarDays(options.monthStart)
            .map((date) => {
              const key = dayKey(date);
              const dayTargets = targetsByDay.get(key) ?? [];
              const outside = date.getMonth() !== options.monthStart.getMonth();
              const hasIssues = dayTargets.some(t => t.status === "failed" || t.status === "requires_user_action");
              
              const now = new Date();
              const isToday = now.getDate() === date.getDate() && 
                              now.getMonth() === date.getMonth() && 
                              now.getFullYear() === date.getFullYear();

              return `
                <article class="calendar-day ${outside ? "is-outside" : ""} ${isToday ? "is-today" : ""}">
                  <div class="calendar-day-head">
                    <strong class="calendar-day-number">
                      ${date.getDate()}
                      ${hasIssues ? `<span class="day-alert-marker" title="Wykryto błędy lub wymagana akcja"></span>` : ""}
                    </strong>
                    ${dayTargets.length > 0 ? `<span class="calendar-day-count">${dayTargets.length}</span>` : ""}
                  </div>
                  <div class="calendar-day-items">
                    ${dayTargets.slice(0, 4).map(targetPill).join("")}
                    ${dayTargets.length > 4 ? `<a href="/control" class="calendar-more-action">+${dayTargets.length - 4} więcej</a>` : ""}
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function agendaList(targets: TargetControlItem[]): string {
  const upcoming = targets
    .slice()
    .sort((first, second) => targetDate(first).getTime() - targetDate(second).getTime())
    .slice(0, 25);

  if (upcoming.length === 0) {
    return `<section class="empty-state compact-empty"><h2>Brak targetów w kalendarzu</h2><p>Zaplanuj targety, aby zobaczyć je w osi czasu.</p></section>`;
  }

  return `
    <div class="heartbeat-list">
      ${upcoming
        .map((target) => `
          <article style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <strong style="display: block; font-size: 0.95rem;">${escapeHtml(target.postTitle)}</strong>
              <span class="row-meta" style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                ${platformBadge(target.platform, true)}
                <span>· ${formatDateTime(targetDate(target))}</span>
              </span>
            </div>
            <div>${targetStatusBadge(target.status)}</div>
          </article>
        `)
        .join("")}
    </div>
  `;
}

export function calendarPage(options: CalendarPageOptions): string {
  return layout({
    title: "Kalendarz",
    active: "calendar",
    body: `
      <section class="page-header compact">
        <p class="eyebrow">Plan publikacji</p>
        <h1 style="font-weight: 800;">Kalendarz</h1>
        <p class="lead">Widok miesięczny targetów publikacji. Tu najłatwiej zauważyć luki, kumulacje i targety wymagające reakcji.</p>
      </section>

      ${messageBanner("notice", options.notice)}
      ${messageBanner("error", options.error)}

      <section class="panel" style="margin-bottom: 28px;">
        <div class="panel-header" style="margin-bottom: 20px;">
          <a class="button-link secondary" href="/calendar?month=${options.previousMonth}">Poprzedni</a>
          <div style="text-align: center;">
            <h2 style="margin: 0; text-transform: capitalize;">${escapeHtml(options.monthStart.toLocaleString("pl-PL", { month: "long", year: "numeric" }))}</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 4px 0 0; font-weight: 600;">${options.targets.length} targetów w zakresie widoku</p>
          </div>
          <a class="button-link secondary" href="/calendar?month=${options.nextMonth}">Następny</a>
        </div>
        ${calendarGrid(options)}
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 style="margin: 0;">Najbliższa agenda</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 4px 0 0; font-weight: 500;">Szybka lista targetów z miesiąca i sąsiednich tygodni.</p>
          </div>
          <a class="text-link" href="/control">Centrum kontroli</a>
        </div>
        ${agendaList(options.targets)}
      </section>
    `
  });
}
