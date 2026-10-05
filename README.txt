PHARMATAP FOR STACKS PHARMACY
Netlify-ready interactive prototype | Version 1.0 | 4 October 2026

UPLOAD TO NETLIFY
1. Unzip PharmaTap-Stacks-Netlify.zip.
2. Drag the extracted folder containing index.html into Netlify's manual deploy area.
3. Open the resulting Netlify URL. No npm install, build command or API key is needed.
For a repository-based deployment, the included netlify.toml publishes the root folder.

The ZIP contains the full editable source, locally bundled fonts and Stacks wordmark.
It is a demonstration app, not a production pharmacy record system.

START HERE
The app opens at Skerries in the Pharmacist demo view.
The top bar switches pharmacy and demonstration role.
Use Group admin to see Group Overview and SOP draft/publish controls.
Use Staff to see the simpler colleague view, without pharmacist incident sign-off.
The sidebar's Product blueprint explains the proposed product and live-build stages.
A standalone printable map is also available at /product-map.html.

SUGGESTED CLIENT WALKTHROUGH (10 MINUTES)
1. TODAY: show the calm daily workspace and the three main tasks.
2. ASK: ask "How do I report a near miss?" and open the cited sample SOP.
3. REPORT: choose Near miss, enter fictional details, record the immediate response,
   review and save. The saved report waits for demo pharmacist review.
4. ACTIONS: as Pharmacist, open the report and add a preventive action. Submit
   evidence, review effectiveness and close the action. Then close the report.
5. SOP LIBRARY: acknowledge a sample SOP. As Group admin, revise it, save a draft
   and publish the demo version. The prior current version remains available to
   colleagues and assistant search while the revision is still in draft.
   Earlier acknowledgements remain in history and the new version needs reading.
6. CHECKS: record current/minimum/maximum fridge temperatures. Try current 4.2,
   minimum 3.1, maximum 9.2 to demonstrate an excursion follow-up action.
7. MAINTENANCE: report a fictional fault; a linked action is created. Completion
   evidence is followed by action review.
8. LEARNING: complete the short near-miss refresher. Wrong answers show feedback.
9. RECALLS: record a response to the fictional DEMO-001 batch exercise. A Staff
   response requires confirmation in the Pharmacist or Group admin view.
10. GROUP: view the named branches, outstanding actions and recall confirmations.
11. INSPECTIONS: complete a sample internal review. Improvement findings create
    actions. Print the evidence pack using the browser's Save as PDF option.
12. DEMO ACTIVITY: review the local history, export demo JSON or reset the workspace.

WHAT WORKS IN THIS DEMO
- Responsive desktop, tablet and mobile layouts; Gellix font bundled locally.
- Role and pharmacy switching, scoped lists and a group view.
- Four-step incident reporting, structured context and optional evidence images.
- Pharmacist review and linked action closure with completion/effectiveness notes.
- SOP search, 24 substantive illustrative SOPs, versions, draft/publish, archives
  and version-specific acknowledgements. New draft documents are hidden from staff.
- Daily check capture, reading consistency validation, exception actions and
  duplicate prevention for the same demo day's site/check.
- Maintenance reporting, optional images, completion evidence and action links.
- Three interactive short refreshers with knowledge checks.
- Fictional recall response tracking and pharmacist confirmation.
- Internal review findings linked to assigned actions.
- Printable evidence pack, downloadable demo data and local activity history.
- A scripted assistant with sample-source links and clinical-question handoff.
- Optional browser-native dictation where supported; review the transcription
  before sending or saving. Availability depends on the browser's speech service.

DEMO BOUNDARIES
Records persist in localStorage in this browser only. Different visitors and devices
have separate data. Export makes a JSON copy; reset restores the seed examples.
The app has no authentication, shared database, live AI, notification service,
external reporting submission, real HPRA alert feed or dispensing integration.
Role switching illustrates UI behavior; it is not a security boundary.
All operational records, reports, staff, faults and recalls are fictional.
The operating day is fixed to Monday 5 October 2026 so the walkthrough is repeatable.
Images must be JPEG, PNG, GIF or WebP, maximum 500 KB each; browser storage is limited.
No personal, patient or confidential information should be entered in this demo.
SOPs are illustrative process drafts, not approved Stacks procedures or complete
clinical protocols. Clinical decisions remain with the authorised pharmacist.
Checks use sample thresholds and schedules, not an approved site configuration.
No compliance certification or unexplained composite safety score is presented.

