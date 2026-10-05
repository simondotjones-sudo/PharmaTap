# Working system update — 5 October 2026

The authenticated working foundation, Demo and Stacks Pharmacies organisation catalogue, and administrator setup are implemented. See `WORKING-SYSTEM.md` for exact scope and validation. Simon has explicitly authorised the main deployment. The assurance/SOP/check modules described below remain prototype-only.

# PharmaTap live-service requirements

The assurance extension is a browser-only prototype. None of the sample SOPs or review packs is an approved Stacks procedure or a complete regulatory assessment. No patient or real pharmacy records should be entered.

## Implemented prototype scope

- Named governance records, registration renewal evidence, traceable local amendments, dated pharmacist cover and handover records; cover gaps create actions.
- Eight evidence-review packs: pharmacy self-assessment, controlled drugs, medicines handling, PCRS, non-prescription medicines, privacy, workplace safety and clinical services.
- Each question captures an outcome and evidence reference. Gaps create owned follow-up actions. Next-review dates and unresolved actions determine review status.
- Nine operational exception types create linked actions.
- Named staff competence records, assessment evidence, review dates and a matrix showing missing evidence. A service or a refresher is not treated as automatic competence.
- Branch assurance visibility and printable evidence-pack additions. Existing demonstration data remains intact.

## Production architecture and acceptance gates

1. Identity: named sign-in, organisation/site membership, separate superintendent, supervising pharmacist, operational manager and staff permissions. Existing demo role switch cannot authorize real records. Configure the production identity provider and client user list before enabling writes.
2. Storage: relational organisation/site/person/document/review/action tables with server-side scope checks. Signed private attachments, malware checks, file size/type limits. No patient data in general operations records.
3. Integrity: server timestamps and actor IDs, append-only audit events and revision history; idempotent submissions, optimistic concurrency and atomic record/action transactions. Browser evidence is editable and does not meet this gate.
4. Retention: client-approved schedules by record type, access reviews, deletion holds and restricted incident handling. No single blanket GDPR retention period.
5. Operations: timezone-aware schedules, per-site approved frequencies and thresholds, missing-evidence alerts, retries, delivery records and monitored job failures. Client-approved escalation recipients are required.
6. Recovery: encrypted backups, restore drill, agreed recovery objectives, monitored errors and documented support ownership.
7. Validation: cross-site access denial, role denial, tamper-resistant audit verification, duplicate/concurrent submission checks, attachment authorization, renewal/reminder boundary tests and restoration evidence.

## Existing systems and clinical ownership

Keep dispensing, consent, consultation and statutory controlled-drug records in their designated systems. Integrations with these systems, FMD and PCRS require the client's vendors and access arrangements. Operational evidence references are not a replacement for those records.

The superintendent/client must approve the actual SOP content, assessment scope, service eligibility and competence criteria, statutory-record approach and branch setup. Current official guidance links are included in the prototype review packs; the prompts are deliberately not clinical instructions.

## Outstanding production inputs

- Approved identity provider / Stacks account provisioning and user-role matrix.
- Database and private evidence storage provisioning, region and retention agreement.
- Confirmed branch list, named pharmacists, renewal dates and approved source documents.
- Clinical, FMD, PCRS and statutory-record system vendors, integration scope and permissions.
- Notification recipients, escalation rules and approved service/check schedules.

These inputs block a safe live launch, not prototype review. The public demonstration must remain browser-only until the above acceptance gates pass.
