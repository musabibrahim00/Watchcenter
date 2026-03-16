Refine the KPI cards in Case Management so the gauge meter matches the attached design exactly.

Important:
Use the attached screenshots as the source of truth.

Do not redesign the dashboard layout.
Do not change the KPI card structure.
Only correct the gauge, spacing, alignment, and colors.

---

1. GAUGE TYPE

The current gauge is still incorrect.

It must be a true semi-circular meter that visually matches the reference design.

Do not use:
- donut chart
- radial progress
- circular ring
- pie chart

Use a custom SVG half-gauge only.

---

2. GAUGE SHAPE AND SIZE

The gauge must be larger and wider, matching the reference.

Rules:

- Fixed 180° semicircle
- Centered horizontally inside the card
- Width must span most of the card content area
- Height must match the reference proportion
- Arc thickness must be medium and visually substantial
- The value arc must begin from the far left and sweep toward the right
- The value arc must never wrap underneath

The current gauge appears too small, too high, and too circular.
Make it wider and flatter like the reference.

---

3. GAUGE TRACK AND ARC COLORS

Use these exact visual rules:

Background track:
- subtle dark slate / blue-gray
- much softer than the active arc

Value arc colors by state:
- Optimal = green
- Caution = orange
- Critical = red

The current orange and green tones do not match the reference closely enough.
Use calmer enterprise-security dashboard tones, closer to the attached design.

---

4. NEEDLE / THRESHOLD MARK

The reference design includes a thin marker line intersecting the arc.

Implement a thin angled indicator line on the active arc, matching the reference.

Rules:
- short line
- same color family as the active arc
- positioned at the current metric point
- visually subtle, not heavy

Do not omit this detail.

---

5. CENTER TEXT ALIGNMENT

The current numbers are not aligned correctly.

Center content must be vertically and horizontally aligned inside the gauge.

Structure:

Small label:
Current MTTO

Large value:
4.3

Unit:
mins

Rules:
- numeric value is the visual focus
- unit sits to the right of the number on the same baseline
- label sits above the value
- everything is perfectly centered within the gauge

Do not stack the value and unit awkwardly.
Do not shift text upward into the arc.

Apply the same formatting to:
- mins
- hrs
- days
- %

---

6. LEGEND

Legend must sit directly below the gauge, centered.

Order:
- Optimal
- Caution
- Critical

Rules:
- small circular color dots
- equal spacing
- subtle muted text
- centered below the gauge

Do not place the legend too low or too close to the dropdown.

---

7. KPI CARD INTERNAL LAYOUT

Each KPI card must follow this exact vertical order:

- Title row
- Description
- Source label row
- Owner pill on the right
- SLA progress bar
- Gauge
- Legend
- Divider line
- Time range dropdown

Keep the gauge in the middle visual zone of the card.
The current version compresses the gauge too much.

---

8. SPACING AND PROPORTIONS

Adjust internal spacing to match the reference:

- more breathing room above the gauge
- more width for the meter
- consistent gap between gauge and legend
- consistent gap between legend and dropdown
- do not let the dropdown crowd the meter

---

9. COLOR CORRECTIONS ACROSS KPI CARDS

Apply these exact UI colors:

Card default background:
#050B11

Card hover background:
#071019

Primary button default:
#076498

Primary button hover:
#0781C2

Primary button active:
#14A2E3

Primary button disabled:
background #0A2F47 at 20% opacity
text #0F496B

Also apply:

Table row default background:
#071019

Table row hover background:
#0C161F

Table header background:
#050B11

---

10. COMPONENT REUSE

All six KPI cards must reuse one shared component:

KPI Gauge Card

Any gauge correction must apply consistently to:
- Mean Time to Observe
- Mean Time to Triage
- Mean Time to Detect
- Mean Time to Respond
- Mean Time to Conclude
- False Positive Rate

---

11. DO NOT CHANGE

Do not change:
- dashboard grid
- chart cards below
- tab layout
- page layout
- typography scale
- dropdown positions

Only correct:
- gauge geometry
- gauge size
- gauge alignment
- center text alignment
- arc colors
- KPI card visual polish
- global color token usage