STACKS SITE LIST
Source: https://www.stackspharmacy.ie/locations (checked 4 October 2026).
Named branches: Ballymount, Bettystown, Callan, Clongriffin, Darndale, Glasnevin,
Gorey, Kilbarrack, Laytown, Lusk, Marley Park, Moyross, Passage West, Ratoath,
Skerries and Tullow.
The locator lists 16 named branches. The homepage says 18. The requested group
scope is 20, so four unconfirmed slots are shown and excluded from operating totals.
County and names follow the locator's branch chooser. Some map popup labels differ
(e.g. Cork City vs Passage West and Limerick vs Moyross); the chooser names are used.
Confirm exact branch structure before importing client records.

LIVE PRODUCT MAP
Core records:
- Organisation, pharmacy, user, role and explicit site assignments.
- SOP document, immutable revision, approval, applicability and acknowledgement.
- Check template, schedule, generated due slot, reading and traceable amendment.
- Incident, category, stage, impact assessment, investigation and restricted details.
- Action, owner, deadline, completion evidence and effectiveness review.
- Asset, service schedule, fault, contractor assignment and return-to-service review.
- Recall notice, product/batch scope, site response and pharmacist confirmation.
- Audit, criterion, finding and linked improvement action.
- Learning unit, assignment, assessment and completion.
- Protected attachment, notification delivery and server audit event.

PROPOSED LIVE BUILD
Stage 1: controlled knowledge and reporting
Named-user sign-in; server-enforced organisation/site/role scope; approved SOP import;
cited search over current applicable versions; incidents and near misses; maintenance;
shared actions; protected attachments; immutable server audit history.

Stage 2: daily operations and learning
Approved schedules/thresholds; due-slot generation; reliable alerts/escalations;
asset servicing/calibration; individual acknowledgements; staff/locum induction;
short refresher learning; offline and retry behavior where operationally justified.

Stage 3: group assurance and integration
Recall notice ingestion and governed distribution; internal audit programmes;
inspection packs; anonymised cross-site learning; activity denominators and agreed
report definitions; explicit integrations with existing dispensing/clinical systems.
Do not replace statutory registers or clinical records without a separately agreed scope.

Before live use:
Client pharmacist approval of workflows, role definitions, SOPs and limits; agreed
handling/retention of necessary patient details; restricted clinical records and
redacted group summaries; backups and restore testing; access-control tests;
reliable job/notification monitoring; duplicate prevention; accessible mobile
acceptance tests; approved correction and amendment behavior; agreed reporting rules.

DESIGN AND SOURCE FILES
index.html: static application entry point.
styles.css: calm responsive design and print styles.
data.js: branch/source metadata, illustrative SOPs and fictional seed records.
app.js: local interactions, forms, scripted assistant and persistence.
product-map.html: standalone product blueprint.
assets/: local wordmark, PharmaTap mark and Gellix font files.
_headers / _redirects / netlify.toml: static hosting settings.
QA-results.json: results from the desktop/mobile end-to-end verification.

The Stacks wordmark was retrieved from their public website for this client demo.
Gellix files were reused from existing project assets; the production deployment
needs the appropriate webfont distribution licence.

GUIDANCE USED TO SHAPE THE PROPOSED WORKFLOWS
PSI medication error management:
https://www.psi.ie/practice-supports/practice-updates-and-learnings/advice-medication-error-management
PSI SOP governance:
https://www.psi.ie/practice-supports/practice-updates-and-learnings/advice-standard-operating-procedures-sops
PSI medicine storage:
https://www.psi.ie/practice-supports/guidance-and-guidelines-pharmacists-and-pharmacies/guidelines-storage-medicinal
PSI equipment:
https://www.psi.ie/practice-supports/guidance-and-guidelines-pharmacists-and-pharmacies/guidelines-equipment
HPRA recall guidance:
https://www.hpra.ie/regulation/human-medicine/marketing-authorisation-holders/post-licensing/market-compliance-and-surveillance-of-medicines/quality-defects-and-recalls-of-medicines
PSI Pharmacy Assessment System guide:
https://www.psi.ie/sites/default/files/2024-06/Pharmacy_Assessment_System_Guide.pdf
