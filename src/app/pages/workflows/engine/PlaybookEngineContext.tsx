/**
 * PlaybookEngineContext — React context for the PlaybookEngine
 *
 * Provides engine instance + reactive state to all workflow components.
 * The provider creates the engine on mount and destroys it on unmount.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { PlaybookEngine, type ReplayMode, type RunEvent } from "./PlaybookEngine";
import type { WorkflowRun } from "../types";

/* ================================================================
   CONTEXT TYPE
   ================================================================ */

interface PlaybookEngineContextValue {
  engine: PlaybookEngine;

  /** Get all runs for a playbook (reactive — re-renders on changes) */
  getRunsForPlaybook: (playbookId: string) => WorkflowRun[];

  /** Manual run */
  manualRun: (playbookId: string, playbookName: string) => WorkflowRun;

  /** Test run from builder */
  testRun: (playbookId: string, playbookName: string) => WorkflowRun;

  /** Replay a run */
  replayRun: (
    sourceRunId: string,
    mode: ReplayMode,
    modifiedInputs?: Record<string, string>
  ) => WorkflowRun | null;

  /** Cancel a run */
  cancelRun: (runId: string) => void;

  /** Approve/reject steps */
  approveStep: (runId: string, stepId: string) => void;
  rejectStep: (runId: string, stepId: string) => void;

  /** Integration management — connect, skip, cancel for blocked steps */
  connectIntegration: (runId: string, stepId: string) => void;
  skipBlockedStep: (runId: string, stepId: string) => void;

  /** Run version counter — bumps on every state change to trigger re-renders */
  version: number;
}

const PlaybookEngineCtx = createContext<PlaybookEngineContextValue | null>(null);

/**
 * Fallback engine instance for when the hook is called outside the provider
 * (e.g., during HMR re-evaluation). This prevents crashes.
 */
let fallbackEngine: PlaybookEngine | null = null;
function getFallbackEngine(): PlaybookEngine {
  if (!fallbackEngine) {
    fallbackEngine = new PlaybookEngine();
  }
  return fallbackEngine;
}

/* ================================================================
   PROVIDER
   ================================================================ */

export function PlaybookEngineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const engineRef = useRef<PlaybookEngine | null>(null);
  const [version, setVersion] = useState(0);

  // Create engine once
  if (!engineRef.current) {
    engineRef.current = new PlaybookEngine();
  }
  const engine = engineRef.current;

  // Subscribe to engine events to drive re-renders
  useEffect(() => {
    const unsubscribe = engine.subscribe((_event: RunEvent) => {
      setVersion((v) => v + 1);
    });
    return () => {
      unsubscribe();
      if (typeof engine.destroy === "function") {
        engine.destroy();
      }
    };
  }, [engine]);

  // Stable callbacks
  const getRunsForPlaybook = useCallback(
    (playbookId: string) => engine.getRunsForPlaybook(playbookId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engine, version]
  );

  const manualRun = useCallback(
    (playbookId: string, playbookName: string) =>
      engine.manualRun(playbookId, playbookName),
    [engine]
  );

  const testRun = useCallback(
    (playbookId: string, playbookName: string) =>
      engine.testRun(playbookId, playbookName),
    [engine]
  );

  const replayRun = useCallback(
    (
      sourceRunId: string,
      mode: ReplayMode,
      modifiedInputs?: Record<string, string>
    ) => engine.replayRun(sourceRunId, mode, modifiedInputs),
    [engine]
  );

  const cancelRun = useCallback(
    (runId: string) => engine.cancelRun(runId),
    [engine]
  );

  const approveStep = useCallback(
    (runId: string, stepId: string) => engine.approveStep(runId, stepId),
    [engine]
  );

  const rejectStep = useCallback(
    (runId: string, stepId: string) => engine.rejectStep(runId, stepId),
    [engine]
  );

  const connectIntegration = useCallback(
    (runId: string, stepId: string) => engine.connectIntegration(runId, stepId),
    [engine]
  );

  const skipBlockedStep = useCallback(
    (runId: string, stepId: string) => engine.skipBlockedStep(runId, stepId),
    [engine]
  );

  const value = useMemo<PlaybookEngineContextValue>(
    () => ({
      engine,
      getRunsForPlaybook,
      manualRun,
      testRun,
      replayRun,
      cancelRun,
      approveStep,
      rejectStep,
      connectIntegration,
      skipBlockedStep,
      version,
    }),
    [
      engine,
      getRunsForPlaybook,
      manualRun,
      testRun,
      replayRun,
      cancelRun,
      approveStep,
      rejectStep,
      connectIntegration,
      skipBlockedStep,
      version,
    ]
  );

  return (
    <PlaybookEngineCtx.Provider value={value}>
      {children}
    </PlaybookEngineCtx.Provider>
  );
}

/* ================================================================
   HOOK
   ================================================================ */

export function usePlaybookEngine(): PlaybookEngineContextValue {
  const ctx = useContext(PlaybookEngineCtx);
  if (ctx) return ctx;

  // Fallback for when the hook is called outside <PlaybookEngineProvider>
  // (e.g., during Vite HMR re-evaluation). Return a working engine instance
  // instead of crashing the app.
  const engine = getFallbackEngine();
  return {
    engine,
    getRunsForPlaybook: (playbookId: string) => engine.getRunsForPlaybook(playbookId),
    manualRun: (playbookId: string, playbookName: string) => engine.manualRun(playbookId, playbookName),
    testRun: (playbookId: string, playbookName: string) => engine.testRun(playbookId, playbookName),
    replayRun: (sourceRunId: string, mode: ReplayMode, modifiedInputs?: Record<string, string>) =>
      engine.replayRun(sourceRunId, mode, modifiedInputs),
    cancelRun: (runId: string) => engine.cancelRun(runId),
    approveStep: (runId: string, stepId: string) => engine.approveStep(runId, stepId),
    rejectStep: (runId: string, stepId: string) => engine.rejectStep(runId, stepId),
    connectIntegration: (runId: string, stepId: string) => engine.connectIntegration(runId, stepId),
    skipBlockedStep: (runId: string, stepId: string) => engine.skipBlockedStep(runId, stepId),
    version: 0,
  };
}