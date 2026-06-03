# API Feasibility Notes

Every real platform adapter must start with a short official-docs check. Do not rely on old memory for scopes, review status or posting requirements.

## Current Status

| Platform | Status | Notes |
| --- | --- | --- |
| Dry run | Implemented | Used to validate queue, targets and logging without publishing. |
| YouTube | First real adapter scaffolded | Uses Google OAuth web-server flow, `youtube.upload` + `youtube.readonly` scopes, `channels.list?mine=true` for account discovery and `videos.insert` resumable upload. Real publishing still needs Google Cloud OAuth credentials on the environment. |
| LinkedIn | Researched, not implemented | Personal posting uses `w_member_social`. Organization posting uses `w_organization_social` and Community Management API access. Video publishing should use Videos API plus Posts API. |
| Instagram | Researched, not implemented | Use Instagram API with Facebook Login for the shared Meta flow. Requires a Professional account linked to a Facebook Page, `pages_show_list`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`, a media container, status polling and publish. |
| Facebook | Researched, not implemented | Page posting only. Use the shared Meta OAuth flow, Page Access Token and `pages_manage_posts`. Keep a separate publisher adapter even though auth is shared with Instagram. |
| TikTok | Researched, not implemented | Login Kit plus Content Posting API. `video.publish` is for Direct Post and `video.upload` for upload flow. Unaudited clients are private-only, and Direct Post review does not accept private/internal-only utility tools. |

## Rules

- Store only redacted raw responses.
- Record required scopes in this file before coding a real adapter.
- Add known review/audit limitations here.
- Keep API-specific code inside `apps/app/src/platforms`.

## Operational Guide

The detailed account creation, developer app, OAuth and review checklist is in:

[PLATFORM_ONBOARDING_PL.md](PLATFORM_ONBOARDING_PL.md)
