Stabilize the UI across the entire application by enforcing a single shared design system.

Important:
The attached screens and previously implemented pages are the source of truth.

Do not redesign any screen.  
Do not generate new visual styles.  
Only enforce a consistent design system across all modules.

Modules that must use this design system:

• Watch Center  
• Control Center  
• Asset Register  
• Employees  
• Risk Register  
• Attack Path  
• Vulnerabilities  
• Misconfigurations  
• Case Management  
• Compliance  
• Integrations  
• Workflows  
• Module Configurations  
• Settings  
• Profile

Every screen must use the same components and tokens.

---

SECTION 1 — GLOBAL COLOR TOKENS

Define the following tokens and reuse them everywhere.

Primary background  
#030A10

Card background default  
#050B11

Card hover background  
#071019

Table header background  
#050B11

Table row default background  
#071019

Table row hover background  
#0C161F

Border color  
#0E1C26

Divider color  
#0C1822

These colors must replace any other dark background currently used.

---

SECTION 2 — PRIMARY BUTTON TOKENS

Primary button default  
#076498

Primary button hover  
#0781C2

Primary button active  
#14A2E3

Primary button disabled background  
#0A2F47 at 20% opacity

Primary button disabled text  
#0F496B

These tokens must apply everywhere:

• dashboard actions  
• playbook buttons  
• modals  
• table actions  
• workflow actions

---

SECTION 3 — CARD SYSTEM

All cards must reuse a shared component.

Card structure:

Card container  
Header area  
Content area  
Footer area (optional)

Card rules:

Default background  
#050B11

Hover background  
#071019

Border  
1px subtle dark border

Radius  
consistent across entire application

Do not generate new card styles.

---

SECTION 4 — TABLE SYSTEM

All tables must use one table component.

Structure:

Header row  
Data rows  
Optional action column

Header background  
#050B11

Row background  
#071019

Row hover  
#0C161F

Do not generate alternative table styles.

Apply to:

• Case Management  
• Asset Register  
• Vulnerabilities  
• Misconfigurations  
• Employees  
• Compliance records

---

SECTION 5 — KPI CARD COMPONENT

Create one reusable component:

KPI Gauge Card

Used in:

• Case Management dashboard  
• Watch Center metrics  
• Risk dashboards  
• Compliance metrics

The KPI card must include:

Title  
Description  
Source row  
Owner badge  
SLA progress bar  
Semi-circular gauge  
Legend  
Time range selector

No alternative KPI card designs allowed.

---

SECTION 6 — CHART CARDS

Trend charts must reuse a shared component.

Chart card structure:

Header  
Chart container  
Legend  
Range selector

Apply to:

• MTTD Trend  
• MTTR Trend  
• Attack Surface metrics  
• Risk trends

Do not generate new chart layouts.

---

SECTION 7 — MODAL SYSTEM

All modals must reuse one modal component.

Structure:

Modal container  
Title  
Body content  
Action buttons

Examples:

• Change Status modal  
• Download Report modal  
• Workflow confirmations  
• Case escalations

---

SECTION 8 — SIDEBAR SYSTEM

The sidebar must be a single shared component used across all pages.

Rules:

Do not generate multiple sidebars.

States:

Default  
Hover  
Active  
Active hover

Each page must highlight the correct navigation item.

Sidebar must remain above page content layers.

---

SECTION 9 — COMPONENT REUSE RULE

Before creating any UI element:

Check if a component already exists.

If a component exists:

Reuse it.

Do not create duplicate components.

Components that must be reused globally:

Sidebar  
Card  
Table  
Modal  
KPI Gauge Card  
Chart Card  
Primary Button  
Dropdown  
Input fields

---

SECTION 10 — UI CONSISTENCY RULE

Across the entire product:

Spacing  
Typography  
Color tokens  
Component structure  
Interactions

must remain consistent.

If a screen deviates from the design system:

Refactor it to reuse the shared component instead of creating a new UI style.

---

SECTION 11 — DO NOT CHANGE

Do not modify:

Page layouts  
Navigation structure  
Screen hierarchy  
Existing module features

Only enforce the shared design system across the entire application.