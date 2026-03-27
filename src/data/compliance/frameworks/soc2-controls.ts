/**
 * SOC 2 Type II — Trust Service Criteria
 *
 * Source: PRD_V3.0 — SOC 2 controls reference sheet
 * Total: 59 criteria
 *   Security (CC): 33 required
 *   Availability:  3 optional
 *   Processing Integrity: 5 optional
 *   Confidentiality: 2 optional
 *   Privacy: 18 optional (P1–P8 principles, 18 criteria)
 *
 * Structure:
 *   ComplianceFramework → ComplianceCategory[] → ComplianceControl[]
 *
 * Titles: Generated from the Criteria Name field.
 *   For CC1–CC4, the "COSO Principle N:" prefix is stripped.
 *   For CC6–CC9 and optional criteria, the criteria name is used directly
 *   or shortened for readability.
 *
 * Evidence: Parsed from the "Common Controls / Evidence Required?" column
 *   as a string array. Items are the canonical artifact names from the PRD.
 */

/* ================================================================
   TYPES
   ================================================================ */

export type ComplianceControl = {
  /** Criteria ID, e.g. "CC1.1", "PI1.3", "P6.3" */
  id: string;
  /** Short, readable title derived from the criteria name */
  title: string;
  /** Full description from the Trust Service Criteria specification */
  description: string;
  /** Canonical evidence artifacts required to satisfy this control */
  evidence: string[];
  /** True = required for SOC 2 Type II; false = optional (scoped by category) */
  required: boolean;
};

export type ComplianceCategory = {
  /** Category prefix, e.g. "CC1", "A1", "PI1", "C1", "P" */
  id: string;
  /** Human-readable category name */
  name: string;
  /** SOC 2 Trust Service Category label */
  trustServiceCategory: string;
  controls: ComplianceControl[];
};

export type ComplianceFramework = {
  id: string;
  name: string;
  version: string;
  totalControls: number;
  requiredControls: number;
  categories: ComplianceCategory[];
};

/* ================================================================
   SOC 2 FRAMEWORK DATA
   ================================================================ */

