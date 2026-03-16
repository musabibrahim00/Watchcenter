GOAL
Fix the RIGHT “Agent Detail” column sizing + positioning so it mirrors the LEFT “Decisions Taken Today” column exactly (same height, padding rhythm, border treatment, and top alignment). Do NOT redesign the panel content, just make it sit correctly and stop interfering with the center orb/agent ring animations.

REFERENCE
Use the existing LEFT panel implementation as the single source of truth for sizing/spacing:
Component: DecisionsTakenTodayExpanded.tsx
Key constraints from that file:
- Outer container: rounded-[12px], p-[17px], gradient border overlay (same style), gap-[32px]
- Fixed height: h-[600px]
- Internal scrolling region: flex-1 min-h-0 overflow-y-auto
- Title row is shrink-0 (fixed), body scrolls

WHAT TO CHANGE
1) CREATE A SHARED PANEL SHELL (IMPORTANT)
Create a shared layout wrapper (or reuse the exact same class recipe) for BOTH left and right columns.
Use identical outer container styles:
- rounded-[12px]
- p-[17px]
- same gradient border overlay approach used in DecisionsTakenTodayExpanded
- h-[600px] (fixed)
- width should be identical for both columns (see “Width + placement” below)

2) WIDTH + PLACEMENT (MIRROR LAYOUT)
Make left and right panels true mirrors:
- Both panels must have the SAME width (define a constant like PANEL_W and use it for both)
- Both panels must have the SAME height = 600
- Both panels must be aligned to the SAME top baseline inside the Watch Center canvas

Positioning rules:
- Panels must NOT reflow or resize the center orb/agent ring area.
- Panels must be OVERLAID/ABSOLUTE within the Watch Center stage (so the center visualization stays perfectly centered and unaffected).
- Anchor the left panel to the left side of the main content area (to the right of the left nav rail) with a consistent gutter (ex: 24px).
- Anchor the right panel to the right side of the main content area with the same gutter (ex: 24px).
- Both panels should sit at the same Y offset from the top (align with each other). Use a shared “PANEL_TOP” based on the current Watch Center header baseline.

Implementation hint:
- In WatchDst layout, wrap the central visualization (orb + ring + bottom cards) in a relative container.
- Render left and right panels as absolutely positioned children:
  - left: absolute left-[NAV_RAIL_WIDTH + 24px] top-[PANEL_TOP]
  - right: absolute right-[24px] top-[PANEL_TOP]
- Ensure both have z-index above the visualization but do NOT affect its width.

3) RIGHT PANEL INTERNAL SCROLL (MATCH LEFT)
Inside the RIGHT panel:
- Keep the header area (agent title row + close button) as shrink-0 (fixed).
- The rest of the content must scroll within the remaining height:
  - Use: flex flex-col h-full
  - Header: shrink-0
  - Body: flex-1 min-h-0 overflow-y-auto
- No page-level scrolling caused by the right panel.

4) DEFAULT COLLAPSE BEHAVIOR (CLEAN + NON-CLUTTERED)
Keep the current content and structure, but set sensible defaults:
- Expanded by default: Active Work, In Queue, Step Timeline, Risk Projection
- Collapsed by default: Agent Communication, Automation Boundaries
Collapsed sections should render as a single row with:
- Section title on left
- Chevron on right (rotates on expand)
On expand, reveal content with a subtle 200–250ms ease-out height/opacity transition.

5) OPEN/CLOSE BEHAVIOR (CLICK AGENT)
Panel opens when user clicks an agent node in the ring:
- Clicking any agent sets it as selected and opens the right panel.
- Clicking the same agent again toggles close.
- Clicking a different agent swaps content (panel stays open, content updates).
- Close button (X) closes.
- ESC closes.

IMPORTANT: Do NOT change orb/ring layout when panel opens.
No “push content” layout behavior. Keep center perfectly stable.

6) FIX “MESSING UP ROTATING CIRCLES”
The right panel must not alter the sizing of the visualization container.
To ensure this:
- The visualization container keeps full width and fixed center (no flex shrink due to panel).
- The panel is position:absolute and does not participate in flex row sizing.
- Do not wrap the visualization + panel in a flex row that causes the visualization to shrink.

7) VISUAL RHYTHM (MATCH LEFT COLUMN)
Match the left column’s vertical rhythm:
- Same outer padding (17px)
- Same section spacing (use consistent gap values, avoid overly large gaps)
- Same border radius and border glow
- Same title typography scale as left (or close to it)
- Keep the panel visually “quiet” and readable like the left

DELIVERABLE
Update the right panel component and its placement in WatchDst so:
- It is the same size as the left column (height 600, same width, same padding)
- It is aligned top-to-top with the left panel
- It is absolutely positioned (overlay) and does not disturb the orb/ring
- It scrolls internally (body only)
- It uses collapsed-by-default sections for Agent Communication + Automation Boundaries

DO NOT
- Do not redesign the center orb/ring
- Do not change the existing right panel content semantics
- Do not change the left panel behavior
- Do not introduce new UI patterns beyond collapse rows and internal scroll