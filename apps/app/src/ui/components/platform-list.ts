import type { PlatformConfig } from "../../domain.js";
import { escapeHtml } from "../html.js";

export function platformList(platforms: PlatformConfig[]): string {
  return `
    <div class="platform-list">
      ${platforms
        .map((platform) => {
          const status = platform.enabled ? "Enabled" : "Disabled";
          const statusClass = platform.enabled ? "status-ok" : "status-muted";
          return `
            <article class="platform-row">
              <div>
                <h3>${escapeHtml(platform.label)}</h3>
                <p>${platform.directPublishing ? "Direct publishing planned" : "Container or polling flow planned"}</p>
              </div>
              <span class="status-badge ${statusClass}">${status}</span>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}
