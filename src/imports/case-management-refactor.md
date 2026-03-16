Refine the Case Management module so it matches the attached design exactly.

Important:
The attached screenshots are the source of truth.

Do not redesign layouts.  
Do not rearrange components.  
Only correct the following:

• KPI gauge geometry  
• KPI gauge sizing  
• KPI value alignment  
• global color tokens  
• table row colors  
• card colors  
• dashboard day-range selector behavior  

---

SECTION 1 — GLOBAL DESIGN TOKENS (MANDATORY)

Define the following tokens and apply them globally across the entire application.

These tokens override all existing colors.

---

TABLE COLORS

Table header background  
#050B11

Table row default background  
#071019

Table row hover background  
#0C161F

Rules:

• Header rows must always use #050B11  
• Data rows must default to #071019  
• Hovering a row must change the background to #0C161F  

No gradients allowed.

---

CARD COLORS

Card default background  
#050B11

Card hover background  
#071019

Rules:

• All cards must use these tokens  
• KPI cards  
• chart cards  
• playbook cards  
• case detail cards  

Cards must never default to #071019.

---

PRIMARY BUTTON COLORS

Default  
#076498

Hover  
#0781C2

Active  
#14A2E3

Disabled background  
#0A2F47 at 20% opacity

Disabled text  
#0F496B

Apply these tokens to all primary buttons in the application.

---

SECTION 2 — KPI GAUGE GEOMETRY

The KPI gauges must match the reference design.

Gauge type  
Semi-circular meter only.

Not allowed:

• donut charts  
• radial charts  
• circular progress rings  
• pie charts

---

GAUGE SHAPE

Angle  
180° semicircle

Start  
far left

End  
far right

The arc must never wrap underneath the center line.

---

GAUGE SIZE

The gauge must be wider and flatter.

Rules:

• Width must span most of the KPI card  
• Height must follow semicircle proportion  
• Gauge must be centered horizontally  
• Gauge must sit visually in the middle of the card

The current implementation is too small and too circular.

---

ARC STYLE

Background track  
Subtle dark blue-gray

Value arc  
Filled from left to right

Arc thickness  
Medium-thick stroke matching the reference design.

---

NEEDLE / MARKER

Add the thin indicator marker visible in the reference design.

Rules:

• small angled marker line  
• placed at the metric value  
• same color family as the arc  
• subtle and minimal

---

SECTION 3 — KPI VALUE ALIGNMENT

Current values are misaligned.

Correct structure:

Small label  
Current MTTO

Large number  
4.3

Unit aligned on the same baseline  
mins

Rules:

• number is the visual focus  
• unit sits to the right of the number  
• everything centered within the gauge

Apply this format to:

mins  
hrs  
days  
%

---

SECTION 4 — LEGEND

Legend must sit below the gauge.

Centered horizontally.

Order:

Optimal  
Caution  
Critical

Each item uses a small circular color indicator.

Spacing must be even.

---

SECTION 5 — KPI CARD STRUCTURE

Maintain this order:

Title  
Description  
Source row  
Owner badge  
SLA progress bar  
Gauge  
Legend  
Divider  
Time range dropdown

Do not change this structure.

---

SECTION 6 — DASHBOARD DAY-RANGE SELECTOR (FUNCTIONAL)

The day-range selector on the Case Management Dashboard must be functional.

Examples:

30 Days  
7 Days  
14 Days  
90 Days

Behavior:

When the user changes the day range:

• KPI values update  
• KPI gauge values update  
• MTTD Trend chart updates  
• MTTR Trend chart updates

The charts must reload using the selected time range.

The dropdown must control the data scope for the dashboard.

Do not leave it as a static UI element.

---

SECTION 7 — COMPONENT REUSE

Create a shared component:

KPI Gauge Card

This component must be reused for:

• Mean Time to Observe  
• Mean Time to Triage  
• Mean Time to Detect  
• Mean Time to Respond  
• Mean Time to Conclude  
• False Positive Rate

All six KPI cards must use the same component.

---

SECTION 8 — DO NOT CHANGE

Do not modify:

• dashboard layout  
• chart card layout  
• cases table structure  
• case detail layout  
• tab layout  
• typography scale

Only correct:

• gauge geometry  
• gauge sizing  
• value alignment  
• color tokens  
• table row colors  
• card colors  
• dashboard time-range behavior