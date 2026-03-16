Refine the Workflows module so the Automation Command Center becomes more cohesive, and enforce a consistent AiBox design system across the product.

Important constraints:
- Do not create a new top-level page.
- Do not modify Watch Center UI.
- Do not change the global design system, colors, card styles, spacing, or typography.
- Keep Workflows limited to the existing Workspace and Library tabs.
- Reuse existing cards, tables, badges, charts, and filters.

Critical design rule:
For all screens except Watch Center, the AiBox look and feel must match the AiBox used in the Agent Detail page.

Watch Center remains the only exception.

---

SECTION 1 — AIBOX DESIGN STANDARDIZATION

Standardize AiBox across the application.

Rule:
- Agent Detail page AiBox becomes the default AiBox design pattern
- Use this same AiBox style for:
  - Workflows
  - Cases
  - Risks
  - Assets
  - future modules using AI interaction
- Do not change Watch Center AiBox

Agent Detail AiBox characteristics to preserve:
- right-side docked panel feel
- same spacing and card treatment
- same conversational input structure
- same message layout hierarchy
- same action alignment and surface styling
- same interaction rhythm

For Workflows specifically:
- refactor the current Workflow Agent panel so it visually matches the Agent Detail AiBox
- preserve workflow-specific content, but align the look and feel

Do not create a new AiBox style for Workflows.

---

SECTION 2 — IMPROVE WORKFLOW AGENT PANEL USING AGENT DETAIL AIBOX STYLE

Refine the Workflow Agent panel on the right side.

Keep the workflow-specific behavior, but update the presentation so it matches the Agent Detail AiBox pattern.

The Workflow Agent panel should include:
- workflow agent title
- short capability subtitle
- quick actions:
  - Explain
  - Simulate
  - Optimize
  - Troubleshoot
- conversational AI input area
- prompt suggestions
- workflow-aware response cards

The panel should feel like a true persistent AI copilot for workflow creation and editing.

---

SECTION 3 — MAKE AI RESPONSES MORE STRUCTURED

Inside the Workflow Agent AiBox, AI responses should become more structured and easier to scan.

When the AI responds, use compact response blocks such as:

- Understanding
- Plan
- Changes Applied
- Suggested Improvements
- Troubleshooting Result
- Simulation Summary

Example response structure:

Understanding
Detected request to create a critical alert workflow

Plan
- Trigger on Watch Center alert
- Filter severity = critical
- Create case
- Request approval
- Notify Slack

Changes Applied
- Added escalation delay
- Added retry logic for Slack

Suggested Improvements
- Add audit logging
- Add fallback notification channel

Use visual sections consistent with the Agent Detail AiBox language.

---

SECTION 4 — IMPROVE AUTOMATION COMMAND CENTER LAYOUT

Inside Workflows → Workspace, refine the Automation Command Center so it feels more like a compact operational overview.

Keep it above the workflow list.

Structure it in this order:

1. KPI cards
2. AI diagnostics summary
3. Optimization opportunities
4. Recent failed runs
5. Pending approvals
6. Live workflow activity

This order should prioritize:
- health
- issues
- actions
- live status

Do not redesign the underlying cards.
Only improve hierarchy and organization.

---

SECTION 5 — MAKE COMMAND CENTER MORE ACTIONABLE

Every major block in the Automation Command Center should support one-click actions.

Examples:

AI Diagnostics Summary
- Open Run
- Ask AI
- Apply Fix

Optimization Opportunities
- Apply
- Ignore
- Ask AI Why

Recent Failed Runs
- View Diagnostics
- Retry
- Ask AI

Pending Approvals
- Approve
- Reject
- Open Workflow

This should make the workspace feel operational, not just informational.

---

SECTION 6 — WORKFLOW AGENT SHOULD UNDERSTAND WORKSPACE CONTEXT

When a user opens the Workflow Agent from an existing workflow, the agent must understand the current workflow context automatically.

Examples:
- if user says "replace Slack with email", the agent should know which step to update
- if user says "optimize this workflow", the agent should evaluate the currently open workflow
- if user says "simulate failure", the agent should simulate the current workflow

No extra manual selection should be required.

---

SECTION 7 — IMPROVE WORKFLOW EXPLANATION UX

When the user clicks Explain, the Workflow Agent should produce a clean explanation card.

Structure:

What triggers this workflow  
What conditions are checked  
What actions happen  
What the final outcome is  
What could fail  

This should be concise and friendly for non-technical users.

---

SECTION 8 — IMPROVE WORKFLOW OPTIMIZATION UX

When the user clicks Optimize, the Workflow Agent should return a prioritized list of suggestions.

Structure:

High Impact Improvements
- Add retry logic to Slack notification
- Add escalation after delayed approval

Reliability Improvements
- Add fallback notification channel

Governance Improvements
- Add audit logging

Each suggestion should include:
- Apply
- Ask AI Why

---

SECTION 9 — IMPROVE WORKFLOW TROUBLESHOOTING UX

When the user clicks Troubleshoot, the Workflow Agent should analyze the current workflow or failed run and produce:

Problem
Likely Cause
Suggested Fix
Optional improvement

Example:

Problem
Jira ticket creation failed

Likely Cause
Authentication token expired

Suggested Fix
Reconnect Jira integration

Optional Improvement
Add retry logic with fallback email notification

This should be easy to scan and act on.

---

SECTION 10 — KEEP WORKSPACE AND LIBRARY SIMPLE

Do not add new tabs.

Keep only:
- Workspace
- Library

Do not create any new top-level screens.

Keep the library segmented and uncluttered.

---

SECTION 11 — FINAL RESULT

After this refinement:

- AiBox across the app matches the Agent Detail page pattern, except Watch Center
- Workflow Agent feels like a real copilot, not a separate custom panel
- Automation Command Center becomes more actionable
- AI workflow creation, editing, optimization, simulation, and troubleshooting become clearer and more usable
- Workflows stays inside the current simple navigation model