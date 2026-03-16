Refactor the application navigation and routing to remove unused automation pages and keep the product structure simple.

Important:
Do not modify Watch Center UI.
Do not change the platform design system.
Do not redesign Workflows cards, tabs, or builder styling.
This step is only for cleanup and simplification.

---

REMOVE THESE PAGES COMPLETELY

Delete these pages, routes, and navigation entries from the product:

- exposure-monitoring
- environment-variables
- approvals
- automation-analytics
- audit-logs
- automation-command-center
- automation-insights
- security-graph
- agent-automation-rules

These must be removed from:

- sidebar navigation
- internal routes
- any hidden page registry
- any module switchers
- any internal links
- any empty placeholders

If any button or action currently links to one of these pages, remove that link or redirect it into the Workflows module only if necessary.

---

KEEP WORKFLOWS SIMPLE

The Workflows module must remain the only automation surface.

Inside Workflows keep only:

- Workspace
- Library

Do not reintroduce extra top-level tabs.

Workspace can still contain internal sections like:
- Workflows
- Runs
- Debug
- Versions
- Settings

But these must remain inside Workspace only.

Library can still contain:
- Templates
- Hub items
- Actions
- Flows
- Resources
- Integrations

But all of these must remain inside Library only.

---

REMOVE UNUSED AUTOMATION NAVIGATION

Anywhere else in the app, do not expose separate navigation for:
- variables
- approvals
- analytics
- command center
- security graph
- audit logs
- agent rules

Those concepts should not appear as standalone pages anymore.

---

VALIDATION RULES

After cleanup:

1. Sidebar must not show any of the removed pages.
2. Routes for removed pages must no longer open.
3. Workflows remains the only automation module.
4. Watch Center remains unchanged.
5. Existing Workflows UI stays visually the same.

---

FINAL RESULT

The application should now have a simpler information architecture with no extra automation pages.

Workflows is the single automation module, and the removed pages no longer exist anywhere in the product.