# API Feasibility Notes

Every real platform adapter must start with a short official-docs check. Do not rely on old memory for scopes, review status or posting requirements.

## Current Status

| Platform | Status | Notes |
| --- | --- | --- |
| Dry run | Planned first | Used to validate queue, targets and logging without publishing. |
| YouTube | Candidate first real adapter | Check OAuth consent, YouTube Data API upload quota and test user flow. |
| LinkedIn | Candidate first real adapter | Check current personal/profile posting scopes and video API requirements. |
| Instagram | Later | Requires Meta app, professional account, media container flow and polling. |
| Facebook | Later | Page posting only. Keep separate adapter even if Meta auth is shared. |
| TikTok | Later | Product-critical, but API review may block direct posting. Build test/dry-run path. |

## Rules

- Store only redacted raw responses.
- Record required scopes in this file before coding a real adapter.
- Add known review/audit limitations here.
- Keep API-specific code inside `apps/app/src/platforms`.
