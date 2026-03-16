Integrate newly created cases into the existing Cases list page using the exact UI structure shown in the attached screenshots.

Important:
Do not redesign the Cases page.
Do not generate a new table layout.
Reuse the same structure, spacing, filters, summary bar, columns, row density, badges, and controls exactly as shown in the screenshots.

The screenshots are the source of truth.

---

CASE SOURCES

New cases may be created from:

Watch Center AI recommendation  
Attack Path investigation  
Blast Radius asset insight  
Manual case creation

All newly created cases must appear in the Cases list page.

---

CASES PAGE STRUCTURE

Preserve the exact structure shown in the screenshots.

Top area:
Dashboard tab  
Cases tab

Cases tab contains:

filter row  
summary bar  
search bar  
table  
pagination

Do not change this hierarchy.

---

FILTER ROW

Reuse the exact filter row structure shown in the screenshots.

Filters:

Severity  
Status  
Verdict

Each new case must automatically fit into these filters.

Examples:

Severity:
Critical / High / Medium / Low

Status:
Open / Review / Escalated / Approval Pending / Case Assigned / Closed

Verdict:
Benign True Positive / True Positive / False Positive / Under Review

Do not redesign filter controls.

---

SUMMARY BAR

Reuse the same summary bar structure shown in the screenshots.

Display:

Total Cases  
High Priority count  
Medium Priority count  
Low Priority count

When new cases are created, update these counts automatically.

The colored summary bar must also update automatically.

Do not change its visual design.

---

TABLE STRUCTURE

Reuse the exact table structure shown in the screenshots.

Columns:

Case ID  
Severity  
Case Name  
Resolution State  
Owner  
Created On  
Last Updated  
Verdict

Do not add or remove columns.

Do not change row spacing.

Do not redesign badges or dropdowns.

---

NEW CASE POPULATION

When a new case is created from Watch Center AI or Attack Path, automatically populate the Cases table row.

Populate:

Case ID  
Generate a unique case ID

Severity  
Use source severity

Case Name  
Use recommendation or attack path title

Resolution State  
Default = Case Assigned

Owner  
Default = System unless manually assigned

Created On  
Use creation timestamp

Last Updated  
Use latest activity timestamp

Verdict  
Default = Under Review

Examples:

Case Name:
Block lateral movement to domain controller

Case Name:
Critical attack path confirmed for finance-db-01

---

ROW CLICK BEHAVIOR

When the user clicks a case row:

Open the Case Detail page.

Reuse the same Case Detail structure shown in the screenshots.

Open the correct case context.

Do not redesign the detail page.

---

AUTO-SYNC WITH CASE DETAIL

If a case is updated in Case Detail, reflect those updates in the Cases table.

Examples:

Status changed  
Verdict changed  
Owner changed  
Observation added  
Playbook run

Update the following fields in the row:

Resolution State  
Owner  
Last Updated  
Verdict

Do not change the row layout.

---

SORTING

Preserve the sorting behavior shown in the screenshots.

Users should be able to sort by:

Case ID  
Severity  
Created On  
Last Updated  
Verdict

Do not redesign sort controls.

---

PAGINATION

Reuse the same pagination structure shown in the screenshots.

If many new cases are created, they should appear in the paginated table correctly.

Newest cases should appear at the top by default.

---

UI CONSTRAINTS

Do not change:

page structure  
tab structure  
filter layout  
summary bar layout  
table layout  
column structure  
badge styles  
dropdown styles  
pagination layout

Only implement the integration logic so new cases appear correctly inside the existing UI.