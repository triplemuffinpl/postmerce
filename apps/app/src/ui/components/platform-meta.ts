import type { Platform } from "../../domain.js";

const platformLabels: Record<Platform, string> = {
  youtube: "YouTube",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok"
};

export function platformLabel(platform: Platform): string {
  return platformLabels[platform] ?? platform;
}

export function platformIcon(platform: Platform, width = 20, height = 20): string {
  switch (platform) {
    case "youtube":
      return `<svg class="platform-icon brand-youtube" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="${width}" height="${height}">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>`;
    case "linkedin":
      return `<svg class="platform-icon brand-linkedin" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="${width}" height="${height}">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>`;
    case "instagram":
      return `<svg class="platform-icon brand-instagram" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="${width}" height="${height}">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>`;
    case "facebook":
      return `<svg class="platform-icon brand-facebook" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="${width}" height="${height}">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>`;
    case "tiktok":
      return `<svg class="platform-icon brand-tiktok" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="${width}" height="${height}">
                <path d="M12.525.02c1.31-.032 2.617-.023 3.91-.033.08 1.56.63 3.09 1.557 4.253.906 1.15 2.174 1.96 3.565 2.193V10.3c-1.24-.077-2.427-.512-3.45-1.258-.228-.166-.44-.347-.638-.544v7.354c.047 1.726-.607 3.414-1.804 4.654A6.47 6.47 0 0 1 10.34 22.2a6.47 6.47 0 0 1-4.834-2.827c-1.074-1.393-1.464-3.195-1.074-4.92A6.5 6.5 0 0 1 8.85 9.878c.813-.23 1.668-.244 2.485-.04v3.916c-.328-.088-.675-.12-1.012-.093-.827.05-1.58.5-2.002 1.21-.422.7-.492 1.57-.187 2.336a2.6 2.6 0 0 0 2.4 1.678c.677.01 1.332-.31 1.727-.86.395-.55.485-1.26.242-1.89a5.1 5.1 0 0 0-.25-.49V.02h.27z"/>
              </svg>`;
    default:
      return "";
  }
}

export function platformToneClass(platform: Platform): string {
  return `platform-${platform}`;
}

export function platformBadge(platform: Platform, compact = false): string {
  const label = platformLabel(platform);
  const icon = platformIcon(platform, 16, 16);
  const classes = `platform-badge platform-${platform} ${compact ? "compact" : ""}`;
  return `<span class="${classes}">${icon}${compact ? "" : `<span>${label}</span>`}</span>`;
}
