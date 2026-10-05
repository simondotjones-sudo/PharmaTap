# PharmaTap working system — 5 October 2026

## Delivered scope

The working sign-in workspace opens at `/`, with an alias at `/workspace.html`. The original browser-only prototype is retained at `/prototype.html`.

- Named Netlify Identity sign-in, invite acceptance, password recovery and sign-out. Invite-only Identity is enabled on the project.
- PostgreSQL organisations, pharmacy sites, organisation administrators, site memberships, reports, review actions and audit history.
- Separate Demo and Stacks Pharmacies organisations, with organisation and pharmacy switching limited to the authenticated user's access.
- Near-miss, medication-error, complaint, safety and maintenance reports. Every report requires a reviewer and deadline and creates its review action in the same transaction.
- Staff see their own reports; managers and superintendents see their assigned pharmacies. Organisation-admin membership is explicit; the installation assigns the requested administrator superintendent permissions at every site in the two organisations.
- Review notes, Open / Awaiting review / Closed statuses, version conflicts and final closure. Submitted reports and audit events reject database update/deletion. Corrections currently use follow-up reports, not silent edits.
- Idempotent report retries and JSON exports with record count and audit history. Exports use a consistent database snapshot.
- Same-origin JSON mutations, escaped record text, no-store API responses and generic operational errors. Records/drafts are not saved in browser localStorage; the Identity SDK manages its own session.

## Organisation catalogue

Demo contains two demonstration sites: Demo Skerries and Demo Marley Park. Stacks Pharmacies contains 16 named branches verified against https://www.stackspharmacy.ie/locations on 5 October 2026: Ballymount, Bettystown, Callan, Clongriffin, Darndale, Glasnevin, Gorey, Kilbarrack, Laytown, Lusk, Marley Park, Moyross, Passage West, Ratoath, Skerries and Tullow. Counties and source URLs are retained. The prototype's four unnamed placeholders are not operational sites. The public homepage describes 18 branches, while the location selector exposes 16 unique branch IDs; any additional locations require confirmation.

No operational reports or approved SOPs are seeded into either organisation.

## Initial administrator setup

The authenticated `/api/workspace/initialise` operation derives its account from Netlify's verified identity context. A deployment-managed database record contains a one-way fingerprint of the account explicitly selected by Simon; neither request parameters nor user-editable metadata can select an account or role. Unlisted accounts receive no access. The working app runs this account setup after sign-in before loading the session. It uses one transaction, assigns organisation-admin and per-pharmacy reviewer memberships, writes assignment audit events, and queries back both organisations and all 18 sites.

A completion marker prevents repeated setup from restoring revoked access or switching the configured administrator. The one-way fingerprint does not reveal an invitation token, password or account identifier. Setup runs separately in preview and production. This replaces the unsuccessful build/environment-variable provisioning. Netlify's configuration tool reported successful writes but returned no environment settings and the deployed function could not read them; no success claim is based on that tool response.

The authorisation to deploy main and create both organisations was given explicitly by Simon on 5 October 2026.

## Validation

Build and strict TypeScript checks pass. Eight PostgreSQL-engine test groups exercise the real migrations and service queries:

1. Report → action → closure → history → export reconciliation.
2. Cross-organisation/pharmacy access, unrelated staff incident access and staff review/export denial.
3. Duplicate retry and changed-payload idempotency conflicts.
4. Stale action revisions, closure notes and final closure.
5. Invalid input/owner/dates and inactive membership.
6. Audit/report immutability and full rollback when audit insertion fails.
7. Same-origin and JSON mutation checks.
8. Verified-identity setup denial, two organisations, 16 Stacks sites, two demo sites, repeat-safe administrator assignment, access verification and no reactivation after revocation.

Tests run in PGlite against PostgreSQL SQL. The setup operation queries actual database memberships before returning a verified result. The browser smoke script remains available in `tests/ui-smoke.mjs`; local execution was blocked because Chromium was unavailable and its download failed. Deployed user screenshots provide sign-in evidence, but a complete browser flow, simultaneous-submit load check and restore drill remain outstanding.

## Next increments and limits

Approved SOP import, pharmacist approval, versions and staff acknowledgements come next, followed by scheduled checks/temperature exceptions, recall tracking and escalation delivery, then source-grounded Ask PharmaTap. These are not yet working modules in the authenticated workspace.

Client-approved report fields, role matrix, hosting/retention arrangements, monitoring/support and backup/restore validation are still required before real sensitive pharmacy records are accepted. Keep patient identifiers in designated clinical systems. This release does not replace dispensing software, statutory controlled-drug records or regulatory reporting.

## Home and profile

Signed-in users land on the six-tile Home screen. Profile contains organisation, site and role selectors plus sign-out. Organisation administrators can select admin, pharmacist or staff views; other accounts can select their assigned role or a lower role. Every server record operation verifies the selected role against the active site membership. SOPs, Checks and Training are marked Coming soon; reports, maintenance reports and actions use the working database.

The working workspace retains the Back / Home / Menu / Ask navigation pill and header action bell. The red badge counts the current user’s open actions at the selected site. Ask provides live report/action summaries and workflow shortcuts; AI and approved SOP retrieval are not yet implemented. Navigation DOM tests cover drawer links, Back, report details, live action counts, overlay draft preservation, profile and sign-out.
