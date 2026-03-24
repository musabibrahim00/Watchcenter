# Watch Center

AI-assisted security operations platform. Surfaces live risk signals, routes investigations through autonomous agents, and gates remediation actions through a human-in-the-loop approval flow.

---

## Product surfaces

| Surface | Description |
|---|---|
| **Watch Center** | Main dashboard — live agent activity, risk tracker, and the AI assistant (AIBox) |
| **Agent Detail** | Per-agent investigation view — findings, skill actions, evidence chain |
| **Attack Paths** | Simulated attack path graph — prioritized by blast radius and exploitability |
| **Workflows** | Action lifecycle management — recommended, authorized, executing, completed |
| **Asset Register** | Inventory of assets with exposure and risk context |
| **Compliance** | Control coverage and compliance posture |

---

## Core concepts

**AIBox** is the single assistant surface. It appears on every page and adapts its context to the current view — it does not open a second assistant or a separate chat window.

**Risk lifecycle** — detected → analyzed → prepared → awaiting authorization → executing → completed → monitoring. Risk Tracker cards on the Watch Center surface tasks at the `awaiting_authorization` stage.

**Agent-based investigation** — eight specialist agents (Asset Intelligence, Configuration Security, Application Security, Governance & Compliance, Risk Intelligence, Exposure, Identity Security, Vulnerability) each own a detection domain. The Watch Center globe visualizes their activity.

**Action / approval flow** — recommended actions require explicit authorization before execution. Deferred, modified, and failed states are tracked in the audit trail.

---

## Local setup

```bash
npm install
npm run dev     # development server at http://localhost:5173
npm run build   # production build to dist/
```

Node 18+ required.

---

## Repo structure

```
src/
  app/
    App.tsx           # React app root
    routes.tsx        # React Router configuration
    components/       # App-level layout components
      Layout.tsx        # Root shell (sidebar + header + content canvas)
      GlobalAIBox.tsx   # AIBox shown on all non-Watch-Center pages
      CommandPalette.tsx
      AgentActivityIndicator.tsx
      ui/               # Shared UI primitives (shadcn/radix components)
    features/           # Domain feature modules
      agent-detail/     # Agent detail barrel export
      ai-box/           # AIBox context, deep-link resolver, multi-agent engine
      charts/           # Recharts wrappers
      investigation/    # TimeTravelContext + barrel export
      persona/          # PersonaContext + barrel export
      watch-center/     # StatusContext, InvestigationContext, AgentNarratives
    pages/              # Route-level page components
      AgentDetailPage.tsx
      AttackPathPage.tsx
      AttackPathDetailPage.tsx
      AssetDetailPage.tsx
      CompliancePage.tsx
      IntegrationsPage.tsx
      asset-register/   # Asset Register page + data
      case-management/  # Dashboard, list, detail, modals, case data
      workflows/        # Workflows index, builder, engine, tabs, modals
    shared/
      components/       # Shared design system components
        layout/           # PageContainer, ChartContainer, DashboardGrid
      contexts/         # React contexts
      data/             # Static mock data (agent-tasks, interventions, hub, workflows…)
      design-system/    # Design tokens and system helpers
      graph/            # Entity graph store, nodes, edges, adapters, perf utils
      services/         # Service layer utilities
      skills/           # Skill registry — single source of truth for all agent skills
        registry.ts       # All skill definitions + getSkillsForContext helpers
        persona.ts        # Persona-aware scoring and getPersonaDefaultSkills
        index.ts          # Public barrel export
      types/            # Shared TypeScript types (agent-types.ts, …)
      utils/            # Utility functions
      entity-graph.ts   # Entity relationship graph

  imports/            # Figma-scaffold origin. Actively-used Watch Center components:
    WatchDst.tsx        # Watch Center main layout
    AiBox.tsx           # AIBox embedded in Watch Center
    AiBoxModules.tsx    # AIBox response module renderers
    AiBoxShared.tsx     # Shared AIBox message state (sessionStorage bridge)
    Tasks.tsx           # Risk Tracker task cards
    Working.tsx         # Globe + agent visualization
    ActivityFeed.tsx    # Live activity feed
    KpiWidget.tsx       # KPI / Insights widget
    InvestigationTimeline.tsx
    InvestigationContext.tsx
    TaskInvestigationBridge.tsx
    StatusContext.tsx
    AgentNarratives.ts
    agent-tasks-data.ts
    intervention-data-types.ts
    svg-*.ts/tsx         # SVG path data (Figma export, ~80 files)
                         # ~100 unused legacy Figma variant files also present

cli/                # secops CLI utility (secops.mjs)
guidelines/         # Product design and development guidelines
skills/             # Claude Code skill definitions
vercel.json         # SPA rewrite rule for Vercel deployment
dist/               # Production build output (git-ignored)
```

---

## Notes

- Originally scaffolded from a Figma Make export (`WatchDSTExpV1.3`). All product logic, agent systems, AIBox, and page routing have been built on top of that scaffold.
- `agency-agents/` — external reference directory, not part of the main build.
- Modals use `z-[100]` to clear the sidebar (`z-[50]`) — always keep this hierarchy when adding new overlay layers.
