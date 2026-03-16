# Watch Center AI → Case Management Integration

## Overview

This document describes the integration between Watch Center AI recommendations and the Case Management module. Cases can be automatically created from AI-powered security insights with full context preservation and intelligent playbook generation.

## Integration Points

### 1. Watch Center AI Box

**Location:** `/src/imports/AiBox.tsx` (lines 602-650)

**Trigger:** User clicks "Create case" button in AI Box response

**Flow:**
1. User interacts with AI recommendation in Watch Center
2. AI response includes "Create case" action button
3. Clicking "Create case" triggers case creation
4. System navigates directly to Case Detail page (Investigation tab)

### 2. Case Creation from AI

**Location:** `/src/app/pages/case-management/case-integration.ts`

**Function:** `createCaseFromAIRecommendation()`

**Auto-populated Fields:**

| Field | Source | Example |
|-------|--------|---------|
| **Case Title** | AI recommendation title | "Block lateral movement to domain controller" |
| **Severity** | AI recommendation severity | Critical / High / Medium / Low |
| **Category** | Auto-detected from recommendation type | Identity Breach, Privilege Escalation, Data Exfiltration |
| **Owner** | Default: System (SOC Analyst) | Escalated to IR Lead for Critical severity |
| **Status** | Always "Open" | - |
| **Resolution State** | Always "Unresolved" | - |
| **Source** | "Watch Center AI" | - |
| **Assigned Team** | Based on severity | "Incident Response" or "SOC" |

### 3. Case Context Metadata

The following Watch Center context is automatically attached to cases:

```typescript
{
  type: "insight" | "decision",
  module: "Watch Center AI",
  severity: "critical" | "high" | "medium" | "low",
  title: string,
  description: string,
  supportingStats: Array<{ label: string; value: string }>,
  actions: string[],
  attackPathId?: string  // if attack path is referenced
}
```

**Example:**
```
Attack Path: internet-facing → EC2 → database
Threat: lateral movement path detected
Confidence: 94%
Assets: 3 production EC2 instances, 1 RDS database
```

### 4. Initial Observation

**Auto-generated content:**

```
Case created automatically from Watch Center AI recommendation. 
AI-identified security exposure requires immediate investigation and containment.

[Context details from recommendation]
```

**Timestamp:** Set to case creation time

### 5. Recommended Playbooks

Playbooks are intelligently generated based on:
- Attack vector (IAM, network, S3, CloudTrail)
- Severity level
- Threat type
- Recommendation content

**Example Playbooks:**

| Condition | Generated Playbooks |
|-----------|---------------------|
| **Exposure/Threat** | Attack Path Containment<br>Exposure Remediation |
| **Vulnerability** | Vulnerability Exploitation Response |
| **Critical Severity** | Critical Risk Mitigation |
| **Always Included** | Forensic Investigation |

**Playbook Structure:**
```typescript
{
  id: string,
  title: string,
  description: string,
  reason: string,        // Why this playbook applies
  action: string         // Step-by-step actions
}
```

### 6. Quick Action Buttons

**Location:** Case Investigation Tab → First Observation (if from AI)

**Displayed When:** First observation contains "watch center" (case-insensitive)

**Available Actions:**
- Disable User Account
- Escalate Case to Tier-2 Analyst
- Isolate Host
- Block Source IP

These buttons appear directly in the observation card for quick response.

### 7. Navigation Flow

**From Watch Center → Case Detail:**
```
Watch Center AI Box 
  → Click "Create case"
  → Case created in background
  → Navigate to /case-management/{caseId}
  → Investigation tab auto-opened
  → Full context preserved
```

**Back Navigation:**
```
Case Detail Page
  → Click back arrow
  → Returns to Watch Center (not Cases list)
  → Uses browser history navigation
```

**Implementation:**
```typescript
// CaseDetailPage.tsx
const handleBack = () => {
  if (locationState?.fromAI) {
    navigate(-1);  // Go back to Watch Center
  } else {
    navigate("/case-management");  // Go to Cases list
  }
};
```

## Code Examples

### Creating a Case from AI Recommendation

```typescript
import { createCaseFromAIRecommendation } from "./case-integration";
import { addCase, addObservation, addPlaybooks } from "./case-data";

// Extract AI context
const aiContext = {
  type: "insight",
  module: "Watch Center AI",
  severity: "critical",
  title: "Unauthorized IAM role escalation detected",
  description: "Multiple attempts to escalate privileges...",
  supportingStats: [
    { label: "Affected users", value: "3" },
    { label: "Privilege level", value: "Admin" },
  ],
};

// Create case with full context
const { caseData, initialObservation, recommendedPlaybooks } = 
  createCaseFromAIRecommendation(aiContext, "ap-047");

// Add to data store
addCase(caseData);
addObservation(caseData.id, initialObservation);
addPlaybooks(caseData.id, recommendedPlaybooks);

// Navigate to case detail
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

### Accessing Case Context in Detail Page

```typescript
const location = useLocation();
const locationState = location.state as CaseDetailLocationState | undefined;

