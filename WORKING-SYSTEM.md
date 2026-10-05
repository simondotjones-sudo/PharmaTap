# PharmaTap working foundation — 5 October 2026

## Delivered

A separate authenticated workspace at `/workspace.html`, using the existing Gellix font and PharmaTap design. The public prototype remains at `/` and is not connected to the database.

- Named Netlify Identity login, password recovery, invitation acceptance and sign-out.
- PostgreSQL organisations, pharmacies, memberships, reports, linked review actions and audit events.
- Reports for near misses, medication errors, complaints, safety concerns and maintenance.
- Explicit reviewer and deadline required on every report. The report, action and creation audit are one database transaction.
- Server-side pharmacy membership checks on every read/write. No client role switching in this workspace. Staff see their own reports; managers and superintendents see the pharmacies assigned to them. Superintendent access is assigned per pharmacy, not automatically group-wide.
- Review notes, Open / Awaiting review / Closed states, version conflicts, final closure and actor attribution. Existing reports are immutable; corrections currently require a linked reference in a follow-up report's details. Dedicated amendments are not yet implemented.
- Same-payload retries with the same idempotency key return the original report. Changed payloads using a previous key are rejected. No operational records or drafts are stored in localStorage; the Identity SDK manages its own session.
- Export includes reports, actions, actor identifiers, timestamps, record count and audit history, read in one consistent database snapshot.
- Report titles/details are escaped when rendered. Mutations require a same-origin JSON request. API responses are never cached. Database errors and identity tokens are not exposed or logged.

## Validation performed

Build and strict TypeScript checks pass. Seven PostgreSQL-engine test groups run with PGlite against the actual migration and service queries, covering:

1. Report submission → reviewer action → closure → history → export reconciliation.
2. Cross-organisation and cross-pharmacy access, unrelated staff report access, staff review/export denial.
3. Duplicate retry and changed-payload idempotency conflicts.
4. Stale action version, required closure notes and final closure.
5. Invalid type/owner/dates and inactive membership.
6. Audit and report mutation/deletion denial and complete rollback on audit insertion failure.
7. Cross-origin and non-JSON mutation denial.

This validates application permissions and SQL behavior. It does not constitute a deployed authentication test, a concurrent-load test, a restore drill or an independent security assessment.

A browser smoke test is provided in `tests/ui-smoke.mjs`. It tests UI login, mobile layout, draft preservation after failed saves, identical retry keys, report creation, action closure and sign-out using mocked Identity/API responses. It was not executed successfully here: the installed browser runtime had no Chromium executable and the browser download was blocked/truncated. Run it with Playwright and Chromium installed before accepting the UI. The test uses `CODEX_PRIMARY_RUNTIME_NODE_MODULES` if supplied, otherwise a local Playwright installation.

## Preview activation

1. Open the working-foundation development pull request and its deploy preview. Open its Netlify deploy preview, then verify the database migration succeeds and functions are deployed.
2. Enable Identity in Netlify project configuration if it is not already enabled. The live project Identity settings endpoint returned HTTP 404 during this session; deployed sign-in has not been validated. Use invite-only registration, email confirmation and redirect links to `/workspace.html`. Do not enable public self-registration for this client workspace.
3. Create named test accounts through Identity. Do not send client invitations until the client list is confirmed. Record the actual Identity user IDs.
4. Create an access JSON file outside the publish directory with an organisation UUID/name and pharmacy UUID/name/members. Use actual identity IDs and confirmed branch names. Each member has `userId`, `displayName`, `role` (`staff`, `manager`, `superintendent`) and optional `active`. Every pharmacy requires an active reviewer. No sample accounts, branch memberships or records are seeded by the migration.
5. In a linked Netlify environment that targets the intended preview database, run `node scripts/provision.mjs /absolute/path/access.json`. Provisioning is an operator-only script; no public HTTP endpoint can grant access. Omitted memberships remain unchanged; deactivate users explicitly with `active: false`.
6. Test named staff and manager accounts in separate browser sessions: create at site A, confirm at site A on a second device, deny site B, revoke access, close an action and reconcile export.
7. Confirm password recovery/invites, expiration/logout behavior, error handling and the application's appearance on a pharmacy phone and shared workstation. Test duplicate in-flight submissions against hosted PostgreSQL.

## Before real pharmacy use

Confirm approved pharmacy/user-role matrix and report fields with the superintendent; verify privacy/hosting region and retention requirements; establish backup/restore, monitoring and support; demonstrate a restore; complete deployed authentication, cross-site and concurrent-save acceptance checks. Current reports are operational text, not patient records. There is no clinical record integration, attachment storage, statutory controlled-drug register or regulatory submission.

## Next increments

1. Approved SOP import, versions, pharmacist approval, staff acknowledgements and review dates.
2. Approved pharmacy check schedules, asset temperatures and corrective-action routing.
3. Group oversight, recall distribution and branch outcomes, notification delivery with escalation logs.
4. Approved-source Ask PharmaTap with permission-aware retrieval, source/version citations and pharmacist-reviewed evaluation.

The new workspace contains no fake AI responses, sample SOPs or compliance scores. These modules remain prototype-only until their working implementations are accepted. Do not describe this first increment as a production-ready pharmacy system.

## Publication status

Publication of the development branch and preview pull request was authorised on 5 October 2026. This increment is for preview validation. Production/main remains unchanged until an explicitly approved release.
