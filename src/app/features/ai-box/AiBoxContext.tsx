import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

/* ================================================================
   PAGE CONTEXT — injected by each page to provide awareness
   ================================================================ */

export interface AiBoxSuggestion {
  label: string;
  prompt: string;
}

export interface AiBoxPageContext {
  /** Context type — determines AIBox behavior */
  type: "workflow" | "agent" | "asset" | "case" | "general";
  /** Primary label shown in context header (e.g., workflow name) */
  label: string;
  /** Secondary sublabel (e.g., "Workflow Context") */
  sublabel?: string;
  /** Suggestion chips shown below chat */
  suggestions: AiBoxSuggestion[];
  /** Initial greeting message when context changes */
  greeting?: string;
  /** Optional initial query to auto-send when opened via action button */
  initialQuery?: string;
  /** Unique key to detect context changes */
  contextKey?: string;
}

/* ================================================================
   CONTEXT TYPE
   ================================================================ */

interface AiBoxContextType {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  /** Current page context — set by the active page */
  pageContext: AiBoxPageContext | null;
  /** Pages call this to push their context into the global AIBox */
  setPageContext: (ctx: AiBoxPageContext | null) => void;
  /** Open AIBox AND set context + optional initial query simultaneously */
  openWithContext: (ctx: AiBoxPageContext) => void;
}

const AiBoxContext = createContext<AiBoxContextType>({
  isOpen: false,
  toggle: () => {},
  open: () => {},
  close: () => {},
  pageContext: null,
  setPageContext: () => {},
  openWithContext: () => {},
});

export function AiBoxProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pageContext, setPageContextState] = useState<AiBoxPageContext | null>(null);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const setPageContext = useCallback((ctx: AiBoxPageContext | null) => {
    setPageContextState(ctx);
  }, []);

  const openWithContext = useCallback((ctx: AiBoxPageContext) => {
    setPageContextState(ctx);
    setIsOpen(true);
  }, []);

  return (
    <AiBoxContext.Provider value={{ isOpen, toggle, open, close, pageContext, setPageContext, openWithContext }}>
      {children}
    </AiBoxContext.Provider>
  );
}

export function useAiBox() {
  return useContext(AiBoxContext);
}