// Check if case was created from AI
if (locationState?.fromAI) {
  // Show AI-specific UI elements
  // Enable back navigation to Watch Center
  // Display context-aware playbooks
}

// Auto-open Investigation tab
const [activeTab, setActiveTab] = useState<TabType>(
  locationState?.initialTab || "investigation"
);
```

## Testing the Integration

### Manual Test Flow

1. **Navigate to Watch Center**
   - Open main dashboard
   - Click on an agent carousel card or task

2. **Open AI Box**
   - AI recommendations should be displayed
   - Look for "Create case" button

3. **Create Case**
   - Click "Create case"
   - Wait for navigation
   - Verify you're on Case Detail page
   - Verify Investigation tab is active

4. **Verify Case Content**
   - Check case title matches AI recommendation
   - Verify severity is correct
   - Check that initial observation includes AI context
   - Verify recommended playbooks are displayed

5. **Test Quick Actions**
   - First observation should show action buttons
   - Buttons: Disable User Account, Escalate Case, Isolate Host, Block Source IP

6. **Test Back Navigation**
   - Click back arrow
   - Should return to Watch Center (not Cases list)

### Expected Data

**Case ID:** Auto-generated (CASE-42XX)

**Case Title:** From AI recommendation

**Severity:** Mapped from AI (Critical/High/Medium/Low)

**Category:** Auto-detected:
- Identity Breach
- Privilege Escalation
- Data Exfiltration
- Unauthorized Access
- Policy Violation
- Anomaly

**Playbooks:** 3-7 context-specific playbooks

**Observations:** Minimum 1 (AI-generated initial observation)

## Architecture

### Data Flow

```
┌─────────────────┐
│  Watch Center   │
│   AI Box        │
└────────┬────────┘
         │ User clicks "Create case"
         ▼
┌─────────────────┐
│ case-integration│
│  .ts            │──► createCaseFromAIRecommendation()
└────────┬────────┘    ├── Generate case ID
         │             ├── Map severity
         │             ├── Determine category
         │             ├── Extract affected assets
         │             ├── Generate playbooks
         │             └── Create initial observation
         ▼
┌─────────────────┐
│  case-data.ts   │──► addCase()
│                 │──► addObservation()
│                 │──► addPlaybooks()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ CaseDetailPage  │──► Display case
│  .tsx           │──► Investigation tab
│                 │──► Quick actions
└─────────────────┘
```

### File Structure

```
/src/app/pages/case-management/
├── case-integration.ts       # Integration utilities
├── case-data.ts              # Data store & types
├── CaseDetailPage.tsx        # Case detail view
├── CaseInvestigationTab.tsx  # Investigation tab with observations
├── CaseManagementPage.tsx    # Cases list
└── WATCH-CENTER-INTEGRATION.md  # This file
```

## Security Considerations

- Cases are auto-assigned based on severity (IR Lead for Critical)
- All cases start in "Open" status with "Unresolved" state
- Attack path references are preserved for audit trail
- Observations include full AI context for forensic analysis
- Playbooks are context-aware and prioritized by risk

## Maintenance

### Adding New Playbook Types

Edit `generatePlaybooks()` in `case-integration.ts`:

```typescript
if (module.includes("your-condition")) {
  playbooks.push({
    id: `playbook-${caseId}-X`,
    title: "Your Playbook Title",
    description: "What this playbook does",
    reason: "Why it's recommended",
    action: "Step-by-step actions",
  });
}
```

### Modifying Case Category Detection

Edit `determineCaseCategory()` in `case-integration.ts`:

```typescript
if (text.includes("your-keyword")) {
  return "Your Category";
}
```

### Adding Quick Actions

Edit observation rendering in `CaseInvestigationTab.tsx`:

```typescript
{index === 0 && observation.content.toLowerCase().includes("watch center") && (
  <div className="flex gap-[8px] mt-[12px]">
    <button ...>Your Action</button>
  </div>
)}
```

## Future Enhancements

1. **Bi-directional sync:** Update AI Box when case status changes
2. **Real-time collaboration:** Multi-analyst case investigation
3. **Playbook execution tracking:** Monitor playbook completion status
4. **AI recommendations in cases:** Suggest next steps based on observations
5. **Automated escalation:** Auto-escalate based on case age and severity
