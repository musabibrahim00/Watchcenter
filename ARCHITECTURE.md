# Architecture & Refactor Handoff

> Produced after the Step 1–7 architectural refactor. Describes the current codebase structure,
> what changed, what remains intentionally deferred, and where to find things.

---

## Codebase philosophy

The codebase originated from a Figma Make scaffold (`WatchDSTExpV1.3`). Product logic has been
built on top incrementally. The refactor progressively migrated canonical code out of
`src/imports/` (the scaffold origin) into a feature-based architecture under `src/app/`.

The migration is **not complete by design** — large working components in `src/imports/` are
left in place until they are ready for a dedicated refactor of their own. Shim re-export files
bridge old import paths to the new canonical locations.

---

## Layer map

```
src/app/features/     ← Feature-owned logic, components, and types
src/app/pages/        ← Route-level pages (compose from features + shared)
src/app/components/   ← App-shell components (Layout, GlobalAIBox, Header, …)
src/app/shared/       ← Cross-cutting design system, utils, services, types
src/imports/          ← Scaffold origin. Active large components + shim proxies
```

---

## What the refactor changed (Steps 1–7)

### Step 1 — Feature barrel exports
Every feature module under `src/app/features/` received a clean `index.ts` barrel export.
All downstream consumers now import from the feature public API, not from internal paths.

### Step 2 — Shared utilities extracted
Utilities that were inline in Figma scaffold files were extracted to:
- `src/app/shared/utils/` — `formatText`, `isCasual`, `casualDetection`, `responseLabels`, `successStates`
- `src/app/shared/services/` — `SessionAwareness`, `ChangeDetection`, `HighlightBus`, `ApprovalQueue`

### Steps 3–4 — Workflow page decomposition
`WorkflowsIndexPage.tsx` (was 2037 lines) split into:
- `WorkflowsIndexPage.tsx` — orchestration only (~1600 lines)
- `WorkflowUIHelpers.tsx` — `KIND_META`, `SOURCE_META`, `StatusBadge`, `Tag`, `WorkflowCardComp`, `LibraryItemCard`, `IntegrationCard`, `RunConfirmationModal`
- `StepFormComponents.tsx` — all 16 step-specific config forms + `AISuggestionBox`
- `types.ts` — `WorkflowStatus`, `WorkflowCard` promoted to the shared types file

### Step 5 — Component relocation (watch-center / investigation)
Four components moved from `src/imports/` to canonical feature locations:

| Canonical new location | Old location |
|---|---|
| `features/watch-center/ActivityFeed.tsx` | `imports/ActivityFeed.tsx` |
| `features/watch-center/KpiWidget.tsx` | `imports/KpiWidget.tsx` |
| `features/investigation/InvestigationTimeline.tsx` | `imports/InvestigationTimeline.tsx` |
| `features/investigation/TaskInvestigationBridge.tsx` | `imports/TaskInvestigationBridge.tsx` |

The `imports/` files were converted to re-export shims. Zero consumers required changes.

Two zero-consumer shims deleted: `imports/Header.tsx`, `imports/SidebarNavigation.tsx`.

### Steps 6 Phase 1–3 — AIBox decomposition
`src/imports/AiBoxShared.tsx` was 2558 lines of mixed types, utilities, data, and components.
It was decomposed into the feature sub-structure below. `AiBoxShared.tsx` was preserved as a
thin compatibility re-export surface (~59 lines).

**New canonical locations:**

| What | Location |
|---|---|
| Type definitions | `features/ai-box/types/index.ts` |
| `classifyActionIntent`, `classifyGuardrailLevel` | `features/ai-box/utils/classifiers.ts` |
| `deriveActionResult`, `deriveActionFailure` | `features/ai-box/utils/action-result.ts` |
| `ACTION_CATALOG`, `matchAction` | `features/ai-box/data/action-catalog.ts` |
| `ActionResultCard`, `ActionFailureCard` | `features/ai-box/components/ActionResultCards.tsx` |
| `ContributingAgentsBlock` | `features/ai-box/components/ContributingAgentsBlock.tsx` |
| `ActionLifecycleBadge` | `features/ai-box/components/ActionLifecycleBadge.tsx` |
| `MessageBubble` | `features/ai-box/components/MessageBubble.tsx` |
| `TypingIndicator` | `features/ai-box/components/TypingIndicator.tsx` |
| `ChatInput` | `features/ai-box/components/ChatInput.tsx` |
| `WelcomeScreen` | `features/ai-box/components/WelcomeScreen.tsx` |
| `ActionCard` | `features/ai-box/components/ActionCard.tsx` |

