Implement the RIGHT side Agent Detail Panel exactly as shown in the provided design reference.

Do NOT redesign.
Do NOT restyle.
Do NOT modify typography or spacing from the reference.
This is a structural and behavioral implementation only.

⸻

	1.	PANEL POSITIONING & LAYOUT RULES

⸻

• The right panel must be fixed-position.
• It overlays the main canvas (does NOT push layout).
• It must align vertically with the far-left column.
• Top edge aligns exactly with the Watch Center header bottom.
• Bottom edge aligns exactly with the viewport bottom.
• Height must match the left column height exactly.

Width:
• 420px fixed width.
• No responsive shrinking.

Add:
• 1px left border stroke.
• Same background tone as left column.
• No backdrop blur.
• No background dimming.

Z-index:
• Must sit above orb canvas layer.
• Must NOT interfere with rotating arcs animation.

⸻

	2.	OPEN / CLOSE BEHAVIOR

⸻

Trigger:
• Clicking any agent node (Alpha, Bravo, Charlie, Delta, Echo).

Behavior:
• If panel closed → open.
• If another agent clicked → switch content without closing animation.
• If same agent clicked → close.

Animation:
• Slide in from right.
• 250ms ease-out.
• No bounce.
• No scaling.

Close triggers:
• Clicking X.
• Pressing ESC.
• Clicking the same active agent node again.

⸻

	3.	STATE MANAGEMENT

⸻

Use a single state:

selectedAgent: string | null

Panel renders only if selectedAgent !== null.

Do NOT re-render orb container.
Do NOT modify orb transforms.
Only toggle highlight class on selected agent node.

⸻

	4.	INTERNAL PANEL STRUCTURE

⸻

Panel must contain a single vertical scroll container.

Scrolling rules:
• Only panel content scrolls.
• Header remains fixed.
• No nested scroll areas.
• Smooth scrolling enabled.

Structure (top to bottom):

HEADER (fixed, non-scrolling)

• Agent Name
• Green status dot
• Role subtitle
• Queue summary (2 Active · 1 Pending)
• Close button (X)

Add subtle divider below header.

CONTENT (scrollable)

SECTION 1 — ACTIVE WORK
• Primary card (always visible)
• Shows:
- Title
- Risk
- Confidence
- Current action summary
• “View details” is collapsed by default.
• Expanding reveals objective + trigger context.
• Only this card is expandable in this section.

SECTION 2 — IN QUEUE
• Collapsed by default.
• Shows only first 2 items preview.
• Clicking expands full list.

SECTION 3 — STEP TIMELINE
• Always visible.
• Shows 4–5 most recent steps.
• Vertical timeline.
• No extra padding.
• Compact spacing.
• No scroll inside this section.

SECTION 4 — RISK PROJECTION
• Always visible.
• Single-line layout:
+22 → -18     Residual +4
• Minimal vertical padding.

SECTION 5 — AGENT COMMUNICATION
• Collapsed by default.
• Chevron toggle.
• Compact list.
• No oversized spacing.

SECTION 6 — AUTOMATION BOUNDARIES
• Collapsed by default.
• When expanded:
- Allowed column
- Restricted column
• Compact two-column layout.
• Policy references at bottom.

⸻

	5.	DEFAULT COLLAPSE STATES

⸻

On open:

Expanded:
• Active Work (summary only)
• Step Timeline
• Risk Projection

Collapsed:
• In Queue
• Agent Communication
• Automation Boundaries

No section should auto-expand except Active Work summary.

⸻

	6.	VISUAL ALIGNMENT RULES

⸻

• Panel must visually mirror the left Decisions column.
• Same internal horizontal padding.
• Same section spacing rhythm.
• Same header height.
• Same border radius style.

Ensure top padding matches left column exactly.

⸻

	7.	ORB INTERACTION SAFETY

⸻

When panel is open:

• Selected agent receives subtle glow ring.
• Do NOT resize agent node.
• Do NOT affect rotation transforms.
• Do NOT clip rotating arcs.
• Do NOT change canvas container width.
• Do NOT reflow center layout.

Only apply a CSS class for highlight.

⸻

	8.	PERFORMANCE RULES

⸻

• Avoid re-mounting orb component.
• Do not use layout-affecting transforms.
• Keep animation GPU-friendly (translateX only).
• Do not use scale or blur.

⸻

	9.	RESPONSIVE RULE

⸻

If viewport width < 1100px:
• Panel becomes full-width overlay.
• Orb becomes dimmed behind.
• Panel still scrollable.

Otherwise:
• Desktop behavior as described above.

⸻

Final result must:

• Feel symmetrical with left column.
• Preserve orb animations.
• Keep content clean and structured.
• Avoid clutter.
• Maintain performance stability.