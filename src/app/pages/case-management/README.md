# Case Management Module

This module implements the complete Case Management system for the Watch Center platform with **full reactive integration** from Watch Center AI and Attack Path investigations.

## ✅ Integration Status: COMPLETE

**NEW:** Cases are automatically created from:
- ✅ Watch Center AI recommendations
- ✅ Attack Path investigations
- ✅ Blast Radius asset insights

All new cases appear **instantly** in the Cases list with reactive updates via `useSyncExternalStore`.

📚 **Quick Links:**
- [Integration Summary](./INTEGRATION-SUMMARY.md) - Executive overview
- [Integration Verification](./INTEGRATION-VERIFICATION.md) - Complete spec compliance checklist
- [Quick Start Guide](./QUICK-START.md) - Testing and verification
- [Watch Center AI Integration](./WATCH-CENTER-AI-INTEGRATION.md) - AI-specific details

## Overview

The Case Management module provides comprehensive incident and case tracking capabilities with three main views:

1. **Dashboard** - KPI metrics and trend visualization
2. **Cases List** - Filterable table of all cases with **reactive updates**
3. **Case Detail** - In-depth investigation and reporting for individual cases

## 🆕 Reactive Integration Features

### Automatic Case Creation

**Watch Center AI:**
- Click "Create case" action in AI recommendations
- Case auto-populated with AI context, insights, and playbooks
- Automatic navigation to Case Detail page
- Case appears in list **instantly** (no refresh needed)

**Attack Path:**
- Click "Create Case" from Attack Path detail page
- Click "Create Case" from Blast Radius panels
- Case auto-populated with ARN, IPs, CVEs, blast radius data
- Context-specific playbooks generated (IAM, network, patching)
- Automatic navigation to Case Detail page

### Real-Time Updates

The Cases list uses `useSyncExternalStore` for reactive updates:
- New cases appear at top instantly
- Summary bar updates automatically
- Filters and search work immediately with new cases
- No page refresh required
- Bidirectional sync with Case Detail page

### Integration Points

| Source | Location | Integration File |
|--------|----------|------------------|
| Watch Center AI | `/src/imports/AiBox.tsx` | Lines 603-649 |
| Attack Path (Header) | `/src/app/pages/AttackPathDetailPage.tsx` | Lines 2582-2625 |
| Attack Path (Blast Radius) | Same as above | Lines 2811-2835 |
| Case Detail Updates | `/src/app/pages/case-management/CaseInvestigationTab.tsx` | updateCase() calls |

## Pages

### Case Management Page (`CaseManagementPage.tsx`)

Main entry point with tab navigation:
- Dashboard tab
- Cases tab

**Route:** `/case-management`

### Dashboard (`CaseManagementDashboard.tsx`)

Displays key performance indicators and trends:

**KPI Cards (4):**
- Mean Time To Detect (MTTD)
- Mean Time To Respond (MTTR)
- Mean Time To Acknowledge (MTTA)
- False Positive Rate (FPR)

Each card includes:
- Current metric value
- Trend indicator (up/down arrow with %)
- Performance gauge (0-100% bar)
- Time range selector (dropdown)

**Trend Charts (2):**
- MTTD Trend (last 7 days)
- MTTR Trend (last 7 days)

### Cases List (`CasesListPage.tsx`)

Table view with advanced filtering:

**Features:**
- Advanced filter bar (same as Asset Register)
- Sortable columns
- Row hover effects
- Click to open case detail
- Pagination controls

**Columns:**
- Case ID (clickable, accent color)
- Severity (badge with color coding)
- Title
- Source
- Assigned Team
- Owner (with avatar)
- Status (badge)
- Created At (timestamp)
- Updated At (timestamp)

**Route:** `/case-management` (Cases tab)

### Case Detail Page (`CaseDetailPage.tsx`)

Detailed view of a single case:

**Header:**
- Back button (navigate -1)
- Case ID and title
- Severity badge
- Tab navigation

**Tabs:**
1. Case Investigation
2. Case Reporting

**Route:** `/case-management/:caseId`

### Case Investigation Tab (`CaseInvestigationTab.tsx`)

**Left Column (4/12):**
- Case metadata card with all case details
- Icons for each field
- Badges for severity and status

**Right Column (8/12):**
1. **Recommended Playbooks** (if available)
   - Playbook cards with:
     - Title and description
     - Reason for recommendation (orange highlight)
     - Suggested action (green highlight)
     - Icon indicator

2. **Add Observation Section**
   - Textarea for new observations
   - Submit button

3. **Observations Feed**
   - Timeline of all observations
   - Author avatar and details
   - Timestamp
   - Content
   - Empty state if no observations

### Case Reporting Tab (`CaseReportingTab.tsx`)

Comprehensive case report with export functionality:

**Header:**
- Report title
- Export Report button (blue, with download icon)

**Two-Column Grid Layout:**
- Summary (full width)
- Actors
- Threat Actor
- Key Findings (full width, bulleted list)
- Actions Taken (full width, bulleted list)
- Assets Affected (colored badges)
- Attributes Impacted (colored badges)

**Footer:**
- Report metadata (generated date, case status, severity, owner)

## Data Structure

### Case Data (`case-data.ts`)

