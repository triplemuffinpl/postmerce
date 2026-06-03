import type { PostTargetStatus, PostStatus, PublishJobStatus, SocialAccountStatus } from "../../domain.js";

export interface StatusMetadata {
  label: string;
  colorClass: string;
  badgeVariant?: string;
}

export const targetStatusMeta: Record<PostTargetStatus, StatusMetadata> = {
  draft: { label: "Szkic", colorClass: "status-gray" },
  scheduled: { label: "Zaplanowany", colorClass: "status-blue" },
  queued: { label: "W kolejce", colorClass: "status-purple" },
  publishing: { label: "Publikowanie", colorClass: "status-amber", badgeVariant: "status-pulse" },
  processing_on_platform: { label: "Przetwarzanie", colorClass: "status-cyan", badgeVariant: "has-loader" },
  published: { label: "Opublikowany", colorClass: "status-green" },
  simulated: { label: "Symulacja", colorClass: "status-green", badgeVariant: "simulated" },
  failed: { label: "Błąd", colorClass: "status-red" },
  requires_user_action: { label: "Wymaga reakcji", colorClass: "status-orange" },
  cancelled: { label: "Anulowany", colorClass: "status-slate" },
  skipped: { label: "Pominięty", colorClass: "status-slate", badgeVariant: "skipped" }
};

export const postStatusMeta: Record<PostStatus, StatusMetadata> = {
  draft: { label: "Szkic", colorClass: "status-gray" },
  scheduled: { label: "Zaplanowany", colorClass: "status-blue" },
  queued: { label: "W kolejce", colorClass: "status-purple" },
  publishing: { label: "Publikowanie", colorClass: "status-amber", badgeVariant: "status-pulse" },
  partially_published: { label: "Częściowo wysłany", colorClass: "status-cyan" },
  published: { label: "Opublikowany", colorClass: "status-green" },
  failed: { label: "Błąd", colorClass: "status-red" },
  cancelled: { label: "Anulowany", colorClass: "status-slate" }
};

export const jobStatusMeta: Record<PublishJobStatus, StatusMetadata> = {
  pending: { label: "Oczekujące", colorClass: "status-purple" },
  running: { label: "W toku", colorClass: "status-amber", badgeVariant: "status-pulse" },
  succeeded: { label: "Ukończone", colorClass: "status-green" },
  failed: { label: "Błąd", colorClass: "status-red" },
  cancelled: { label: "Anulowane", colorClass: "status-slate" }
};

export const accountStatusMeta: Record<SocialAccountStatus, StatusMetadata> = {
  connected: { label: "Połączone", colorClass: "status-green" },
  disconnected: { label: "Rozłączone", colorClass: "status-gray" },
  requires_reauth: { label: "Wymaga reautoryzacji", colorClass: "status-orange" },
  missing_permissions: { label: "Brak uprawnień", colorClass: "status-orange" },
  disabled: { label: "Wyłączone", colorClass: "status-slate" },
  error: { label: "Błąd", colorClass: "status-red" }
};

export function targetStatusBadge(status: PostTargetStatus): string {
  const meta = targetStatusMeta[status];
  const variant = meta.badgeVariant ? ` ${meta.badgeVariant}` : "";
  return `<span class="status-badge ${meta.colorClass}${variant}">${meta.label}</span>`;
}

export function postStatusBadge(status: PostStatus): string {
  const meta = postStatusMeta[status];
  const variant = meta.badgeVariant ? ` ${meta.badgeVariant}` : "";
  return `<span class="status-badge ${meta.colorClass}${variant}">${meta.label}</span>`;
}

export function jobStatusBadge(status: PublishJobStatus): string {
  const meta = jobStatusMeta[status];
  const variant = meta.badgeVariant ? ` ${meta.badgeVariant}` : "";
  return `<span class="status-badge ${meta.colorClass}${variant}">${meta.label}</span>`;
}

export function accountStatusBadge(status: SocialAccountStatus): string {
  const meta = accountStatusMeta[status];
  const variant = meta.badgeVariant ? ` ${meta.badgeVariant}` : "";
  return `<span class="status-badge ${meta.colorClass}${variant}">${meta.label}</span>`;
}
