# Case Management Integration Guide

## Overview

The Case Management module integrates with Watch Center AI and Attack Path investigations to automatically create security cases with contextual information.

## Integration Points

### 1. Watch Center AI Recommendations

**Location:** `/src/imports/AiBox.tsx`

When a user clicks "Create case" from a Watch Center AI recommendation:
- Extracts threat context from the proactive scenario
- Creates a new case with AI-generated title, severity, and description
- Auto-generates relevant playbooks based on threat type
- Navigates to Case Detail page (Investigation tab)

### 2. Attack Path Detail Page Header

**Location:** `/src/app/pages/AttackPathDetailPage.tsx` (Header)

When a user clicks "Create Case" from the attack path header:
- Captures full attack path context (ID, name, description, priority)
- Includes vulnerability and misconfiguration counts
- Extracts CVE information if available
- Generates context-specific playbooks (IAM, Network, Logging, Patching, etc.)

### 3. Attack Path Insights Panel (Blast Radius Assets)

**Location:** `/src/app/pages/AttackPathDetailPage.tsx` (InsightsPanel)

When a user clicks "Create Case" from a specific asset in the Blast Radius:
- Captures attack path context
- **Plus** specific asset context (ID, name, ARN, private IP)
- Includes asset-specific vulnerabilities and misconfigurations
- Includes network exposure details
- Generates playbooks tailored to the asset's security posture

## Case Creation Flow

```typescript
// 1. Build context
const context: AttackPathContext = {
  attackPathId: "ap-001",
  attackPathName: "Internet-facing service → Database",
  attackPathDescription: "External attacker can traverse...",
  priority: "critical",
  assetId: "br-1",
  assetName: "mandrill-prod",
  assetArn: "arn:aws:ec2:us-east-1:384:i-0a3f7c9d",
  assetPrivateIp: "10.0.1.10",
  vulnerabilityCount: 49,
  misconfigurationCount: 3,
  vulnerabilityId: "CVE-2018-15133",
  riskSeverity: "critical",
  exposures: ["SSH", "HTTP"],
  blastRadiusAssets: 12,
};

// 2. Create case
import { createCaseFromAttackPath } from "./case-management/case-integration";
import { addCase, addObservation, addPlaybooks } from "./case-management/case-data";

const { caseData, initialObservation, recommendedPlaybooks } = 
  createCaseFromAttackPath(context);

// 3. Store in data layer
addCase(caseData);
addObservation(caseData.id, initialObservation);
addPlaybooks(caseData.id, recommendedPlaybooks);

// 4. Navigate to case
navigate(`/case-management/${caseData.id}`, {
  state: {
    fromAI: true,
    initialTab: "investigation",
    caseData,
    initialObservation,
    recommendedPlaybooks,
  },
});
```

## Auto-Generated Playbooks

The system automatically suggests relevant playbooks based on attack path characteristics:

### IAM-Related Attacks
- **Disable Compromised IAM User**: Immediate credential revocation
- **Enable MFA Enforcement**: Multi-factor authentication implementation

### Network-Based Attacks
- **Block Malicious IP Addresses**: Network segmentation and ingress filtering

### Logging and Monitoring
- **Enable CloudTrail Logging**: Comprehensive audit logging activation

### Vulnerability Management
- **Emergency Vulnerability Patching**: Immediate patching procedures

### Misconfiguration Remediation
- **Security Misconfiguration Remediation**: Systematic correction of security gaps

### Always Included
- **Attack Path Containment**: Break the attack chain
- **Blast Radius Impact Assessment**: Assess connected assets (if blast radius > 0)
- **Attack Path Forensic Analysis**: Evidence collection and timeline reconstruction

## Case Investigation Page Population

When a case is created from an attack path, the Investigation tab automatically displays:

### Affected Assets
- Asset name, ID, ARN, and private IP
- Risk severity level
- Vulnerability and misconfiguration counts

### Threat Actor
- Extracted from context if available

### Key Findings
- Verified lateral movement path description
- Exploitable vulnerability count
- Security misconfiguration count
- Network exposure points
- Containment recommendations

### Attack Path Reference
- Direct link back to the originating attack path
- Attack path ID and priority level

### Recommended Playbooks
- Context-specific playbooks based on:
  - Attack vector (IAM, network, S3, etc.)
  - Severity level
  - Vulnerability/misconfiguration presence
  - Network exposure types

## Example: Complete Integration

```typescript
// In AttackPathDetailPage.tsx - InsightsPanel
<button
  onClick={() => {
    import("./case-management/case-integration").then(({ createCaseFromAttackPath }) => {
      import("./case-management/case-data").then(({ addCase, addObservation, addPlaybooks }) => {
        const pathData = ATTACK_PATHS[sourcePathId];
        const vulnNode = pathData.nodes.find(n => n.isVulnerable);
        
        const context = {
          attackPathId: sourcePathId,
          attackPathName: sourcePathName,
          attackPathDescription: pathData.description,
          priority: pathData.priority,
          assetId: asset.id,
          assetName: asset.name,
          assetArn: asset.arn,
          assetPrivateIp: asset.privateIp,
          vulnerabilityCount: asset.vulnerabilities,
          misconfigurationCount: asset.misconfigurations,
          vulnerabilityId: vulnNode?.cve,
          riskSeverity: asset.riskSeverity,
          exposures: asset.exposures,
          blastRadiusAssets: pathData.blastRadius.totalAssets,
        };
        
        const { caseData, initialObservation, recommendedPlaybooks } = 
          createCaseFromAttackPath(context);
        
        addCase(caseData);
        addObservation(caseData.id, initialObservation);
        addPlaybooks(caseData.id, recommendedPlaybooks);
        
        navigate(`/case-management/${caseData.id}`, {
          state: {
            fromAI: true,
            initialTab: "investigation",
            caseData,
            initialObservation,
            recommendedPlaybooks,
          },
        });
      });
    });
  }}
>
  <FileText size={13} />
  Create Case
</button>
```

## Notes

- All case creation uses **dynamic imports** to avoid circular dependencies
- Cases are stored in the runtime data layer (CASES, OBSERVATIONS, RECOMMENDED_PLAYBOOKS)
- Case IDs are auto-generated in the range CASE-4200 to CASE-4299
- Initial observations are automatically created with AI/Attack Path context
- The Case Detail page receives location state to pre-populate UI
- No Case Management UI was modified - only case creation logic was implemented
