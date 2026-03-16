import React from "react";

export interface StatusEntry {
  title: string;
  description: string;
}

export const STATUS_ENTRIES: StatusEntry[] = [
  {
    title: "Risk Intelligence Analyst correlated anomaly signals.",
    description:
      "Risk Intelligence Analyst performed a correlation analysis on identity, endpoint, and network telemetry linked to finance-admin-02. Authentication logs, endpoint behavior signals, and privilege usage patterns were aggregated to determine whether the anomaly represents isolated activity or part of a broader threat pattern. The analyst refined the investigation context by identifying related systems, potential lateral movement signals, and unusual privilege escalations associated with the account.",
  },
  {
    title: "Configuration Security Analyst verified endpoint containment.",
    description:
      "Following the SOC containment action on corp-endpoint-17, Configuration Security Analyst executed validation checks to confirm that the endpoint was effectively isolated. The analyst verified network segmentation enforcement, reviewed active processes, terminated suspicious sessions, and confirmed that outbound communications were blocked. Monitoring rules were temporarily strengthened to ensure no residual malicious activity persists.",
  },
  {
    title: "Application Security Analyst enriched phishing evidence.",
    description:
      "Application Security Analyst collected additional threat intelligence associated with the phishing attempt targeting hr-mailbox-02. The analyst analyzed email headers, sender infrastructure, domain registration details, and attachment indicators. Reputation services and internal threat intelligence feeds were consulted to determine whether the phishing infrastructure has been linked to previous campaigns. The enriched intelligence package was attached to the investigation for faster triage.",
  },
  {
    title: "Asset Intelligence Analyst discovered exposed infrastructure.",
    description:
      "Asset Intelligence Analyst identified previously uncatalogued infrastructure assets connected to dmz-segment-04. The analyst mapped asset dependencies, cataloged endpoint configurations, and cross-referenced cloud resource inventories to determine the scope of exposure. Discovery findings were escalated to Vulnerability Analyst for immediate CVE validation across the newly identified attack surface.",
  },
  {
    title: "Exposure Analyst reassessed external attack surface.",
    description:
      "Exposure Analyst reassessed the external attack surface related to infra-gateway-02 and api-edge-02 following remediation and configuration changes. Network connectivity, gateway policies, and service exposure parameters were analyzed to determine whether systems remain reachable from untrusted networks. The analyst updated exposure metrics and confirmed a reduced projected attack surface after the security adjustments were applied.",
  },
  {
    title: "Vulnerability Analyst synchronized remediation status.",
    description:
      "After patching actions were performed on web-node-07 and ui-app-09, Vulnerability Analyst synchronized vulnerability management records with the updated system states. The analyst verified that vulnerable packages were successfully replaced, scanned dependency trees for lingering outdated libraries, and refreshed the vulnerability inventory to ensure accurate reporting across application and infrastructure environments.",
  },
  {
    title: "Exposure Analyst confirmed lateral movement path.",
    description:
      "Exposure Analyst mapped potential attack paths that could allow an adversary to reach finance-db-01 using updated infrastructure relationships and identity privileges. The analyst identified privilege escalation steps, lateral movement routes, and system dependencies exploitable during an intrusion scenario. Findings were forwarded to Risk Intelligence Analyst for impact scoring and prioritization.",
  },
  {
    title: "Governance & Compliance Analyst recalculated compliance posture.",
    description:
      "Governance & Compliance Analyst refreshed policy validation results after control verification activities involving iam-core-01 and compliance checks on payment-03. The analyst evaluated whether required controls remain active, detected gaps where controls were missing or incomplete, and updated the compliance dashboard used for regulatory oversight and internal audit readiness.",
  },
  {
    title: "Identity Security Analyst enforced access policy update.",
    description:
      "Identity Security Analyst propagated updated security policies across relevant services, including encryption configuration changes applied to storage-02 and mandatory multi-factor authentication enforcement for admin-group-02. The analyst verified that encryption standards and authentication requirements were consistently applied across all associated systems and identity groups.",
  },
  {
    title: "Governance & Compliance Analyst initiated remediation workflow.",
    description:
      "Governance & Compliance Analyst initiated monitoring workflows related to the vendor-17 access exception and the onboarding-04 governance process. The analyst is tracking approval lifecycles, ensuring required policy checks are completed, and maintaining an auditable record of access decisions and onboarding governance activities within the risk management framework.",
  },
  {
    title: "Risk Intelligence Analyst recalculated exposure score.",
    description:
      "Risk Intelligence Analyst recalculated the composite exposure score for the finance-segment after Vulnerability Analyst reported three newly confirmed CVEs across production database nodes. The analyst aggregated threat intelligence signals, asset criticality weights, and active exploitation indicators to produce an updated risk posture. The revised score triggered an automatic escalation threshold, prompting Governance & Compliance Analyst to review remediation timelines.",
  },
  {
    title: "Identity Security Analyst detected anomalous privilege escalation.",
    description:
      "Identity Security Analyst detected an anomalous privilege escalation pattern on svc-account-14 within the engineering identity group. The analyst reviewed IAM permission changes, cross-referenced recent access policy modifications, and identified an unauthorized role binding that granted elevated database access. The finding was escalated to Configuration Security Analyst for baseline drift analysis and immediate policy rollback.",
  },
];

interface StatusContextType {
  currentStatus: StatusEntry;
  fade: boolean;
}

const StatusContext = React.createContext<StatusContextType>({
  currentStatus: STATUS_ENTRIES[0],
  fade: true,
});

export function StatusProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = React.useState(() =>
    Math.floor(Math.random() * STATUS_ENTRIES.length)
  );
  const [fade, setFade] = React.useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex(Math.floor(Math.random() * STATUS_ENTRIES.length));
        setFade(true);
      }, 400);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const value = React.useMemo(
    () => ({ currentStatus: STATUS_ENTRIES[index], fade }),
    [index, fade]
  );

  return (
    <StatusContext.Provider value={value}>{children}</StatusContext.Provider>
  );
}

export function useStatus() {
  return React.useContext(StatusContext);
}
