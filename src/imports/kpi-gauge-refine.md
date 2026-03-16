Refine the KPI Semi-Circular Gauge component to match the exact thickness and visual weight shown in the reference design.

Important:
Do not redesign the card.
Do not modify layout.
Only correct the gauge geometry and stroke rendering.

The attached reference design is the visual source of truth.

---

SECTION 1 — FORCE ABSOLUTE GAUGE GEOMETRY

The gauge must be rendered with a fixed SVG viewbox.

Use:

viewBox: 0 0 260 140

The gauge must occupy the upper half of the SVG.

Do not allow automatic scaling of the stroke width.

---

SECTION 2 — ARC THICKNESS (CRITICAL)

Increase the arc thickness to match the reference design.

Required stroke values:

Background arc stroke-width: 26px

Active arc stroke-width: 26px

Marker line stroke-width: 4px

The arc must visually appear bold and heavy.

The arc should occupy a large portion of the gauge height.

Do not render thin arcs.

---

SECTION 3 — ARC RADIUS

Use the following geometry to ensure thickness looks correct.

Arc center X: 130  
Arc center Y: 120  

Arc radius: 90

This radius ensures the thick arc renders correctly inside the gauge container.

---

SECTION 4 — ARC STYLE

Arc caps must be rounded.

stroke-linecap: round

This is required so the arc ends look smooth like the reference design.

---

SECTION 5 — BACKGROUND ARC COLOR

Background arc color must be a muted dark blue-gray.

Use a neutral tone that matches the card theme.

The background arc must span the full 180°.

---

SECTION 6 — ACTIVE ARC

The active arc overlays the background arc.

Rules:

• same stroke width  
• same radius  
• same center point  
• value controlled using stroke-dasharray

The arc must fill from left to right.

---

SECTION 7 — MARKER POSITION

Place a short marker line at the current value position.

Marker rules:

length: 18px

stroke width: 4px

The marker must sit directly on top of the arc and follow the value angle.

---

SECTION 8 — CENTER TEXT

Center text must remain perfectly aligned.

Structure:

Label  
CURRENT [metric]

Value  
4.3

Unit  
mins / hrs / days / %

The number must remain the visual focus.

---

SECTION 9 — GAUGE SCALE CONSISTENCY

Every KPI card must reuse this exact gauge component.

Apply the same gauge to:

• Mean Time to Observe  
• Mean Time to Triage  
• Mean Time to Detect  
• Mean Time to Respond  
• Mean Time to Conclude  
• False Positive Rate

No variations allowed.

---

SECTION 10 — DO NOT CHANGE

Do not modify:

Card layout  
Progress bars  
Legend placement  
Dropdown position  
Dashboard grid

Only increase the arc thickness and enforce the correct SVG geometry.