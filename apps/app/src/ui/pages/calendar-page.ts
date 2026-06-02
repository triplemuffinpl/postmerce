import type { CalendarPageData } from "../../services/target-service.js";
import type { TargetControlItem } from "../../db/target-repository.js";
import { escapeHtml } from "../html.js";
import { layout } from "../layout.js";
import { formatDateTime } from "../components/target-control-components.js";
import { platformLabel, targetStatusBadge } from "../components/post-components.js";

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

function targetCard(target: TargetControlItem): string {
  return `
    <a class="calendar-target-card" href="/posts/${target.postId}">
      <span>${escapeHtml(platformLabel(target.platform))}</span>
      <strong>${escapeHtml(target.postTitle)}</strong>
      ${targetStatusBadge(target.status)}
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
    <div class="calendar-weekdays">
      ${["Pon", "Wt", "Sr", "Czw", "Pt", "Sob", "Nd"].map((label) => `<span>${label}</span>`).join("")}
    </div>
    <div class="calendar-grid">
      ${calendarDays(options.monthStart)
        .map((date) => {
          const key = dayKey(date);
          const dayTargets = targetsByDay.get(key) ?? [];
          const outside = date.getMonth() !== options.monthStart.getMonth();
          return `
            <article class="calendar-day ${outside ? "is-outside" : ""}">
              <div class="calendar-day-head">
                <strong>${date.getDate()}</strong>
                <span>${dayTargets.length} target</span>
              </div>
              <div class="calendar-day-items">
                ${dayTargets.slice(0, 4).map(targetCard).join("")}
                ${dayTargets.length > 4 ? `<span class="row-meta">+${dayTargets.length - 4} wiecej</span>` : ""}
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function agendaList(targets: TargetControlItem[]): string {
  const upcoming = targets
    .slice()
    .sort((first, second) => targetDate(first).getTime() - targetDate(second).getTime())
    .slice(0, 25);

  if (upcoming.length === 0) {
    return `<section class="empty-state compact-empty"><h2>Brak targetow w kalendarzu</h2><p>Zaplanuj targety, aby zobaczyc je w osi czasu.</p></section>`;
  }

  return `
    <div class="heartbeat-list">
      ${upcoming
        .map((target) => `
          <article>
            <strong>${escapeHtml(target.postTitle)}</strong>
            <span>${escapeHtml(platformLabel(target.platform))} · ${formatDateTime(targetDate(target))}</span>
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
        <h1 style="font-weight: 800; letter-spacing: -0.03em;">Kalendarz</h1>
        <p class="lead">Widok miesieczny targetow publikacji. Tu najlatwiej zauwazyc luki, kumulacje i targety wymagajace reakcji.</p>
      </section>

      ${messageBanner("notice", options.notice)}
      ${messageBanner("error", options.error)}

      <section class="panel" style="margin-bottom: 28px;">
        <div class="panel-header" style="margin-bottom: 20px;">
          <a class="button-link secondary" href="/calendar?month=${options.previousMonth}">Poprzedni</a>
          <div style="text-align: center;">
            <h2 style="margin: 0; text-transform: capitalize;">${escapeHtml(options.monthStart.toLocaleString("pl-PL", { month: "long", year: "numeric" }))}</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 4px 0 0; font-weight: 600;">${options.targets.length} targetow w zakresie widoku</p>
          </div>
          <a class="button-link secondary" href="/calendar?month=${options.nextMonth}">Nastepny</a>
        </div>
        ${calendarGrid(options)}
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 style="margin: 0;">Najblizsza agenda</h2>
            <p style="color: var(--muted); font-size: 0.85rem; margin: 4px 0 0; font-weight: 500;">Szybka lista targetow z miesiaca i sasiednich tygodni.</p>
          </div>
          <a class="text-link" href="/control">Centrum kontroli</a>
        </div>
        ${agendaList(options.targets)}
      </section>
    `
  });
}
