# 094 — NFC Google Card Link Guide

**Status / date / sole writer:** Locally accepted / 2026-09-30 / main agent; self-review only.

**Purpose and user need:** Produce one print-ready A4 Turkish brochure showing a Google-card recipient how to copy a Google review or other link and write it to the supplied NFC card with NFC Tools.

**Delivery focus:** One observable result: a one-page customer handout. This does not advance or change the choir app roadmap. No product code, live service, messaging, or release work is in scope.

**Starting evidence:** The user requested an A4 brochure for buyers who left the link field blank on their Trendyol order. The current official NFC Tools guide gives the sequence Write → Add a recording → URL / URI → Validate → Write → tap the NFC chip. Google Business Profile Help gives the current review-link path. Working tree was on `main`, 261 commits ahead of `origin/main`, with unrelated pre-existing `supabase/.temp/cli-latest` modified; that path is outside this task and remains untouched. At final staging, separate changes were also present in `docs/briefs/090-private-file-ticket-revocation-contract.md`, `supabase/functions/assignment-file/index.ts`, `supabase/functions/repertoire-file/handler.ts`, and `supabase/functions/repertoire-file/index.ts`, plus untracked `supabase/functions/_shared/private-file-authority.ts`, `supabase/functions/_shared/private-file-ticket-v2.ts`, and `supabase/migrations/20260930080046_private_file_ticket_authority_090.sql`. These remain outside this task and unstaged.

**Current work card:** `output/pdf/google-karti-nfc-link-kilavuzu.pdf` is complete; one-page A4, readable in Turkish, with source links and successful rendered-page inspection.

**Resources:** N/A — document-only; no runtime or product test environment required. Final PDF is 69,258 bytes. The 150 dpi rendered preview was visually inspected and removed; no generated runtime remains.

**Allowed paths:**

- `docs/briefs/094-nfc-google-card-link-guide.md` — this acceptance record.
- `output/pdf/google-karti-nfc-link-kilavuzu.pdf` — requested customer brochure.
- Temporary renderer/source files outside the repository; remove after use.

**Sources:**

- NFC Tools official URL-writing guide: https://www.wakdev.com/en/knowledge-base/how-to-guides/how-to-write-a-link-url-on-an-nfc-chip.html
- Google Business Profile Help, review link/QR: https://support.google.com/business/answer/16816815?hl=en
- NFC Tools app listings identify wakdev as developer (Google Play and Apple App Store).

**Transition-start checklist:** N/A — this is not a Genova mobile migration.

**Out of scope:**

- Any web/mobile app, database, NFC-card encoding, supplier, Trendyol, release, or hosted-service change.
- Claiming the customer's particular card was physically tested; no physical card was supplied.
- Adding an unknown company logo, support contact, or business identity.

**Risk / authority / rollback:** Only local brochure and acceptance-document creation are authorized. The PDF can be regenerated or removed locally. Do not stage or alter `supabase/.temp/cli-latest`; do not push. State clearly that writing requires an NFC-enabled phone and an NFC tag/card that is not write-protected. A new NDEF write replaces the existing card link.

**Small steps:**

1. PASS — researched the current official NFC Tools and Google link paths.
2. PASS — created the A4 handout with short link and NFC steps plus a visible overwrite note.
3. PASS — rendered and inspected the page, checked extracted text and hyperlinks, and committed owned files only.

**Definition of done:**

- [x] One-page portrait A4 PDF tells the card recipient they can add their own link.
- [x] Google review-link path and a generic “Share / Copy link” path are clear and quick.
- [x] NFC Tools URL-write actions match the official guide; app labels include English names for interface variation.
- [x] New-write replacement and write-protection limitations are clear; Google review-policy reminder is brief.
- [x] PDF source links work; extracted text and final rendered page are visually checked.
- [x] Document-only gate: links and claims are consistent with sources, scoped diff reviewed, staged `git diff --check` clean, and unrelated changes untouched.
- [x] Local commit contains only the brief and PDF; no push.

No product test/build gate applies to this document-only output. Actual card writing is N/A because no physical card is available; it is not evidence of card-specific compatibility.

**Result record:**

| Date | Command / action | Environment | Status | Evidence and boundary |
|---|---|---|---|---|
| 2026-09-30 | Read official NFC Tools guide and Google Business Profile Help | Web, read-only | PASS | Current URL-writing sequence and review-link path used; no card was provided. |
| 2026-09-30 | Create and inspect brochure | Local PDF | PASS | `pdfinfo`: 1 page, A4 (595.276 x 841.89 pt), 69,258 bytes. Extracted text: 1,574 characters; both HTTPS source links present. Rendered at 150 dpi and visually checked; no clipping or overlap. Preview removed. |
| 2026-09-30 | Physical NFC write/read on delivered card | Physical hardware | N/A | No card supplied; no card-specific hardware claim. |
| 2026-09-30 | Stage-owned-path diff check and local commit | Local Git | PASS | Only this brief and the final PDF were included; concurrent/unrelated dirty paths remained unstaged. No push. |

**Delivery:** Local commit completed with only this brief and the final PDF; no push. Review was self-review; no independent reviewer was used. No rollback action needed unless the user asks to remove or revise the handout.

## Mandatory acceptance evidence

| Criterion / expected behavior | Required? / N/A reason | Status: PASS / FAIL / NOT RUN / N/A | Date, revision, environment, command or scenario | Evidence and limits |
|---|---|---|---|---|
| One-page portrait A4 Turkish brochure clearly invites the buyer to set their preferred link | Required | PASS | 2026-09-30, local PDF generation and `pdfinfo` | One page; A4 dimensions; customer-facing Turkish text. |
| Quick Google review-link and other-link instructions are included | Required | PASS | 2026-09-30, extracted-text review | Google Profile path plus Share / Copy link for other pages. |
| NFC Tools steps match official instructions; replacement and writeability caveats are clear | Required | PASS | 2026-09-30, official-source and content review | Write → Add a recording → URL / URI → Validate → Write; overwrite and write-protection notes included. |
| Source hyperlinks work and extracted text is complete | Required | PASS | 2026-09-30, pypdf inspection | One-page text extracted; two HTTPS source annotations present. |
| Final page renders cleanly with no clipping or overlap | Required | PASS | 2026-09-30, `pdftoppm` at 150 dpi and visual inspection | Rendered preview inspected, then removed. |
| Physical supplied-card write/read acceptance | N/A | N/A | 2026-09-30, physical hardware | No physical tag was provided; brochure does not claim the specific card was tested. |
| Web/mobile product tests and builds | N/A | N/A | 2026-09-30, document-only | No product code or behavior changed. |
