Enhance the existing Workflows page with Smart Workflow Templates and an improved node creation experience.

Important:
Reuse the same design system already used in the product.

Do NOT introduce new colors, card styles, or UI tokens.

Reuse the existing components already used in:
Watch Center
Attack Path
Case Management
Asset Register

Use the same:
Card styles
Buttons
Inputs
Sidebar
Borders
Typography
Spacing

---

GOAL

Improve the workflow builder usability by introducing:

1. Smart Workflow Templates
2. Drag-to-Add Node Library
3. Faster node creation

The builder must remain visually consistent with the rest of the platform.

---

WORKFLOW TEMPLATE SYSTEM

Add a Templates panel that appears when creating a new workflow.

Show a modal titled:

Create Workflow

Two options:

Start from Template
Start from Blank Workflow

Templates should be displayed as cards.

Each template card includes:

Template icon
Template title
Short description

Example templates:

Create Case on Critical Alert
Automatically create a case when a high severity alert is detected.

Alert Enrichment Workflow
Enrich alerts with asset intelligence and threat intelligence.

Vulnerability Notification
Notify security team when critical vulnerabilities are discovered.

Risk Escalation Workflow
Escalate high risk assets to the security team.

Asset Discovery Automation
Automatically enrich newly discovered assets.

Use the same card styling used across the application.

Clicking a template generates the starter workflow on the canvas.

---

NODE LIBRARY (DRAG SYSTEM)

Add a collapsible Node Library on the left side of the workflow canvas.

The library must reuse existing sidebar and card styling.

Sections:

Workflow Nodes
Integrations
Saved Actions

---

WORKFLOW NODES

Trigger
Input
Action
Logic
Approval
Output

Each item should include:

Icon
Name

Nodes must be draggable onto the canvas.

---

INTEGRATIONS

Show commonly used integrations:

Slack
Email
API
Database
AWS
Webhook

Each integration should appear as a draggable node card.

---

SAVED ACTIONS

Display reusable actions saved in the workspace.

Example:

Send Slack Message
Create Case
Update Vulnerability
Notify Risk Team

---

DRAG AND DROP BEHAVIOR

Users can drag nodes from the Node Library onto the canvas.

When dragging over the workflow connectors:

Show visual drop indicators.

Dropping a node inserts it into the workflow.

---

NODE INSERTION UX

The “+” connectors between nodes should still work.

Clicking “+” opens the module selector panel on the right.

Dragging nodes bypasses the selector and inserts immediately.

---

NODE SUMMARY DISPLAY

Each node on the canvas should display a short summary.

Example:

Send Slack Message
#alerts-channel

Create Case
Severity: High

Update Risk
Owner: SOC

This allows workflows to be readable at a glance.

---

WORKFLOW MINI MAP

Add an optional mini-map in the bottom right corner of the canvas.

The mini-map helps navigate large workflows.

Reuse existing card styling for the mini-map container.

---

WORKFLOW ZOOM CONTROLS

Add zoom controls on the canvas.

Buttons:

Zoom in
Zoom out
Fit workflow

Place controls in the bottom-right corner of the canvas.

---

WORKFLOW AUTO-LAYOUT

Ensure nodes align vertically with consistent spacing.

Connector lines should remain clean and readable.

Nodes should never overlap.

---

VISUAL CONSISTENCY

All UI elements must reuse existing components.

Use the same:

Background colors
Card backgrounds
Borders
Buttons
Hover states
Input styles

No new UI style system should be created.

---

FINAL RESULT

The Workflows page should now support:

Visual workflow creation
Drag-and-drop nodes
Reusable actions
Prebuilt templates
Operational automation workflows

The builder should feel simple and powerful for non-technical users while still supporting advanced automation through the underlying workflow engine.