export const SOC2_FRAMEWORK: ComplianceFramework = {
  id: "soc2",
  name: "SOC 2 Type II",
  version: "2017 Trust Service Criteria",
  totalControls: 59,
  requiredControls: 33,

  categories: [

    /* ── CC1: Control Environment ───────────────────────────────── */
    {
      id: "CC1",
      name: "Control Environment",
      trustServiceCategory: "Security (Common Criteria)",
      controls: [
        {
          id: "CC1.1",
          title: "Commitment to Integrity and Ethical Values",
          description:
            "The entity demonstrates a commitment to integrity and ethical values.",
          evidence: ["Code of conduct", "Ethics policy", "Employee acknowledgments"],
          required: true,
        },
        {
          id: "CC1.2",
          title: "Board Oversight Responsibility",
          description:
            "The board of directors demonstrates independence from management and exercises oversight.",
          evidence: ["Board meeting minutes", "Oversight documentation"],
          required: true,
        },
        {
          id: "CC1.3",
          title: "Organizational Structure and Authority",
          description:
            "Management establishes structures, reporting lines, and appropriate authorities and responsibilities.",
          evidence: ["Org chart", "RACI matrix", "Role descriptions"],
          required: true,
        },
        {
          id: "CC1.4",
          title: "Commitment to Competence",
          description:
            "The entity demonstrates a commitment to attract, develop, and retain competent individuals.",
          evidence: ["Job descriptions", "Training programs", "Performance reviews"],
          required: true,
        },
        {
          id: "CC1.5",
          title: "Accountability Enforcement",
          description:
            "The entity holds individuals accountable for their internal control responsibilities.",
          evidence: ["Performance metrics", "Disciplinary policy", "Accountability records"],
          required: true,
        },
      ],
    },

    /* ── CC2: Communication and Information ─────────────────────── */
    {
      id: "CC2",
      name: "Communication and Information",
      trustServiceCategory: "Security (Common Criteria)",
      controls: [
        {
          id: "CC2.1",
          title: "Relevant Information Use",
          description:
            "The entity obtains or generates and uses relevant, quality information to support functioning of internal control.",
          evidence: ["Information systems documentation", "Data quality procedures"],
          required: true,
        },
        {
          id: "CC2.2",
          title: "Internal Communication",
          description:
            "The entity internally communicates information necessary to support the functioning of internal control.",
          evidence: ["Internal communication records", "Security awareness training"],
          required: true,
        },
        {
          id: "CC2.3",
          title: "External Communication",
          description:
            "The entity communicates with external parties regarding matters affecting the functioning of internal control.",
          evidence: [
            "External communications",
            "Customer notifications",
            "Incident disclosure procedures",
          ],
          required: true,
        },
      ],
    },

    /* ── CC3: Risk Assessment ────────────────────────────────────── */
    {
      id: "CC3",
      name: "Risk Assessment",
      trustServiceCategory: "Security (Common Criteria)",
      controls: [
        {
          id: "CC3.1",
          title: "Suitable Objective Specification",
          description:
            "The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks.",
          evidence: ["Security objectives documentation", "Risk appetite statement"],
          required: true,
        },
        {
          id: "CC3.2",
          title: "Risk Identification and Analysis",
          description:
            "The entity identifies risks to the achievement of its objectives and analyzes risks as a basis for determining how the risks should be managed.",
          evidence: ["Risk assessment reports", "Risk register", "Threat analysis"],
          required: true,
        },
        {
          id: "CC3.3",
          title: "Fraud Risk Assessment",
          description:
            "The entity considers the potential for fraud in assessing risks to the achievement of objectives.",
          evidence: ["Fraud risk assessment", "Anti-fraud controls"],
          required: true,
        },
        {
          id: "CC3.4",
          title: "Significant Change Identification",
          description:
            "The entity identifies and assesses changes that could significantly impact the system of internal control.",
          evidence: ["Change management records", "Risk reassessment triggers"],
          required: true,
        },
      ],
    },

    /* ── CC4: Monitoring Activities ─────────────────────────────── */
    {
      id: "CC4",
      name: "Monitoring Activities",
      trustServiceCategory: "Security (Common Criteria)",
      controls: [
        {
          id: "CC4.1",
          title: "Ongoing Evaluation Selection and Performance",
          description:
            "The entity selects, develops, and performs ongoing and/or separate evaluations to ascertain whether the components of internal control are present and functioning.",
          evidence: ["Monitoring dashboards", "Continuous assessment reports"],
          required: true,
        },
        {
          id: "CC4.2",
          title: "Deficiency Evaluation and Communication",
          description:
            "The entity evaluates and communicates internal control deficiencies in a timely manner to those parties responsible for taking corrective action.",
          evidence: [
            "Deficiency tracking",
            "Remediation reports",
            "Management notifications",
          ],
          required: true,
        },
      ],
    },

    /* ── CC5: Control Activities ─────────────────────────────────── */
    {
      id: "CC5",
      name: "Control Activities",
      trustServiceCategory: "Security (Common Criteria)",
      controls: [
        {
          id: "CC5.1",
          title: "Control Activity Selection and Development",
          description:
            "The entity selects and develops control activities that contribute to the mitigation of risks to the achievement of objectives to acceptable levels.",
          evidence: [
            "Control framework documentation",
            "Control design evidence",
          ],
          required: true,
        },
        {
          id: "CC5.2",
          title: "General Controls over Technology",
          description:
            "The entity selects and develops general control activities over technology to support the achievement of objectives.",
          evidence: [
            "IT general controls documentation",
            "Technology governance",
          ],
          required: true,
        },
        {
          id: "CC5.3",
          title: "Policy and Procedure Deployment",
          description:
            "The entity deploys control activities through policies that establish what is expected and procedures that put policies into action.",
          evidence: [
            "Security policies",
            "Procedures",
            "Implementation evidence",
          ],
          required: true,
        },
      ],
    },

    /* ── CC6: Logical and Physical Access Controls ───────────────── */
    {
      id: "CC6",
      name: "Logical and Physical Access Controls",
      trustServiceCategory: "Security (Common Criteria)",
      controls: [
        {
          id: "CC6.1",
          title: "Logical Access Security Architecture",
          description:
            "The entity implements logical access security software, infrastructure, and architectures over protected information assets.",
          evidence: [
            "Firewall configurations",
            "Network diagrams",
            "IAM policies",
            "Encryption configuration",
          ],
          required: true,
        },
        {
          id: "CC6.2",
          title: "User Registration and Access Authorization",
          description:
            "Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users.",
          evidence: [
            "User provisioning procedures",
            "Approval workflows",
            "Access request tickets",
          ],
          required: true,
        },
        {
          id: "CC6.3",
          title: "Role-Based Access and Least Privilege",
          description:
            "The entity authorizes, modifies, or removes access to data, software, functions, and other protected information assets based on roles.",
          evidence: [
            "RBAC configuration",
            "Access review reports",
            "Least privilege evidence",
          ],
          required: true,
        },
        {
          id: "CC6.4",
          title: "Physical Access Controls",
          description:
            "The entity restricts physical access to facilities and protected information assets to authorized personnel.",
          evidence: [
            "Badge access logs",
            "Visitor logs",
            "Physical security records",
          ],
          required: true,
        },
        {
          id: "CC6.5",
          title: "Asset Disposal and Access Discontinuation",
          description:
            "The entity discontinues logical and physical protections over physical assets only after the ability to read or recover data and software from those assets has been diminished.",
          evidence: [
            "Asset disposal procedures",
            "Data wiping certificates",
          ],
          required: true,
        },
        {
          id: "CC6.6",
          title: "External Threat Logical Access Security",
          description:
            "The entity implements logical access security measures to protect against threats from sources outside its system boundaries.",
          evidence: [
            "Firewall rules",
            "IDS/IPS configuration",
            "Threat detection configuration",
            "WAF configuration",
          ],
          required: true,
        },
        {
          id: "CC6.7",
          title: "Information Transmission Restriction",
          description:
            "The entity restricts the transmission, movement, and removal of information to authorized internal and external users and processes.",
          evidence: [
            "DLP configuration",
            "Encryption in transit",
            "Transfer policies",
          ],
          required: true,
        },
        {
          id: "CC6.8",
          title: "Malicious Software Prevention and Detection",
          description:
            "The entity implements controls to prevent or detect and act upon the introduction of unauthorized or malicious software.",
          evidence: [
            "Anti-malware tools",
            "Endpoint protection configuration",
            "Software whitelisting",
          ],
          required: true,
        },
      ],
    },

    /* ── CC7: System Operations ──────────────────────────────────── */
    {
      id: "CC7",
      name: "System Operations",
      trustServiceCategory: "Security (Common Criteria)",
      controls: [
        {
          id: "CC7.1",
          title: "Detection and Monitoring",
          description:
            "To meet its objectives, the entity uses detection and monitoring procedures to identify changes to configurations that result in the introduction of new vulnerabilities.",
          evidence: [
            "Vulnerability scanning reports",
            "Configuration monitoring tools",
          ],
          required: true,
        },
        {
          id: "CC7.2",
          title: "System Component Anomaly Monitoring",
          description:
            "The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors.",
          evidence: [
            "SIEM dashboards",
            "Anomaly detection configuration",
            "Alert configurations",
          ],
          required: true,
        },
        {
          id: "CC7.3",
          title: "Security Event Evaluation",
          description:
            "The entity evaluates security events to determine whether they could or have resulted in a failure of the entity to meet its objectives.",
          evidence: [
            "Event triage procedures",
            "Incident classification criteria",
          ],
          required: true,
        },
        {
          id: "CC7.4",
          title: "Incident Response",
          description:
            "The entity responds to identified security incidents by executing a defined incident response program.",
          evidence: [
            "Incident response plan",
            "IR drill records",
            "Post-incident reports",
          ],
          required: true,
        },
        {
          id: "CC7.5",
          title: "Security Incident Recovery",
          description:
            "The entity identifies, develops, and implements activities to recover from identified security incidents.",
          evidence: [
            "Recovery plans",
            "DR test results",
            "Lessons learned documentation",
          ],
          required: true,
        },
      ],
    },

    /* ── CC8: Change Management ──────────────────────────────────── */
    {
      id: "CC8",
      name: "Change Management",
      trustServiceCategory: "Security (Common Criteria)",
      controls: [
        {
          id: "CC8.1",
          title: "Change Management Process",
          description:
            "The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures.",
          evidence: [
            "Change management policy",
            "Change tickets",
            "CAB records",
            "Deployment logs",
          ],
          required: true,
        },
      ],
    },

    /* ── CC9: Risk Mitigation ─────────────────────────────────────── */
    {
      id: "CC9",
      name: "Risk Mitigation",
      trustServiceCategory: "Security (Common Criteria)",
      controls: [
        {
          id: "CC9.1",
          title: "Risk Mitigation",
          description:
            "The entity identifies, selects, and develops risk mitigation activities for risks arising from potential business disruptions.",
          evidence: [
            "BCP/DR plans",
            "Risk mitigation strategies",
            "Insurance documentation",
          ],
          required: true,
        },
        {
          id: "CC9.2",
          title: "Vendor and Business Partner Risk Management",
          description:
            "The entity assesses and manages risks associated with vendors and business partners.",
          evidence: [
            "Vendor risk assessments",
            "Third-party audits",
            "Contract security clauses",
          ],
          required: true,
        },
      ],
    },

    /* ── A1: Availability ─────────────────────────────────────────── */
    {
      id: "A1",
      name: "Availability",
      trustServiceCategory: "Availability (Optional)",
      controls: [
        {
          id: "A1.1",
          title: "System Availability and Capacity Monitoring",
          description:
            "The entity maintains, monitors, and evaluates current processing capacity and use of system components to manage capacity demand and enable the implementation of additional capacity.",
          evidence: [
            "Capacity monitoring",
            "SLA documentation",
            "Uptime records",
          ],
          required: false,
        },
        {
          id: "A1.2",
          title: "Environmental Protections and Recovery Infrastructure",
          description:
            "The entity authorizes, designs, develops or acquires, implements, operates, approves, maintains, and monitors environmental protections, software, data backup and recovery infrastructure.",
          evidence: [
            "Backup procedures",
            "DR plans",
            "Recovery test results",
            "Environmental controls",
          ],
          required: false,
        },
        {
          id: "A1.3",
          title: "Recovery Plan Testing",
          description:
            "The entity tests recovery plan procedures supporting system recovery to meet its objectives.",
          evidence: [
            "DR test results",
            "Failover test records",
            "RTO/RPO achievement documentation",
          ],
          required: false,
        },
      ],
    },

    /* ── PI1: Processing Integrity ────────────────────────────────── */
    {
      id: "PI1",
      name: "Processing Integrity",
      trustServiceCategory: "Processing Integrity (Optional)",
      controls: [
        {
          id: "PI1.1",
          title: "Processing Integrity Objectives",
          description:
            "The entity obtains or generates, uses, and communicates relevant, quality information regarding the objectives related to processing to support the use of the products or services.",
          evidence: [
            "Data validation rules",
            "Processing error logs",
            "Quality metrics",
          ],
          required: false,
        },
        {
          id: "PI1.2",
          title: "System Input Completeness and Accuracy",
          description:
            "The entity implements policies and procedures over system inputs that result in products, services, and reporting to meet the entity's objectives.",
          evidence: [
            "Input validation controls",
            "Data integrity checks",
          ],
          required: false,
        },
        {
          id: "PI1.3",
          title: "System Processing Completeness and Accuracy",
          description:
            "The entity implements policies and procedures over system processing to result in products, services, and reporting to meet the entity's objectives.",
          evidence: [
            "Processing controls",
            "Batch validation",
            "Reconciliation reports",
          ],
          required: false,
        },
        {
          id: "PI1.4",
          title: "System Output Completeness and Accuracy",
          description:
            "The entity implements policies and procedures to make available or deliver output completely, accurately, and timely in accordance with specifications to meet the entity's objectives.",
          evidence: [
            "Output validation",
            "Delivery confirmation",
            "Accuracy checks",
          ],
          required: false,
        },
        {
          id: "PI1.5",
          title: "Input, Processing, and Output Storage Protection",
          description:
            "The entity implements policies and procedures to store inputs, items in processing, and outputs completely, accurately, and timely in accordance with specifications to meet the entity's objectives.",
          evidence: [
            "Data storage controls",
            "Archival procedures",
          ],
          required: false,
        },
      ],
    },

    /* ── C1: Confidentiality ──────────────────────────────────────── */
    {
      id: "C1",
      name: "Confidentiality",
      trustServiceCategory: "Confidentiality (Optional)",
      controls: [
        {
          id: "C1.1",
          title: "Confidential Information Identification",
          description:
            "The entity identifies and maintains confidential information to meet the entity's objectives related to confidentiality.",
          evidence: [
            "Data classification policy",
            "Confidential data inventory",
          ],
          required: false,
        },
        {
          id: "C1.2",
          title: "Confidential Information Disposal",
          description:
            "The entity disposes of confidential information to meet the entity's objectives related to confidentiality.",
          evidence: [
            "Data disposal procedures",
            "Disposal certificates",
            "Wiping records",
          ],
          required: false,
        },
      ],
    },

    /* ── P: Privacy (P1–P8) ───────────────────────────────────────── */
    {
      id: "P",
      name: "Privacy",
      trustServiceCategory: "Privacy (Optional)",
      controls: [
        {
          id: "P1.1",
          title: "Privacy Notice",
          description:
            "The entity provides notice to data subjects about its privacy practices.",
          evidence: ["Privacy policy/notice", "Consent mechanisms"],
          required: false,
        },
        {
          id: "P2.1",
          title: "Choice and Consent",
          description:
            "The entity communicates choices available regarding the collection, use, retention, disclosure, and disposal of personal information.",
          evidence: [
            "Consent forms",
            "Preference centers",
            "Opt-out mechanisms",
          ],
          required: false,
        },
        {
          id: "P3.1",
          title: "Personal Information Collection",
          description:
            "Personal information is collected consistent with the entity's objectives related to privacy.",
          evidence: [
            "Data collection procedures",
            "Purpose limitation documentation",
          ],
          required: false,
        },
        {
          id: "P3.2",
          title: "Explicit Consent for Sensitive Information",
          description:
            "For information requiring explicit consent, the entity communicates the need for such consent and the consequences of declining.",
          evidence: [
            "Explicit consent forms",
            "Sensitive data handling procedures",
          ],
          required: false,
        },
        {
          id: "P4.1",
          title: "Use of Personal Information",
          description:
            "The entity limits the use of personal information to the purposes identified in the notice.",
          evidence: [
            "Data processing agreements",
            "Purpose limitation controls",
          ],
          required: false,
        },
        {
          id: "P4.2",
          title: "Retention of Personal Information",
          description:
            "The entity retains personal information consistent with the entity's objectives related to privacy.",
          evidence: ["Retention schedules", "Deletion procedures"],
          required: false,
        },
        {
          id: "P4.3",
          title: "Disposal of Personal Information",
          description:
            "The entity securely disposes of personal information to meet the entity's objectives related to privacy.",
          evidence: ["Disposal procedures", "Disposal verification records"],
          required: false,
        },
        {
          id: "P5.1",
          title: "Access to Personal Information",
          description:
            "The entity grants identified and authenticated data subjects the ability to access their stored personal information for review.",
          evidence: [
            "Data subject access request procedures",
            "Access portal",
          ],
          required: false,
        },
        {
          id: "P5.2",
          title: "Correction of Personal Information",
          description:
            "The entity corrects, amends, or appends personal information based on information provided by data subjects.",
          evidence: ["Correction request procedures", "Update logs"],
          required: false,
        },
        {
          id: "P6.1",
          title: "Disclosure of Personal Information",
          description:
            "The entity discloses personal information to third parties with the consent of the data subjects.",
          evidence: [
            "Third-party data sharing agreements",
            "Consent records",
          ],
          required: false,
        },
        {
          id: "P6.2",
          title: "Authorized Disclosure Communication",
          description:
            "The entity creates and communicates to data subjects information about how it discloses personal information.",
          evidence: ["Privacy notice disclosures", "DPA agreements"],
          required: false,
        },
        {
          id: "P6.3",
          title: "Unauthorized Disclosure Notification",
          description:
            "The entity provides notification of breaches and incidents to affected data subjects, regulators, and others.",
          evidence: [
            "Breach notification procedures",
            "Incident response plans",
          ],
          required: false,
        },
        {
          id: "P6.4",
          title: "Disclosure to Third Countries",
          description:
            "The entity obtains privacy commitments from vendors and other third parties who access personal information.",
          evidence: [
            "Vendor DPAs",
            "Standard Contractual Clauses (SCCs)",
            "Privacy impact assessments",
          ],
          required: false,
        },
        {
          id: "P6.5",
          title: "Third Party Confidentiality Commitments",
          description:
            "The entity obtains commitments of confidentiality from third parties to whom personal information is disclosed.",
          evidence: [
            "Confidentiality agreements",
            "Vendor privacy assessments",
          ],
          required: false,
        },
        {
          id: "P7.1",
          title: "Personal Information Quality",
          description:
            "The entity collects and maintains accurate, up-to-date, complete, and relevant personal information for the purposes identified in the notice.",
          evidence: ["Data quality procedures", "Validation controls"],
          required: false,
        },
        {
          id: "P8.1",
          title: "Privacy Policy Monitoring and Enforcement",
          description:
            "The entity implements a process for receiving, addressing, resolving, and communicating the resolution of inquiries, complaints, and disputes from data subjects.",
          evidence: [
            "Complaint handling procedures",
            "Dispute resolution records",
          ],
          required: false,
        },
      ],
    },
  ],
};

/* ================================================================
   DERIVED HELPERS
   Convenience utilities for querying the framework data.
   ================================================================ */

/** Flat list of all 59 controls. */
export const SOC2_ALL_CONTROLS: ComplianceControl[] = SOC2_FRAMEWORK.categories.flatMap(
  (cat) => cat.controls
);

/** Look up a single control by ID, e.g. getControl("CC6.1") */
export function getControl(id: string): ComplianceControl | undefined {
  return SOC2_ALL_CONTROLS.find((c) => c.id === id);
}

/** Look up the category that owns a control, e.g. getCategory("CC6.1") → CC6 */
export function getCategory(controlId: string): ComplianceCategory | undefined {
  return SOC2_FRAMEWORK.categories.find((cat) =>
    cat.controls.some((c) => c.id === controlId)
  );
}

/** All required (Security CC) controls only. */
export const SOC2_REQUIRED_CONTROLS: ComplianceControl[] = SOC2_ALL_CONTROLS.filter(
  (c) => c.required
);

/** All optional controls (Availability, PI, Confidentiality, Privacy). */
export const SOC2_OPTIONAL_CONTROLS: ComplianceControl[] = SOC2_ALL_CONTROLS.filter(
  (c) => !c.required
);