### Step 7 — Low-risk stabilization
- Removed unused imports (`Activity`, `Clock`, `memo`) from `WorkflowUIHelpers.tsx`
- Fixed stale shim path in `shared/types/index.ts`
- Removed duplicate type definitions that had been promoted to `workflows/types.ts`

---

## Compatibility shims (intentionally kept)

These files in `src/imports/` are pure re-export shims. They exist so that consumers of the
old import paths continue to work without changes. **Do not remove them until all consumers
are deliberately migrated.**

| Shim file | Points to |
|---|---|
| `imports/ActivityFeed.tsx` | `features/watch-center/ActivityFeed` |
| `imports/KpiWidget.tsx` | `features/watch-center/KpiWidget` |
| `imports/InvestigationTimeline.tsx` | `features/investigation/InvestigationTimeline` |
| `imports/InvestigationContext.tsx` | `features/watch-center/InvestigationContext` |
| `imports/TaskInvestigationBridge.tsx` | `features/investigation/TaskInvestigationBridge` |
| `imports/StatusContext.tsx` | `features/watch-center/StatusContext` |
| `imports/AiBoxShared.tsx` | `features/ai-box/components/`, `utils/`, `data/`, `types/` |

`AiBoxShared.tsx` is the most important shim: `imports/AiBox.tsx` and
`app/components/GlobalAIBox.tsx` both import from it directly. Do not remove it without
refactoring those two files first.

---

## Components that are intentionally NOT refactored

These files remain large and monolithic by design. They are stable, actively used, and
refactoring them is a separate scoped project:

| File | Approx size | Notes |
|---|---|---|
| `imports/AiBox.tsx` | ~2200 lines | Main AIBox in Watch Center. Complex session/message orchestration. |
| `imports/AiBoxRenderer.tsx` | ~1600 lines | AI response renderer. Wires agent context to module output. |
| `imports/AiBoxModules.tsx` | ~1300 lines | Module widget library. Safe to extend, not ready to decompose. |
| `imports/AiBoxLiveData.ts` | ~1700 lines | Live data integration bridge. |
| `imports/Working.tsx` | ~4400 lines | Globe + radial agent visualization. Highly coupled to animation system. |
| `imports/Tasks.tsx` | ~1300 lines | Risk Tracker task carousel. |
| `app/components/GlobalAIBox.tsx` | ~1500 lines | Platform-wide AIBox. Imports from AiBoxShared. Defer until after AiBox.tsx refactor. |

---

## AIBox import hierarchy (current)

```
consumers (AiBox.tsx, GlobalAIBox.tsx)
    ↓ import from
imports/AiBoxShared.tsx           ← compatibility shim (~59 lines)
    ↓ re-exports from
features/ai-box/
    components/   ActionCard, MessageBubble, ChatInput, TypingIndicator,
                  WelcomeScreen, ActionLifecycleBadge, ActionResultCards,
                  ContributingAgentsBlock
    data/         ACTION_CATALOG, matchAction
    utils/        classifiers, action-result
    types/        all AI box type definitions
```

External consumers (pages, other features) that need AIBox types or components
should import from `features/ai-box` (the barrel) or `imports/AiBoxShared` — not
from the sub-paths directly.

---

## Remaining deferred debt

These items were identified but deliberately deferred. They are not bugs.

| Item | Why deferred |
|---|---|
| `imports/AiBox.tsx` decomposition | Requires careful session/state orchestration audit |
| `imports/AiBoxRenderer.tsx` decomposition | Tightly coupled to AiBox.tsx; should be done together |
| `imports/Working.tsx` decomposition | Animation system coupling makes it a separate project |
| `GlobalAIBox.tsx` import path update | Wait until AiBox.tsx is refactored; update both at once |
| Feature index double-hop (index.ts → AiBoxShared → canonical) | Cosmetic; no correctness impact |
| SVG path files in `imports/` | All 15 verified as used — no orphans present |

---

## Build health

- **Module count:** ~2804 modules (stable post-refactor)
- **Build time:** ~3.8s (production)
- **Known large chunks:** `index.js` (~1.2 MB), `Working.tsx`/`AiBox.tsx` bundles
  (expected — these are the large monolithic files intentionally left in place)
- The chunk size warning is pre-existing and not introduced by this refactor

---

## Is the repo stable for normal feature development?

**Yes.** All product surfaces work. Build is clean. The refactor is additive:
new code should go into `src/app/features/<feature-name>/` and be exported via
a barrel `index.ts`. Import from feature barrels or `src/app/shared/`, not from
`src/imports/` paths (except when extending Watch Center components that still
live there).
