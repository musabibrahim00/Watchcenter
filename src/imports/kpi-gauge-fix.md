Fix the KPI Gauge meters in the Case Management Dashboard.

The current implementation is incorrect because the gauges render as donut/radial charts.  
They must be replaced with a true semicircular gauge meter that exactly matches the attached design.

Do not redesign the KPI cards.  
Only correct the gauge visualization.

---

SOURCE OF TRUTH

Use the attached gauge design screenshot as the visual reference.

The gauge must visually match that design.

---

STRICT GAUGE GEOMETRY

The gauge must always be a fixed 180° semicircle.

Start angle: -90°  
End angle: +90°

The arc must render left → right only.

Never render:

• full circles  
• donut charts  
• radial progress rings  
• pie charts  
• circular meters

If a chart library attempts to render those, reject the implementation.

---

GAUGE STRUCTURE

Each gauge must contain exactly two arcs.

Background Arc
• fixed 180° semicircle
• dark grey track color
• full width

Value Arc
• overlays the background arc
• fills proportionally from the left side
• length determined by the metric value

Example:

0% → arc starts at left only  
50% → arc reaches top center  
100% → arc reaches right end

The arc must never wrap below the semicircle.

---

ARC STYLE

Arc thickness: medium  
Arc style: smooth stroke

The arc thickness must visually match the screenshot.

Do not use thin radial strokes.

---

CENTER CONTENT

Inside the gauge show:

Small label  
Current MTTO

Large metric value  
Example:
4.3 mins

The text must remain centered inside the semicircle.

---

LEGEND

Below the gauge include the legend:

● Optimal  
● Caution  
● Critical

Legend colors must match arc colors.

Optimal → green  
Caution → orange  
Critical → red

---

KPI CARD STRUCTURE (DO NOT CHANGE)

Each KPI card must keep the existing layout:

Title  
Description text  
Source label  
Owner badge  
SLA progress bar  
Gauge visualization  
Legend  
Time range dropdown (30 Days)

Spacing and alignment must remain identical to the existing layout.

---

COMPONENT REUSE

Create one reusable component:

KPI Gauge

This component must be reused across all KPI cards:

• Mean Time to Observe  
• Mean Time to Triage  
• Mean Time to Detect  
• Mean Time to Respond  
• Mean Time to Conclude  
• False Positive Rate

Any change to the gauge must update all KPI cards.

---

IMPLEMENTATION REQUIREMENT

To completely eliminate chart engines misinterpreting the gauge, implement the meter as a custom SVG semicircle gauge instead of a chart library.

Structure:

SVG
 ├ Background Arc (180°)
 └ Value Arc (dynamic length)

The value arc should use stroke-dasharray / stroke-dashoffset to control fill percentage.

This guarantees the meter remains a semicircle and cannot become a donut chart.

---

PROTECTION RULE

If the system attempts to convert the gauge to:

• donut chart  
• radial progress  
• circular progress ring  
• pie chart  

reject that change and keep the semicircular SVG gauge.

---

DO NOT MODIFY

Do not change:

• KPI card layout  
• dashboard layout  
• chart sections below  
• spacing or typography  
• legend placement  
• dropdown placement

Only correct the gauge visualization so it matches the provided design exactly.