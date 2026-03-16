Refine the KPI Semi-Circular Gauge component so that the gauge arc is perfectly vertically aligned inside the KPI card.

Important:
Do not redesign the KPI card.
Do not change card spacing.
Only correct the gauge vertical positioning and internal spacing.

The attached design reference is the source of truth.

---

SECTION 1 — GAUGE CONTAINER

Create a fixed gauge container inside the KPI card.

Gauge container height  
160px

Gauge container width  
100%

The gauge must always render inside this container.

---

SECTION 2 — GAUGE CENTER POSITION

The SVG arc center must be positioned slightly lower in the container so the arc visually centers.

Use the following geometry:

Center X: 130  
Center Y: 115

This ensures the semi-circle sits balanced vertically.

Do not place the arc too high in the card.

---

SECTION 3 — INTERNAL SPACING

Spacing inside the KPI card must follow this structure:

SLA progress bar  
↓ 24px spacing  
Gauge container  
↓ 16px spacing  
Legend  
↓ 20px spacing  
Range selector

Maintain consistent spacing across all KPI cards.

---

SECTION 4 — VALUE TEXT POSITION

The center text group must be vertically centered inside the semi-circle.

Adjust the text group baseline so that:

The numeric value sits slightly below the arc midpoint.

This matches the visual alignment in the reference design.

---

SECTION 5 — LEGEND POSITION

Legend must remain fixed below the gauge.

Structure:

• Optimal  
• Caution  
• Critical

Legend must always be horizontally centered.

---

SECTION 6 — DROPDOWN POSITION

The range selector must stay anchored at the bottom of the KPI card.

Rules:

Width  
100% of card content width

Height  
48px

The dropdown must not overlap the gauge.

---

SECTION 7 — APPLY TO ALL KPI CARDS

Apply the corrected alignment to every KPI card:

• Mean Time to Observe  
• Mean Time to Triage  
• Mean Time to Detect  
• Mean Time to Respond  
• Mean Time to Conclude  
• False Positive Rate

All gauges must share identical vertical alignment.

---

SECTION 8 — DO NOT CHANGE

Do not change:

Gauge thickness  
Gauge colors  
Progress bars  
Legend content  
Card layout  
Dashboard grid

Only correct the gauge vertical alignment and internal spacing.