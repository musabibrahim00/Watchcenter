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
npm run dev        # development server at http://localhost:5173
npm run build      # production build to dist/
npm run typecheck  # TypeScript type-check (no emit)
npm run lint       # ESLint across src/
```

Node 22 required.

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
      ai-box/           # AIBox feature — canonical home for all AI assistant logic
        AiBoxContext.tsx    # open/close context + page context API
        workflowAiEngine.ts # workflow plan/canvas dispatch
        multiAgentEngine.ts # analyst routing + multi-agent intent
        deepLink*.ts        # URL-based context resolution
        components/         # Presentational chat components (ActionCard, MessageBubble, …)
        data/               # Static action catalog + matchAction
        types/              # Pure TypeScript type definitions (no React)
        utils/              # Pure helper functions (classifiers, result derivation)
        index.ts            # Public barrel export for the feature
      asset-register/   # Asset Register feature (components, data, hooks, utils)
      charts/           # Recharts wrappers
      compliance/       # ActionableEvidenceRow + evidence store
      investigation/    # InvestigationTimeline, TaskInvestigationBridge + barrel export
      persona/          # PersonaContext + barrel export
      watch-center/     # StatusContext, InvestigationContext, AgentNarratives,
                        # ActivityFeed, KpiWidget
    pages/              # Route-level page components
      AgentDetailPage.tsx
      AttackPathPage.tsx
      AttackPathDetailPage.tsx
      AssetDetailPage.tsx
      CompliancePage.tsx
      IntegrationsPage.tsx
      attack-path/      # Attack path graph data, layout utils, InsightsPanel
      asset-register/   # Asset Register page + data
      case-management/  # Dashboard, list, detail, modals, case data
      workflows/        # Workflows index, builder, engine, tabs, modals
                        # StepFormComponents.tsx, WorkflowUIHelpers.tsx (extracted)
    shared/
      components/       # Shared design system components
        layout/           # PageContainer, ChartContainer, DashboardGrid
      contexts/         # React contexts (TimeTravelContext)
      data/             # Static mock data (agent-tasks, interventions, hub, workflows…)
      design-system/    # Design tokens and system helpers
      graph/            # Entity graph store, nodes, edges, adapters, perf utils
      services/         # Service layer (SessionAwareness, ChangeDetection, ApprovalQueue, …)
      skills/           # Skill registry — single source of truth for all agent skills
        registry.ts       # All skill definitions + getSkillsForContext helpers
        persona.ts        # Persona-aware scoring and getPersonaDefaultSkills
        index.ts          # Public barrel export
      types/            # Shared TypeScript types (agent-types.ts, …)
      utils/            # Utility functions
      entity-graph.ts   # Entity relationship graph

  imports/            # Figma-scaffold origin. Large components still live here:
    WatchDst.tsx        # Watch Center main layout
    AiBox.tsx           # AIBox embedded in Watch Center (~2200 lines, defer decomposition)
    AiBoxModules.tsx    # AIBox response module renderers (~1300 lines)
    AiBoxRenderer.tsx   # AIBox response rendering engine (~1600 lines)
    AiBoxLiveData.ts    # Live data integration bridge (~1700 lines)
    AiBoxShared.tsx     # Thin shim — re-exports everything from features/ai-box/
    Tasks.tsx           # Risk Tracker task cards
    Working.tsx         # Globe + agent visualization (~4400 lines)
    Container.tsx       # Scroll container wrapper
    LoaderFill.tsx      # Loading overlay
    MoveLeft.tsx        # Navigation helper
    MoveRight.tsx       # Navigation helper
    Secure.tsx          # Clearance/security gate component
    assets.ts           # Asset data shim
    # Shims only — canonical source is in src/app/features/:
    ActivityFeed.tsx         → features/watch-center/ActivityFeed
    KpiWidget.tsx            → features/watch-center/KpiWidget
    InvestigationTimeline.tsx → features/investigation/InvestigationTimeline
    InvestigationContext.tsx  → features/watch-center/InvestigationContext
    TaskInvestigationBridge.tsx → features/investigation/TaskInvestigationBridge
    StatusContext.tsx         → features/watch-center/StatusContext
    svg-*.ts/tsx             # SVG path data (Figma export, ~14 files)

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