**Main Types:**
- `Case` - Full case object
- `CaseSeverity` - Critical | High | Medium | Low
- `CaseStatus` - Open | In Progress | Resolved | Closed | Escalated
- `ResolutionState` - Unresolved | True Positive | False Positive | Duplicate
- `CaseCategory` - Intrusion | Malware | Data Exfiltration | etc.
- `CaseOwner` - User with avatar, name, role
- `Observation` - Case notes/updates
- `Playbook` - Recommended response procedures
- `CaseReport` - Final investigation report

**Mock Data:**
- 8 cases with varying severities and statuses
- 5 case owners (SOC analysts, IR leads, etc.)
- Recommended playbooks for select cases
- Observations for select cases
- Full report for CASE-4221

## Design Patterns

### Color Coding

**Severity Colors:**
- Critical: `#ef4444` (red)
- High: `#f97316` (orange)
- Medium: `#f59e0b` (amber)
- Low: `#3b82f6` (blue)

**Status Colors:**
- Open: Blue
- In Progress: Amber
- Resolved: Green
- Closed: Gray
- Escalated: Red

**UI Colors:**
- Background App: `#030609`
- Background Card: `#0a1520`
- Border: `#121e27`
- Text Primary: `#dadfe3`
- Text Secondary: `#89949e`
- Text Tertiary: `#62707d`
- Accent: `#14a2e3`

### Layout Preservation

All layouts match the Figma designs exactly:

✅ **Dashboard**
- 4-column KPI grid
- 2-column trend charts
- Card spacing: 16px gap
- Consistent padding: 20px

✅ **Cases List**
- Filter bar with chip-based filters
- Full-width table
- Proper column alignment
- Row hover states

✅ **Case Detail**
- Header with back navigation
- Tab navigation below title
- 4/8 column split on Investigation tab
- 2-column grid on Reporting tab

✅ **Typography**
- Inter font family
- Consistent font sizes (12px-32px scale)
- Font weights: Regular (400), Medium (500), SemiBold (600), Bold (700)

## Navigation Flow

```
/case-management
├── Dashboard tab (default)
│   └── 4 KPI cards + 2 trend charts
│
├── Cases tab
│   └── Cases table
│       └── Click row → /case-management/:caseId
│
/case-management/:caseId
├── Case Investigation tab (default)
│   ├── Metadata sidebar
│   ├── Recommended playbooks
│   ├── Add observation
│   └── Observations feed
│
└── Case Reporting tab
    ├── Summary sections
    ├── Findings and actions
    ├── Affected assets
    └── Export button
```

## Integration Points

### Routing
- Main route: `/case-management`
- Detail route: `/case-management/:caseId`
- Both integrated into `/src/app/routes.tsx`

### Header
- "Case Management" title for main page
- "Case Detail" title for detail pages
- Handled by dynamic title in `/src/imports/Header.tsx`

### Sidebar
- Navigation item at `/case-management`
- Active state when on Case Management pages
- Configured in `/src/imports/SidebarNavigation.tsx`

## Future Enhancements

Potential additions (not currently implemented):

1. Real-time updates for observations
2. Playbook execution workflow
3. Case assignment and reassignment
4. SLA tracking and alerts
5. Integration with external ticketing systems
6. Advanced analytics and reporting
7. Case templates
8. Automated case creation from alerts
9. Email notifications
10. Audit trail and version history

## Files

```
/src/app/pages/case-management/
├── README.md                           # This file (updated with integration info)
├── INTEGRATION-SUMMARY.md              # Executive integration overview
├── INTEGRATION-VERIFICATION.md         # Complete spec compliance checklist
├── QUICK-START.md                      # Testing and verification guide
├── WATCH-CENTER-AI-INTEGRATION.md      # Watch Center AI integration details
├── INTEGRATION.md                      # General integration documentation
├── index.ts                            # Module exports
├── case-data.ts                        # Data types, mock data, reactive store
├── case-integration.ts                 # Case creation utilities (AI & Attack Path)
├── test-case-creation.ts               # Test suite for integration verification
├── IntegrationStatus.tsx               # Visual monitoring component
├── case-asset-utils.ts                 # Asset extraction utilities
├── CaseManagementPage.tsx              # Main page with tabs
├── CaseManagementDashboard.tsx         # Dashboard with KPIs
├── CasesListPage.tsx                   # Cases table with reactive updates
├── CaseDetailPage.tsx                  # Case detail wrapper
├── CaseInvestigationTab.tsx            # Investigation view with quick actions
└── CaseReportingTab.tsx                # Reporting view with export
```

## 🧪 Testing Integration

### Browser Console
```javascript
// Run all integration tests
window.casesTest.runAll();

// Individual tests
window.casesTest.testWatchCenterAI();
window.casesTest.testAttackPath();
window.casesTest.testFields();
```

### Manual Testing
1. Navigate to `/` (main dashboard)
2. Wait for Watch Center AI proactive scenario
3. Click "Create case" action
4. ✨ Verify navigation to case detail
5. Navigate to `/case-management` → Cases tab
6. ✨ Verify new case at top of table
7. ✨ Verify summary bar updated

See [QUICK-START.md](./QUICK-START.md) for complete testing workflows.