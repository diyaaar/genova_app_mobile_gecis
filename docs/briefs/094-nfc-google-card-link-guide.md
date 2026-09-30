# 094 — NFC Google Card Link Guide

**Status / date / sole writer:** QR update locally accepted / 2026-09-30 / main agent; self-review only.

**Purpose:** One print-ready Turkish A4 brochure for Google-card buyers who need to copy a Google review or other link and write it to the supplied NFC card with NFC Tools.

**Starting evidence:** The official NFC Tools URL-writing guide and Google Business Profile review-link guide informed the original brochure. The QR update uses the current official iOS App Store and Google Play listings for NFC Tools by wakdev. No physical card was supplied.

At the QR follow-up start, unrelated worktree changes were present and left unstaged. Exact paths shown by `git status`:

- `apps/mobile/src/repertoire/expo-private-file-store.ts`
- `apps/mobile/src/repertoire/private-file-store.ts`
- `apps/mobile/src/repertoire/reader-gateway.ts`
- `components/chat/ProtectedChatMediaImage.tsx`
- `docs/briefs/090-private-file-ticket-revocation-contract.md`
- `hooks/useProtectedChatMediaUrl.ts`
- `hooks/useProtectedDriveFileUrl.ts`
- `lib/drive-file-url.ts`
- `lib/repertuvar/protected-file-client.ts`
- `supabase/.temp/cli-latest`
- `supabase/functions/assignment-file/index.ts`
- `supabase/functions/assignment-review-file/index.ts`
- `supabase/functions/chat-media-file/index.ts`
- `supabase/functions/repertoire-comment-file/index.ts`
- `supabase/functions/repertoire-file/handler.test.ts`
- `supabase/functions/repertoire-file/handler.ts`
- `supabase/functions/repertoire-file/index.ts`
- `supabase/functions/_shared/private-file-authority.ts`
- `supabase/functions/_shared/private-file-ticket-v2.test.ts`
- `supabase/functions/_shared/private-file-ticket-v2.ts`
- `supabase/migrations/20260930080046_private_file_ticket_authority_090.sql`

**Allowed files:** This brief and `output/pdf/google-karti-nfc-link-kilavuzu.pdf`. Only those two paths are staged by this follow-up. Temporary QR preview and decoder script are removed after review.

**Official sources:**

- NFC Tools URL-writing steps: https://www.wakdev.com/en/knowledge-base/how-to-guides/how-to-write-a-link-url-on-an-nfc-chip.html
- Google Business Profile review link: https://support.google.com/business/answer/16816815?hl=en
- iOS App Store NFC Tools: https://apps.apple.com/tr/app/nfc-tools/id1252962749
- Android Google Play NFC Tools: https://play.google.com/store/apps/details?id=com.wakdev.wdnfc

**Scope and limits:** The PDF provides the current link-copy paths, NFC Tools write steps, overwrite/write-protection note, and a short Google review-policy reminder. It now includes clearly labeled, clickable QR tiles for iOS/App Store and Android/Google Play. No product code, live service, app message, or card encoding was changed. A new write replaces the card's current link. Physical printer output and supplied-card write/read remain unverified.

**Acceptance evidence:**

| Criterion | Status | Evidence / limit |
|---|---|---|
| One-page portrait A4 Turkish brochure remains intact | PASS | `pdfinfo`: 1 page, 595.276 x 841.89 pt. |
| iOS QR opens official NFC Tools App Store listing | PASS | macOS Vision decoded the 150 dpi rendered QR as `https://apps.apple.com/tr/app/nfc-tools/id1252962749`; PDF tile is also clickable. |
| Android QR opens official NFC Tools Google Play listing | PASS | macOS Vision decoded the 150 dpi rendered QR as `https://play.google.com/store/apps/details?id=com.wakdev.wdnfc`; PDF tile is also clickable. |
| Existing NFC Tools and Google source links remain present | PASS | `pypdf` inspection found all four HTTPS PDF link annotations. |
| Final page is visually clean | PASS | 150 dpi PNG rendered and inspected; no overlap or clipping. Preview and decoder script removed. |
| Actual printed sheet and supplied NFC card | N/A | No physical print or card was available; no hardware compatibility claim. |

The QR codes use ReportLab's vector QR widget, with the store destination strings asserted at creation; Vision confirmed the final rendered QR payloads. PDF is 73,230 bytes and contains 1,625 extracted text characters. No product build/test gate applies.

**Delivery:** Original brochure commit `f9869f8`; this QR follow-up updates only the brief and PDF in a separate local commit. No push. Review is self-review; no independent reviewer was used.
