# Watch Center AI → Case Management Integration

## Overview

This document describes the complete integration between Watch Center AI recommendations and the Case Management module.

## Integration Flow

```
Watch Center AI Box → Create Case Button → Case Detail Page (Investigation Tab)
                                              ↓
                                     Auto-generated:
                                     - Case data
                                     - First observation
                                     - Recommended playbooks
```

## Trigger Points

### 1. AI Box Action Buttons

When users interact with AI recommendations in the Watch Center, they see three action options:

- **Investigate** - Opens AI Box with detailed timeline and analysis
- **Create Case** - Automatically creates a case and navigates to it
- **View Details** / **Show attack path** - Opens relevant detail views

### 2. Create Case Action

Located in `/src/imports/AiBox.tsx` (lines 602-650), the "Create Case" button:

1. Extracts AI recommendation context from the proactive scenario
2. Calls `createCaseFromAIRecommendation()` from `case-integration.ts`
3. Adds case, observation, and playbooks to the data store
4. Navigates to the case detail page with location state

## Case Creation Logic

### Auto-Populated Fields

```typescript
{
  id: "CASE-4xxx",              // Auto-generated
  title: [AI recommendation title],
  severity: "Critical" | "High" | "Medium" | "Low",
  category: Auto-detected from content,
  source: "Watch Center AI",
  assignedTeam: "Incident Response" | "SOC",
  owner: [Auto-assigned based on severity],
  status: "Open",
  resolutionState: "Unresolved",
  createdAt: [Current timestamp],
  description: [Enhanced with AI context]
}
```

### Category Detection

The system auto-detects categories based on AI recommendation content:

- **Data Exfiltration** - Keywords: exfiltration, data transfer, S3
- **Intrusion** - Keywords: intrusion, breach
- **Malware** - Keywords: malware, ransomware
- **Unauthorized Access** - Keywords: unauthorized, access, IAM
- **Policy Violation** - Keywords: policy, compliance
- **Anomaly** - Default fallback

### Severity Mapping

```typescript
AI Severity → Case Severity
---------------------------
"critical"  → "Critical"
"high"      → "High"
"medium"    → "Medium"
"low"       → "Low"
```

## Case Context Metadata

The following metadata from Watch Center AI is preserved in the case:

```typescript
{
  type: "insight" | "decision",
  module: "Watch Center AI",
  severity: string,
  title: string,
  description: string,
  supportingStats: Array<{label, value}>,
  actions: string[],
  attackPathId?: string,  // If detected
}
```

This data is embedded in the case description and used for playbook generation.

## Auto-Generated Playbooks

Playbooks are automatically generated based on AI recommendation characteristics:

### Attack Path / Exposure Scenarios

1. **Attack Path Containment**
   - Immediate containment for lateral movement paths
   - Triggered by: exposure, threat, or attack keywords

2. **Exposure Remediation**
   - Systematic remediation of vulnerabilities/misconfigurations
   - Triggered by: multiple security gaps

### Vulnerability Scenarios

3. **Vulnerability Exploitation Response**
   - Investigation and response procedures
   - Triggered by: vulnerability or CVE keywords

### Critical Risk Scenarios

4. **Critical Risk Mitigation**
   - Prioritized mitigation workflow
   - Triggered by: critical severity

### Always Included

5. **Forensic Investigation**
   - Standard evidence collection procedures
   - Always included for comprehensive investigation

## Auto-Generated First Observation

When a case is created from AI, the first observation is automatically added:

```typescript
{
  id: "obs-[caseId]-1",
  caseId: string,
  author: [Case owner],
  content: "Case created automatically from Watch Center AI recommendation. 
            AI-identified security exposure requires immediate investigation 
            and containment.",
  timestamp: [Case creation time],
}
```

## Navigation & Page State

### Location State Structure

```typescript
interface CaseDetailLocationState {
  fromAI: boolean,              // Indicates AI origin
  initialTab: "investigation",  // Auto-opens investigation tab
  caseData: Case,              // Case details
  initialObservation: Observation,
  recommendedPlaybooks: Playbook[],
}
```

### Navigation Flow

1. User clicks "Create Case" in AI Box
2. System creates case and stores in data layer
3. Navigation occurs to `/case-management/[caseId]`
4. Case Detail Page receives location state
5. Investigation tab auto-opens (not reporting)
6. Back button returns to Watch Center (not cases list)

### Back Navigation

The back button behavior is context-aware:

- **From AI**: Returns to Watch Center main screen (`/`)
- **From Cases List**: Returns to cases list (`/case-management`)

Implementation in `CaseDetailPage.tsx`:

```typescript
const [returnPath, setReturnPath] = useState("/case-management");

useEffect(() => {
  if (locationState?.fromAI) {
    setReturnPath("/");
  }
}, [locationState]);
```

## File Locations

```
Integration Code:
├── /src/app/pages/case-management/
│   ├── case-integration.ts          # Core integration utilities
│   ├── CaseDetailPage.tsx           # Auto-opens investigation tab
│   ├── CaseInvestigationTab.tsx     # Shows playbooks & observations
│   └── case-data.ts                 # Data store operations
│
AI Box Integration:
└── /src/imports/
    ├── AiBox.tsx                     # "Create Case" button handler
    └── AiBoxRenderer.tsx             # AI recommendation rendering
```

## Usage Example

```typescript
// In AI Box action handler
if (label === "Create case" && proactiveScenario) {
  import("../app/pages/case-management/case-integration")
    .then(({ createCaseFromAIRecommendation }) => {
      import("../app/pages/case-management/case-data")
        .then(({ addCase, addObservation, addPlaybooks }) => {
          
          // Build AI context
          const aiContext = {
            type: "insight",
            module: "Watch Center AI",
            severity: "high",
            title: "Block lateral movement to domain controller",
            description: "A multi-hop lateral movement path was detected...",
            supportingStats: [...],
          };
          
          // Create case
          const { caseData, initialObservation, recommendedPlaybooks } = 
            createCaseFromAIRecommendation(aiContext);
          
          // Store data
          addCase(caseData);
          addObservation(caseData.id, initialObservation);
          addPlaybooks(caseData.id, recommendedPlaybooks);
          
          // Navigate with state
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
}
```

## Testing the Integration

1. **Navigate to Watch Center** (`/`)
2. **Open AI Box** by clicking the AI button or investigating a task
3. **Wait for AI recommendation** to appear
4. **Click "Create Case"** button
5. **Verify:**
   - Case is created with AI-populated data
   - Investigation tab is auto-opened
   - Recommended playbooks are displayed
   - First observation contains AI context
   - Back button returns to Watch Center

## Design Principles

Following the requirements document:

✅ **No UI Changes** - Reuses existing Case Management layouts exactly
✅ **Auto-Population** - All fields populated from AI context
✅ **Auto-Navigation** - Direct to case detail (not list)
✅ **Auto-Tab** - Investigation tab opens by default
✅ **Context Preservation** - AI metadata stored in case
✅ **Smart Playbooks** - Generated based on recommendation type
✅ **Smart Back Nav** - Returns to originating screen

## Future Enhancements

Potential improvements for consideration:

1. **Enhanced Back Navigation**
   - Store specific Watch Center screen in location state
   - Return to exact Agent detail page or Task view

2. **Quick Actions in Observations**
   - Add action buttons to AI-generated observations
   - Examples: Disable User, Escalate, Isolate Host

3. **Real-time Updates**
   - Push case updates back to Watch Center
   - Show case status in AI Box

4. **Attack Path Linking**
   - Automatically link to attack path detail pages
   - Bi-directional navigation between cases and paths
