Connect Attack Path investigations to the existing Case Management module using the exact UI structure shown in the attached screenshots.

Important:
Do not redesign Case Management.
Do not generate new layouts.
Reuse the exact page structure, spacing, section hierarchy, tabs, cards, tables, and modals from the screenshots.

The screenshots are the source of truth for UI.

---

INTEGRATION TRIGGER

When a user clicks Create case from any of these places:

- Attack Path vulnerable asset workflow
- Blast Radius asset insight
- Attack Path recommendation card
- Watch Center AI recommendation related to attack paths

Create a new case in Case Management.

---

CASE CREATION DATA

When the case is created, populate it with Attack Path context.

Store:

Case title  
Severity  
Attack path name  
Affected asset list  
Vulnerability / KEV reference  
Misconfiguration context  
Threat source  
Recommended remediation  
Confidence score  
AI analyst summary

Examples:

Case title:
Block lateral movement to domain controller

Severity:
Critical

Threat source:
Attack Path Investigation

AI analyst summary:
A multi-hop lateral movement path was confirmed from an internet-facing asset to a critical internal target.

---

OPEN DESTINATION PAGE

After case creation:

Open the Case Detail page directly

Do not open the Cases list first.

Open the Case Investigation tab by default.

The Case Detail page must follow the exact screenshot structure.

---

CASE DETAIL PAGE STRUCTURE

Preserve this structure exactly:

Header:
- back arrow
- case title
- top right actions

Tabs:
- Case Investigation
- Case Reporting

---

CASE INVESTIGATION TAB STRUCTURE

Use the same structure shown in the screenshots.

Top Case Overview block fields:

Case ID  
Category  
Severity  
Owner  
Case Age  
Last Update  
Status  
Resolution State

Do not change the layout.

Populate these automatically from Attack Path data.

Examples:

Category:
Attack Path / Lateral Movement

Severity:
Critical

Owner:
System

Status:
Open

Resolution State:
Case Assigned

---

RECOMMENDED PLAYBOOKS

Populate the existing Recommended Playbooks section using Attack Path context.

Do not change the playbook card design.

Use the same 3-column card layout shown in the screenshots.

Suggested playbooks may include:

Disable AWS IAM User  
Workflow to enforce MFA for a user  
Workflow to restrict IAM policies permission  
Block IP in ACL  
Re-enable CloudTrail logs  
Workflow to enable GuardDuty on AWS  
Rotate credentials  
Isolate host

Each playbook card must use the same structure as the screenshots:

title  
description  
reason  
action button / manual instruction if already present in the design

---

ADD OBSERVATIONS SECTION

Reuse the exact Add Observations UI from the screenshots.

Automatically create the first observation entry.

Example:

AI Insight from Watch Center

"A multi-hop lateral movement path was detected from an internet-facing asset to a critical database. Immediate containment is recommended."

If the case was created directly from Attack Path, use:

AI Insight from Attack Path

"A critical attack path was confirmed involving KEV exposure and blast radius expansion across affected assets."

Timestamp = case creation time

---

OBSERVATION FEED

Reuse the same observation feed structure from the screenshots.

If quick actions are included, they must appear inside the observation card using the same structure as the screenshot.

Examples:

Disable User Account  
Escalate Case to Tier-2 Analyst  
Block Source IP  
Isolate Host  
Open Asset Detail

Do not redesign the observation cards.

---

CASE REPORTING TAB

When the user switches to Case Reporting, reuse the exact Case Reporting layout from the screenshots.

Sections must remain exactly as shown:

Summary  
Actors  
Actions  
Assets Affected  
Attributes Impacted

Populate these sections using Attack Path context.

Examples:

Summary:
Critical attack path confirmed from internet-facing source to crown-jewel asset

Actors:
External actor or unknown attacker source

Actions:
Containment initiated, case created, investigation assigned

Assets Affected:
List impacted resources from blast radius

Attributes Impacted:
Confidentiality, Integrity, Availability based on attack path findings

Do not change layout or spacing.

---

EXPORT REPORT

Reuse the existing Export Report button and modal structure exactly as shown in the screenshots.

Do not generate a new modal design.

The report should include Attack Path investigation context when exported.

---

BACK NAVIGATION

When the case was opened from Attack Path:

Back navigation should return the user to the exact Attack Path screen they came from.

Do not redirect to the generic Cases list.

---

UI CONSTRAINTS

Do not change:

- page layout
- spacing
- section order
- card design
- table design
- tab styling
- modal styling
- observation feed structure
- playbook card layout

Only implement the integration logic and data population using the existing Case Management UI structure from the screenshots.