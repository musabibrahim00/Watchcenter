import React from "react";
import type { AgentId } from "./Working";

export interface InvestigationScenario {
  name: string;
  agents: AgentId[];
  color: string;
}

export const INVESTIGATION_SCENARIOS: InvestigationScenario[] = [
  {
    name: "Exposed Asset Response",
    agents: ["alpha", "hotel", "foxtrot", "echo", "delta"],
    color: "#0781C2",
  },
  {
    name: "Identity Breach Investigation",
    agents: ["golf", "charlie", "foxtrot", "echo", "delta"],
    color: "#00A46E",
  },
  {
    name: "Configuration Drift Response",
    agents: ["bravo", "hotel", "foxtrot", "echo", "delta"],
    color: "#F05B06",
  },
];

export const AGENT_NAMES: Record<AgentId, string> = {
  alpha: "Asset Intelligence Analyst",
  hotel: "Vulnerability Analyst",
  bravo: "Configuration Security Analyst",
  charlie: "Application Security Analyst",
  foxtrot: "Exposure Analyst",
  delta: "Governance & Compliance Analyst",
  echo: "Risk Intelligence Analyst",
  golf: "Identity Security Analyst",
};

export interface TimelineStep {
  agentId: AgentId;
  analystName: string;
  action: string;
}

const SCENARIO_ACTIONS: Record<string, Record<AgentId, string>> = {
  "Exposed Asset Response": {
    alpha: "Discovered exposed infrastructure asset",
    hotel: "Validated CVE exposure",
    foxtrot: "Detected potential lateral movement path",
    echo: "Calculated overall risk score",
    delta: "Requested remediation authorization",
    bravo: "", charlie: "", golf: "",
  },
  "Identity Breach Investigation": {
    golf: "Detected anomalous identity behavior",
    charlie: "Identified compromised application session",
    foxtrot: "Mapped lateral movement vectors",
    echo: "Assessed breach impact severity",
    delta: "Initiated compliance breach protocol",
    alpha: "", bravo: "", hotel: "",
  },
  "Configuration Drift Response": {
    bravo: "Detected unauthorized configuration change",
    hotel: "Assessed new vulnerability exposure",
    foxtrot: "Evaluated expanded attack surface",
    echo: "Recalculated risk posture",
    delta: "Enforced policy remediation",
    alpha: "", charlie: "", golf: "",
  },
};

export function getTimelineSteps(scenario: InvestigationScenario): TimelineStep[] {
  const actions = SCENARIO_ACTIONS[scenario.name];
  if (!actions) return [];
  return scenario.agents.map((agentId) => ({
    agentId,
    analystName: AGENT_NAMES[agentId],
    action: actions[agentId] || "",
  }));
}

/* ── Investigation Story Data ── */

/** Short contribution labels shown near agent nodes during investigation */
export const AGENT_CONTRIBUTIONS: Record<string, Record<AgentId, string>> = {
  "Exposed Asset Response": {
    alpha: "discovered a new exposed workload",
    hotel: "validated critical CVE exposure",
    foxtrot: "discovered a lateral movement path",
    echo: "raised the overall risk score",
    delta: "triggered remediation workflow",
    bravo: "", charlie: "", golf: "",
  },
  "Identity Breach Investigation": {
    golf: "flagged anomalous privilege escalation",
    charlie: "identified compromised session token",
    foxtrot: "mapped lateral movement vectors",
    echo: "elevated breach severity to critical",
    delta: "initiated compliance breach protocol",
    alpha: "", bravo: "", hotel: "",
  },
  "Configuration Drift Response": {
    bravo: "detected unauthorized policy change",
    hotel: "found new vulnerability exposure",
    foxtrot: "evaluated expanded attack surface",
    echo: "recalculated composite risk posture",
    delta: "enforced policy remediation workflow",
    alpha: "", charlie: "", golf: "",
  },
};

/** Center status messages per investigation phase */
export const INVESTIGATION_CENTER_MESSAGES: Record<string, { drawing: string[]; holding: string; completion: string }> = {
  "Exposed Asset Response": {
    drawing: [
      "Investigating exposed workload",
      "Correlating vulnerability signals",
      "Evaluating attack path",
      "Scoring risk posture",
      "Preparing remediation",
    ],
    holding: "Attack path confirmed — remediation recommended",
    completion: "Investigation complete — remediation authorized",
  },
  "Identity Breach Investigation": {
    drawing: [
      "Analyzing privilege exposure",
      "Tracing application session",
      "Mapping lateral movement",
      "Assessing breach impact",
      "Initiating compliance protocol",
    ],
    holding: "Privilege escalation risk mitigated",
    completion: "Investigation complete — breach contained",
  },
  "Configuration Drift Response": {
    drawing: [
      "Evaluating configuration change",
      "Assessing vulnerability impact",
      "Mapping expanded attack surface",
      "Recalculating risk posture",
      "Enforcing policy rollback",
    ],
    holding: "Configuration drift remediated",
    completion: "Investigation complete — policy restored",
  },
};

