/**
 * ISO 27001:2022 — Information Security Management System
 *
 * Status: PLACEHOLDER
 * Operational control data (statuses, evidence links, owners) lives in
 * src/app/pages/compliance-data.ts → FRAMEWORK_CONTROLS["iso27001"].
 * This file will be expanded to the full 93-control dataset in a future
 * iteration, following the same pattern as soc2-controls.ts.
 *
 * To populate: extract controls from the ISO/IEC 27001:2022 Annex A
 * and fill the categories array below. Each control should follow the
 * ComplianceControl shape — id, title, description, evidence[], required.
 */

import type { ComplianceFramework } from "./soc2-controls";

export const ISO27001_FRAMEWORK: ComplianceFramework = {
  id:               "iso27001",
  name:             "ISO 27001",
  version:          "ISO/IEC 27001:2022",
  totalControls:    93,
  requiredControls: 93,

  categories: [

    /* ── A.5: Organizational Controls (37 controls) ─────────────── */
    {
      id:                   "A.5",
      name:                 "Organizational Controls",
      trustServiceCategory: "Information Security Policies",
      controls: [
        {
          id:          "A.5.1",
          title:       "Policies for information security",
          description: "Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals or if significant changes occur.",
          evidence:    ["Information security policy", "Management approval records", "Communication acknowledgements", "Review log"],
          required:    true,
        },
        {
          id:          "A.5.2",
          title:       "Information security roles and responsibilities",
          description: "Information security roles and responsibilities shall be defined and allocated according to the organization needs.",
          evidence:    ["RACI matrix", "Job descriptions", "Role assignment records"],
          required:    true,
        },
        // Remaining A.5 controls (A.5.3–A.5.37) to be added
      ],
    },

    /* ── A.6: People Controls (8 controls) ──────────────────────── */
    {
      id:                   "A.6",
      name:                 "People Controls",
      trustServiceCategory: "Human Resource Security",
      controls: [
        {
          id:          "A.6.1",
          title:       "Screening",
          description: "Background verification checks on all candidates to become personnel shall be carried out prior to joining the organization and on an ongoing basis.",
          evidence:    ["Background check policy", "Screening records", "Pre-employment verification logs"],
          required:    true,
        },
        {
          id:          "A.6.2",
          title:       "Terms and conditions of employment",
          description: "The employment contractual agreements shall state the personnel's and the organization's responsibilities for information security.",
          evidence:    ["Employment contracts", "Security clauses", "Signed acknowledgements"],
          required:    true,
        },
        // Remaining A.6 controls (A.6.3–A.6.8) to be added
      ],
    },

    /* ── A.7: Physical Controls (14 controls) ───────────────────── */
    {
      id:                   "A.7",
      name:                 "Physical Controls",
      trustServiceCategory: "Physical and Environmental Security",
      controls: [
        {
          id:          "A.7.1",
          title:       "Physical security perimeters",
          description: "Security perimeters shall be defined and used to protect areas that contain information and other associated assets.",
          evidence:    ["Site security assessment", "Perimeter access logs", "Physical security policy"],
          required:    true,
        },
        // Remaining A.7 controls (A.7.2–A.7.14) to be added
      ],
    },

    /* ── A.8: Technological Controls (34 controls) ──────────────── */
    {
      id:                   "A.8",
      name:                 "Technological Controls",
      trustServiceCategory: "Technology Security",
      controls: [
        {
          id:          "A.8.1",
          title:       "User endpoint devices",
          description: "Information stored on, processed by or accessible via user endpoint devices shall be protected.",
          evidence:    ["Endpoint policy", "MDM configuration", "Device inventory"],
          required:    true,
        },
        {
          id:          "A.8.2",
          title:       "Privileged access rights",
          description: "The allocation and use of privileged access rights shall be restricted and managed.",
          evidence:    ["Privileged access policy", "Access review records", "PAM tool configuration"],
          required:    true,
        },
        {
          id:          "A.8.3",
          title:       "Information access restriction",
          description: "Access to information and other associated assets shall be restricted in accordance with the established topic-specific policy on access control.",
          evidence:    ["Access control policy", "Role-based access configurations", "Access review evidence"],
          required:    true,
        },
        // Remaining A.8 controls (A.8.4–A.8.34) to be added
      ],
    },
  ],
};
