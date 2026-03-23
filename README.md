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

**Agent-based investigation** — six specialist agents (Vulnerability Analyst, Exposure Analyst, Identity Security, Configuration Security, Application Security, Risk Intelligence) each own a detection domain. The Watch Center globe visualizes their activity.

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
    components/     # Shared app-level components (GlobalAIBox, layout wrappers)
    features/       # Feature modules (watch-center, attack-paths, …)
    pages/          # Route-level page components
    shared/
      types/        # Shared TypeScript types (agent-types.ts, …)
    routes.tsx      # React Router configuration
  imports/          # Core UI components and data modules
    WatchDst.tsx      # Watch Center main layout
    AiBox.tsx         # AIBox assistant component (Watch Center)
    AiBoxModules.tsx  # AIBox response module renderers
    Tasks.tsx         # Risk Tracker task cards
    Working.tsx       # Globe + agent visualization
    ActivityFeed.tsx  # Live activity feed
    ...

cli/                # secops CLI utility (secops.mjs)
Guidelines.md       # Product design and development guidelines
dist/               # Production build output (git-ignored)
```

---

## Notes

- Originally scaffolded from a Figma Make export (`WatchDSTExpV1.3`). All product logic, agent systems, AIBox, and page routing have been built on top of that scaffold.
- `agency-agents/` — external reference directory, excluded from the repo.