/** Passive monitoring messages — shown during gap phase */
export const PASSIVE_MESSAGES: string[] = [
  "Analysts correlating vulnerability and asset signals",
  "Evaluating potential attack path",
  "Recalculating risk posture",
  "Monitoring identity and access patterns",
  "Scanning for configuration drift",
  "Correlating threat intelligence feeds",
  "Assessing external attack surface",
  "Validating compliance control coverage",
];

export type InvestigationPhase = "drawing" | "holding" | "fading" | "gap";

interface InvestigationContextType {
  scenario: InvestigationScenario;
  revealedSegments: number;
  phase: InvestigationPhase;
  steps: TimelineStep[];
  /** Index of the currently active (most recently revealed) agent */
  activeAgentIndex: number;
  /** The center context message for the current state */
  centerMessage: string;
  /** The contribution label for a specific agent in the current scenario */
  getContribution: (agentId: AgentId) => string;
  /** Whether a given agent has been revealed so far */
  isRevealed: (agentId: AgentId) => boolean;
  /** Completion message (briefly shown during holding/fading) */
  completionMessage: string;
}

const InvestigationContext = React.createContext<InvestigationContextType>({
  scenario: INVESTIGATION_SCENARIOS[0],
  revealedSegments: 0,
  phase: "gap",
  steps: getTimelineSteps(INVESTIGATION_SCENARIOS[0]),
  activeAgentIndex: -1,
  centerMessage: "",
  getContribution: () => "",
  isRevealed: () => false,
  completionMessage: "",
});

export function InvestigationProvider({ children }: { children: React.ReactNode }) {
  const [flowIndex, setFlowIndex] = React.useState(0);
  const [revealedSegments, setRevealedSegments] = React.useState(0);
  const [phase, setPhase] = React.useState<InvestigationPhase>("gap");
  const [passiveIndex, setPassiveIndex] = React.useState(() => Math.floor(Math.random() * PASSIVE_MESSAGES.length));

  const scenario = INVESTIGATION_SCENARIOS[flowIndex];
  const totalSegments = scenario.agents.length - 1;

  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "gap") {
      setRevealedSegments(0);
      t = setTimeout(() => setPhase("drawing"), 2500);
    } else if (phase === "drawing") {
      if (revealedSegments < totalSegments) {
        t = setTimeout(() => setRevealedSegments((s) => s + 1), 1400);
      } else {
        t = setTimeout(() => setPhase("holding"), 600);
      }
    } else if (phase === "holding") {
      t = setTimeout(() => setPhase("fading"), 4000);
    } else if (phase === "fading") {
      t = setTimeout(() => {
        setFlowIndex((i) => (i + 1) % INVESTIGATION_SCENARIOS.length);
        setPassiveIndex((i) => (i + 1) % PASSIVE_MESSAGES.length);
        setPhase("gap");
      }, 1200);
    }
    return () => clearTimeout(t!);
  }, [phase, revealedSegments, totalSegments]);

  React.useEffect(() => {
    const t = setTimeout(() => setPhase("drawing"), 3000);
    return () => clearTimeout(t);
  }, []);

  const steps = React.useMemo(() => getTimelineSteps(scenario), [scenario]);

  /* Compute active agent index — the most recently revealed agent */
  const activeAgentIndex = React.useMemo(() => {
    if (phase === "drawing") return Math.min(revealedSegments, scenario.agents.length - 1);
    if (phase === "holding") return scenario.agents.length - 1;
    return -1;
  }, [phase, revealedSegments, scenario]);

  /* Center message based on phase */
  const centerMessage = React.useMemo(() => {
    const msgs = INVESTIGATION_CENTER_MESSAGES[scenario.name];
    if (!msgs) return "";
    if (phase === "drawing") {
      const idx = Math.min(revealedSegments, msgs.drawing.length - 1);
      return msgs.drawing[idx] || msgs.drawing[0];
    }
    if (phase === "holding" || phase === "fading") return msgs.holding;
    return PASSIVE_MESSAGES[passiveIndex] || PASSIVE_MESSAGES[0];
  }, [phase, revealedSegments, scenario.name, passiveIndex]);

  const completionMessage = React.useMemo(() => {
    const msgs = INVESTIGATION_CENTER_MESSAGES[scenario.name];
    return msgs?.completion || "";
  }, [scenario.name]);

  const getContribution = React.useCallback((agentId: AgentId): string => {
    const contribs = AGENT_CONTRIBUTIONS[scenario.name];
    return contribs?.[agentId] || "";
  }, [scenario.name]);

  const isRevealed = React.useCallback((agentId: AgentId): boolean => {
    if (phase !== "drawing" && phase !== "holding") return false;
    const idx = scenario.agents.indexOf(agentId);
    if (idx === -1) return false;
    if (phase === "holding") return true;
    return idx <= revealedSegments;
  }, [phase, revealedSegments, scenario]);

  const value = React.useMemo(
    () => ({
      scenario, revealedSegments, phase, steps,
      activeAgentIndex, centerMessage, getContribution, isRevealed, completionMessage,
    }),
    [scenario, revealedSegments, phase, steps, activeAgentIndex, centerMessage, getContribution, isRevealed, completionMessage]
  );

  return (
    <InvestigationContext.Provider value={value}>
      {children}
    </InvestigationContext.Provider>
  );
}

export function useInvestigation() {
  return React.useContext(InvestigationContext);
}
