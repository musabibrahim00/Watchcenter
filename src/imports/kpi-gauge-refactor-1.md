Refactor the KPI Gauge Card component used across the dashboards to match the exact design of the attached reference.

Important:
Do not redesign the dashboard layout.
Do not convert the gauge into a donut chart or pie chart.

The gauge must be implemented as a fixed UI component, not a chart visualization.


SECTION 1 — GAUGE COMPONENT STRUCTURE

Create a reusable component called:

KPI Semi-Circular Gauge

This component must be reused in:

• Case Management Dashboard
• Watch Center metrics
• Risk metrics
• Compliance dashboards

Do not create multiple gauge styles.


SECTION 2 — GAUGE LAYOUT

The gauge must follow this exact layout:

Top section
KPI title
Description text
Source row
Owner badge

Below this:

SLA progress bar

Below the progress bar:

Centered semi-circular gauge

Below the gauge:

Legend row

Below the legend:

Time range selector dropdown

Do not change this layout.


SECTION 3 — GAUGE SHAPE

The gauge must be a semi-circular arc, not a full circle.

Angle range:
Start: 180°
End: 0°

Gauge arc thickness must remain constant.

The background arc must be a dark neutral color.

The active arc must reflect the metric value.

Do not generate donut charts.

Do not generate pie charts.

Do not use chart libraries.


SECTION 4 — GAUGE SIZE

The gauge must have fixed dimensions:

Width
260px

Height
130px

Arc thickness
12px

These dimensions must remain consistent across all KPI cards.


SECTION 5 — VALUE ALIGNMENT

The numeric value must be centered inside the gauge.

Layout:

Label
CURRENT [metric name]

Value
large number

Unit
mins / hrs / days / %

All text must be centered horizontally.

Do not place text outside the gauge.


SECTION 6 — GAUGE NEEDLE

A small marker line must indicate the current position.

The marker must:

• sit on top of the arc
• follow the value angle
• remain inside the arc bounds

Do not extend the marker beyond the arc.


SECTION 7 — COLOR LOGIC

Gauge colors must follow severity levels.

Optimal
Green

Caution
Orange

Critical
Red

Only the active portion of the arc should be colored.

The remainder of the arc must stay neutral.


SECTION 8 — LEGEND

Legend must appear under the gauge:

• Optimal
• Caution
• Critical

Each label must include a colored indicator dot.


SECTION 9 — VALUE CONSISTENCY

The gauge value must match the KPI number displayed in the center.

Example:

Current MTTO
4.3 mins

The arc position must correspond to the value relative to the SLA threshold.


SECTION 10 — COMPONENT REUSE

Once the KPI gauge component is created:

Replace all existing gauges across the application with this component.

Do not generate alternate gauge styles.


SECTION 11 — DO NOT CHANGE

Do not change:

Dashboard layout
Card spacing
Card titles
Metric descriptions
Chart sections

Only correct the KPI gauge component implementation.